from django.test import TestCase
from django.contrib.auth import get_user_model
from ..models import ChatHistory, University, Course
from ..encryption import encrypt_data, decrypt_data

User = get_user_model()

class EncryptionTest(TestCase):
    def setUp(self):
        # Create test data
        self.university = University.objects.create(
            name="Test University",
            location="Test Location",
            website="https://test.edu"
        )
        
        self.course = Course.objects.create(
            title="Test Course",
            code="TEST101",
            description="Test Description",
            university=self.university
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="test@example.com",
            bio="Test bio text"
        )

    def test_user_email_encryption(self):
        """Test that user email is properly encrypted and decrypted"""
        # Check if email is encrypted
        self.assertNotEqual(self.user._encrypted_email, "test@example.com")
        
        # Check if we can retrieve the decrypted email
        self.assertEqual(self.user.email, "test@example.com")
        
        # Check if updating email works
        self.user.email = "newemail@example.com"
        self.user.save()
        self.assertEqual(self.user.email, "newemail@example.com")

    def test_user_bio_encryption(self):
        """Test that user bio is properly encrypted and decrypted"""
        # Check if bio is encrypted
        self.assertNotEqual(self.user._encrypted_bio, "Test bio text")
        
        # Check if we can retrieve the decrypted bio
        self.assertEqual(self.user.bio, "Test bio text")
        
        # Check if updating bio works
        new_bio = "New bio text"
        self.user.bio = new_bio
        self.user.save()
        self.assertEqual(self.user.bio, new_bio)

    def test_chat_history_encryption(self):
        """Test that chat messages and responses are properly encrypted"""
        # Create a chat history entry
        chat = ChatHistory.objects.create(
            user=self.user,
            course=self.course,
            message="Test user message",
            response="Test AI response"
        )
        
        # Check if message is encrypted
        self.assertNotEqual(chat._encrypted_message, "Test user message")
        
        # Check if response is encrypted
        self.assertNotEqual(chat._encrypted_response, "Test AI response")
        
        # Check if we can retrieve the decrypted message and response
        self.assertEqual(chat.message, "Test user message")
        self.assertEqual(chat.response, "Test AI response")
        
        # Check if updating message and response works
        new_message = "New user message"
        new_response = "New AI response"
        chat.message = new_message
        chat.response = new_response
        chat.save()
        
        # Refresh from database to ensure changes are persisted
        chat.refresh_from_db()
        self.assertEqual(chat.message, new_message)
        self.assertEqual(chat.response, new_response)

    def test_encryption_utility_functions(self):
        """Test the encryption utility functions directly"""
        test_data = "Test data to encrypt"
        
        # Test encryption
        encrypted = encrypt_data(test_data)
        self.assertNotEqual(encrypted, test_data)
        
        # Test decryption
        decrypted = decrypt_data(encrypted)
        self.assertEqual(decrypted, test_data)
        
        # Test handling of empty data
        self.assertEqual(encrypt_data(""), "")
        self.assertEqual(decrypt_data(""), "")
        
        # Test handling of None
        self.assertEqual(encrypt_data(None), None)
        self.assertEqual(decrypt_data(None), None) 