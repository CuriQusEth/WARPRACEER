# Warp Racer

An immersive AI-powered web3 racing game built on Base. Connect your Base Account via Coinbase Wallet, submit on-chain transactions, and dive into high-speed Warp Racing!

## Overview
This application implements:
- Base ecosystem connection via Wagmi, Viem & Coinbase Wallet.
- ERC-8021 Transaction Attribution support (Automatic suffixes for builder codes).
- ERC-8004 Trustless Agents support & SIWA (Sign-In with Agent) signatures.
- Interactive HTML5 Canvas racing game launched upon successful on-chain login.
- Real-time on-chain score submission and "Say GM" transactions.
- A2A (Agent-to-Agent) endpoints and MCP protocol readiness for seamless AI agent registry.

## Game Mechanics
- **Controls**: Swipe/Tap left or right to avoid obstacles and collect tokens.
- **Warp Mechanism**: Utilize warp gates for massive speed boosts and invincibility frames.
- **Scores & Leaderboards**: Navigate the endless procedural track; your highest score can be submitted directly onto the Base chain via an authenticated transaction.
- **Skins & Audio**: Neon-cyber aesthetics with immersive audio and visual feedback.

## Hosting & Deployment
Warp Racer is designed to be hosted on Vercel or any standard Node/Static host that supports serverless functions.
- **Frontend**: Vite + React (Deploy as SPA).
- **A2A & MCP Serverless APIs**: The root `/api` directory includes `mcp.js` and `agent.js` to handle Agent registry requirements and MCP tools requests. These are automatically deployed as serverless functions on Vercel.

To run locally:
```bash
npm install
npm run dev
```

## Security & Sensitive Information
- **Environment Variables**: No sensitive API keys or plain-text private keys are stored in the codebase or frontend repository.
- **SIWA Signatures**: The game relies on decentralized wallet signatures (EIP-4361 / SIWA) and valid smart contract transactions to prove identity. User wallets are never compromised.
- **Agent Keys**: Any agent-specific credentials used for orchestration should be kept in secure `.env.local` files, NEVER committed to GitHub or exposed publicly.
- **On-chain Data**: All scores are recorded on the blockchain immutably; avoid pushing PII (Personally Identifiable Information) in transaction data.
