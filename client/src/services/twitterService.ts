interface TwitterConfig {
    apiKey: string;
    apiKeySecret: string;
    bearerToken: string;
    accessToken: string;
    accessTokenSecret: string;
    clientId: string;
    clientSecret: string;
}

interface Tweet {
    id: string;
    text: string;
    created_at: string;
}

interface TwitterResponse {
    data: Tweet[];
    meta: {
        result_count: number;
        newest_id: string;
        oldest_id: string;
        next_token?: string;
    };
}

class TwitterService {
    private config: TwitterConfig;

    constructor() {
        this.config = {
            apiKey: import.meta.env.VITE_TWITTER_API_KEY,
            apiKeySecret: import.meta.env.VITE_TWITTER_API_KEY_SECRET,
            bearerToken: import.meta.env.VITE_TWITTER_BEARER_TOKEN,
            accessToken: import.meta.env.VITE_TWITTER_ACCESS_TOKEN,
            accessTokenSecret: import.meta.env.VITE_TWITTER_ACCESS_TOKEN_SECRET,
            clientId: import.meta.env.VITE_TWITTER_CLIENT_ID,
            clientSecret: import.meta.env.VITE_TWITTER_CLIENT_SECRET,
        };
    }

    async tweet(message: string): Promise<boolean> {
        try {
            const response = await fetch("https://api.twitter.com/2/tweets", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.config.bearerToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: message,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Twitter API error:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Failed to send tweet:", error);
            return false;
        }
    }

    async searchTweets(query: string, maxResults = 10): Promise<Tweet[]> {
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
                `https://api.twitter.com/2/tweets/search/recent?query=${encodedQuery}&max_results=${maxResults}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.config.bearerToken}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                console.error("Twitter API error:", error);
                return [];
            }

            const data = (await response.json()) as TwitterResponse;
            return data.data || [];
        } catch (error) {
            console.error("Failed to search tweets:", error);
            return [];
        }
    }

    async getSentiment(
        query: string
    ): Promise<{ positive: number; negative: number; neutral: number }> {
        try {
            const tweets = await this.searchTweets(query, 100);
            const results = {
                positive: 0,
                negative: 0,
                neutral: 0,
            };

            const positiveWords = [
                "bullish",
                "moon",
                "pump",
                "good",
                "great",
                "excellent",
                "up",
            ];
            const negativeWords = [
                "bearish",
                "dump",
                "bad",
                "poor",
                "down",
                "crash",
                "sell",
            ];

            for (const tweet of tweets) {
                const text = tweet.text.toLowerCase();
                const hasPositive = positiveWords.some((word) =>
                    text.includes(word)
                );
                const hasNegative = negativeWords.some((word) =>
                    text.includes(word)
                );

                if (hasPositive && !hasNegative) {
                    results.positive++;
                } else if (hasNegative && !hasPositive) {
                    results.negative++;
                } else {
                    results.neutral++;
                }
            }

            const total = tweets.length || 1;
            return {
                positive: (results.positive / total) * 100,
                negative: (results.negative / total) * 100,
                neutral: (results.neutral / total) * 100,
            };
        } catch (error) {
            console.error("Failed to analyze sentiment:", error);
            return { positive: 0, negative: 0, neutral: 100 };
        }
    }

    async getTokenMentions(tokenSymbol: string): Promise<number> {
        try {
            const tweets = await this.searchTweets(`$${tokenSymbol}`, 100);
            return tweets.length;
        } catch (error) {
            console.error("Failed to get token mentions:", error);
            return 0;
        }
    }
}

export const twitterService = new TwitterService();
