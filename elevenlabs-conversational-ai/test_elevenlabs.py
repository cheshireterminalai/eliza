import requests
import json
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

ELEVEN_LABS_API_KEY = "sk_c72dfcfd1f92156c802395c9becd6b301a9a881ebaca9012"
ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1"

def test_list_voices():
    try:
        headers = {
            "xi-api-key": ELEVEN_LABS_API_KEY,
            "Content-Type": "application/json"
        }
        
        logger.info("Making request to list voices...")
        response = requests.get(
            f"{ELEVEN_LABS_API_URL}/voices",
            headers=headers
        )
        
        logger.info(f"Response status: {response.status_code}")
        logger.info(f"Response headers: {response.headers}")
        
        if response.status_code == 200:
            voices = response.json()
            logger.info("Available voices:")
            for voice in voices.get("voices", []):
                logger.info(f"Voice ID: {voice.get('voice_id')}, Name: {voice.get('name')}")
        else:
            logger.error(f"Error response: {response.text}")
            
    except Exception as e:
        logger.error(f"Error: {str(e)}")

if __name__ == "__main__":
    test_list_voices()
