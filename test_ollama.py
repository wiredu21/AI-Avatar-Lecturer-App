import requests
import os

def test_ollama():
    base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
    model_name = os.getenv("OLLAMA_MODEL", "llama3")
    
    print(f"Testing Ollama connection to {base_url}")
    print(f"Looking for model: {model_name}")
    
    try:
        # Check if Ollama service is running
        url = f"{base_url}/api/tags"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            print("✅ Ollama service is running")
            models = response.json().get("models", [])
            
            # Check for exact match
            exact_match = any(model.get("name") == model_name for model in models)
            
            # Check for partial match
            partial_match = any(model_name in model.get("name") for model in models)
            
            if exact_match:
                print(f"✅ Model '{model_name}' is available (exact match)")
            elif partial_match:
                print(f"⚠️ Model '{model_name}' is available as a partial match")
                print("Available models with this name:")
                for model in models:
                    if model_name in model.get("name"):
                        print(f"  - {model.get('name')}")
            else:
                print(f"❌ Model '{model_name}' is NOT available")
                print("Available models:")
                for model in models:
                    print(f"  - {model.get('name')}")
        else:
            print(f"❌ Ollama service returned status code: {response.status_code}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama service")
    except requests.exceptions.Timeout:
        print("❌ Connection to Ollama service timed out")
    except Exception as e:
        print(f"❌ Error checking Ollama service: {str(e)}")

if __name__ == "__main__":
    test_ollama() 