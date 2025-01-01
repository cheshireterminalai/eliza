import React, {
    type FC,
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { twitterService } from "~/services/twitterService";

import type { QuoteResponse } from "@jup-ag/api";

import { blockchainService } from "./blockchain-service";
import {
    type Token,
    TOKENS,
} from "./tokens";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface SystemStats {
    cpu: number;
    memory: number;
    timestamp: number;
}

interface ConnectionStatus {
    [key: string]: {
        status: string;
        version?: string;
        error?: string;
    };
}

interface PriceData {
    time: string;
    price: number;
}

interface SocialMetrics {
    mentions: number;
    sentiment: {
        positive: number;
        negative: number;
        neutral: number;
    };
}

const TradingTerminal: FC = () => {
    const [systemStats, setSystemStats] = useState<SystemStats>({
        cpu: 0,
        memory: 0,
        timestamp: Date.now(),
    });
    const [connections, setConnections] = useState<ConnectionStatus>({});
    const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
    const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]); // Default to SOL
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quote, setQuote] = useState<QuoteResponse | null>(null);
    const [socialMetrics, setSocialMetrics] = useState<SocialMetrics>({
        mentions: 0,
        sentiment: {
            positive: 0,
            negative: 0,
            neutral: 100,
        },
    });

    // Jupiter Integration
    const fetchQuote = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('https://quote-api.jup.ag/v6/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputMint: TOKENS[0].mint, // Always use SOL as input
                    outputMint: selectedToken.mint,
                    amount: "1000000000", // 1 SOL in lamports
                    slippageBps: 50,
                    onlyDirectRoutes: false,
                    asLegacyTransaction: false,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch quote');
            }

            const quoteResponse = await response.json();
            setQuote(quoteResponse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [selectedToken.mint]);

    // System Monitoring
    useEffect(() => {
        const updateStats = async () => {
            const stats = await blockchainService.updateSystemStats();
            setSystemStats(stats);
        };

        const interval = setInterval(updateStats, 2000);
        return () => clearInterval(interval);
    }, []);

    // Connection Status
    useEffect(() => {
        const checkConnections = async () => {
            const status = await blockchainService.testConnections();
            if (status) {
                setConnections((prev) => ({ ...prev, ...status }));
            }
        };

        checkConnections();
        const interval = setInterval(checkConnections, 30000);
        return () => clearInterval(interval);
    }, []);

    // Social Metrics
    useEffect(() => {
        const updateSocialMetrics = async () => {
            const [mentions, sentiment] = await Promise.all([
                twitterService.getTokenMentions(selectedToken.symbol),
                twitterService.getSentiment(`$${selectedToken.symbol}`),
            ]);

            setSocialMetrics({
                mentions,
                sentiment,
            });
        };

        updateSocialMetrics();
        const interval = setInterval(updateSocialMetrics, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [selectedToken.symbol]);

    // Mock price data - updates when token changes
    useEffect(() => {
        const generateMockData = () => {
            const mockPriceData = Array.from({ length: 24 }, (_, i) => ({
                time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString(),
                price: 50 + Math.random() * 10,
            }));
            setPriceHistory(mockPriceData);
        };

        generateMockData();
        const interval = setInterval(generateMockData, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []); // No dependencies since we're just generating random data

    // Initial quote fetch
    useEffect(() => {
        fetchQuote();
    }, [fetchQuote]);

    const getBestPrice = (quote: QuoteResponse | null): string => {
        if (!quote?.outAmount) return "N/A";
        return blockchainService.formatBalance(Number(quote.outAmount));
    };

    const chartData = {
        labels: priceHistory.map(d => d.time),
        datasets: [
            {
                label: 'Price',
                data: priceHistory.map(d => d.price),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    color: '#1f4a1f',
                },
                ticks: {
                    color: '#22c55e',
                },
            },
            y: {
                grid: {
                    color: '#1f4a1f',
                },
                ticks: {
                    color: '#22c55e',
                },
            },
        },
    };

    return (
        <div className="min-h-screen bg-black text-green-500 p-4 font-mono">
            {/* System Stats Header */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="border border-green-500 p-2">
                    CPU: {systemStats.cpu.toFixed(1)}%
                </div>
                <div className="border border-green-500 p-2">
                    Memory: {systemStats.memory.toFixed(1)}%
                </div>
                <div className="border border-green-500 p-2">
                    Time: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Token Selector */}
            <div className="mb-6">
                <select
                    value={selectedToken.symbol}
                    onChange={(e) => {
                        const token = TOKENS.find(t => t.symbol === e.target.value);
                        if (token) setSelectedToken(token);
                    }}
                    className="bg-black text-green-500 border border-green-500 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    {TOKENS.map((token) => (
                        <option key={token.symbol} value={token.symbol}>
                            {token.name} ({token.symbol})
                        </option>
                    ))}
                </select>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-4">
                {/* Connection Status */}
                <div className="col-span-3 border border-green-500 p-4">
                    <h2 className="text-lg mb-4">Network Status</h2>
                    {Object.entries(connections).map(([name, status]) => (
                        <div key={name} className="mb-2">
                            <div>{name}:</div>
                            <div className={`text-${status.status === 'connected' ? 'green' : 'red'}-500`}>
                                {status.status}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Price Chart */}
                <div className="col-span-6 border border-green-500 p-4">
                    <h2 className="text-lg mb-4">Price Chart</h2>
                    <div className="h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Jupiter Swap Integration */}
                <div className="col-span-3 border border-green-500 p-4">
                    <h2 className="text-lg mb-4">Jupiter Swap</h2>
                    {loading ? (
                        <div>Loading routes...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <div>
                            <div className="mb-4">
                                Best price: {getBestPrice(quote)}
                            </div>
                            <button
                                type="button"
                                onClick={fetchQuote}
                                className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
                            >
                                Refresh Rate
                            </button>
                        </div>
                    )}
                </div>

                {/* Market Data */}
                <div className="col-span-12 border border-green-500 p-4 mt-4">
                    <h2 className="text-lg mb-4">Market Data</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <h3 className="mb-2">Recent Transactions</h3>
                            <div className="text-sm">Coming soon...</div>
                        </div>
                        <div>
                            <h3 className="mb-2">Token Info</h3>
                            <div className="text-sm">
                                <div>Symbol: {selectedToken.symbol}</div>
                                <div>Name: {selectedToken.name}</div>
                                <div>Network: Solana</div>
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-2">Social Metrics</h3>
                            <div className="text-sm">
                                <div>Mentions: {socialMetrics.mentions}</div>
                                <div>Sentiment:</div>
                                <div className="pl-4">
                                    <div className="text-green-500">
                                        Positive: {socialMetrics.sentiment.positive.toFixed(1)}%
                                    </div>
                                    <div className="text-red-500">
                                        Negative: {socialMetrics.sentiment.negative.toFixed(1)}%
                                    </div>
                                    <div>
                                        Neutral: {socialMetrics.sentiment.neutral.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-2">Validator Status</h3>
                            <div className="text-sm">Coming soon...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingTerminal;
