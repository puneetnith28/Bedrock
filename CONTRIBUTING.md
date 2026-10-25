# Contributing to Bedrock

Thank you for your interest in contributing to **Bedrock**! Bedrock is an open-source, local-first foundation for persistent, secure, and verifiable AI agent execution.

We welcome contributions from developers, researchers, technical writers, and designers. This guide outlines everything you need to get your development environment running, test your code, and submit pull requests.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) (adapted from Contributor Covenant v2.1). Please read it to understand our community standards and reporting guidelines.

---

## Prerequisites & Supported Runtimes

Before setting up Bedrock locally, verify that your machine has:

- **Node.js 22.0 or higher** (`node --version`):
  *Node.js 22.x is required* because the automated test runner uses native `--experimental-strip-types` (introduced in Node.js 22.6+). On older Node versions (such as Node 20), test execution will fail.
- **Git** (`git --version`): To clone and contribute.
- **npm** (`npm --version`): Bundled with Node.js.
- **Python 3.10–3.12 with `uv` (Optional)**: Only needed if you plan to run local `aider` agents (GPT-OSS / Nemotron) or `LocalHarness` agents. Install `uv` via `curl -LsSf https://astral.sh/uv/install.sh | sh`.

---

## Getting Started: Local Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/Bedrock.git
   cd Bedrock
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # or for clean CI-like installation:
   npm ci
   ```
   > **Note on Peer Dependencies**: The repository includes a `.npmrc` file with `legacy-peer-deps=true` pre-configured to resolve dependencies between Express and model SDKs.

3. **Configure Environment (Optional)**:
   Bedrock requires zero API keys to start and run basic local terminals:
   ```bash
   cp .env.example .env
   ```
   See `docs/environment.md` for complete documentation on optional cloud keys (Amazon Bedrock, Anthropic, Groq, OpenRouter) and authentication settings (`CONDUIT_AUTH`).

---

## Running Bedrock Locally

### Development Mode (with Hot Reloading)
Runs `tsup` in watch mode, the background Bedrock daemon, the web server, and Vite dev server concurrently:
```bash
npm run dev
```
- Web Console: [http://localhost:5173](http://localhost:5173)
- Web API Server: [http://localhost:3200](http://localhost:3200)
- Daemon Socket: `ws://127.0.0.1:3210`

### Production Mode
Builds all production bundles and launches both the daemon and web server:
```bash
npm run build
npm run start:all
```
Open [http://localhost:3200](http://localhost:3200) in your browser.

### Seeding Demo Data
To inspect an active multi-agent studio with sample agents and context:
```bash
npm run seed:demo
```

---

## Quality Gates & Verification Commands

All pull requests must pass our automated quality gates before merging. Run these commands locally before submitting your changes:

| Command | Purpose | What it validates |
|---|---|---|
| `npm run check:brand` | Brand & Convention Lint | Enforces consistent terminology and naming assertions. |
| `npm run lint` | Linting Check | Project linting rules. |
| `npm run format` | Formatting Check | Code formatting verification. |
| `npm run typecheck` | TypeScript Type Check | Runs `tsc --noEmit` across backend (`tsconfig.json`) and frontend (`client/tsconfig.json`). |
| `npm test` | Automated Test Suite | Executes all 50 test suites in `scripts/test-*.mjs` via Node 22 native type-stripping. |
| `npm run build` | Build Verification | Compiles server bundles (`tsup`) and client assets (`vite build`). |
| `npm run check:all` | Comprehensive Check | Convenience command that runs `typecheck`, `check:brand`, and `npm test` sequentially. |

---

## Architectural & Security Invariants

When writing code in Bedrock, keep these critical invariants in mind:

1. **State Mutation Requires Broadcast**:
   Any REST route or daemon method that mutates state must broadcast changes over WebSocket (`broadcast(...)`). Never add a route that modifies state silently.
2. **Single Gate Resolution Path**:
   Gate resolution has exactly one implementation: `src/gate-resolve.ts`. Both REST and voice paths share this function to prevent divergent safety logic.
3. **No Auto-Approval for ACP / LocalHarness Gates**:
   Local model permission requests (`source: 'acp'`) must never be auto-approved, and approvals must default to allow-once.
4. **Path Traversal Protection**:
   Never concatenate untrusted user inputs with `path.join()`. Always use `storage.resolveInside()` or helper functions (`sharedDirFor()`, `wikiDirFor()`).
5. **DOMPurify Sanitization**:
   All markdown or raw text emitted by agents/models rendered in the React UI must pass through `renderMarkdown()` in `client/src/utils/md.ts`.
6. **Supervisor Bounded Authority**:
   The supervisor only produces *proposals*. It possesses zero direct write permissions to send unapproved instructions to agents.

---

## Submitting Changes

### 1. Branching Strategy
Create a descriptive branch for your work:
- `feat/<feature-name>`: New capabilities, UI views, or provider integrations.
- `fix/<bug-name>`: Bug fixes and edge-case handling.
- `chore/<task-name>`: Build tooling, dependencies, or maintenance.
- `docs/<topic>`: Documentation enhancements.

### 2. Conventional Commits
All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
```
<type>(<scope>): <short summary>

[optional body explaining motivation and changes]
```
Common types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`, `build`, `security`.

### 3. Open a Pull Request
1. Push your branch to your fork on GitHub.
2. Open a Pull Request targeting the `main` branch of `puneetnith28/Bedrock`.
3. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely, including the summary, related issues, and testing performed.
4. Verify that all CI checks pass. If a check fails, review the GitHub Actions log, fix the issue locally, and push an update to your branch.

---

## Continuous Integration (CI) Overview

Bedrock runs an automated CI pipeline (`.github/workflows/ci.yml`) on every pull request and push to `main`:
- Runs in an isolated environment with **least-privilege permissions** (`permissions: contents: read`).
- Uses pinned, immutable GitHub Actions (`actions/checkout`, `actions/setup-node`).
- Executes reproducible dependency installation (`npm ci`).
- Executes brand linting, type checks, all 50 automated test suites, and production bundle builds.

---

## Where to Get Help & Report Issues

- **Bug Reports & Feature Requests**: Submit an issue on the [GitHub Issue Tracker](https://github.com/puneetnith28/Bedrock/issues). Please include steps to reproduce, expected vs actual behavior, and environment details.
- **Security Vulnerabilities**: Report security issues privately to the project maintainers:
  - **Puneet Yadav**: [puneetnith28@gmail.com](mailto:puneetnith28@gmail.com)
  - **Prashant Bahuguna**: [devprashant19@gmail.com](mailto:devprashant19@gmail.com)
