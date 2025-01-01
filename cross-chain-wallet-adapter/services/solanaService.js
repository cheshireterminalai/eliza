import {
    Helius,
} from 'helius-sdk'; // Example import if you use Helius's official SDK

import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
} from '@solana/web3.js';

if (!process.env.HELIUS_API_KEY) {
  throw new Error("HELIUS_API_KEY is required in .env file");
}

const HELIUS_RPC_URL = `https://rpc.helius.xyz?api-key=${process.env.HELIUS_API_KEY}`;

export const createSolanaWallet = () => {
  try {
    const keypair = Keypair.generate();
    return {
      publicKey: keypair.publicKey.toBase58(),
      secretKey: Array.from(keypair.secretKey),
    };
  } catch (error) {
    console.error("Error creating Solana wallet:", error);
    throw new Error("Failed to create Solana wallet");
  }
};

export const getSolanaBalance = async (publicKey) => {
  try {
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance;
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    throw new Error("Failed to fetch Solana balance");
  }
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
    const helius = new Helius(process.env.HELIUS_API_KEY);
    const response = await helius.getTransactionHistory({
      address: publicKey,
      options: {
        limit: 10,
        order: 'desc'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Solana transactions:", error);
    return [];
  }
};
