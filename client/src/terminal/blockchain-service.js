import axios from "axios";
import si from "systeminformation";

import {
    Connection,
    PublicKey,
} from "@solana/web3.js";

class BlockchainService {
    constructor() {
        this.connections = {
            helius: new Connection(process.env.VITE_HELIUS_API_KEY ?
                `https://rpc.helius.xyz/?api-key=${process.env.VITE_HELIUS_API_KEY}` :
                'https://api.mainnet-beta.solana.com'),
            local: new Connection('http://localhost:8899'),
            backup: new Connection('https://api.mainnet-beta.solana.com')
        };

        this.systemStats = {
            cpu: 0,
            memory: 0,
            timestamp: Date.now()
        };
    }

    // Connection Management
    async testConnections() {
        const results = {};
        for (const [name, connection] of Object.entries(this.connections)) {
            try {
                const version = await connection.getVersion();
                results[name] = {
                    status: 'connected',
                    version: version['solana-core']
                };
            } catch (error) {
                results[name] = {
                    status: 'error',
                    error: error.message
                };
            }
        }
        return results;
    }

    // System Monitoring
    async updateSystemStats() {
        const [cpu, mem] = await Promise.all([
            si.currentLoad(),
            si.mem()
        ]);

        this.systemStats = {
            cpu: cpu.currentLoad,
            memory: (mem.used / mem.total) * 100,
            timestamp: Date.now()
        };

        return this.systemStats;
    }

    // Token Analysis
    async analyzeMemeToken(tokenAddress) {
        try {
            const connection = this.connections.helius;
            const tokenInfo = await connection.getParsedAccountInfo(new PublicKey(tokenAddress));

            // Get token metadata
            const metadata = await this.getTokenMetadata(tokenAddress);

            // Get social metrics if available
            const socialMetrics = await this.getSocialMetrics(tokenAddress);

            return {
                tokenInfo,
                metadata,
                socialMetrics,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error analyzing token:', error);
            throw error;
        }
    }

    async getTokenMetadata(tokenAddress) {
        try {
            const response = await axios.get(
                `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.VITE_HELIUS_API_KEY}`,
                { params: { mintAccounts: [tokenAddress] } }
            );
            return response.data[0];
        } catch (error) {
            console.error('Error fetching token metadata:', error);
            return null;
        }
    }

    async getSocialMetrics(tokenAddress) {
        // Implement social metrics tracking
        // This would integrate with services like Twitter API for social sentiment
        return {
            twitterMentions: 0,
            sentiment: 'neutral',
            timestamp: Date.now()
        };
    }

    // Local Validator Management
    async checkLocalValidator() {
        try {
            const connection = this.connections.local;
            const version = await connection.getVersion();
            const slot = await connection.getSlot();

            return {
                status: 'running',
                version: version['solana-core'],
                slot,
                timestamp: Date.now()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    // Blockchain Explorer Functions
    async getRecentTransactions(address, limit = 10) {
        try {
            const connection = this.connections.helius;
            const pubkey = new PublicKey(address);
            const signatures = await connection.getSignaturesForAddress(pubkey, { limit });

            const transactions = await Promise.all(
                signatures.map(sig => connection.getParsedTransaction(sig.signature))
            );

            return transactions;
        } catch (error) {
            console.error('Error fetching recent transactions:', error);
            throw error;
        }
    }

    // Utility Functions
    formatBalance(balance, decimals = 9) {
        return (balance / (10 ** decimals)).toFixed(decimals);
    }

    async getTokenPrice(tokenAddress) {
        try {
            // Implement price fetching logic
            // This could integrate with Jupiter API or other price feeds
            return null;
        } catch (error) {
            console.error('Error fetching token price:', error);
            return null;
        }
    }
}

export const blockchainService = new BlockchainService();
