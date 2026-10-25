#!/usr/bin/env node
// The Agent Client Protocol transport, against a fake ACP agent on stdio.
// No Python and no model server: this is what keeps the suite hermetic.
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && specifier.endsWith('.js') && context.parentURL) {
      const asTs = new URL(specifier.replace(/\.js$/, '.ts'), context.parentURL);
      if (fs.existsSync(fileURLToPath(asTs))) return { url: asTs.href, shortCircuit: true };
    }
    return next(specifier, context);
  },
});

const { AcpConnection, AcpError } = await import('../src/daemon/acp-client.ts');

const FAKE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'fake-acp-agent.mjs');

let pass = 0, fail = 0;
function t(cond, name, extra) {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${extra ? ' — ' + extra : ''}`); }
}

function connect(env = {}) {
  return new AcpConnection({
    command: process.execPath,
    args: [FAKE],
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    label: 'test-acp',
  });
}

const prompt = (conn, sessionId, text) =>
  conn.request('session/prompt', { sessionId, prompt: [{ type: 'text', text }] }, { timeoutMs: 0 });

console.log('\nACP client tests\n');

// 1. Handshake and a streamed turn.
{
  const conn = connect();
  await conn.start();
  t(conn.isRunning(), 'spawns the agent');
  const init = await conn.request('initialize', { protocolVersion: 1, clientCapabilities: {} });
  t(init.protocolVersion === 1, 'initialize negotiates protocol version 1');
  const session = await conn.request('session/new', { cwd: process.cwd(), mcpServers: [] });
  t(typeof session.sessionId === 'string', 'session/new returns a session id');

  const chunks = [];
  conn.onNotification((method, params) => {
    if (method === 'session/update' && params.update.sessionUpdate === 'agent_message_chunk') {
      chunks.push(params.update.content.text);
    }
  });
  const res = await prompt(conn, session.sessionId, 'hello');
  t(res.stopReason === 'end_turn', 'prompt resolves with end_turn when the turn ends');
  t(chunks.join('') === 'Hello world', 'message chunks arrive as notifications, in order', JSON.stringify(chunks));

  // 2. JSON-RPC errors surface as AcpError with the code.
  try {
    await conn.request('session/new', { cwd: process.cwd(), mcpServers: [] });
    t(false, 'a second session/new is refused');
  } catch (err) {
    t(err instanceof AcpError && err.code === -32000, 'a second session/new is refused with the agent\'s error');
  }

  // 3. The agent's requests are answered asynchronously.
  let asked = null;
  conn.onRequest(async (method, params) => {
    asked = { method, params };
    await new Promise((r) => setTimeout(r, 150)); // a human taking their time
    return { outcome: { outcome: 'selected', optionId: 'allow_once' } };
  });
  const writeChunks = chunks.length;
  const w = await prompt(conn, session.sessionId, 'write');
  t(asked?.method === 'session/request_permission', 'the agent\'s permission request reaches the handler');
  t(asked?.params.options?.length === 4, 'all four ACP options are passed through');
  t(w.stopReason === 'end_turn' && chunks.slice(writeChunks).join('').includes('allow_once'),
    'the turn continues with the answer the handler gave');

  // 4. A handler that throws becomes a JSON-RPC error, not a hang.
  conn.onRequest(() => { throw new Error('nobody home'); });
  const r = await Promise.race([
    prompt(conn, session.sessionId, 'write').then(() => 'answered'),
    new Promise((res2) => setTimeout(() => res2('hung'), 3000)),
  ]);
  t(r === 'answered', 'a throwing handler still answers the agent');

  // 5. Cancel ends a long turn.
  const slow = prompt(conn, session.sessionId, 'slow');
  setTimeout(() => conn.notify('session/cancel', { sessionId: session.sessionId }), 100);
  const s = await slow;
  t(s.stopReason === 'cancelled', 'session/cancel ends the turn as cancelled');

  // 6. Close ends the process.
  const exited = new Promise((res2) => conn.onExit(() => res2(true)));
  conn.close(500);
  t(await Promise.race([exited, new Promise((res2) => setTimeout(() => res2(false), 3000))]), 'close ends the agent');
  t(!conn.isRunning(), 'isRunning is false after exit');
  try {
    await conn.request('initialize', {});
    t(false, 'requests after exit are rejected');
  } catch (err) {
    t(err instanceof AcpError, 'requests after exit are rejected');
  }
}

// 7. A crash mid-turn rejects the open prompt with the agent's own explanation.
{
  const conn = connect();
  await conn.start();
  await conn.request('initialize', { protocolVersion: 1, clientCapabilities: {} });
  const { sessionId } = await conn.request('session/new', { cwd: process.cwd(), mcpServers: [] });
  try {
    await prompt(conn, sessionId, 'crash');
    t(false, 'a crash rejects the open prompt');
  } catch (err) {
    t(/code 3/.test(err.message), 'a crash rejects the open prompt with the exit code', err.message);
    t(/model server went away/.test(err.message), 'the rejection carries the agent\'s stderr', err.message);
  }
}

// 8. An agent that refuses to start is reported, with its reason.
{
  const conn = connect({ FAKE_ACP_FAIL_START: '1' });
  await conn.start();
  try {
    await conn.request('initialize', { protocolVersion: 1, clientCapabilities: {} });
    t(false, 'a failed start rejects initialize');
  } catch (err) {
    t(/no config/.test(err.message), 'a failed start rejects initialize with the stderr reason', err.message);
  }
}

// 9. A binary that does not exist rejects start().
{
  const conn = new AcpConnection({ command: 'definitely-not-a-real-binary-xyz', args: [], cwd: process.cwd(), env: process.env });
  try {
    await conn.start();
    t(false, 'a missing binary rejects start');
  } catch (err) {
    t(err instanceof AcpError && /Could not start/.test(err.message), 'a missing binary rejects start');
  }
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
