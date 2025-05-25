import os
from dotenv import load_dotenv

def test_environment():
    # Load environment variables
    load_dotenv()
    
    print("Testing environment variables:")
    print("=" * 50)
    
    # Check Ollama configuration
    ollama_url = os.getenv('OLLAMA_API_URL')
    ollama_model = os.getenv('OLLAMA_MODEL')
    ai_max_length = os.getenv('AI_MAX_LENGTH')
    ai_temperature = os.getenv('AI_TEMPERATURE')
    ai_top_p = os.getenv('AI_TOP_P')
    
    print(f"OLLAMA_API_URL: {ollama_url}")
    print(f"OLLAMA_MODEL: {ollama_model}")
    print(f"AI_MAX_LENGTH: {ai_max_length}")
    print(f"AI_TEMPERATURE: {ai_temperature}")
    print(f"AI_TOP_P: {ai_top_p}")
    
    # Verify critical values
    if ollama_model != "phi3:latest":
        print("\n⚠️ Warning: OLLAMA_MODEL is not set to 'phi3:latest'")
    else:
        print("\n✅ OLLAMA_MODEL is correctly set to 'phi3:latest'")
    
    if not ollama_url:
        print("⚠️ Warning: OLLAMA_API_URL is not set")
    else:
        print("✅ OLLAMA_API_URL is set")
    
    print("\nEnvironment test completed!")

if __name__ == "__main__":
    test_environment() 