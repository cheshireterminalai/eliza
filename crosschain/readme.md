This is my experiemental structure a Next.js + React application that lets autonomous agents (or users) create cross-chain wallets (Solana, Bitcoin, Base/Ethereum) and manage/index their transactions.

- **Helius RPC + SDK** for Solana
- **Ordiscan API** for Bitcoin indexing
- **(Optional) bitcoinjs-lib** or similar library for Bitcoin wallet creation/management
- **Coinbase SDK** for Base (Ethereum L2) wallet management
- **Next.js + React** for the UI

---

## 1. Project Initialization

```bash
# Create a new Next.js app
npx create-next-app cross-chain-wallet-adapter
cd cross-chain-wallet-adapter

# Install the dependencies you need
npm install react react-dom next
npm install helius-sdk @solana/web3.js
npm install bitcoinjs-lib axios
npm install coinbase-commerce-node ethers
```

*(Note: Dependencies may differ depending on which exact Bitcoin/Ethereum library or Coinbase SDK you use.)*

---

## 2. Project Structure

A suggested file/folder structure:

```
cross-chain-wallet-adapter
├── pages
│   ├── index.js
│   ├── agent.js
│   └── _app.js
├── components
│   └── AgentWalletManager.jsx
├── services
│   ├── solanaService.js
│   ├── bitcoinService.js
│   └── baseService.js
├── utils
│   └── keyManagement.js
├── package.json
└── ...
```

### Explanation

