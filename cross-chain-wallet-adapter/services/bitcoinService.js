import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';

if (!process.env.ORDISCAN_API_KEY) {
  throw new Error("ORDISCAN_API_KEY is required in .env file");
}

const NETWORK = bitcoin.networks.testnet; // or mainnet if you are on the main Bitcoin network
const ORDISCAN_API_BASE = "https://ordiscan.xyz/api";

// Configure axios with API key
const ordiscanApi = axios.create({
  baseURL: ORDISCAN_API_BASE,
  headers: {
    'Authorization': `Bearer ${process.env.ORDISCAN_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export const createBitcoinWallet = () => {
  try {
    const keyPair = bitcoin.ECPair.makeRandom({ network: NETWORK });
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: NETWORK
    });

    return {
      address,
      privateKeyWIF: keyPair.toWIF(),
    };
  } catch (error) {
    console.error("Error creating Bitcoin wallet:", error);
    throw new Error("Failed to create Bitcoin wallet");
  }
};

export const getBitcoinBalance = async (address) => {
  // For real usage, you'd need a UTXO provider or a block explorer API.
  // Ordiscan might help you parse ordinals, inscriptions, and possibly balances.

  // Ordiscan’s official docs: https://ordiscan.xyz/docs
  // Example endpoint: GET /api/address/<address>
  try {
    const response = await ordiscanApi.get(`/address/${address}`);
    // The shape of the response can vary. For example:
    // response.data.balance
    return response.data.balance || 0;
  } catch (error) {
    console.error("Error fetching Bitcoin balance:", error);
    return 0;
  }
};

export const sendBitcoinTransaction = async (fromPrivateKeyWIF, toAddress, satoshis) => {
  try {
    const keyPair = bitcoin.ECPair.fromWIF(fromPrivateKeyWIF, NETWORK);
    const { address: fromAddress } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: NETWORK
    });

    // Fetch UTXOs
    const utxosResponse = await ordiscanApi.get(`/address/${fromAddress}/utxos`);
    const utxos = utxosResponse.data;

    if (!utxos || utxos.length === 0) {
      throw new Error("No UTXOs available");
    }

    // Create transaction
    const psbt = new bitcoin.Psbt({ network: NETWORK });

    // Add inputs from UTXOs
    let totalInput = 0;
    for (const utxo of utxos) {
      if (totalInput < satoshis) {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: bitcoin.address.toOutputScript(fromAddress, NETWORK),
            value: utxo.value,
          }
        });
        totalInput += utxo.value;
      }
    }

    if (totalInput < satoshis) {
      throw new Error("Insufficient funds");
    }

    // Add outputs
    psbt.addOutput({
      address: toAddress,
      value: satoshis,
    });

    // Add change output if needed
    const fee = 1000; // Example fee
    const change = totalInput - satoshis - fee;
    if (change > 0) {
      psbt.addOutput({
        address: fromAddress,
        value: change,
      });
    }

    // Sign and broadcast
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();

    // Broadcast transaction
    const broadcastResponse = await ordiscanApi.post('/tx/broadcast', {
      rawTx: tx.toHex()
    });

    return broadcastResponse.data.txid;
  } catch (error) {
    console.error("Error sending BTC transaction:", error);
    throw new Error(error.message || "Failed to send Bitcoin transaction");
  }
};

// Example: get transaction history from Ordiscan
export const getBitcoinTransactions = async (address) => {
  try {
    const response = await ordiscanApi.get(`/address/${address}/txs`);
    // The exact shape depends on Ordiscan's API
    return response.data || [];
  } catch (error) {
    console.error("Error fetching Bitcoin transactions:", error);
    return [];
  }
};
