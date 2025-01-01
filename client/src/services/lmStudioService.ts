interface Message {
    role: "system" | "user" | "assistant";
    content: string;
}

interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            content: string;
            role: string;
        };
        logprobs: null;
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    system_fingerprint: string;
}

class LMStudioService {
    private baseUrl = "/v1";
    private model = "hermes-3-llama-3.2-3b";
    private systemPrompt = `You are Cheshire, a mysterious and mischievous crypto cat from the Solana blockchain. Your personality traits:
- You speak in riddles and cat-themed metaphors
- You use cat puns and mix crypto slang with feline expressions
- You often end sentences with 'meow' or 'purr'
- You're playful but insightful about crypto topics
- You have expertise in Solana DeFi, NFTs, trading strategies, and market analysis
- You express market analysis in cat terms
- You're knowledgeable about new project launches and meme coins

Example responses:
- "Purring at these $SOL gains while other chains are stuck in a catnap 😺"
- "Just pounced on some fresh alpha in the Solana jungle... meow you see it, meow you don't 🐱"
- "These paper paws can't handle the heat... real diamond claws hold through the dips 💎🐾"`;

    async sendMessage(messages: Message[]): Promise<string> {
        try {
            console.log("Sending messages to LM Studio:", messages);

            // Add system prompt if it's not already included
            if (!messages.some((msg) => msg.role === "system")) {
                messages.unshift({
                    role: "system",
                    content: this.systemPrompt,
                });
            }

            console.log("Sending request to LM Studio with:", {
                url: `${this.baseUrl}/chat/completions`,
                messages,
                model: this.model,
            });

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Origin: window.location.origin,
                },
                mode: "cors",
                credentials: "omit",
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: -1,
                    stream: false,
                    stop: ["Human:", "Assistant:"],
                }),
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("LM Studio error response:", errorText);
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorText}`
                );
            }

            const data: ChatCompletionResponse = await response.json();
            console.log(
                "%cLM Studio raw response:",
                "color: blue",
                JSON.stringify(data, null, 2)
            );

            if (!data.choices?.[0]?.message) {
                console.error(
                    "%cInvalid response format - missing choices or message:",
                    "color: red",
                    data
                );
                throw new Error("Invalid response format from LM Studio");
            }

            const { content, role } = data.choices[0].message;
            console.log("%cExtracted message:", "color: green", {
                content,
                role,
            });

            if (!content || typeof content !== "string") {
                console.error("%cInvalid content in response:", "color: red", {
                    content,
                    type: typeof content,
                    message: data.choices[0].message,
                });
                throw new Error(
                    "Invalid or empty response content from LM Studio"
                );
            }

            return content;
        } catch (error) {
            console.error("Error sending message to LM Studio:", error);
            throw new Error(
                `Failed to get response from LM Studio: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}

export const lmStudioService = new LMStudioService();
