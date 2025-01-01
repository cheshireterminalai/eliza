import axios from "axios";
import { ethers } from "ethers";
import type { BaseTransaction } from "~/types/transactions";

const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const BASESCAN_API_URL = "https://api.basescan.org/api";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;

const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);

interface BaseScanTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: string;
    timeStamp: string;
    isError: string;
}

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

export const getBaseBalance = async (address: string) => {
    try {
        const balance = await provider.getBalance(address);
        return balance.toString(); // in wei
    } catch (error) {
        console.error("Error fetching Base balance:", error);
        return "0";
    }
};

export const sendBaseTransaction = async (
    fromPrivateKey: string,
    toAddress: string,
    amountInEth: string
) => {
    try {
        const wallet = new ethers.Wallet(fromPrivateKey, provider);
        const tx = {
            to: toAddress,
            value: ethers.parseEther(amountInEth),
        };
        const receipt = await wallet.sendTransaction(tx);
        return receipt;
    } catch (error) {
        console.error("Error sending Base transaction:", error);
        throw error;
    }
};

export const getBaseTransactions = async (
    address: string
): Promise<BaseTransaction[]> => {
    try {
        const response = await axios.get(BASESCAN_API_URL, {
            params: {
                module: "account",
                action: "txlist",
                address,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 10,
                sort: "desc",
                apikey: BASESCAN_API_KEY,
            },
        });

        if (response.data.status === "1" && response.data.result) {
            return response.data.result.map((tx: BaseScanTransaction) => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                blockNumber: Number.parseInt(tx.blockNumber, 10),
                status: tx.isError === "0" ? "success" : "failed",
                timestamp: new Date(
                    Number.parseInt(tx.timeStamp, 10) * 1000
                ).toISOString(),
            }));
        }

        return [];
    } catch (error) {
        console.error("Error fetching Base transactions:", error);
        return [];
    }
};
