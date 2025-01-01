import axios from "axios";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

if (!process.env.BASESCAN_API_KEY) {
  throw new Error("BASESCAN_API_KEY is required in .env file");
}

// For Base mainnet (or testnet)
const BASE_RPC_URL = "https://mainnet.base.org";
const BASESCAN_API_URL = "https://api.basescan.org/api";

const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);

// Configure axios for Basescan API
const basescanApi = axios.create({
  baseURL: BASESCAN_API_URL,
  params: {
    apikey: process.env.BASESCAN_API_KEY,
  }
});

export const createBaseWallet = () => {
  try {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  } catch (error) {
    console.error("Error creating Base wallet:", error);
    throw new Error("Failed to create Base wallet");
  }
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
      value: ethers.parseEther(amountInEth.toString()),
    };
    const receipt = await wallet.sendTransaction(tx);
    return receipt;
  } catch (error) {
    console.error("Error sending Base transaction:", error);
    throw error;
  }
};

export const getBaseTransactions = async (address) => {
  try {
    // Get normal transactions using Basescan API
    const response = await basescanApi.get('', {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 10,
        sort: 'desc'
      }
    });

    if (response.data.status === '1' && response.data.result) {
      return response.data.result.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        blockNumber: Number.parseInt(tx.blockNumber, 10),
        status: tx.isError === '0' ? 'success' : 'failed',
        timestamp: new Date(Number.parseInt(tx.timeStamp, 10) * 1000).toISOString()
      }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching Base transactions:", error);
    return [];
  }
};
