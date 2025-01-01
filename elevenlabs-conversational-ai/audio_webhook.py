from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import asyncio
import aiohttp
import json
import os
from typing import Optional
import logging
import base64
import traceback
import sys

# Configure logging to output to both file and console
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('audio_webhook.log')
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Eleven Labs Configuration
ELEVEN_LABS_API_KEY = "sk_c72dfcfd1f92156c802395c9becd6b301a9a881ebaca9012"
ELEVEN_LABS_VOICE_ID = "v9j1d3wLyU7N2cUz1uBQ"  # Rick's voice ID
ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1"

class AudioMessage(BaseModel):
    text: str  # Input text
    user_id: str
    session_id: Optional[str] = None
    metadata: Optional[dict] = None

class AudioResponse(BaseModel):
    text: str
    audio: Optional[str]  # Base64 encoded audio
    user_id: str
    session_id: Optional[str] = None

async def generate_audio(text: str) -> Optional[str]:
    """Generate audio using Eleven Labs API"""
    try:
        logger.debug(f"Starting audio generation for text: {text}")
        headers = {
            "xi-api-key": ELEVEN_LABS_API_KEY,
            "Content-Type": "application/json"
        }
        
        logger.debug(f"Making request to Eleven Labs API")
        logger.debug(f"Request URL: {ELEVEN_LABS_API_URL}/text-to-speech/{ELEVEN_LABS_VOICE_ID}")
        logger.debug(f"Request headers: {headers}")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{ELEVEN_LABS_API_URL}/text-to-speech/{ELEVEN_LABS_VOICE_ID}",
                headers=headers,
                json={
                    "text": text,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.5
                    }
                },
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                logger.debug(f"Eleven Labs API response status: {response.status}")
                logger.debug(f"Eleven Labs API response headers: {response.headers}")
                
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Eleven Labs API error response: {error_text}")
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"Eleven Labs API error: {error_text}"
                    )
                
                audio_content = await response.read()
                audio_base64 = base64.b64encode(audio_content).decode()
                logger.debug(f"Successfully generated audio, base64 length: {len(audio_base64)}")
                return audio_base64
                
    except aiohttp.ClientError as e:
        logger.error(f"aiohttp client error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"API request error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in generate_audio: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/webhook/audio")
async def handle_audio_webhook(message: AudioMessage):
    try:
        logger.debug(f"Received webhook request: {message.dict()}")
        
        # Generate response text
        response_text = f"You said: {message.text}"
        logger.debug(f"Generated response text: {response_text}")
        
        # Generate audio from text using Eleven Labs
        try:
            audio_response = await generate_audio(response_text)
            logger.debug("Audio generation completed successfully")
        except HTTPException as e:
            logger.error(f"Audio generation failed: {e.detail}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during audio generation: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")
        
        # Create response
        response = AudioResponse(
            text=response_text,
            audio=audio_response,
            user_id=message.user_id,
            session_id=message.session_id
        )
        
        logger.debug("Sending response back to client")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Webhook error: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    logger.info("Starting audio webhook server...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down audio webhook server...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
