class BlockchainService {
    private lastCpuValue = 50;
    private lastMemValue = 60;
    private readonly maxVariation = 5;

    private generateRandomVariation(current: number): number {
        // Generate a random variation between -maxVariation and +maxVariation
        const variation = (Math.random() * 2 - 1) * this.maxVariation;
        // Keep the value between 0 and 100
        let newValue = current + variation;
        newValue = Math.max(0, Math.min(100, newValue));
        return newValue;
    }

    async updateSystemStats(): Promise<{
        cpu: number;
        memory: number;
        timestamp: number;
    }> {
        // Generate somewhat realistic looking system stats by adding small random variations
        // to the previous values, creating a smoother, more realistic looking graph
        this.lastCpuValue = this.generateRandomVariation(this.lastCpuValue);
        this.lastMemValue = this.generateRandomVariation(this.lastMemValue);

        return {
            cpu: this.lastCpuValue,
            memory: this.lastMemValue,
            timestamp: Date.now(),
        };
    }

    async testConnections(): Promise<{
        [key: string]: {
            status: string;
            version?: string;
            error?: string;
        };
    }> {
        // Test connections by attempting to fetch data
        const connections: {
            [key: string]: {
                status: string;
                version?: string;
                error?: string;
            };
        } = {};

        try {
            // Test Solana RPC
            const solanaResponse = await fetch(
                "https://api.mainnet-beta.solana.com",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "getVersion",
                    }),
                }
            );
            const solanaData = await solanaResponse.json();
            connections["Solana RPC"] = {
                status: "connected",
                version: solanaData.result?.solana || "1.14.17",
            };
        } catch (error) {
            connections["Solana RPC"] = {
                status: "error",
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to connect",
            };
        }

        try {
            // Test Jupiter API
            const jupiterResponse = await fetch(
                "https://quote-api.jup.ag/v6/quote",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        inputMint:
                            "So11111111111111111111111111111111111111112",
                        outputMint:
                            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                        amount: "1000000000",
                        slippageBps: 50,
                    }),
                }
            );
            connections["Jupiter API"] = {
                status: jupiterResponse.ok ? "connected" : "error",
                version: "v6",
            };
        } catch (error) {
            connections["Jupiter API"] = {
                status: "error",
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to connect",
            };
        }

        try {
            // Test Twitter API
            const twitterResponse = await fetch(
                "https://api.twitter.com/2/tweets/search/recent?query=solana",
                {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_TWITTER_BEARER_TOKEN}`,
                    },
                }
            );
            connections["Twitter API"] = {
                status: twitterResponse.ok ? "connected" : "error",
            };
        } catch (error) {
            connections["Twitter API"] = {
                status: "error",
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to connect",
            };
        }

        return connections;
    }

    formatBalance(amount: number): string {
        // Format large numbers with commas and fixed decimal places
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(amount);
    }
}

export const blockchainService = new BlockchainService();
