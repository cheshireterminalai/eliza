export interface BaseTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: number;
    status: string;
    timestamp?: string;
}

export interface BitcoinTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: number;
    status: string;
    timestamp?: string;
}

export interface SolanaTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: number;
    status: string;
    timestamp?: string;
}

export type Transaction =
    | SolanaTransaction
    | BitcoinTransaction
    | BaseTransaction;
