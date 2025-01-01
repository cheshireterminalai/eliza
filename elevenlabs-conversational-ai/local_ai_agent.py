import sys
import json
import asyncio
import logging
from typing import Optional, Dict, Any
import traceback
import requests
import os
import base64

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Eleven Labs Configuration
ELEVEN_LABS_API_KEY = "sk_c72dfcfd1f92156c802395c9becd6b301a9a881ebaca9012"
ELEVEN_LABS_VOICE_ID = "lwiJrJFJXhXCJTiYfQxV"  # Using the provided ID as a voice ID
ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1"

class CheshireAgent:
    def __init__(self):
        self.context: Dict[str, Any] = {}
        self.conversation_history = []
        self.headers = {
            "xi-api-key": ELEVEN_LABS_API_KEY,
            "Content-Type": "application/json"
        }
        logger.info("CheshireAgent initialized")
        
    async def process_input(self, input_text: str) -> Dict[str, Any]:
        """Process input text and generate response with audio"""
        try:
            logger.info(f"Processing input: {input_text}")
            
            # Add input to conversation history
            self.conversation_history.append({"role": "user", "content": input_text})
            
            # Generate text response
            text_response = await self._generate_response(input_text)
            logger.info(f"Generated text response: {text_response}")
            
            # Generate audio from text using Eleven Labs
            audio_response = await self._generate_audio(text_response)
            logger.info("Generated audio response")
            
            # Add response to conversation history
            self.conversation_history.append({"role": "assistant", "content": text_response})
            
            response = {
                "text": text_response,
                "audio": audio_response
            }
            
            # Log response size
            logger.info(f"Response text length: {len(text_response)}")
            if audio_response:
                logger.info(f"Audio response length: {len(audio_response)}")
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing input: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                "text": f"Error processing input: {str(e)}",
                "audio": None
            }
    
    async def _generate_response(self, input_text: str) -> str:
        """Generate text response based on input text"""
        try:
            # For now, we'll use a simple echo response
            # In a real implementation, you might want to use a more sophisticated
            # text generation model or service
            return f"You said: {input_text}"
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    async def _generate_audio(self, text: str) -> Optional[str]:
        """Generate audio from text using Eleven Labs"""
        try:
            logger.info("Making request to Eleven Labs API")
            response = requests.post(
                f"{ELEVEN_LABS_API_URL}/text-to-speech/{ELEVEN_LABS_VOICE_ID}",
                headers=self.headers,
                json={
                    "text": text,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.5
                    }
                }
            )
            
            # Log the response status and headers
            logger.info(f"Eleven Labs API response status: {response.status_code}")
            logger.info(f"Eleven Labs API response headers: {response.headers}")
            
            response.raise_for_status()
            
            # Convert audio bytes to base64 string
            audio_base64 = base64.b64encode(response.content).decode()
            logger.info("Successfully generated and encoded audio")
            return audio_base64
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error in Eleven Labs API request: {str(e)}")
            logger.error(f"Response content: {getattr(e.response, 'text', 'No response content')}")
            logger.error(traceback.format_exc())
            return None
        except Exception as e:
            logger.error(f"Error generating audio: {str(e)}")
            logger.error(traceback.format_exc())
            return None

async def main():
    logger.info("Starting CheshireAgent main loop")
    agent = CheshireAgent()
    
    try:
        # Read input from stdin
        while True:
            logger.info("Waiting for input...")
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            
            if not line:
                logger.info("Received empty input, exiting")
                break
            
            logger.info("Processing input line")
            # Process the input
            response = await agent.process_input(line.strip())
            
            # Write response to stdout
            response_json = json.dumps(response)
            logger.info(f"Sending response: {response_json[:100]}...")  # Log first 100 chars
            print(response_json)
            sys.stdout.flush()
            
    except Exception as e:
        logger.error(f"Main loop error: {str(e)}")
        logger.error(traceback.format_exc())
        # Ensure error is properly formatted as JSON
        error_response = json.dumps({
            "text": f"Error: {str(e)}",
            "audio": None
        })
        print(error_response)
        sys.stdout.flush()

if __name__ == "__main__":
    asyncio.run(main())
