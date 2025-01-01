export interface Token {
    symbol: string;
    name: string;
    mint: string;
}

export const TOKENS: Token[] = [
    {
        symbol: "SOL",
        name: "Solana",
        mint: "So11111111111111111111111111111111111111112",
    },
    {
        symbol: "USDC",
        name: "USD Coin",
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
    {
        symbol: "BONK",
        name: "Bonk",
        mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    },
    {
        symbol: "JUP",
        name: "Jupiter",
        mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    },
    {
        symbol: "ORCA",
        name: "Orca",
        mint: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    },
];

export const getTokenBySymbol = (symbol: string): Token | undefined => {
    return TOKENS.find((token) => token.symbol === symbol);
};

export const getTokenByMint = (mint: string): Token | undefined => {
    return TOKENS.find((token) => token.mint === mint);
};
