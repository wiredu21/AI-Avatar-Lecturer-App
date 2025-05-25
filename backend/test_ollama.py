import requests
import os
import json
import time

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
            
            # Test model generation
            if exact_match or partial_match:
                print("\nTesting model generation...")
                generate_url = f"{base_url}/api/generate"
                test_prompt = "Hello, can you introduce yourself?"
                
                # First, check if model is loaded
                try:
                    print("Checking if model is loaded...")
                    check_url = f"{base_url}/api/show"
                    response = requests.post(
                        check_url,
                        json={"name": model_name},
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        print("✅ Model is loaded and ready")
                    else:
                        print("⚠️ Model might not be fully loaded yet")
                        print("Waiting 10 seconds for model to initialize...")
                        time.sleep(10)
                except Exception as e:
                    print(f"⚠️ Could not check model status: {str(e)}")
                
                # Try model generation with increased timeout
                try:
                    print("Attempting to generate response...")
                    response = requests.post(
                        generate_url,
                        json={
                            "model": model_name,
                            "prompt": test_prompt,
                            "stream": False,
                            "options": {
                                "num_predict": 100,  # Limit response length
                                "temperature": 0.7,  # Add some randomness
                                "top_p": 0.9,       # Nucleus sampling
                                "top_k": 40         # Top-k sampling
                            }
                        },
                        timeout=60  # Increased timeout to 60 seconds
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        print("✅ Model generation successful!")
                        print("\nTest response:")
                        print(result.get("response", "No response received"))
                    else:
                        print(f"❌ Model generation failed with status code: {response.status_code}")
                        print(f"Error: {response.text}")
                        print("\nTroubleshooting tips:")
                        print("1. Make sure you have enough RAM available")
                        print("2. Try closing other resource-intensive applications")
                        print("3. Consider using a smaller model variant (e.g., llama3:8b)")
                except requests.exceptions.Timeout:
                    print("❌ Model generation timed out after 60 seconds")
                    print("\nTroubleshooting tips:")
                    print("1. Your system might not have enough resources to run the model")
                    print("2. Try using a smaller model variant (e.g., llama3:8b)")
                    print("3. Close other resource-intensive applications")
                    print("4. Check your system's RAM usage")
                except Exception as e:
                    print(f"❌ Error during model generation: {str(e)}")
        else:
            print(f"❌ Ollama service returned status code: {response.status_code}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama service")
        print("Make sure Ollama is running on your system")
        print("You can start Ollama by running 'ollama serve' in a separate terminal")
    except requests.exceptions.Timeout:
        print("❌ Connection to Ollama service timed out")
    except Exception as e:
        print(f"❌ Error checking Ollama service: {str(e)}")

if __name__ == "__main__":
    test_ollama() 