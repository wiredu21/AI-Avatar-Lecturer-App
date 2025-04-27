import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get SendGrid API key
sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
default_from_email = os.getenv('DEFAULT_FROM_EMAIL')

print("Environment Variable Test Results:")
print("------------------------------------")
print(f"SENDGRID_API_KEY exists: {bool(sendgrid_api_key)}")
if sendgrid_api_key:
    # Only show first 10 chars and last 4 for security
    masked_key = sendgrid_api_key[:10] + "..." + sendgrid_api_key[-4:]
    print(f"SENDGRID_API_KEY: {masked_key}")
else:
    print("SENDGRID_API_KEY is missing or empty")

print(f"DEFAULT_FROM_EMAIL: {default_from_email}")
print("------------------------------------")
print("If both variables exist and have values, environment variables are loading correctly.") 