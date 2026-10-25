# Bedrock

> **The Open-Source, Local-First Foundation for Persistent, Secure, and Verifiable AI Agent Execution.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![AWS Strands Agents](https://img.shields.io/badge/AWS-Strands%20Agents-orange.svg)](https://aws.amazon.com/bedrock/)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

---

## Table of Contents

- [Overview](#overview)
- [The Core Philosophy](#the-core-philosophy)
- [Why Bedrock? The Open-Source Value Proposition](#why-bedrock-the-open-source-value-proposition)
- [Who Benefits from Bedrock?](#who-benefits-from-bedrock)
  - [Solo Developers & Builders](#solo-developers--builders)
  - [Engineering Teams & Tech Leads](#engineering-teams--tech-leads)
  - [Open-Source Maintainers](#open-source-maintainers)
  - [Local AI & Privacy Enthusiasts](#local-ai--privacy-enthusiasts)
- [Key Capabilities](#key-capabilities)
  - [Multi-Agent Orchestration & Real Interactive PTYs](#multi-agent-orchestration--real-interactive-ptys)
  - [Dual-Layer Safety: In-Process Regex & Strands Supervisor](#dual-layer-safety-in-process-regex--strands-supervisor)
  - [100% Offline & Local-First Execution (LocalHarness)](#100-offline--local-first-execution-localharness)
  - [Persistent Architecture: Process Decoupling](#persistent-architecture-process-decoupling)
  - [Project Memory, Shared Knowledge & Skills](#project-memory-shared-knowledge--skills)
  - [Hands-Free Voice Control with Amazon Nova Sonic](#hands-free-voice-control-with-amazon-nova-sonic)
  - [Inter-Agent Communication via Model Context Protocol (MCP)](#inter-agent-communication-via-model-context-protocol-mcp)
- [Supported Agent CLIs & Runtimes](#supported-agent-clis--runtimes)
- [How to Use Bedrock: Step-by-Step Guide](#how-to-use-bedrock-step-by-step-guide)
  - [Step 1: Installation & Prerequisites](#step-1-installation--prerequisites)
  - [Step 2: Configuration & Environment](#step-2-configuration--environment)
  - [Step 3: Launching Bedrock](#step-3-launching-bedrock)
  - [Step 4: Creating Your First Project & Spawning Agents](#step-4-creating-your-first-project--spawning-agents)
  - [Step 5: Managing Human-in-the-Loop Approval Gates](#step-5-managing-human-in-the-loop-approval-gates)
  - [Step 6: Running Completely Local Models via LocalHarness](#step-6-running-completely-local-models-via-localharness)
  - [Step 7: Collaborating Across Shared Context & Group Chat](#step-7-collaborating-across-shared-context--group-chat)
  - [Step 8: Hands-Free Voice Control](#step-8-hands-free-voice-control)
- [The Eight Console Views](#the-eight-console-views)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Deployment Options](#deployment-options)
  - [1. Local Development](#1-local-development)
  - [2. Native Desktop Application (Electron)](#2-native-desktop-application-electron)
  - [3. Docker Containerization](#3-docker-containerization)
- [Security & Threat Model](#security--threat-model)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)
- [Author & Acknowledgments](#author--acknowledgments)

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

## The Core Philosophy

Bedrock is built around three core architectural tenets:

1. **Agents scale; human attention does not.**
   Compute is abundant, but human focus is finite. Starting ten agents is easy; reading ten simultaneous terminal logs is impossible. Bedrock continuously monitors all raw agent output, drops routine terminal noise, extracts salient milestones into a project Group Chat, and alerts you only when a decision is genuinely required.

2. **A gate is an enforceable decision, not an ignorable notification.**
   Post-hoc logs or non-blocking notifications do not protect repositories. When an agent attempts a destructive command or encounters a critical prompt, Bedrock freezes the agent's process where it stands. The terminal is brought forward, waiting for explicit human authorization (`y` / `n` / custom instruction).

3. **The supervisor proposes; the human disposes.**
   The AWS Strands Supervisor watches progress, analyzes obstacles, and formulates strategic next steps. However, the supervisor possesses zero autonomous write permissions to dispatch instructions to agents. It can only generate a structured *Proposal Plan*. An agent will never receive a supervisor-originated command until a human reviews and clicks **Approve**.

---

## Why Bedrock? The Open-Source Value Proposition

As an open-source project, Bedrock provides unique architectural and economic advantages over proprietary SaaS orchestration tools:

- **100% Data Sovereignty & Local-First Execution**: Bedrock stores all state—projects, plans, group chat logs, execution audits, skills, and memory—locally on disk under `~/.conduit`. It operates without mandatory cloud subscriptions, telemetry, or remote vendor lock-in.
- **Support for Both Local & Hosted LLMs**: Run frontier cloud models (Claude 3.5/4.5 Sonnet, OpenAI Codex) side-by-side with fully offline open-source weights (Ollama, LM Studio, vLLM, llama.cpp) on consumer hardware via LocalHarness.
- **Zero Cost for Core Coordination**: The daemon, PTY terminal multiplexing, MCP server routing, local LLM bridge, and web console are free and open-source forever under the Apache License 2.0.
- **Extensible & Hackable Architecture**: Define custom agents via YAML templates, implement read-only observer plugins, supply reusable domain knowledge via standard `SKILL.md` folders, or wire up external systems via REST and WebSocket APIs.

---

## Who Benefits from Bedrock?

### Solo Developers & Builders
- **10x Multi-Tasking**: Assign front-end styling to one agent, database migrations to a second, and unit test generation to a third—all working concurrently within the same project.
- **Peace of Mind**: Walk away from long-running agent workflows knowing destructive commands (`git reset --hard`, `npm publish`, deleting files) will be halted by approval gates until you return.
- **Unified Interface**: Replace dozens of fragmented terminal windows with a single responsive workspace featuring customizable 1-up, 2-up, 3-up, Tmux grid, and infinite canvas layouts.

### Engineering Teams & Tech Leads
- **Transparent Audit Trails**: Every raised approval gate, approval/rejection decision, human override, and supervisor proposal is recorded in a tamper-evident `audit.jsonl` log.
- **Shared Project Memory & Standardized Skills**: Embed team conventions, architecture rules, and preferred API patterns directly into `.bedrock/skills/` and project memory so every agent follows identical standards.
- **Token & Cost Optimization**: Track model quota burn across Claude and Codex sessions directly from the status bar, preventing surprise API billing spikes.

### Open-Source Maintainers
- **Safe Community PR Review & Triaging**: Run agents inside Docker sandboxes to review, build, and test contributor pull requests with automated gate policies that prevent unauthorized network calls or environment tampering.
- **Documented Decision Records**: Maintain a centralized project Wiki that agents continuously reference and update as features evolve.

### Local AI & Privacy Enthusiasts
- **Air-Gapped Operation**: Run models completely disconnected from the internet using Ollama, LM Studio, or vLLM. No prompt data, source code, or proprietary intellectual property ever leaves your machine.
- **Zero Cloud Spend**: Harness the power of open-weight coding models (Qwen 2.5 Coder, DeepSeek-Coder, Llama 3) with full approval gate protection and multi-agent coordination.

---

## Key Capabilities

### Multi-Agent Orchestration & Real Interactive PTYs
Unlike web wrappers that display simulated fake consoles, Bedrock spawns real operating system pseudo-terminals using `node-pty`. 
- **Full Interactivity**: You can click directly into any terminal and type commands, respond to interactive CLI prompts, send `Ctrl+C`, or take over manual control at any second.
- **Replay Buffering**: The daemon maintains circular output buffers for every agent. Reconnecting to the web UI or opening a new browser tab immediately replays existing terminal history without missing a character.
- **Flexible Layouts**: Switch instantly between Single terminal focus, 2-Up vertical split, 3-Up columns, 4-pane Tmux grid, or an expansive drag-and-drop Canvas.

### Dual-Layer Safety: In-Process Regex & Strands Supervisor
Safety in Bedrock operates through two coordinated defensive layers:
1. **In-Process Regex Interceptors (Zero Latency)**: 23 regex patterns monitor streaming agent output in real-time. Destructive commands (e.g. `rm -rf`, `git reset --hard`, `DROP TABLE`, `mkfs`, force pushes) and interactive confirmation prompts (`y/N`, `Allow this action?`) instantly trigger a freeze without waiting for network round-trips.
2. **Strands Supervisor Classifier**: Powered by the AWS Strands Agents SDK running on Amazon Bedrock (or Anthropic fallback), the Supervisor periodically reviews batched agent output. It classifies activities, synthesizes milestone summaries, detects circular loops or blocked progress, and raises context-aware gates.

### 100% Offline & Local-First Execution (LocalHarness)
Bedrock includes native support for **LocalHarness**, enabling agents to run entirely against local model providers:
- Compatible with **Ollama**, **LM Studio**, **vLLM**, and **llama.cpp** exposing an OpenAI-compatible API (`http://127.0.0.1:11434/v1`).
- Runs agents using the Agent Client Protocol (ACP) over stdio.
- Every permission request emitted by a local model (file edits, bash execution, directory listing) becomes an enforceable approval gate.
- Configurable directly from **Settings → Local model** or via environment variables.

### Persistent Architecture: Process Decoupling
Bedrock separates user interaction from process execution across two distinct tiers:
- **The Bedrock Daemon (`:3210`)**: A lightweight background service that owns all PTY processes, JSON-RPC Codex threads, ACP LocalHarness sessions, status state machines, and supervisor watchers.
- **The Web & API Server (`:3200`)**: An Express server and WebSocket hub providing the React front-end and client communications.

**Resilience Guarantee**: You can refresh the browser, close your laptop, restart Vite, or restart the web server entirely—**your running agents will not be interrupted, aborted, or killed.** When the web server restarts, it automatically reconnects to the daemon and resumes real-time telemetry.

### Project Memory, Shared Knowledge & Skills
Bedrock provides a structured cognitive substrate so agents collaborate effectively:
- **Shared Folder (`shared_content/`)**: A dedicated project directory mounted into every agent's context where agents exchange build artifacts, patches, and shared data.
- **Project Wiki (`wiki/`)**: Long-term markdown documentation that persists across sessions and is injected into agent instruction headers.
- **Project Memory**: Global project context defined in the Team tab, automatically appended to agent system instructions (`CLAUDE.md`, `AGENTS.md`, or `.localharness/INSTRUCTIONS.md`).
- **Skills Discovery (`SKILL.md`)**: Automatically loads skill definitions from `.bedrock/skills/`, `.agents/skills/`, and `~/.conduit/skills/`, teaching agents specific development workflows, commands, and rules.

### Hands-Free Voice Control with Amazon Nova Sonic
Bedrock features a voice control subsystem:
- **Bidirectional Live Audio**: Integrated with Amazon Nova 2 Sonic over WebSockets for natural, low-latency spoken conversations.
- **Autonomous Tool Calling**: Spoken requests trigger Keeper tools to inspect running agents, query project status, and propose plans.
- **Strict Server-Side Approval Guard**: While agents can be halted or rejected instantly by voice, destructive approval gates cannot be bypassed by voice hallucinations. The approval guard strictly enforces four criteria on the live audio transcript before approving any gate.

### Inter-Agent Communication via Model Context Protocol (MCP)
Bedrock bundles Model Context Protocol servers:
- **Agent MCP Server**: Gives Claude Code agents tools (`message_agent`, `list_teammates`) to communicate directly with other agents running in the same project.
- **Keeper MCP Server**: Provides the project Keeper with org-level inspection and coordination tools across all projects and agents.

---

## Supported Agent CLIs & Runtimes

All supported agents are defined in a unified registry (`src/cli-registry.ts`):

| Agent CLI | Provider / Core | Runtime Mode | Status Tracking | Inter-Agent MCP | Typical Use Case |
|---|---|---|---|:---:|---|
| **Claude Code** | Anthropic | PTY (`node-pty`) | Lifecycle Hooks | Yes | Complex multi-file refactoring, architectural changes |
| **Codex CLI** | OpenAI | `codex app-server` | JSON-RPC Items | No | Fast iterative coding, unit testing, structured tool tasks |
| **Gemini CLI** | Google | PTY (`node-pty`) | Process Liveness | No | Large context analysis, code audits, documentation |
| **OpenCode** | Open Source | PTY (`node-pty`) | Process Liveness | No | Independent community agent workflows |
| **GPT-OSS 120B** | Groq / `aider` | PTY (`node-pty`) | Process Liveness | No | Ultra-fast code generation via Groq LPU inference |
| **Nemotron 3.5** | OpenRouter / `aider` | PTY (`node-pty`) | Process Liveness | No | Cost-effective reasoning and bug resolution |
| **LocalHarness** | Ollama / vLLM / LM Studio | ACP Session (`stdio`) | ACP Turn Lifecycle | Yes (Config) | 100% offline, privacy-critical, zero-cloud development |

---

## How to Use Bedrock: Step-by-Step Guide

Follow this guide to get up and running from scratch.

### Step 1: Installation & Prerequisites

#### Prerequisites
- **Node.js**: Version 22.0 or higher (`node --version`). *Node 22 is required for native `--experimental-strip-types` support used by the test suites.*
- **Git**: Installed and available on your system `PATH`.
- **Python (Optional, for aider / LocalHarness)**: Python 3.10–3.12 (with `uv` recommended: `curl -LsSf https://astral.sh/uv/install.sh | sh`).

#### Clone and Install
```bash
# Clone the repository
git clone https://github.com/puneetnith28/Bedrock.git
cd Bedrock

# Install dependencies (respecting --legacy-peer-deps configured in .npmrc)
npm install
```

---

### Step 2: Configuration & Environment

Bedrock works immediately out of the box without requiring any API keys for basic terminal management and local execution.

To configure optional capabilities (cloud models, supervisor, voice, authentication), copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key environment options in `.env`:

```ini
# Basic authentication for the web interface (user:password)
# RECOMMENDED before exposing Bedrock outside of localhost
CONDUIT_AUTH=admin:your-secure-password

# Supervisor Provider: auto | bedrock | anthropic | local | off
SUPERVISOR_PROVIDER=auto
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-5-20250929-v1:0
ANTHROPIC_API_KEY=your-anthropic-api-key

# Local model server configuration (Ollama, LM Studio, vLLM)
LOCAL_LLM_BASE_URL=http://127.0.0.1:11434/v1
LOCAL_LLM_MODEL=qwen2.5-coder:latest
LOCAL_LLM_API_KEY=not-needed

# Fast hosted inference keys (optional)
GROQ_API_KEY=your-groq-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

---

### Step 3: Launching Bedrock

#### Option A: Development Mode (with Hot Reload)
Runs the TypeScript watcher (`tsup`), background daemon, web server, and Vite dev server concurrently:

```bash
npm run dev
```
- **Vite Web Console**: [http://localhost:5173](http://localhost:5173)
- **Web API Server**: [http://localhost:3200](http://localhost:3200)
- **Bedrock Daemon**: `ws://127.0.0.1:3210`

#### Option B: Production Mode
Builds all production bundles and launches the servers:

```bash
npm run build
npm run start:all
```
Open [http://localhost:3200](http://localhost:3200) in your browser.

#### Option C: Seed Demo Data
To explore an active multi-agent studio with sample data pre-populated:

```bash
npm run seed:demo
```

---

### Step 4: Creating Your First Project & Spawning Agents

1. **Open the Web Console**: Navigate to `http://localhost:5173` (or `http://localhost:3200`).
2. **Create a Project**:
   - In the left sidebar, click **+ New Project**.
   - Enter a project name (e.g., `Payment Gateway`) and select the target working directory on your filesystem.
3. **Spawn Agents**:
   - Inside your project, click **+ Add Agent**.
   - Choose your agent type:
     - **Claude Code**: Best for full-repo understanding and refactoring.
     - **Codex**: Ideal for rapid task execution and test generation.
     - **Gemini**: Great for broad file reviews and architectural critique.
     - **LocalHarness**: 100% offline local model.
   - Enter an agent name (e.g., `Architect`, `Tester`) and role.
   - Click **Start Agent**.
4. **Interact**:
   - Select the **Terminals** tab. Click into any agent terminal to type directly into the CLI session.
   - Use the layout switcher in the header to view agents in **2-Up**, **3-Up**, or **Tmux Grid** modes.

---

### Step 5: Managing Human-in-the-Loop Approval Gates

When an agent attempts a sensitive operation, Bedrock intervenes automatically:

1. **Gate Activation**:
   - If an agent types `git push -f`, attempts to delete files, or prompts `Do you want to proceed? (y/N)`, Bedrock instantly intercepts the stream.
   - The agent's status shifts to `awaiting_input`.
   - A high-visibility **Approval Gate Modal** appears on your screen displaying the exact pending command, risk classification, and context.
2. **Taking Action**:
   - **Approve (`y`)**: Sends confirmation to the CLI to proceed.
   - **Reject (`n` / `Esc`)**: Halts the command or sends an interrupt signal (`SIGINT` / `Ctrl+C`).
   - **Custom Input**: Type alternative instructions directly into the modal to redirect the agent's approach safely.

---

### Step 6: Running Completely Local Models via LocalHarness

For zero-cloud, 100% private agent execution:

1. **Start Your Local Model Server**:
   - For Ollama: `ollama run qwen2.5-coder` (listens on `http://127.0.0.1:11434/v1`).
   - For LM Studio: Start the local inference server on port `1234`.
2. **Install LocalHarness**:
   ```bash
   uv tool install localharness
   ```
3. **Configure Settings**:
   - In the Bedrock web console, click **Settings (⚙) → Local model**.
   - Verify the Base URL (`http://127.0.0.1:11434/v1`) and select your model.
   - Click **Test Connection** to verify health.
4. **Create a LocalHarness Agent**:
   - Click **+ Add Agent** → Select **LocalHarness (local model)**.
   - LocalHarness will communicate via Agent Client Protocol (ACP). Every file write, shell command, or permission check will surface as an approval gate before execution.

---

### Step 7: Collaborating Across Shared Context & Group Chat

- **Project Group Chat**: Switch to the **Group Chat** tab. Post high-level objectives here. Tag specific agents using `@agent-name` to assign subtasks.
- **Shared Folder**: Place reference documentation, test payloads, or database schemas into the **Shared** tab. Bedrock mounts this folder into each agent's execution context.
- **Project Wiki**: Use the **Wiki** tab to author long-term markdown specifications that persist across agent lifecycles.
- **Team Memory & Skills**: Navigate to the **Team** tab to define persistent instructions and view automatically discovered skills from `.bedrock/skills`.

---

### Step 8: Hands-Free Voice Control

1. Click the **Microphone** icon in the console header or press the wake word (default: `jarvis`).
2. Speak your command naturally:
   - *"What are the agents working on right now?"*
   - *"Ask the Architect agent to check the database migrations."*
   - *"Halt all running agents."*
3. The Voice Keeper responds via speech audio while streaming actions to the HUD.

---

## The Eight Console Views

The Bedrock console provides eight dedicated tabs tailored to multi-agent management:

| View Tab | Primary Purpose | Key Features |
|---|---|---|
| **Terminals** | Real-time terminal multiplexer | Interactive PTYs, layout switcher (1-up to canvas), direct keyboard input, output replay. |
| **MCP Messages** | Inter-agent communication log | Live stream of direct messages and collaboration events passed between agents via MCP. |
| **Group Chat** | Project-level conversational hub | Unified conversation between humans, agents, and the Supervisor. Mention agents via `@name`. |
| **Shared** | Synchronized project workspace | File browser and editor for the shared directory accessible by all project agents. |
| **Wiki** | Long-term knowledge base | Markdown documentation repository providing durable architectural context. |
| **Team** | Agent templates, skills & memory | Manage declarative YAML agent templates, persistent memory notes, and view discovered `SKILL.md` workflows. |
| **Activity** | Unified audit & event stream | Chronological feed of file operations, gate triggers, agent lifecycle state changes, and supervisor notes. |
| **Usage** | Cost and quota monitoring | Real-time tracking of session percentage, weekly burn rate, and reset windows for API quotas. |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open Command Palette (switch projects, trigger actions, filter agents) |
| `⌘J` / `Ctrl+J` | Open The Keeper (query cross-project intelligence) |
| `⌘1` – `⌘5` | Quick-focus agent terminals 1 through 5 |
| `y` | Approve active approval gate (when modal is focused) |
| `n` | Reject active approval gate |
| `Esc` | Dismiss modal or cancel action |

---

## Deployment Options

### 1. Local Development
Ideal for active development and contributing:
```bash
npm install
npm run dev
```

### 2. Native Desktop Application (Electron)
Bedrock packages into a native cross-platform desktop application that bundles its own internal daemon and web server:
```bash
# Build icons and desktop installer
npm run build:desktop
```
The resulting executable will be in `dist-desktop/`. The desktop app automatically loads user configuration from `~/.conduit/.env`.

### 3. Docker Containerization
Run Bedrock in an isolated container pre-equipped with Node.js, Python, Git, and CLI runtimes:
```bash
# Set mandatory authentication password
export CONDUIT_AUTH=admin:your-secret-password

# Build and start container
docker compose up -d --build
```
Access the console at `http://localhost:3200`.

---

## Security & Threat Model

Because Bedrock executes coding agents with authentic shell access to your filesystem, security is paramount:

- **Mandatory Authentication (`CONDUIT_AUTH`)**: When deploying to remote servers or shared networks, set `CONDUIT_AUTH=user:password`. Both HTTP endpoints and WebSocket upgrade connections enforce constant-time credential comparison.
- **Strict Path Containment**: User-supplied file paths are sanitized through path-traversal-safe resolution (`resolveInside`). Operations attempting directory traversal outside project bounds are rejected.
- **Rendered Output Sanitization**: All markdown emitted by models, agent logs, and chats is sanitized using `DOMPurify` before DOM injection, mitigating Stored XSS threats.
- **Local Secret Isolation**: API keys configured via settings are saved to `~/.conduit/api-keys.json` with restricted filesystem permissions and are never transmitted to client browsers.

---

## Testing & Quality Assurance

Bedrock maintains a rigorous automated testing and evaluation pipeline:

```bash
# Run type checking across backend and frontend
npm run typecheck

# Run unit tests and gate pattern validation
npm test

# Run end-to-end integration smoke test against a running instance
npm run smoke

# Run abuse and security resilience testing (fuzzing and traversal checks)
npm run check:abuse

# Run UI roundtrip integration tests
npm run check:ui

# Run full daemon and organization API tests
npm run check:org

# Run complete test verification suite
npm run check:all
```

---

## Contributing

We welcome contributions from the open-source community! Whether you are fixing bugs, adding support for new agent CLIs, designing UI enhancements, or expanding skills documentation:

1. **Fork the Repository**: Create your feature branch (`git checkout -b feature/amazing-feature`).
2. **Follow Coding Standards**: Ensure code passes typechecks (`npm run typecheck`) and all existing tests pass (`npm test`).
3. **Commit Cleanly**: Write meaningful, conventional commit messages.
4. **Open a Pull Request**: Submit your PR with a thorough description of the changes, test results, and relevant issue links.

Please ensure your contributions adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Code of Conduct

Bedrock is dedicated to providing an open, welcoming, diverse, and harassment-free environment for every contributor and user.

We hold our community to the standards established in the **Contributor Covenant (version 2.1)**. All participants are expected to maintain professional, constructive, and empathetic communication across all project issues, discussions, and pull requests.

For detailed standards, enforcement procedures, and confidential reporting of incidents, please review our complete [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for complete details.

---

## Maintainers & Authors

- **Puneet Yadav** (Project Maintainer): [puneetnith28@gmail.com](mailto:puneetnith28@gmail.com) ([@puneetnith28](https://github.com/puneetnith28))
- **Prashant Bahuguna** (Project Maintainer): [devprashant19@gmail.com](mailto:devprashant19@gmail.com) ([@devprashant19](https://github.com/devprashant19))

### Acknowledgments
- Built with [AWS Strands Agents SDK](https://aws.amazon.com/bedrock/), [node-pty](https://github.com/microsoft/node-pty), [React](https://react.dev/), [Vite](https://vite.dev/), [xterm.js](https://xtermjs.org/), and [LocalHarness](https://github.com/ahwurm/localharness).