1. **pages/**:
   - `index.js` – the landing page where you might display an overview or let the user create an agent.
   - `agent.js` – a dedicated page to handle an individual agent's wallet UI, transactions, and indexing.

2. **components/**:
   - `AgentWalletManager.jsx` – a React component that might display wallet info for each chain, plus controls for sending/receiving transactions.

3. **services/**:
   - `solanaService.js` – handles Solana wallet creation, transaction sending, and indexing using Helius.
   - `bitcoinService.js` – handles Bitcoin wallet creation, transaction sending, and indexing using Ordiscan + a Bitcoin library.
   - `baseService.js` – handles Base (Ethereum L2) wallet creation, transaction sending, and indexing using the Coinbase SDK (or ethers with Base endpoints).

4. **utils/keyManagement.js**:
   - A utility for generating and storing private keys securely. *(For real production usage, do **not** store raw private keys on the frontend or in localStorage. Use a secure vault or encrypted storage.)*

---

## 3. Example Services

### 3.1 Solana (using Helius + @solana/web3.js)

> **Note:** You will need your **Helius API key**. Be sure to keep this private if it has usage limits or is paid.

```js
// services/solanaService.js

import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Helius } from 'helius-sdk'; // Example import if you use Helius's official SDK

const HELIUS_RPC_URL = "https://rpc.helius.xyz?api-key=YOUR_HELIUS_API_KEY";

export const createSolanaWallet = () => {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Array.from(keypair.secretKey), // For demonstration
  };
};

export const getSolanaBalance = async (publicKey) => {
  const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance;
};

export const sendSolanaTransaction = async (
  fromSecretKey,
  toAddress,
  lamports // 1 SOL = 1,000,000,000 lamports
) => {
  try {
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
    const fromKeypair = Keypair.fromSecretKey(new Uint8Array(fromSecretKey));
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports,
      })
    );

    const signature = await connection.sendTransaction(transaction, [fromKeypair]);
    // Optional: confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error("Solana transaction error:", error);
    throw error;
  }
};

// Example: get transaction history using Helius
export const getSolanaTransactions = async (publicKey) => {
  try {
    // Using the Helius SDK or direct RPC call:
    const helius = new Helius(HELIUS_RPC_URL);
    // Helius has specialized endpoints, e.g. /addresses/<address>/transactions
    // Or you can just call connection.getSignaturesForAddress(...)

    // This is a conceptual example:
    const txs = await helius.getTransactions(publicKey);
    return txs;
  } catch (error) {
    console.error("Error fetching Solana transactions:", error);
    return [];
  }
};
```

### 3.2 Bitcoin (using [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) + Ordiscan)

> **Note:** Ordiscan provides indexing for Bitcoin Ordinals and transactions. You’ll still need a library like `bitcoinjs-lib` to generate addresses, sign transactions, etc. You also need a Bitcoin node or a 3rd-party service to broadcast transactions.

```js
// services/bitcoinService.js

import * as bitcoin from 'bitcoinjs-lib';
import axios from 'axios';

const NETWORK = bitcoin.networks.testnet;
// or mainnet if you are on the main Bitcoin network

// Ordiscan base URL for mainnet/testnet:
const ORDISCAN_API_BASE = "https://ordiscan.xyz/api"; // update if needed

export const createBitcoinWallet = () => {
  const keyPair = bitcoin.ECPair.makeRandom({ network: NETWORK });
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: NETWORK });

  return {
    address,
    // In production, store WIF (Wallet Import Format) or privateKey in secure vault
    privateKeyWIF: keyPair.toWIF(),
  };
};

export const getBitcoinBalance = async (address) => {
  // For real usage, you'd need a UTXO provider or a block explorer API.
  // Ordiscan might help you parse ordinals, inscriptions, and possibly balances.

  // Ordiscan’s official docs: https://ordiscan.xyz/docs
  // Example endpoint: GET /api/address/<address>
  try {
    const response = await axios.get(`${ORDISCAN_API_BASE}/address/${address}`);
    // The shape of the response can vary. For example:
    // response.data.balance
    return response.data.balance || 0;
  } catch (error) {
    console.error("Error fetching Bitcoin balance:", error);
    return 0;
  }
};

export const sendBitcoinTransaction = async (fromPrivateKeyWIF, toAddress, satoshis) => {
  // This is non-trivial because you must gather UTXOs, create a transaction,
  // sign it, and broadcast it to the Bitcoin network or via a 3rd-party service.

  // Pseudocode:
  try {
    const keyPair = bitcoin.ECPair.fromWIF(fromPrivateKeyWIF, NETWORK);

    // 1. Fetch UTXOs for your address (via a block explorer or your own node).
    // 2. Build a PSBT (Partially Signed Bitcoin Transaction).
    // 3. Sign it.
    // 4. Broadcast.

    // For indexing, you can rely on Ordiscan or a similar explorer to check confirmations.

    return "dummy-txid";
  } catch (error) {
    console.error("Error sending BTC transaction:", error);
    throw error;
  }
};

// Example: get transaction history from Ordiscan
export const getBitcoinTransactions = async (address) => {
  try {
    const response = await axios.get(`${ORDISCAN_API_BASE}/address/${address}/txs`);
    // The exact shape depends on Ordiscan's API
    return response.data || [];
  } catch (error) {
    console.error("Error fetching Bitcoin transactions:", error);
    return [];
  }
};
```

### 3.3 Base (Ethereum L2) (using Coinbase SDK or ethers)

Base is EVM-compatible. You can often use the standard `ethers` library with the appropriate RPC URL. Alternatively, if you have special needs via Coinbase’s official SDK, you could integrate that. Below is an example using **ethers**:

```js
// services/baseService.js

import { ethers } from "ethers";

// For Base mainnet (or testnet), find the official RPC endpoints in docs:
// https://docs.base.org/
const BASE_RPC_URL = "https://mainnet.base.org";
const provider = new ethers.providers.JsonRpcProvider(BASE_RPC_URL);

export const createBaseWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

export const getBaseBalance = async (address) => {
  try {
    const balance = await provider.getBalance(address);
    return balance.toString(); // in wei
  } catch (error) {
    console.error("Error fetching Base balance:", error);
    return "0";
  }
};

export const sendBaseTransaction = async (fromPrivateKey, toAddress, amountInEth) => {
  try {
    const wallet = new ethers.Wallet(fromPrivateKey, provider);
    const tx = {
      to: toAddress,
      value: ethers.utils.parseEther(amountInEth.toString()),
    };
    const receipt = await wallet.sendTransaction(tx);
    return receipt;
  } catch (error) {
    console.error("Error sending Base transaction:", error);
    throw error;
  }
};

export const getBaseTransactions = async (address) => {
  // You can either parse logs from the provider or use 3rd-party indexing solutions.
  // For a simple approach, get transaction history from an explorer or a specialized API.

  // ethers does not have a built-in "get full TX history" method,
  // so you'd typically rely on block explorers or indexing solutions like Covalent, Etherscan, etc.
  // For demonstration, just returning an empty array or partial logic:
  return [];
};
```

---

## 4. A Shared React Component for Agent Wallet Management

Here’s a simplified React component that demonstrates how an **agent** might manage multiple chains from a single UI. We’ll create or load existing wallet data, show balances, and show minimal transaction functionality.

```jsx
// components/AgentWalletManager.jsx

import React, { useEffect, useState } from "react";

// Our service modules
import {
  createSolanaWallet,
  getSolanaBalance,
  sendSolanaTransaction,
  getSolanaTransactions,
} from "../services/solanaService";

import {
  createBitcoinWallet,
  getBitcoinBalance,
  sendBitcoinTransaction,
  getBitcoinTransactions,
} from "../services/bitcoinService";

import {
  createBaseWallet,
  getBaseBalance,
  sendBaseTransaction,
  getBaseTransactions,
} from "../services/baseService";

export default function AgentWalletManager() {
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [bitcoinWallet, setBitcoinWallet] = useState(null);
  const [baseWallet, setBaseWallet] = useState(null);

  const [solanaBalance, setSolanaBalance] = useState(0);
  const [bitcoinBalance, setBitcoinBalance] = useState(0);
  const [baseBalance, setBaseBalance] = useState("0");

  // Transactions
  const [solanaTxs, setSolanaTxs] = useState([]);
  const [bitcoinTxs, setBitcoinTxs] = useState([]);
  const [baseTxs, setBaseTxs] = useState([]);

  // On mount, create or load existing wallets from localStorage
  useEffect(() => {
    const savedSolana = localStorage.getItem("solanaWallet");
    const savedBitcoin = localStorage.getItem("bitcoinWallet");
    const savedBase = localStorage.getItem("baseWallet");

    if (savedSolana) setSolanaWallet(JSON.parse(savedSolana));
    if (savedBitcoin) setBitcoinWallet(JSON.parse(savedBitcoin));
    if (savedBase) setBaseWallet(JSON.parse(savedBase));
  }, []);

  // Whenever we have wallet data, fetch balances
  useEffect(() => {
    if (solanaWallet?.publicKey) {
      getSolanaBalance(solanaWallet.publicKey).then(setSolanaBalance);
      getSolanaTransactions(solanaWallet.publicKey).then(setSolanaTxs);
    }
    if (bitcoinWallet?.address) {
      getBitcoinBalance(bitcoinWallet.address).then(setBitcoinBalance);
      getBitcoinTransactions(bitcoinWallet.address).then(setBitcoinTxs);
    }
    if (baseWallet?.address) {
      getBaseBalance(baseWallet.address).then(setBaseBalance);
      getBaseTransactions(baseWallet.address).then(setBaseTxs);
    }
  }, [solanaWallet, bitcoinWallet, baseWallet]);

  const handleCreateSolanaWallet = () => {
    const newWallet = createSolanaWallet();
    setSolanaWallet(newWallet);
    localStorage.setItem("solanaWallet", JSON.stringify(newWallet));
  };

  const handleCreateBitcoinWallet = () => {
    const newWallet = createBitcoinWallet();
    setBitcoinWallet(newWallet);
    localStorage.setItem("bitcoinWallet", JSON.stringify(newWallet));
  };

  const handleCreateBaseWallet = () => {
    const newWallet = createBaseWallet();
    setBaseWallet(newWallet);
    localStorage.setItem("baseWallet", JSON.stringify(newWallet));
  };

  // Example transaction sending
  const handleSendSolana = async (to, lamports) => {
    if (!solanaWallet) return;
    const txSig = await sendSolanaTransaction(
      solanaWallet.secretKey,
      to,
      lamports
    );
    console.log("Solana TX Sig:", txSig);
  };

  const handleSendBitcoin = async (to, satoshis) => {
    if (!bitcoinWallet) return;
    const txid = await sendBitcoinTransaction(
      bitcoinWallet.privateKeyWIF,
      to,
      satoshis
    );
    console.log("Bitcoin TX ID:", txid);
  };

  const handleSendBase = async (to, amountInEth) => {
    if (!baseWallet) return;
    const receipt = await sendBaseTransaction(
      baseWallet.privateKey,
      to,
      amountInEth
    );
    console.log("Base TX Receipt:", receipt);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Agent Wallet Manager</h2>
      <hr />

      <div>
        <h3>Solana</h3>
        {solanaWallet ? (
          <div>
            <p>Public Key: {solanaWallet.publicKey}</p>
            <p>Balance: {solanaBalance} lamports</p>
            <button
              onClick={() => handleSendSolana("RECIPIENT_ADDRESS", 1000000)}
            >
              Send 0.001 SOL
            </button>
            <div>
              <h4>Transaction History</h4>
              <pre>{JSON.stringify(solanaTxs, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <button onClick={handleCreateSolanaWallet}>Create Solana Wallet</button>
        )}
      </div>

      <hr />

      <div>
        <h3>Bitcoin</h3>
        {bitcoinWallet ? (
          <div>
            <p>Address: {bitcoinWallet.address}</p>
            <p>Balance: {bitcoinBalance} satoshis</p>
            <button
              onClick={() => handleSendBitcoin("RECIPIENT_BTC_ADDRESS", 1000)}
            >
              Send 1000 sats
            </button>
            <div>
              <h4>Transaction History</h4>
              <pre>{JSON.stringify(bitcoinTxs, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <button onClick={handleCreateBitcoinWallet}>Create Bitcoin Wallet</button>
        )}
      </div>

      <hr />

      <div>
        <h3>Base (Ethereum L2)</h3>
        {baseWallet ? (
          <div>
            <p>Address: {baseWallet.address}</p>
            <p>Balance (wei): {baseBalance}</p>
            <button onClick={() => handleSendBase("RECIPIENT_BASE_ADDRESS", 0.001)}>
              Send 0.001 ETH on Base
            </button>
            <div>
              <h4>Transaction History</h4>
              <pre>{JSON.stringify(baseTxs, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <button onClick={handleCreateBaseWallet}>Create Base Wallet</button>
        )}
      </div>
    </div>
  );
}
```

---

## 5. Pages

### 5.1 `pages/index.js`

A simple landing page that can route to the agent’s page or show a global overview:

```jsx
// pages/index.js

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Cross-Chain Wallet Adapter Example</h1>
      <p>
        This is a demo that integrates Solana (Helius), Bitcoin (Ordiscan), and
        Base (Coinbase/ethers).
      </p>
      <Link href="/agent">Go to Agent</Link>
    </div>
  );
}
```

### 5.2 `pages/agent.js`

Renders the `AgentWalletManager` component:

```jsx
// pages/agent.js

import React from "react";
import AgentWalletManager from "../components/AgentWalletManager";

export default function AgentPage() {
  return (
    <div>
      <h1>Agent Page</h1>
      <AgentWalletManager />
    </div>
  );
}
```

---

## 6. Security & Production Considerations

1. **Private Key Storage**
   Storing private keys in localStorage is **not** secure. A malicious script or browser extension can potentially read them. For a more production-ready approach, consider:
   - Using server-side or hardware-based secure storage (e.g., an HSM or an encrypted database).
   - Encrypting private keys with a passphrase.
   - Using a real wallet solution (e.g., a browser extension like Phantom, Metamask, etc., or a secure backend custodian).

2. **Transaction Broadcasting**
   Especially for Bitcoin, you need a reliable way to gather UTXOs and broadcast transactions (either a local node or a reputable API service).

3. **Rate Limits & API Keys**
   - Make sure your Helius and other APIs are used securely on the backend if possible.
   - If you must call them directly from the frontend, store your API keys carefully (obfuscation, server proxies, etc.).

4. **Autonomous Agent Logic**
   The example above is purely for manual user control. If you want actual autonomous AI agents:
   - Integrate an AI agent framework (like LangChain, Auto-GPT, etc.)
   - Provide it with safe-sandboxed access to these wallet services.
   - Enforce spending limits and strong security measures.

---

## 7. Summary

With the above boilerplate:

1. **Solana**: Uses the Helius SDK + `@solana/web3.js` for wallet generation, balance queries, transactions, and indexing.
2. **Bitcoin**: Uses `bitcoinjs-lib` for wallet creation and transaction signing, Ordiscan API for indexing.
3. **Base**: Uses `ethers` or the Coinbase SDK for wallet operations, with an RPC endpoint for Base.

You now have a **cross-chain, cross-platform wallet adapter** in Next.js/React that agents (or users) can use to create their wallets, manage balances, and track transactions across three different chains.

> **Disclaimer**:
> This code is for **demonstration purposes only**. Do not use these patterns as-is for production. Always secure private keys, secrets, and API keys properly.