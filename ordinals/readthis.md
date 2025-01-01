This document explains the purpose of the cross-chain wallet adapter, how to use it, and how it can be integrated into an **Eliza AI agent framework** or similar autonomous-agent environment.

---

# Cross-Chain Autonomous Wallet Adapter (Solana, Bitcoin, Base)

**Purpose**
This repository contains a **cross-chain, cross-platform wallet adapter** for Solana, Bitcoin, and Base (an Ethereum L2). It demonstrates how you can:

1. **Create Wallets** for each chain.
2. **Fetch Balances** and basic transaction history.
3. **Send Transactions** across the supported blockchains.

It leverages the following technologies:

- **Next.js + React** for the front-end UI.
- **Helius RPC + @solana/web3.js** for Solana.
- **Ordiscan** (plus `bitcoinjs-lib`) for Bitcoin.
- **Ethers** (or the Coinbase SDK) for Base (Ethereum L2).

The example also outlines how these capabilities can be exposed to **autonomous AI agents** (e.g., Eliza/Auto-GPT-like frameworks) in a secure, structured way.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Architecture Overview](#architecture-overview)
3. [Quick Start](#quick-start)
4. [Usage Guide](#usage-guide)
5. [Integration with Eliza AI Agent Framework](#integration-with-eliza-ai-agent-framework)
6. [Security Considerations](#security-considerations)
7. [License](#license)

---

## Key Features

- **Multi-chain wallet creation**: Generate new wallet addresses and keypairs for Solana, Bitcoin, and Base.
- **Balance queries**: Retrieve on-chain balances using Helius (Solana), Ordiscan (Bitcoin), and an RPC provider or Coinbase API (Base).
- **Transaction sending**: Demonstrates how to build, sign, and broadcast simple transactions on each chain.
- **Transaction indexing**: Fetch transaction history for each chain from relevant indexing providers.
- **Extendable**: Easily integrate additional blockchains or indexing APIs.

---

## Architecture Overview

```
Cross-Chain Wallet Adapter
├── pages
│   ├── index.js            # Home page
│   ├── agent.js            # Demonstrates the agent wallet manager
├── components
│   └── AgentWalletManager.jsx  # Main React component for wallet creation/management
├── services
│   ├── solanaService.js    # Solana wallet operations (Helius)
│   ├── bitcoinService.js   # Bitcoin wallet ops (Ordiscan + bitcoinjs-lib)
│   └── baseService.js      # Base/Ethereum L2 wallet ops (ethers / Coinbase SDK)
├── utils
│   └── keyManagement.js    # Utility for key generation and handling (demo purposes)
└── ...
```

- **`services/`**: Each blockchain’s core logic is encapsulated in a dedicated service.
- **`components/AgentWalletManager.jsx`**: Unified React component that references each service to create or load wallets, display balances, and send transactions.
- **`pages/agent.js`**: Renders the `AgentWalletManager` for demonstration purposes.

---

## Quick Start

1. **Clone the repository** (or copy the code).

2. **Install dependencies**:
   ```bash
   npm install
   ```
   This should install Next.js, React, Helius SDK, bitcoinjs-lib, ethers, and any other required packages.

3. **Set up environment variables** (if needed). For example, set your **Helius API Key**:
   ```
   HELIUS_API_KEY=<YOUR_HELIUS_KEY>
   ```
   Make sure to **not** commit sensitive keys to version control.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Then open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## Usage Guide

1. **Create wallets**:
   - Navigate to the **Agent** page (`/agent`).
   - Click **Create Solana Wallet**, **Create Bitcoin Wallet**, or **Create Base Wallet** to generate a new keypair.
   - **Disclaimer**: In this demo, the private keys are stored in `localStorage`. This is **not secure** for production.

2. **Check balances & transactions**:
   - Once a wallet is created, the UI fetches the balance and transaction history for that wallet from the respective chain or indexing provider.
   - You can see the data printed out in the UI in JSON format.

3. **Send transactions**:
   - For each chain, there is a “Send” button that demonstrates sending a simple transaction.
   - In the sample code, you must provide a recipient address and an amount (in the correct units).
   - For Bitcoin, you would typically need real UTXO data and a broadcast endpoint (the demo code shows “dummy” steps).

4. **Extend or modify**:
   - Add new chains by creating another service (e.g., `services/polygonService.js`) that mirrors the structure.
   - Integrate different indexing or broadcast APIs.
   - Replace localStorage key storage with a secure method.

---

## Integration with Eliza AI Agent Framework

### 1. Overview

This cross-chain wallet adapter can be easily integrated into an **Eliza AI agent** or any other autonomous framework by exposing a set of **wallet and transaction APIs** that the agent can call. The agent can then:

- Generate addresses or import existing wallets.
- Check balances at will (e.g., to decide if it has enough funds).
- Initiate transactions with a specified amount, to a specified address.
- Track transaction confirmations or gather event data from the chain.

### 2. How to Integrate

1. **Expose RPC-like endpoints**:
   - Create simple API routes in Next.js (e.g., `pages/api/solana.js`, `pages/api/bitcoin.js`, `pages/api/base.js`) that wrap around the service methods.
   - The Eliza AI agent can make HTTP requests to these API endpoints to create wallets, fetch balances, and send transactions.

2. **Use direct function calls**:
   - If the Eliza framework runs within the same Node.js environment as this code, you can import and call the service functions directly.
   - For instance, from the Eliza agent code:
     ```js
     import { createSolanaWallet, sendSolanaTransaction } from '../services/solanaService';

     // Example usage in the agent:
     const newWallet = createSolanaWallet();
     const txSig = await sendSolanaTransaction(newWallet.secretKey, recipientAddress, lamports);
     ```
   - This approach gives the agent programmatic access without needing to go through HTTP endpoints.

3. **Implement safety controls**:
   - Provide the Eliza agent with a limited subset of commands to avoid reckless spending.
   - Create a separate “secure manager” class or layer to confirm large transactions or require multi-signature approval.

### 3. Example Flow in an Eliza Agent

- **Agent**: “I need to pay 0.001 SOL to a collaborator’s Solana address.”
- **Eliza**: (Within its chain-of-thought) calls `sendSolanaTransaction` with the correct parameters.
- **Eliza**: Checks the transaction signature or status to confirm success.
- **Eliza**: Logs the result or takes further actions depending on success/failure.

---

## Security Considerations

1. **Do not store raw private keys** in localStorage in production. This code is for demonstration purposes only.
2. **Use secure vaults or server-side storage** for private keys if possible.
3. **API Key safety**: Store your **Helius** or other sensitive API keys in `.env` files or server-side environment variables.
4. **Tx broadcasting**: Ensure you trust the nodes or APIs used to fetch balances and broadcast transactions.
5. **Agent autonomy**: If your Eliza AI agent can self-execute transactions, put appropriate guardrails or spending limits in place to avoid potential malicious or accidental large-value transactions.

---

## License

You can use and modify this code under the terms of your chosen license (MIT, Apache-2.0, etc.). Make sure to include a LICENSE file with your repository.

---

### Final Notes

This **Cross-Chain Autonomous Wallet Adapter** is meant to be a **starting point**. For real-world deployment:

- Integrate production-ready libraries for UTXO management on Bitcoin.
- Use robust transaction indexing solutions (e.g., Helius for Solana, Ordiscan for Bitcoin, Etherscan/Covalent for Base).
- Securely handle private keys and sign transactions offline whenever possible.

**Happy building!**