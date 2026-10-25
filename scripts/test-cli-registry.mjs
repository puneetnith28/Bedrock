#!/usr/bin/env node
import fs from 'node:fs';
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

const {
  isCliId,
  checkBinaryAvailability,
  checkCliReady,
  CLI_IDS,
} = await import('../src/cli-registry.ts');

let pass = 0, fail = 0;
const failures = [];
function t(cond, name, extra) {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; failures.push(name); console.log(`  ✗ ${name}${extra ? ' — ' + extra : ''}`); }
}

console.log('\nCLI Registry & Health Check Probe Tests\n');

// 1. isCliId type guard
t(isCliId('claude'), 'recognizes valid cli id "claude"');
t(isCliId('codex'), 'recognizes valid cli id "codex"');
t(isCliId('gpt'), 'recognizes valid cli id "gpt"');
t(isCliId('nemotron'), 'recognizes valid cli id "nemotron"');
t(!isCliId('unknown-cli'), 'rejects unknown cli id');
t(!isCliId(null), 'rejects null');

// 2. Binary probe for gpt/nemotron
const gptProbe = checkBinaryAvailability('gpt');
t(gptProbe.binary === 'aider', 'gpt maps to aider binary');
t(typeof gptProbe.available === 'boolean', 'reports binary availability boolean');
t(gptProbe.prerequisites !== undefined, 'probes toolchain prerequisites for aider');
t(typeof gptProbe.prerequisites?.python === 'boolean', 'probes python availability');
t(typeof gptProbe.prerequisites?.uv === 'boolean', 'probes uv availability');

// 3. checkCliReady error surfacing
const ready = checkCliReady('unknown');
t(!ready.ok && ready.error?.includes('Unknown agent type'), 'handles unknown cli type');

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
