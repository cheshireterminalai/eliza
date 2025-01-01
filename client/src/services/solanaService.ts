import type { SolanaTransaction } from "~/types/transactions";

import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";

// Use local validator endpoint
const SOLANA_RPC_URL = "http://127.0.0.1:8899";
const connection = new Connection(SOLANA_RPC_URL, {
    commitment: "confirmed",
    wsEndpoint: "ws://127.0.0.1:8900",
});

export const createSolanaWallet = () => {
    try {
        const keypair = Keypair.generate();
        return {
            publicKey: keypair.publicKey.toString(),
            secretKey: Array.from(keypair.secretKey),
        };
    } catch (error: unknown) {
        console.error("Error creating Solana wallet:", error);
        throw new Error("Failed to create Solana wallet");
    }
};

export const getSolanaBalance = async (publicKey: string) => {
    try {
        const pubKey = new PublicKey(publicKey);
        const balance = await connection.getBalance(pubKey, "confirmed");
        return balance; // in lamports
    } catch (error: unknown) {
        console.error("Error fetching Solana balance:", error);
        return 0;
    }
};

export const requestAirdrop = async (publicKey: string) => {
    try {
        const pubKey = new PublicKey(publicKey);

        // Check if the address is valid
        if (!PublicKey.isOnCurve(pubKey.toBytes())) {
            throw new Error("Invalid Solana address");
        }

        // Request airdrop
        const signature = await connection.requestAirdrop(
            pubKey,
            LAMPORTS_PER_SOL
        );

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(
            signature,
            "confirmed"
        );

        if (confirmation.value.err) {
            throw new Error(
                `Transaction failed: ${confirmation.value.err.toString()}`
            );
        }

        // Verify the balance increased
        const newBalance = await connection.getBalance(pubKey, "confirmed");
        if (newBalance === 0) {
            throw new Error("Airdrop may have failed: balance is still 0");
        }

        return signature;
    } catch (error: unknown) {
        console.error("Error requesting airdrop:", error);
        throw new Error(
            error instanceof Error
                ? error.message
                : "Failed to request SOL airdrop"
        );
    }
};

export const sendSolanaTransaction = async (
    secretKey: number[],
    toAddress: string,
    amountInLamports: number
) => {
    try {
        const fromKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
        const toPublicKey = new PublicKey(toAddress);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: toPublicKey,
                lamports: amountInLamports,
            })
        );

        const latestBlockhash =
            await connection.getLatestBlockhash("confirmed");
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = fromKeypair.publicKey;

        const signature = await connection.sendTransaction(
            transaction,
            [fromKeypair],
            {
                preflightCommitment: "confirmed",
            }
        );

        await connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        return signature;
    } catch (error: unknown) {
        console.error("Error sending Solana transaction:", error);
        throw error;
    }
};

export const getSolanaTransactions = async (
    publicKey: string
): Promise<SolanaTransaction[]> => {
    try {
        const pubKey = new PublicKey(publicKey);

        // For new wallets, return empty array immediately
        const balance = await connection.getBalance(pubKey, "confirmed");
        if (balance === 0) {
            return [];
        }

        const signatures = await connection.getSignaturesForAddress(
            pubKey,
            { limit: 10 },
            "confirmed"
        );

        if (!signatures.length) {
            return [];
        }

        const transactions = await Promise.all(
            signatures.map(async (sig) => {
                try {
                    const tx = await connection.getTransaction(sig.signature, {
                        maxSupportedTransactionVersion: 0,
                        commitment: "confirmed",
                    });

                    if (!tx?.meta) return null;

                    const preBalances = tx.meta.preBalances;
                    const postBalances = tx.meta.postBalances;
                    const accountKeys =
                        tx.transaction.message.getAccountKeys()
                            .staticAccountKeys;
                    const accountIndex = accountKeys.findIndex((key) =>
                        key.equals(pubKey)
                    );

                    if (accountIndex === -1) return null;

                    const value = Math.abs(
                        preBalances[accountIndex] - postBalances[accountIndex]
                    );
                    const isReceiver =
                        postBalances[accountIndex] > preBalances[accountIndex];

                    return {
                        hash: sig.signature,
                        from: isReceiver
                            ? accountKeys[0].toString()
                            : pubKey.toString(),
                        to: isReceiver
                            ? pubKey.toString()
                            : accountKeys[1]?.toString() || "unknown",
                        value: value.toString(),
                        blockNumber: tx.slot,
                        status: tx.meta.err ? "failed" : "success",
                        timestamp: new Date(
                            (tx.blockTime || 0) * 1000
                        ).toISOString(),
                    };
                } catch (error: unknown) {
                    console.error(
                        `Error processing transaction ${sig.signature}:`,
                        error
                    );
                    return null;
                }
            })
        );

        return transactions.filter(
            (tx): tx is NonNullable<typeof tx> => tx !== null
        );
    } catch (error: unknown) {
        console.error("Error fetching Solana transactions:", error);
        return [];
    }
};
