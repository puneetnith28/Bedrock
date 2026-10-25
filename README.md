# Bedrock

Bedrock is an open-source, local-first foundation for persistent, secure, and verifiable AI agent execution.

Run Claude Code, Codex, Gemini, OpenCode, GPT-OSS, Nemotron and LocalHarness side by side with human-in-the-loop approval gates, shared context, and continuous supervision.

## Local models (LocalHarness)

Bedrock can run entirely on your own machine — no AWS or Anthropic credentials:

1. Run a local model server (Ollama, LM Studio, vLLM or llama.cpp) and install
   [LocalHarness](https://github.com/ahwurm/localharness): `uv tool install localharness`.
2. Point Bedrock at the server in **Settings → Local model**, or with `LOCAL_LLM_BASE_URL`
   (default `http://127.0.0.1:11434/v1`, Ollama) and optionally `LOCAL_LLM_MODEL`.
3. Create an agent of type **LocalHarness (local model)**. Every permission it asks for becomes an
   approval gate with LocalHarness's own answers; nothing is auto-approved.
4. Optional: `SUPERVISOR_PROVIDER=local` runs the Supervisor on the same server (still a Strands
   Agent), and `CONDUIT_KEEPER_ENGINE=localharness` runs the Keeper there.

Also new, for every agent type (the **Team** tab): project **memory** every agent is told about,
**skills** (`SKILL.md` folders in `.bedrock/skills`, `.agents/skills` or `~/.conduit/skills`),
agent definitions in `.bedrock/agents/*.yaml`, and machine-level **plugins** in
`~/.conduit/plugins`. Details: [Agent Runtime](docs/agent-runtime.md) and
[Environment](docs/environment.md).

## Documentation

- [Documentation Index](docs/README.md)
- [Architecture & Topology](ARCHITECTURE.md)
- [Testing & Evaluation](TESTING.md)
- [Development Guide](CLAUDE.md)

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start backend daemon and web interface
npm run dev

# Or run tests
npm test
```

## License

MIT