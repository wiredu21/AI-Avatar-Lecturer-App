import os
from cryptography.fernet import Fernet
from django.conf import settings

def get_encryption_key():
    """Get the encryption key from environment variables."""
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        raise ValueError("ENCRYPTION_KEY not found in environment variables")
    return key.encode()

def get_fernet():
    """Get a Fernet instance with the configured key."""
    return Fernet(get_encryption_key())

def encrypt_data(data: str) -> str:
    """
    Encrypt a string using Fernet encryption.
    
    Args:
        data (str): The string to encrypt
        
    Returns:
        str: The encrypted string (base64 encoded)
    """
    if not data:
        return data
    
    f = get_fernet()
    return f.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    """
    Decrypt a string that was encrypted using Fernet.
    
    Args:
        encrypted_data (str): The encrypted string (base64 encoded)
        
    Returns:
        str: The decrypted string
        
    Raises:
        Exception: If the data cannot be decrypted
    """
    if not encrypted_data:
        return encrypted_data
    
    try:
        f = get_fernet()
        return f.decrypt(encrypted_data.encode()).decode()
    except Exception as e:
        raise Exception(f"Failed to decrypt data: {str(e)}")

def encrypt_field(model_instance, field_name):
    """
    Encrypt a field value in a model instance.
    
    Args:
        model_instance: The model instance containing the field
        field_name (str): The name of the field to encrypt
    """
    if hasattr(model_instance, field_name):
        value = getattr(model_instance, field_name)
        if value:
            setattr(model_instance, field_name, encrypt_data(value))

def decrypt_field(model_instance, field_name):
    """
    Decrypt a field value in a model instance.
    
    Args:
        model_instance: The model instance containing the field
        field_name (str): The name of the field to decrypt
    """
    if hasattr(model_instance, field_name):
        value = getattr(model_instance, field_name)
        if value:
            setattr(model_instance, field_name, decrypt_data(value)) 