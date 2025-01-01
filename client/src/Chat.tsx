import "./App.css";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ImageIcon,
    Volume2,
} from "lucide-react";
import { useParams } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";

import { elevenLabsService } from "./services/elevenLabsService";
import { lmStudioService } from "./services/lmStudioService";

type Message = {
    id: string;
    text: string;
    user: string;
    role: 'system' | 'user' | 'assistant';
    attachments?: { url: string; contentType: string; title: string }[];
};

export default function Chat() {
    const { agentId } = useParams();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            const chatContainer = document.getElementById('chat-messages');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
    }, []);

    // Initialize with welcome message
    useEffect(() => {
        setMessages([{
            id: crypto.randomUUID(),
            text: "Meow! I'm Cheshire, your crypto-savvy feline friend. How can I help you navigate the Solana jungle today? 😺",
            user: "assistant",
            role: "assistant"
        }]);
    }, []);

    const mutation = useMutation({
        mutationFn: async (text: string) => {
            try {
                console.log('%cStarting chat mutation with text:', 'color: blue; font-weight: bold', text);
                setError(null);

                // Convert messages to LM Studio format, excluding the welcome message
                console.log('%cConverting messages:', 'color: blue', messages);
                const chatHistory = messages
                    .filter(msg => msg.role !== 'assistant' || msg.text !== "Meow! I'm Cheshire, your crypto-savvy feline friend. How can I help you navigate the Solana jungle today? 😺")
                    .map(msg => {
                        console.log('%cConverting message:', 'color: blue', msg);
                        return {
                            role: msg.role,
                            content: msg.text
                        };
                    });

                // Add system prompt at the start
                const systemPrompt = {
                    role: 'system' as const,
                    content: `You are Cheshire, a mysterious and mischievous crypto cat from the Solana blockchain. Your personality traits:
- You speak in riddles and cat-themed metaphors
- You use cat puns and mix crypto slang with feline expressions
- You often end sentences with 'meow' or 'purr'
- You're playful but insightful about crypto topics
- You have expertise in Solana DeFi, NFTs, trading strategies, and market analysis
- You express market analysis in cat terms
- You're knowledgeable about new project launches and meme coins`
                };

                chatHistory.unshift(systemPrompt);
                console.log('%cAdded system prompt:', 'color: blue', systemPrompt);

                // Add user message
                const userMessage = {
                    role: 'user' as const,
                    content: text
                };
                chatHistory.push(userMessage);
                console.log('%cAdded user message:', 'color: blue', userMessage);

                console.log('%cFinal chat history:', 'color: blue', chatHistory);

                // Make request to LM Studio
                console.log('%cMaking request to LM Studio...', 'color: purple');
                const response = await lmStudioService.sendMessage(chatHistory);
                console.log('%cReceived response from LM Studio:', 'color: green', response);

                if (!response) {
                    throw new Error('Empty response from LM Studio');
                }

                const assistantMessage = {
                    id: crypto.randomUUID(),
                    text: response,
                    user: 'assistant',
                    role: 'assistant'
                };

                // Log the message that will be displayed
                console.log('%cCreating assistant message:', 'color: green', assistantMessage);

                return [assistantMessage] as Message[];
            } catch (error) {
                console.error('%cError in chat mutation:', 'color: red', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('%cError details:', 'color: red', errorMessage);
                setError(`Failed to send message: ${errorMessage}`);
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log('%cMutation succeeded, updating messages with:', 'color: green', data);
            setMessages((prev) => {
                console.log('%cPrevious messages:', 'color: green', prev);
                const newMessages = [...prev, ...data];
                console.log('%cUpdated messages:', 'color: green', newMessages);
                return newMessages;
            });
            setSelectedFile(null);
            setInput("");
            inputRef.current?.focus();
        },
        onError: (error) => {
            console.error('%cMutation error:', 'color: red', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('%cError details:', 'color: red', errorMessage);
            setError(`An error occurred: ${errorMessage}`);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();

        try {
            console.log('%cForm submitted with input:', 'color: blue; font-weight: bold', trimmedInput);
            if (!trimmedInput && !selectedFile) {
                console.log('%cNo input or file selected', 'color: orange');
                return;
            }

            // Clear any previous errors
            setError(null);

            // Create user message
            const userMessage: Message = {
                id: crypto.randomUUID(),
                text: trimmedInput,
                user: "user",
                role: "user",
                attachments: selectedFile ? [{
                    url: URL.createObjectURL(selectedFile),
                    contentType: selectedFile.type,
                    title: selectedFile.name
                }] : undefined,
            };

            // Update UI immediately
            console.log('%cAdding user message:', 'color: green', userMessage);
            setMessages(prev => [...prev, userMessage]);
            setInput("");
            setSelectedFile(null);

            // Start mutation
            console.log('%cStarting mutation:', 'color: purple', {
                input: trimmedInput,
                isPending: mutation.isPending,
                isError: mutation.isError,
                currentMessages: messages
            });

            // Wait for mutation to complete
            try {
                const result = await mutation.mutateAsync(trimmedInput);
                console.log('%cMutation completed successfully:', 'color: green', {
                    result,
                    newMessagesCount: messages.length + 1
                });

                // Scroll to bottom after state updates
                const chatContainer = document.getElementById('chat-messages');
                if (chatContainer) {
                    setTimeout(() => {
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }, 100);
                }
            } catch (error) {
                console.error('%cMutation failed:', 'color: red', error);
                setError(error instanceof Error ? error.message : 'Failed to send message');
            }

        } catch (error) {
            console.error('%cError in handleSubmit:', 'color: red', error);
            setError(error instanceof Error ? error.message : 'Failed to send message');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file?.type.startsWith('image/')) {
            setSelectedFile(file);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-screen w-full">
            <div className="flex-1 min-h-0 overflow-y-auto p-4" id="chat-messages">
                <div className="max-w-3xl mx-auto space-y-4">
                    {error && (
                        <div className="text-red-500 text-center p-2 bg-red-50 rounded">
                            {error}
                        </div>
                    )}
                    {messages.length > 0 ? (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`text-left flex ${
                                    message.user === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        message.user === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {message.text}
                                        {message.user === "assistant" && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        const audioBuffer = await elevenLabsService.textToSpeech(message.text);
                                                        await elevenLabsService.playAudio(audioBuffer);
                                                    } catch (error) {
                                                        console.error('Error playing voice:', error);
                                                        setError('Failed to play voice message');
                                                    }
                                                }}
                                                className="p-1 hover:bg-gray-200 rounded-full"
                                            >
                                                <Volume2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    {message.attachments?.map((attachment) => (
                                        attachment.contentType.startsWith('image/') && (
                                            <img
                                                key={`${message.id}-${attachment.url}`}
                                                src={message.user === "user"
                                                    ? attachment.url
                                                    : attachment.url.startsWith('http')
                                                        ? attachment.url
                                                        : `http://localhost:3000/media/generated/${attachment.url.split('/').pop()}`
                                                }
                                                alt={attachment.title || "Attached image"}
                                                className="mt-2 max-w-full rounded-lg"
                                            />
                                        )
                                    ))}
                                 </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground">
                            No messages yet. Start a conversation!
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="border-t p-4 bg-background">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => {
                                console.log('Input changed:', e.target.value);
                                setInput(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 px-3 py-2 border rounded-md"
                            disabled={mutation.isPending}
                        />
                        <button
                            type="button"
                            className="p-2 border rounded-md"
                            onClick={handleFileSelect}
                            disabled={mutation.isPending}
                        >
                            <ImageIcon className="h-4 w-4" />
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                            disabled={mutation.isPending || (!input.trim() && !selectedFile)}
                        >
                            {mutation.isPending ? "..." : "Send"}
                        </button>
                    </form>
                    {selectedFile && (
                        <div className="mt-2 text-sm text-gray-500">
                            Selected file: {selectedFile.name}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
