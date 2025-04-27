import os
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.urls import reverse
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

def generate_verification_token(user):
    """Generate a verification token for the user"""
    # Generate a token using Django's default token generator
    token = default_token_generator.make_token(user)
    # Encode the user's ID for the URL
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    return uid, token

def get_verification_url(request, uid, token):
    """Generate the verification URL"""
    # Get base URL from settings
    frontend_url = settings.FRONTEND_URL
    # Create verification URL for frontend
    verification_url = f"{frontend_url}/verify-email/{uid}/{token}/"
    return verification_url

def send_verification_email(user, request=None):
    """Send verification email using SendGrid"""
    try:
        # Generate verification token
        uid, token = generate_verification_token(user)
        logger.debug(f"Generated verification token for user id: {user.id}, username: {user.username}")
        
        # Generate verification URL
        verification_url = get_verification_url(request, uid, token)
        logger.debug(f"Generated verification URL: {verification_url}")
        
        # Get SendGrid API key from environment
        sg_api_key = os.getenv('SENDGRID_API_KEY')
        if not sg_api_key:
            logger.error("SendGrid API key not found in environment variables")
            return False
        
        # Log user email value for debugging
        logger.debug(f"User email type: {type(user.email)}, value: '{user.email}'")
        
        # Create email message
        message = Mail(
            from_email=settings.DEFAULT_FROM_EMAIL,
            to_emails=user.email,
            subject='Verify your VirtuAId Account',
            html_content=f'''
            <html>
            <body>
                <h2>Welcome to VirtuAId!</h2>
                <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
                <p><a href="{verification_url}">Verify Email Address</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br>The VirtuAId Team</p>
            </body>
            </html>
            '''
        )
        
        # Send email using SendGrid
        sg = SendGridAPIClient(sg_api_key)
        logger.debug(f"Attempting to send email to: {user.email}")
        response = sg.send(message)
        
        # Log success with detailed information
        logger.info(f"Verification email sent to {user.email}, status code: {response.status_code}")
        logger.debug(f"SendGrid response headers: {response.headers}")
        return True
    
    except Exception as e:
        # Enhanced error logging with exception details
        logger.error(f"Failed to send verification email: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        
        # Log user information for debugging
        try:
            logger.error(f"User data: id={user.id}, username={user.username}, email={user.email}")
        except Exception as user_error:
            logger.error(f"Could not log user data: {str(user_error)}")
            
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

def verify_user_email(uidb64, token):
    """Verify user email with token"""
    from .models import User  # Import here to avoid circular import
    
    try:
        # Decode the user ID
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
        
        # Check if the token is valid
        if default_token_generator.check_token(user, token):
            # Update user as email verified
            user.is_active = True
            user.save()
            return user
        return None
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None 