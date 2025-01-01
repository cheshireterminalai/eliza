import type { Transaction } from "../../client/src/types/transactions";

declare module "../services/baseService" {
    export function createBaseWallet(): {
        address: string;
        privateKey: string;
    };

    export function getBaseBalance(address: string): Promise<string>;
    export function getBaseTransactions(
        address: string
    ): Promise<Transaction[]>;
    export interface BaseTransactionReceipt {
        transactionHash: string;
        blockNumber: number;
        blockHash: string;
        confirmations: number;
        status: boolean;
        gasUsed: string;
    }

    export function sendBaseTransaction(
        privateKey: string,
        toAddress: string,
        amountInEth: string
    ): Promise<BaseTransactionReceipt>;
}

declare module "../services/bitcoinService" {
    export function createBitcoinWallet(): {
        address: string;
        privateKeyWIF: string;
    };

    export function getBitcoinBalance(address: string): Promise<number>;
    export function getBitcoinTransactions(
        address: string
    ): Promise<Transaction[]>;
    export function sendBitcoinTransaction(
        privateKeyWIF: string,
        toAddress: string,
        satoshis: number
    ): Promise<string>;
}

declare module "../services/solanaService" {
    export function createSolanaWallet(): {
        publicKey: string;
        secretKey: number[];
    };

    export function getSolanaBalance(publicKey: string): Promise<number>;
    export function getSolanaTransactions(
        publicKey: string
    ): Promise<Transaction[]>;
    export function sendSolanaTransaction(
        secretKey: number[],
        toAddress: string,
        lamports: number
    ): Promise<string>;
}
