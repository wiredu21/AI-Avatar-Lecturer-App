import os
import requests
import logging
import time
import re
from typing import Optional, Dict, Any, Tuple, List
from django.conf import settings

# Import content embedding service for RAG
try:
    from content.embeddings import content_embedding_service
    CONTENT_RAG_AVAILABLE = True
except ImportError:
    CONTENT_RAG_AVAILABLE = False

# Set up logging
logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
        self.model_name = os.getenv("OLLAMA_MODEL", "llama3")
        self.connection_timeout = int(os.getenv("OLLAMA_TIMEOUT", "5"))
        self.max_retries = int(os.getenv("OLLAMA_MAX_RETRIES", "2"))
        self.use_rag = os.getenv("USE_CONTENT_RAG", "True").lower() == "true"
        
    def _get_relevant_university_content(self, query: str) -> Optional[str]:
        """Retrieve relevant university content using RAG"""
        if not self.use_rag or not CONTENT_RAG_AVAILABLE:
            return None
            
        try:
            # Check if query is related to university content
            university_keywords = [
                "university", "campus", "lecture", "course", "professor", 
                "student", "class", "study", "academic", "faculty", "event", 
                "news", "deadline", "program", "department", "school", "college",
                "northampton", "graduation", "semester", "exam", "research",
                "what's happening", "upcoming", "this week", "announcement"
            ]
            
            # Simple keyword check - could be replaced with a more sophisticated classifier
            if not any(keyword in query.lower() for keyword in university_keywords):
                return None
                
            # Get relevant content
            logger.info(f"Searching for university content related to: {query}")
            results = content_embedding_service.retrieve_relevant_content(query, k=3)
            
            if not results:
                logger.info("No relevant university content found")
                return None
                
            # Format the content as context for the AI
            context_parts = ["Here is some relevant information about the university:"]
            
            for idx, item in enumerate(results):
                if item['content_type'] == 'news':
                    context_parts.append(f"NEWS: {item['title']}. {item['summary']}")
                elif item['content_type'] == 'event':
                    date_info = f"Date: {item['published_date']}" if item['published_date'] else ""
                    context_parts.append(f"EVENT: {item['title']}. {date_info}. {item['summary']}")
                else:
                    context_parts.append(f"{item['title']}. {item['summary']}")
                    
                # Add source information
                if item['source_name'] and item['university_name']:
                    context_parts.append(f"Source: {item['source_name']} at {item['university_name']}")
                
                # Add URL if available
                if item['url']:
                    context_parts.append(f"More information: {item['url']}")
                    
                # Add separator between items
                if idx < len(results) - 1:
                    context_parts.append("---")
            
            context = "\n".join(context_parts)
            logger.info(f"Added university content context using RAG")
            return context
        
        except Exception as e:
            logger.error(f"Error retrieving university content: {str(e)}")
            return None
        
    def generate_response(self, prompt: str, max_length: int = 512) -> str:
        """Generate a response using Ollama API with RAG enhancement for university content."""
        # Try to get relevant university content
        university_context = self._get_relevant_university_content(prompt)
        
        # Add university context to prompt if available
        enriched_prompt = prompt
        if university_context:
            enriched_prompt = f"{university_context}\n\nUser query: {prompt}\n\nPlease answer the query using the provided university information when relevant:"
            
        for attempt in range(self.max_retries + 1):
            try:
                url = f"{self.base_url}/api/generate"
                payload = {
                    "model": self.model_name,
                    "prompt": enriched_prompt,
                    "max_tokens": max_length,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "stream": False
                }
                
                log_prompt = enriched_prompt[:100] + "..." if len(enriched_prompt) > 100 else enriched_prompt
                logger.info(f"Sending request to Ollama API: model={self.model_name}, length={max_length}, prompt={log_prompt}")
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