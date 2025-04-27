import os
import json
import logging
import requests
from requests.exceptions import RequestException, Timeout, ConnectionError

logger = logging.getLogger(__name__)

def try_ollama_connection():
    """
    Test if the Ollama service is available and responding
    Returns True if available, False otherwise
    """
    try:
        ollama_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
        response = requests.get(f"{ollama_url}/api/tags", timeout=2)
        return response.status_code == 200
    except (ConnectionError, Timeout, RequestException) as e:
        logger.error(f"Failed to connect to Ollama service: {str(e)}")
        return False 