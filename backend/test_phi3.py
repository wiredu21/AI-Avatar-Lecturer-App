import requests
import os
import json
import time

def test_phi3():
    base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
    model_name = "phi3:latest"  # Updated to use the correct model name format
    
    print(f"Testing Ollama connection to {base_url}")
    print(f"Testing model: {model_name}")
    
    try:
        # Check if Ollama service is running
        url = f"{base_url}/api/tags"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            print("✅ Ollama service is running")
            models = response.json().get("models", [])
            
            # Check if Phi-3 is available
            phi3_available = any(model.get("name") == model_name for model in models)
            
            if phi3_available:
                print(f"✅ Model '{model_name}' is available")
            else:
                print(f"❌ Model '{model_name}' is NOT available")
                print("Available models:")
                for model in models:
                    print(f"  - {model.get('name')}")
                return
            
            # Test cases for Phi-3
            test_cases = [
                {
                    "name": "Basic Introduction",
                    "prompt": "Hello, can you introduce yourself and tell me what you're capable of?",
                    "max_tokens": 100
                },
                {
                    "name": "Simple Math",
                    "prompt": "What is 15 + 27? Show your work.",
                    "max_tokens": 50
                },
                {
                    "name": "Basic Code",
                    "prompt": "Write a simple Python function to add two numbers.",
                    "max_tokens": 100
                },
                {
                    "name": "Short Summary",
                    "prompt": "Summarize what artificial intelligence is in one sentence.",
                    "max_tokens": 50
                }
            ]
            
            # Run test cases
            for test in test_cases:
                print(f"\n🧪 Running test: {test['name']}")
                print(f"Prompt: {test['prompt']}")
                
                try:
                    generate_url = f"{base_url}/api/generate"
                    response = requests.post(
                        generate_url,
                        json={
                            "model": model_name,
                            "prompt": test["prompt"],
                            "stream": False,
                            "options": {
                                "num_predict": test["max_tokens"],
                                "temperature": 0.7,
                                "top_p": 0.9,
                                "top_k": 40,
                                "repeat_penalty": 1.1,
                                "stop": ["\n\n", "Human:", "Assistant:"]  # Add stop sequences
                            }
                        },
                        timeout=20  # Reduced timeout for faster feedback
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        print("✅ Response received successfully!")
                        print("\nResponse:")
                        print(result.get("response", "No response received"))
                        print("\n" + "="*50)
                    else:
                        print(f"❌ Test failed with status code: {response.status_code}")
                        print(f"Error: {response.text}")
                
                except requests.exceptions.Timeout:
                    print(f"❌ Test timed out after 20 seconds")
                except Exception as e:
                    print(f"❌ Error during test: {str(e)}")
                
                # Small delay between tests
                time.sleep(1)
            
            print("\n✨ All tests completed!")
            
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
    test_phi3() 