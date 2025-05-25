import os
import requests
import time

def test_connection():
    base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
    model_name = os.getenv("OLLAMA_MODEL", "phi3:latest")
    
    print("Testing Ollama API Connection...")
    print("=" * 50)
    
    # Test 1: Check API availability
    try:
        print("\n1. Testing API availability...")
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ API is accessible")
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Failed to connect to API: {str(e)}")
        return
    
    # Test 2: Check model availability
    try:
        print("\n2. Checking model availability...")
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        models = response.json().get("models", [])
        model_found = any(model_name in model.get("name") for model in models)
        
        if model_found:
            print(f"✅ Model '{model_name}' is available")
        else:
            print(f"❌ Model '{model_name}' not found in available models")
            return
    except Exception as e:
        print(f"❌ Error checking model availability: {str(e)}")
        return
    
    # Test 3: Quick model status check
    try:
        print("\n3. Checking model status...")
        response = requests.post(
            f"{base_url}/api/show",
            json={"name": model_name},
            timeout=5
        )
        if response.status_code == 200:
            print("✅ Model is loaded and ready")
        else:
            print(f"❌ Model status check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking model status: {str(e)}")
    
    print("\nConnection test completed!")

if __name__ == "__main__":
    test_connection() 