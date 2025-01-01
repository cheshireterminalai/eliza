interface VoiceResponse {
    audio: ArrayBuffer;
}

export class ElevenLabsService {
    private baseUrl = "https://api.elevenlabs.io/v1";
    private apiKey: string;
    // Cheshire voice ID - you might want to replace this with a specific voice ID from Eleven Labs
    private voiceId = "ErXwobaYiN019PkySvjV"; // Using "Antoni" voice as default

    constructor() {
        this.apiKey = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
        if (!this.apiKey) {
            console.error(
                "Eleven Labs API key not found in environment variables"
            );
        }
    }

    async textToSpeech(text: string): Promise<ArrayBuffer> {
        try {
            const response = await fetch(
                `${this.baseUrl}/text-to-speech/${this.voiceId}/stream`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "xi-api-key": this.apiKey,
                    },
                    body: JSON.stringify({
                        text,
                        model_id: "eleven_monolingual_v1",
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75,
                        },
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.arrayBuffer();
        } catch (error) {
            console.error("Error in text-to-speech:", error);
            throw error;
        }
    }

    async playAudio(audioBuffer: ArrayBuffer) {
        const audioContext = new AudioContext();
        const audioBufferSource = audioContext.createBufferSource();

        try {
            const decodedAudio =
                await audioContext.decodeAudioData(audioBuffer);
            audioBufferSource.buffer = decodedAudio;
            audioBufferSource.connect(audioContext.destination);
            audioBufferSource.start(0);
        } catch (error) {
            console.error("Error playing audio:", error);
            throw error;
        }
    }
}

export const elevenLabsService = new ElevenLabsService();
