# 🚀 Warp Racer | Advanced Autonomous Agent & On-Chain Racing

Warp Racer is a highly optimized, AI-powered on-chain racing ecosystem built on Base. It tightly integrates real-time HTML5 racing mechanics with robust, specialized agent coordination utilizing SIWA (Sign-In with Agent), ERC-8004, and ERC-8021 standards.

This repository serves as both the client application for players, and the centralized A2A (Agent-to-Agent) endpoints for MCP protocol synchronization.

## 🧠 Core Architecture & Mechanics

- **High-Performance Rendering**: Built on Vite + React with heavily optimized, 60 FPS HTML5 Canvas game loops utilizing Framer Motion for UI parallelization.
- **On-Chain Agent Synchronization**: Natively interfaces with EIP-5792, enabling batch transactions, sponsored execution models, and immutable performance indexing directly on the Base network.
- **Trustless Multi-Track Orchestration**: Includes EIP-8004 agent registries (`agent-card.json`) to allow verifiable racing optimizations and interactions securely over MCP (Model Context Protocol).

## 🔒 Security Posture & Sensitive Data Management

> **CRITICAL:** Operating autonomous game state logic on public blockchains requires strict data custody and identity verification mechanisms.

- **Private Keys & Local Storage**: Never commit `.env`, `.env.local`, or any file containing agent private keys, API secrets, or master seeds. All orchestration endpoints enforce stateless signature verification.
- **SIWA (Sign-In with Agent)**: Ensures that any modification to game state or agent alignment is securely signed through EIP-4361 standard messages.
- **Ecosystem Data Immutability**: Player performance records (`SUBMIT_SCORE`) and interactive checkpoints (`Say GM`) are processed as raw transactions. No Personally Identifiable Information (PII) should ever be mapped to these unencrypted transaction payloads. 

## 🌐 EIP-8004 Agent Registration & MCP Setup

This application hosts independent agent APIs out of the box aimed at cross-agent ecosystem coordination:
1. **Agent Card Profile**: `.well-known/agent-card.json` exports to the public 8004 registry standards, declaring skillsets, endpoints, and identity.
2. **MCP API (`/api/mcp`)**: A full JSON-RPC 2.0 Webhook interface exposing standard racing agent tools:
   - `start_race`
   - `get_race_status` 
   - `get_leaderboard`
   - `optimize_speed`
   - `get_track_info`

Connect any MCP-compatible clients to the `/api/mcp` endpoint using standard JSON-RPC HTTP POST payloads.

## 🚀 Hosting & Vercel Deployment Optimization

This project is tuned specifically for serverless edge networks like Vercel. 

### Serverless APIs & Routing
The root `/api` directory dynamically scales Node.js endpoints (`/api/mcp`, `/api/agent`) independent of the static Vite frontend. 
You must deploy the static assets while preserving the `/.well-known/agent-card.json` route for autonomous verification.

**Vercel Configuration:**
To guarantee that the MCP endpoints and Agent Card bypass the SPA fallback (`index.html`), the repository relies on Vercel's native `/api` function routing and static directory resolution. Ensure your Framework Preset is strictly set to **Vite** or **Node.js** (depending on your setup) and utilizes the `vercel.json` rewrites logic built-in to the master branch.

```bash
# 1. Install dependencies
npm install

# 2. Start local development environment
npm run dev

# 3. Build for production (Static + Serverless)
npm run build
```
