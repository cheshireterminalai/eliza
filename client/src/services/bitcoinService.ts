import axios from "axios";
import type { BitcoinTransaction } from "~/types/transactions";

const BLOCKCYPHER_API_URL = "https://api.blockcypher.com/v1/btc/main";
const BLOCKCYPHER_API_KEY = process.env.BLOCKCYPHER_API_KEY;

interface BlockCypherTransaction {
    hash: string;
    addresses: string[];
    total: number;
    fees: number;
    block_height: number;
    confirmed: string;
}

interface BlockCypherWallet {
    private: string;
    public: string;
    address: string;
    wif: string;
}

export const createBitcoinWallet = async () => {
    try {
        const response = await axios.post(
            `${BLOCKCYPHER_API_URL}/addrs`,
            {},
            {
                params: {
                    token: BLOCKCYPHER_API_KEY,
                },
            }
        );
        const wallet: BlockCypherWallet = response.data;
        return {
            address: wallet.address,
            privateKeyWIF: wallet.wif,
        };
    } catch (error) {
        console.error("Error creating Bitcoin wallet:", error);
        throw new Error("Failed to create Bitcoin wallet");
    }
};

export const getBitcoinBalance = async (address: string) => {
    try {
        const response = await axios.get(
            `${BLOCKCYPHER_API_URL}/addrs/${address}/balance`,
            {
                params: {
                    token: BLOCKCYPHER_API_KEY,
                },
            }
        );
        return response.data.balance; // in satoshis
    } catch (error) {
        console.error("Error fetching Bitcoin balance:", error);
        return 0;
    }
};

export const sendBitcoinTransaction = async (
    privateKeyWIF: string,
    toAddress: string,
    amountInSatoshis: number
) => {
    try {
        // Create a new transaction
        const newtx = {
            inputs: [{ addresses: [privateKeyWIF] }],
            outputs: [{ addresses: [toAddress], value: amountInSatoshis }],
        };

        // Send transaction using BlockCypher's API
        const response = await axios.post(
            `${BLOCKCYPHER_API_URL}/txs/new`,
            newtx,
            {
                params: {
                    token: BLOCKCYPHER_API_KEY,
                },
            }
        );

        return response.data.tx.hash;
    } catch (error) {
        console.error("Error sending Bitcoin transaction:", error);
        throw error;
    }
};

export const getBitcoinTransactions = async (
    address: string
): Promise<BitcoinTransaction[]> => {
    try {
        const response = await axios.get(
            `${BLOCKCYPHER_API_URL}/addrs/${address}/full`,
            {
                params: {
                    token: BLOCKCYPHER_API_KEY,
                    limit: 10,
                },
            }
        );

        return response.data.txs.map((tx: BlockCypherTransaction) => ({
            hash: tx.hash,
            from: tx.addresses[0],
            to: tx.addresses[tx.addresses.length - 1],
            value: tx.total.toString(),
            blockNumber: tx.block_height,
            status: "success",
            timestamp: new Date(tx.confirmed).toISOString(),
        }));
    } catch (error) {
        console.error("Error fetching Bitcoin transactions:", error);
        return [];
    }
};
