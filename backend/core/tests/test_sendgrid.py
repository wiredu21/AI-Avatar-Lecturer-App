import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import sys

def test_send_email():
    # Load environment variables
    load_dotenv()
    
    # Get SendGrid API key and from email
    api_key = os.getenv('SENDGRID_API_KEY')
    from_email = os.getenv('DEFAULT_FROM_EMAIL')
    
    # Check if variables exist
    if not api_key:
        print("Error: SENDGRID_API_KEY not found in environment variables")
        return False
    
    if not from_email:
        print("Error: DEFAULT_FROM_EMAIL not found in environment variables")
        return False
    
    # Get test recipient email
    if len(sys.argv) > 1:
        to_email = sys.argv[1]
    else:
        to_email = input("Enter test recipient email: ")
    
    try:
        # Create the email message
        message = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject='VirtuAId SendGrid Test',
            html_content='''
            <html>
            <body>
                <h2>SendGrid Test Email</h2>
                <p>This is a test email to verify that SendGrid is working correctly with your Django application.</p>
                <p>If you received this email, the configuration is working!</p>
                <p>Best regards,<br>The VirtuAId Team</p>
            </body>
            </html>
            '''
        )
        
        # Send email using SendGrid
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        # Print response details
        print(f"Response status code: {response.status_code}")
        print(f"Response body: {response.body}")
        print(f"Response headers: {response.headers}")
        
        # Check if successful
        if response.status_code >= 200 and response.status_code < 300:
            print("Email sent successfully!")
            return True
        else:
            print(f"Failed to send email. Status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing SendGrid Email Sending...")
    print("------------------------------------")
    result = test_send_email()
    print("------------------------------------")
    if result:
        print("TEST PASSED: SendGrid is configured correctly!")
    else:
        print("TEST FAILED: There was an issue with SendGrid configuration.")
        print("Please check the error messages above for details.") 