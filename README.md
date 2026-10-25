# Bedrock

> **The Open-Source, Local-First Foundation for Persistent, Secure, and Verifiable AI Agent Execution.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![AWS Strands Agents](https://img.shields.io/badge/AWS-Strands%20Agents-orange.svg)](https://aws.amazon.com/bedrock/)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

---

## Table of Contents

- [Overview](#overview)
- [Capabilities & Current Limitations](#capabilities--current-limitations)
  - [Key Capabilities](#key-capabilities)
  - [Current Limitations & Known Constraints](#current-limitations--known-constraints)
- [The Core Philosophy](#the-core-philosophy)
- [Technology Stack & Architecture](#technology-stack--architecture)
- [Supported Agent CLIs & Runtimes](#supported-agent-clis--runtimes)
- [Getting Started & Local Development](#getting-started--local-development)
  - [Prerequisites & Supported Systems](#prerequisites--supported-systems)
  - [Step 1: Installation](#step-1-installation)
  - [Step 2: Configuration (Optional)](#step-2-configuration-optional)
  - [Step 3: Launching Bedrock](#step-3-launching-bedrock)
  - [Step 4: Creating Projects & Spawning Agents](#step-4-creating-projects--spawning-agents)
  - [Step 5: Managing Human-in-the-Loop Approval Gates](#step-5-managing-human-in-the-loop-approval-gates)
  - [Step 6: Running 100% Offline Models via LocalHarness](#step-6-running-100-offline-models-via-localharness)
- [The Eight Console Views](#the-eight-console-views)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Quality Gates & Testing](#quality-gates--testing)
- [Desktop Packaging & Build Instructions](#desktop-packaging--build-instructions)
- [Troubleshooting Common Setup Errors](#troubleshooting-common-setup-errors)
- [Security & Threat Model](#security--threat-model)
- [Release Status & Documentation Links](#release-status--documentation-links)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)
- [Maintainers & Authors](#maintainers--authors)

---

## Overview

Modern software engineering increasingly relies on specialized autonomous coding agents—such as Anthropic's **Claude Code**, OpenAI's **Codex**, Google's **Gemini CLI**, OpenCode, or open-weights models like DeepSeek, Qwen, and Llama running via **LocalHarness** or **aider**.

However, running multiple autonomous agents simultaneously quickly creates critical bottlenecks:
1. **Attention Deficit**: One developer cannot monitor multiple terminal windows printing thousands of lines of output simultaneously.
2. **Safety Risks**: Autonomous CLI agents execute destructive shell commands (`rm -rf`, `git push --force`, database migrations, dropping partitions, overwriting secrets).
3. **Session Volatility**: Closing a browser window, refreshing a web page, or restarting a development server frequently kills background agent processes and abandons work in progress.
4. **Siloed Context**: Agents work in isolation, unaware of tests, schemas, architecture decisions, or code written by companion agents.

**Bedrock solves this.** It acts as an ambient supervisory layer and unified orchestration console. It hosts multiple agent CLIs side-by-side in real interactive pseudo-terminals (PTYs) and structured JSON-RPC / Agent Client Protocol (ACP) streams, watches their output in real time, classifies operations through an AWS Strands-powered Supervisor, and intercepts hazardous commands with **human-in-the-loop approval gates** before execution.

---

## Capabilities & Current Limitations

### Key Capabilities
- **Multi-Agent Orchestration & Real Interactive PTYs**: Spawns authentic operating system pseudo-terminals using `node-pty`. Click directly into any terminal, type commands, send `Ctrl+C`, or switch layouts (1-Up, 2-Up, 3-Up, Tmux grid, draggable Canvas).
- **Dual-Layer Safety Architecture**:
  1. *Zero-Latency In-Process Regex Interceptors*: 23 deterministic patterns intercept dangerous commands (`rm -rf`, `git reset --hard`, `DROP TABLE`) and interactive confirmation prompts immediately.
  2. *AWS Strands Supervisory Engine*: Periodically classifies batched agent activities, synthesizes milestones into project chat, and raises context-aware gates.
- **100% Offline & Local-First Execution (LocalHarness)**: Connect to Ollama, LM Studio, or vLLM (`http://127.0.0.1:11434/v1`). Models run over the Agent Client Protocol (ACP) where file edits and shell commands surface as approval gates.
- **Persistent Process Decoupling**: The background daemon (`:3210`) isolates agent processes from the web server (`:3200`) and browser sessions. Refreshing the browser or restarting the web server never terminates active agents.
- **Inter-Agent Communication (MCP)**: Bundled Model Context Protocol servers allow agents to message teammates directly and share build context.
- **Shared Memory, Wiki & Skills**: Auto-discovers reusable workflows from `.bedrock/skills/` (`SKILL.md`) and injects long-term project context into agent system headers.
- **Hands-Free Voice Control**: WebSocket audio integration with Amazon Nova 2 Sonic featuring strict server-side approval transcript validation.

### Current Limitations & Known Constraints
- **Node.js Runtime Requirement**: Node.js 22.6+ is strictly required for test execution due to native `--experimental-strip-types`. Node 20 will fail automated test runs.
- **Agent CLI Prerequisites**: Claude Code and Codex require user-provided CLI tools and valid API keys; they cannot execute live turns without valid credentials.
- **Native Desktop Code Signing**: Current community release artifacts for macOS and Windows are unsigned by default. macOS Gatekeeper and Windows Defender SmartScreen warnings appear until signing certificates are configured.
- **Native Dependency Build Tools**: `node-pty` bundles prebuilt binaries for common operating systems, but compiling from source on non-standard architectures requires standard C++ build tools (`build-essential`, Xcode CLI tools, or Visual Studio C++ build tools).

---

## The Core Philosophy

1. **Agents scale; human attention does not.**
   Starting ten agents is easy; reading ten simultaneous terminal logs is impossible. Bedrock continuously monitors raw output, filters terminal noise, extracts milestones into a unified Group Chat, and alerts you only when a decision is genuinely required.

2. **A gate is an enforceable decision, not an ignorable notification.**
   When an agent attempts a destructive command or encounters a critical prompt, Bedrock freezes the agent's process where it stands. The terminal is brought forward, waiting for explicit human authorization (`y` / `n` / custom instruction).

3. **The supervisor proposes; the human disposes.**
   The AWS Strands Supervisor watches progress and formulates strategic next steps as structured *Proposal Plans*. It possesses zero autonomous write permissions to dispatch instructions to agents without explicit human approval.

---

## Technology Stack & Architecture

Bedrock is built with an auditable, lightweight open-source stack:

| Layer | Technologies & Dependencies | Purpose |
|---|---|---|
| **Runtime & Language** | Node.js 22.x+, TypeScript 5.5 | Type-safe execution with native type-stripping support. |
| **Daemon Service (`:3210`)** | `ws` 8.18, `node-pty` 1.2, `chokidar` 5.0 | Manages PTY sessions, ACP streams, regex interception, and state machines. |
| **Web & API Server (`:3200`)** | Express 4.21, `dotenv` 16.6 | REST API endpoints, WebSocket dispatch hub, and static client serving. |
| **Front-End Console** | React 18.3, Vite 5.4, xterm.js 5.5, `@xterm/addon-fit` | Responsive multi-pane terminal multiplexer, Activity feed, and HUD. |
| **Agent Protocols** | AWS Strands Agents SDK, Anthropic SDK, OpenAI SDK, MCP SDK | Supervisor reasoning, frontier cloud CLI integration, and MCP servers. |
| **Security & Sanitization** | `DOMPurify` 3.4 | Sanitizes agent markdown output before DOM rendering to prevent XSS. |
| **Desktop Application** | Electron 44.1, `electron-builder` 26.15 | Bundled cross-platform desktop installers for Linux, macOS, and Windows. |
| **Bundling & Build** | `tsup` 8.2 | Fast ESM/CJS build compilation for backend and Electron entry points. |

---

## Supported Agent CLIs & Runtimes

All supported agents are defined in a unified registry (`src/cli-registry.ts`):

| Agent CLI | Provider / Core | Runtime Mode | Status Tracking | Inter-Agent MCP | Typical Use Case |
|---|---|---|---|:---:|---|
| **Claude Code** | Anthropic | PTY (`node-pty`) | Lifecycle Hooks | Yes | Complex multi-file refactoring, architectural changes |
| **Codex CLI** | OpenAI | `codex app-server` | JSON-RPC Items | No | Fast iterative coding, unit testing, structured tool tasks |
| **Gemini CLI** | Google | PTY (`node-pty`) | Process Liveness | No | Large context analysis, code audits, documentation |
| **OpenCode** | Open Source | PTY (`node-pty`) | Process Liveness | No | Independent community agent workflows |
| **GPT-OSS 120B** | Groq / `aider` | PTY (`node-pty`) | Process Liveness | No | Fast code generation via Groq LPU inference |
| **Nemotron 3.5** | OpenRouter / `aider` | PTY (`node-pty`) | Process Liveness | No | Cost-effective reasoning and bug resolution |
| **LocalHarness** | Ollama / vLLM / LM Studio | ACP Session (`stdio`) | ACP Turn Lifecycle | Yes (Config) | 100% offline, privacy-critical, zero-cloud development |

---

## Getting Started & Local Development

### Prerequisites & Supported Systems
- **Node.js**: Version 22.0 or higher (`node --version` >= 22.6 recommended).
- **npm**: Version 10 or higher (bundled with Node.js 22).
- **Git**: Installed and available on your system `PATH`.
- **Supported OS**: Linux (Ubuntu 22.04+), macOS 13+, Windows 11 (WSL2 recommended or native PowerShell).

### Step 1: Installation
```bash
# Clone the repository
git clone https://github.com/puneetnith28/Bedrock.git
cd Bedrock

# Clean install dependencies (respecting legacy-peer-deps configured in .npmrc)
npm ci
```

### Step 2: Configuration (Optional)
> **Note:** Bedrock requires **zero API keys or environment variables** to run basic terminal management and local projects.

To configure optional capabilities (cloud models, supervisor, voice, authentication), copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key optional settings in `.env`:
```ini
# Optional: Basic auth for web UI (user:pass) - recommended on public interfaces
CONDUIT_AUTH=admin:your-secure-password

# Optional: Supervisor provider (auto | bedrock | anthropic | local | off)
SUPERVISOR_PROVIDER=auto
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-5-20250929-v1:0
ANTHROPIC_API_KEY=your-anthropic-key

# Optional: Local model server (Ollama, LM Studio, vLLM)
LOCAL_LLM_BASE_URL=http://127.0.0.1:11434/v1
LOCAL_LLM_MODEL=qwen2.5-coder:latest
LOCAL_LLM_API_KEY=not-needed
```

### Step 3: Launching Bedrock

#### Development Mode (with Hot Reload)
Runs `tsup` in watch mode, the background daemon, the web server, and the Vite dev server concurrently:
```bash
npm run dev
```
- **Vite Web Console**: [http://localhost:5173](http://localhost:5173)
- **Web API Server**: [http://localhost:3200](http://localhost:3200)
- **Bedrock Daemon**: `ws://127.0.0.1:3210`

#### Production Mode
Compiles production bundles and starts the servers:
```bash
npm run build
npm run start:all
```
Open [http://localhost:3200](http://localhost:3200) in your browser.

#### Seeding Sample Demo Data
```bash
npm run seed:demo
```

### Step 4: Creating Projects & Spawning Agents
1. Open [http://localhost:5173](http://localhost:5173).
2. Click **+ New Project** in the sidebar, choose a project name, and select a filesystem directory.
3. Click **+ Add Agent**, select your preferred agent runtime (Claude, Codex, Gemini, or LocalHarness), and click **Start Agent**.
4. In the **Terminals** tab, click directly into the terminal to interact with the CLI session.

### Step 5: Managing Human-in-the-Loop Approval Gates
When an agent attempts a sensitive shell command (`git push -f`, deleting directories, dropping tables) or reaches an interactive confirmation prompt:
1. Bedrock intercepts the stream and changes agent state to `awaiting_input`.
2. An **Approval Gate Modal** appears showing the pending command and context.
3. Click **Approve (`y`)** to allow, **Reject (`n`)** to cancel, or type custom instructions into the modal.

### Step 6: Running 100% Offline Models via LocalHarness
1. Start your local inference server (e.g. Ollama: `ollama run qwen2.5-coder`).
2. In Bedrock, go to **Settings (⚙) → Local model**, verify the URL (`http://127.0.0.1:11434/v1`), and test the connection.
3. Click **+ Add Agent** → Choose **LocalHarness (local model)**. All operations stream over ACP with permission approval gates.

---

## The Eight Console Views

| View Tab | Primary Purpose | Key Features |
|---|---|---|
| **Terminals** | Terminal multiplexer | Interactive PTYs, layout switcher (1-up to canvas), direct typing, replay buffer. |
| **MCP Messages** | Inter-agent communication | Real-time feed of direct messages passed between agents via MCP. |
| **Group Chat** | Project conversational hub | Unified discussion between humans, agents, and the Supervisor. Mention agents via `@name`. |
| **Shared** | Synchronized project workspace | File browser and editor for the shared directory mounted into agent workspaces. |
| **Wiki** | Long-term knowledge base | Markdown documentation repository providing durable architectural context. |
| **Team** | Agent templates, skills & memory | Manage declarative agent templates, persistent memory notes, and view `SKILL.md` workflows. |
| **Activity** | Unified audit & event stream | Chronological feed of file operations, gate triggers, lifecycle state changes, and supervisor notes. |
| **Usage** | Quota & cost monitoring | Real-time tracking of session percentage and weekly API quota reset windows. |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open Command Palette (switch projects, filter agents) |
| `⌘J` / `Ctrl+J` | Open The Keeper (query cross-project intelligence) |
| `⌘1` – `⌘5` | Quick-focus agent terminals 1 through 5 |
| `y` | Approve active approval gate (when modal is focused) |
| `n` | Reject active approval gate |
| `Esc` | Dismiss modal or cancel action |

---

## Quality Gates & Testing

Bedrock enforces comprehensive quality gates in CI. Contributors can run the complete verification suite locally with a single command:

```bash
npm run check:all
```

Individual commands:
```bash
# Brand assertion & naming lint
npm run check:brand

# ESLint & Prettier verification
npm run lint
npm run format

# TypeScript compilation checks (backend and frontend)
npm run typecheck

# Automated test suites (all 50 suites via Node 22 native type-stripping)
npm test

# Build verification (tsup server bundles and vite client assets)
npm run build
```

---

## Desktop Packaging & Build Instructions

Bedrock can be packaged into standalone native desktop installers using Electron:

```bash
# 1. Generate icon assets
npm run build:icons

# 2. Build application bundles
npm run build

# 3. Package desktop application (outputs to dist-desktop/)
npm run build:desktop
```

Packaged outputs:
- **Linux**: `dist-desktop/*.AppImage` and `dist-desktop/*.deb`
- **macOS**: `dist-desktop/*.dmg` and `dist-desktop/*.zip`
- **Windows**: `dist-desktop/*.exe` installer and `dist-desktop/*.zip` portable

For full release procedures, checksum validation, and signing instructions, see [docs/release-procedure.md](docs/release-procedure.md).

---

## Troubleshooting Common Setup Errors

| Symptom | Root Cause | Solution |
|---|---|---|
| `TypeError: Unknown file extension ".ts"` during tests | Running Node.js < 22.6. Test runner requires native `--experimental-strip-types`. | Upgrade Node.js: `nvm use 22` or install Node.js 22.x from [nodejs.org](https://nodejs.org/). |
| `listen EADDRINUSE: address already in use :::3200` | Port 3200 is already in use by a background instance or service. | Terminate the process on port 3200 (`fuser -k 3200/tcp` on Linux) or change `PORT=3201` in `.env`. |
| `WebSocket connection to ws://127.0.0.1:3210 failed` | Bedrock daemon is not running on port 3210. | Launch the daemon via `npm run daemon` or use `npm run dev` to start all services concurrently. |
| `node-pty` native compilation error | Missing C++ build tools on host machine. | On Ubuntu: `sudo apt-get install -y build-essential python3`. On macOS: `xcode-select --install`. |
| `HTTP 401 Unauthorized` on web console | `CONDUIT_AUTH` is set in `.env` and browser credentials are missing. | Enter username and password matching `CONDUIT_AUTH=user:password`, or unset `CONDUIT_AUTH` in `.env` for local use. |
| LocalHarness connection failed (`ECONNREFUSED 127.0.0.1:11434`) | Local model server (Ollama) is not running. | Start Ollama (`ollama serve`) and ensure `LOCAL_LLM_BASE_URL=http://127.0.0.1:11434/v1` is reachable. |

---

## Security & Threat Model

- **Authentication (`CONDUIT_AUTH`)**: When binding outside localhost, configure `CONDUIT_AUTH=user:password`. Both HTTP endpoints and WebSocket upgrade connections enforce constant-time credential comparison.
- **Strict Path Containment**: All file operations resolve via `storage.resolveInside()` to prevent directory traversal outside project roots.
- **Rendered Output Sanitization**: Markdown logs and chats are sanitized via `DOMPurify` before DOM rendering to prevent XSS.
- **Local Secret Isolation**: Configured API keys are stored in `~/.conduit/api-keys.json` with restricted permissions (`0600`) and are never sent over client WebSocket streams.
- **Security Policy**: For reporting vulnerabilities, consult [SECURITY.md](SECURITY.md).

---

## Release Status & Documentation Links

- **Current Version**: `1.0.0` (Initial release pending; see [CHANGELOG.md](CHANGELOG.md))
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- **Release Procedure & Checklist**: [docs/release-procedure.md](docs/release-procedure.md)
- **Environment Reference**: [docs/environment.md](docs/environment.md)
- **API Specification**: [docs/api-spec.md](docs/api-spec.md)
- **Agent Runtime Details**: [docs/agent-runtime.md](docs/agent-runtime.md)

---

## Contributing

We welcome contributions from the open-source community! Before submitting pull requests, please read our [Contributing Guide](CONTRIBUTING.md) for environment setup, quality-gate commands, and submission conventions.

---

## Code of Conduct

Bedrock is dedicated to providing an inclusive, welcoming, and harassment-free community. All participants must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) (Contributor Covenant v2.1).

---

## License

Bedrock is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for complete details.

---

## Maintainers & Authors

- **Puneet Yadav** (Project Maintainer): [puneetnith28@gmail.com](mailto:puneetnith28@gmail.com) ([@puneetnith28](https://github.com/puneetnith28))
- **Prashant Bahuguna** (Project Maintainer): [devprashant19@gmail.com](mailto:devprashant19@gmail.com) ([@devprashant19](https://github.com/devprashant19))