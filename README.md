# Warp Racer

An immersive web3 racing game built on Base. Connect your Base Account via Coinbase Wallet, submit a transaction, and dive into the Warp Race!

## Overview
This application implements:
- Base ecosystem connection via Wagmi + Viem.
- EOA connection leveraging **Coinbase Wallet** specifically as the Base Account entry point.
- Single and Batch mode transactions leveraging EIP-5792.
- Interactive HTML5 Canvas racing game launched upon successful transaction attribution.

**Note:** The native Base Account integrations/smart wallet specific account abstractions and advanced sponsor functions are strictly available via the Coinbase Wallet connector. Full `@base-org/account` integration is currently considered **NOT ACTIVE** / still in development phase structurally in this snippet, hence "Base Account" (as a standalone explicit feature outside the wallet) is not fully active, relying securely on standard Coinbase Smart Wallet connections instead.

## Running the App
```bash
npm run dev
```

## Security
No sensitive information, API keys, or raw builder codes are stored openly on the frontend UI interface.
