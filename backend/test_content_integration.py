import os
import requests
import json
import time
from datetime import datetime
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'virtuaid.settings')
django.setup()

# Now we can import Django models
from content.embeddings import content_embedding_service

def test_content_integration():
    base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
    model_name = os.getenv("OLLAMA_MODEL", "phi3:latest")
    
    print("Testing Phi-3 Integration with University Content...")
    print("=" * 50)
    
    try:
        print("\n1. Retrieving relevant university content...")
        # Query for relevant content with smaller k value
        query = "upcoming academic events"
        relevant_content = content_embedding_service.retrieve_relevant_content(query, k=1)  # Reduced to 1 item
        
        if not relevant_content:
            print("❌ No relevant university content found in the database")
            return
            
        print(f"✅ Found {len(relevant_content)} relevant content items")
        
        # Prepare minimal context from retrieved content
        item = relevant_content[0]  # Get first item only
        context = f"Event: {item['title']}"
        if item['summary']:
            context += f"\nDetails: {item['summary'][:100]}"  # Limit summary length
        if item['published_date']:
            context += f"\nDate: {item['published_date']}"
        
        # Simplified prompt with minimal context
        prompt = f"Based on this event: {context}\nSummarize this event briefly."
        
        # Prepare the request with minimal parameters
        payload = {
            "model": model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 30,  # Further reduced token count
                "temperature": 0.7,
                "top_p": 0.9,
                "stop": ["\n\n", "Human:", "Assistant:"]
            }
        }
        
        # Add retry mechanism with shorter timeouts
        max_retries = 3
        base_timeout = 3  # Reduced base timeout
        
        for attempt in range(max_retries):
            try:
                print(f"\n2. Sending request to Phi-3 model (Attempt {attempt + 1}/{max_retries})...")
                response = requests.post(
                    f"{base_url}/api/generate",
                    json=payload,
                    timeout=base_timeout * (attempt + 1)  # Shorter timeouts
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print("\n✅ Response received successfully!")
                    print("\nModel's Response:")
                    print("-" * 50)
                    print(result.get("response", "No response received"))
                    print("-" * 50)
                    
                    # Check if the response contains any university-specific information
                    response_text = result.get("response", "").lower()
                    university_keywords = [
                        "university", "campus", "student", "event", "announcement",
                        "course", "lecture", "seminar", "workshop", "deadline"
                    ]
                    
                    keyword_matches = [word for word in university_keywords if word in response_text]
                    if keyword_matches:
                        print(f"\n✅ Response contains university-related content (keywords found: {', '.join(keyword_matches)})")
                    else:
                        print("\n⚠️ Response may not contain university-specific information")
                    break  # Success, exit retry loop
                    
                else:
                    print(f"\n❌ Request failed with status code: {response.status_code}")
                    print(f"Error: {response.text}")
                    if attempt < max_retries - 1:
                        wait_time = 1  # Fixed short wait time
                        print(f"Retrying in {wait_time} seconds...")
                        time.sleep(wait_time)
                    continue
                    
            except requests.exceptions.Timeout:
                print(f"\n❌ Request timed out after {base_timeout * (attempt + 1)} seconds")
                if attempt < max_retries - 1:
                    wait_time = 1  # Fixed short wait time
                    print(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                continue
                
            except Exception as e:
                print(f"\n❌ Error during test: {str(e)}")
                if attempt < max_retries - 1:
                    wait_time = 1  # Fixed short wait time
                    print(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                continue
                
    except Exception as e:
        print(f"\n❌ Fatal error during test: {str(e)}")
    
    print("\nIntegration test completed!")

if __name__ == "__main__":
    test_content_integration() 