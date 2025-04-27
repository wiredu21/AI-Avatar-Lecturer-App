import os
import requests
import logging
import time
from typing import Optional, Dict, Any, Tuple
from django.conf import settings

# Set up logging
logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
        self.model_name = os.getenv("OLLAMA_MODEL", "llama3")
        self.connection_timeout = int(os.getenv("OLLAMA_TIMEOUT", "5"))
        self.max_retries = int(os.getenv("OLLAMA_MAX_RETRIES", "2"))
        
    def generate_response(self, prompt: str, max_length: int = 512) -> str:
        """Generate a response using Ollama API with improved error handling."""
        for attempt in range(self.max_retries + 1):
            try:
                url = f"{self.base_url}/api/generate"
                payload = {
                    "model": self.model_name,
                    "prompt": prompt,
                    "max_tokens": max_length,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "stream": False
                }
                
                logger.info(f"Sending request to Ollama API: model={self.model_name}, length={max_length}")
                response = requests.post(url, json=payload, timeout=self.connection_timeout)
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"Successfully generated response from Ollama")
                return result.get("response", "No response generated")
                
            except requests.exceptions.ConnectionError as e:
                logger.error(f"Connection error to Ollama API: {str(e)}")
                if attempt < self.max_retries:
                    wait_time = 1 * (attempt + 1)  # Exponential backoff
                    logger.info(f"Retrying in {wait_time} seconds (attempt {attempt+1}/{self.max_retries})")
                    time.sleep(wait_time)
                    continue
                return f"Error: Cannot connect to the AI service. Please ensure Ollama is running."
                
            except requests.exceptions.Timeout as e:
                logger.error(f"Timeout error to Ollama API: {str(e)}")
                return f"Error: The AI service timed out. Please try again with a shorter query."
                
            except requests.exceptions.HTTPError as e:
                error_msg = f"HTTP error from Ollama API: {str(e)}"
                logger.error(error_msg)
                # Check if the error is because model doesn't exist
                if response.status_code == 404:
                    if attempt < self.max_retries:
                        logger.info(f"Model {self.model_name} not found. Attempting to pull...")
                        success = self.pull_model()
                        if success:
                            logger.info(f"Successfully pulled model {self.model_name}. Retrying...")
                            continue
                    return f"Error: The requested AI model '{self.model_name}' is not available."
                return f"Error: The AI service encountered a problem (HTTP {response.status_code})."
                
            except Exception as e:
                logger.error(f"Unexpected error generating response: {str(e)}")
                return f"Error: An unexpected error occurred when generating a response."
    
    def is_model_available(self) -> bool:
        """Check if the Ollama service and model are available."""
        try:
            url = f"{self.base_url}/api/tags"
            response = requests.get(url, timeout=self.connection_timeout)
            response.raise_for_status()
            
            models = response.json().get("models", [])
            is_available = any(self.model_name in model.get("name") for model in models)
            
            if is_available:
                logger.info(f"Model {self.model_name} is available")
            else:
                logger.warning(f"Model {self.model_name} is not available")
            
            return is_available
        except requests.RequestException as e:
            logger.error(f"Error checking model availability: {str(e)}")
            return False
    
    def get_service_status(self) -> Tuple[bool, str]:
        """Get the status of the Ollama service and model."""
        try:
            # Check if Ollama service is running
            healthcheck_url = f"{self.base_url}/api/tags"
            response = requests.get(healthcheck_url, timeout=self.connection_timeout)
            
            if response.status_code != 200:
                return False, f"Ollama service responded with status code {response.status_code}"
            
            # Check if the model is available
            models = response.json().get("models", [])
            model_available = any(self.model_name in model.get("name") for model in models)
            
            if not model_available:
                return False, f"Model '{self.model_name}' is not available"
            
            return True, "Ollama service and model are available"
        except requests.exceptions.ConnectionError:
            return False, "Cannot connect to Ollama service"
        except requests.exceptions.Timeout:
            return False, "Connection to Ollama service timed out"
        except Exception as e:
            return False, f"Error checking Ollama service: {str(e)}"
    
    def pull_model(self) -> bool:
        """Pull the model if not already available."""
        try:
            logger.info(f"Attempting to pull model {self.model_name}")
            url = f"{self.base_url}/api/pull"
            payload = {"name": self.model_name}
            
            response = requests.post(url, json=payload, timeout=30)  # Longer timeout for model pulling
            response.raise_for_status()
            
            logger.info(f"Successfully pulled model {self.model_name}")
            return True
        except requests.RequestException as e:
            logger.error(f"Error pulling model {self.model_name}: {str(e)}")
            return False

    def is_off_topic(self, query: str) -> bool:
        """Check if the query is off-topic."""
        off_topic_keywords = [
            "hack", "crack", "illegal", "pirate", "warez",
            "drug", "weapon", "exploit", "vulnerability", 
            "porn", "gambling", "betting", "steal", "torrent",
            "password", "credit card", "bank account"
        ]
        return any(keyword in query.lower() for keyword in off_topic_keywords)

    def get_fallback_message(self) -> str:
        """Return a fallback message when the AI service is unavailable."""
        fallback_messages = [
            "I apologize, but I'm having trouble processing your request right now. Please try again later.",
            "I'm currently experiencing technical difficulties. Please try again in a few moments.",
            "I'm unable to provide a response at this moment. Please try asking a different question."
        ]
        return fallback_messages[0] 