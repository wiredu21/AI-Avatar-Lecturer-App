import os
import requests
from typing import Optional, Dict, Any
from django.conf import settings

class OllamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
        self.model_name = os.getenv("OLLAMA_MODEL", "llama3")
        
    def generate_response(self, prompt: str, max_length: int = 512) -> Optional[str]:
        """Generate a response using Ollama API."""
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
            
            response = requests.post(url, json=payload)
            response.raise_for_status()
            
            result = response.json()
            return result.get("response", "No response generated")
            
        except requests.RequestException as e:
            print(f"Error calling Ollama API: {str(e)}")
            return f"Error generating response: {str(e)}"
    
    def is_model_available(self) -> bool:
        """Check if the Ollama service and model are available."""
        try:
            url = f"{self.base_url}/api/tags"
            response = requests.get(url)
            response.raise_for_status()
            
            models = response.json().get("models", [])
            return any(model.get("name") == self.model_name for model in models)
        except requests.RequestException:
            return False
    
    def pull_model(self) -> bool:
        """Pull the model if not already available."""
        try:
            url = f"{self.base_url}/api/pull"
            payload = {"name": self.model_name}
            
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            print(f"Error pulling model: {str(e)}")
            return False

    def is_off_topic(self, query: str) -> bool:
        """Check if the query is off-topic."""
        off_topic_keywords = [
            "hack", "crack", "illegal", "pirate", "warez",
            "drug", "weapon", "exploit", "vulnerability"
        ]
        return any(keyword in query.lower() for keyword in off_topic_keywords)

    def get_fallback_message(self) -> str:
        """Return a fallback message when the AI service is unavailable."""
        fallback_messages = [
            "I apologize, but I'm having trouble processing your request right now.",
            "I'm currently experiencing technical difficulties. Please try again later.",
            "I'm unable to provide a response at this moment. Please rephrase your question.",
        ]
        return fallback_messages[0] 