from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .encryption import encrypt_data, decrypt_data

class CustomUserManager(UserManager):
    """
    Custom user manager to handle encrypted email field during user creation
    """
    def create_user(self, username, email=None, password=None, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        This overrides the default create_user to properly handle encrypted email.
        """
        if not username:
            raise ValueError('The username must be set')
        
        # Create user without saving to get the instance
        user = self.model(username=username, **extra_fields)
        
        # Set password
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        
        # Set email using the property setter which handles encryption
        if email:
            user.email = email
        
        user.save(using=self._db)
        return user
        
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """
        Create and save a superuser with the given username, email, and password.
        This overrides the default create_superuser to properly handle encrypted email.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    """Extended User model with additional fields for VirtuAid"""
    # GDPR Fields
    consent_given = models.BooleanField(default=False)
    data_retention_date = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)  # Soft delete flag
    
    # Email verification
    email_verified = models.BooleanField(default=False)

    # Onboarding status fields
    has_completed_onboarding = models.BooleanField(default=False)
    is_first_time_login = models.BooleanField(default=True)
    onboarding_completed_date = models.DateTimeField(null=True, blank=True)

    # Encrypted Fields
    _encrypted_email = models.TextField(blank=True, null=True)
    _encrypted_bio = models.TextField(blank=True, null=True)
    
    # Use the custom manager
    objects = CustomUserManager()

    # Override save() to set data retention date and handle encryption
    def save(self, *args, **kwargs):
        if self.consent_given and not self.data_retention_date:
            self.data_retention_date = timezone.now() + timezone.timedelta(days=365)
        super().save(*args, **kwargs)
        
    # Method to handle proper account deletion with anonymization
    def delete_user(self):
        """
        Properly handle user deletion by:
        1. Marking the account as deleted
        2. Deactivating the account 
        3. Anonymizing personal data
        4. Making password unusable
        5. Setting retention date for final deletion
        """
        import time
        timestamp = int(time.time())
        
        # Mark account as deleted and inactive
        self.is_deleted = True
        self.is_active = False
        
        # Anonymize user data
        self.first_name = "Deleted"
        self.last_name = "User"
        old_username = self.username
        self.username = f"deleted_user_{self.id}_{timestamp}"
        
        # Anonymize email by clearing encrypted field
        self._encrypted_email = None
        
        # Set retention period if not already set
        if not self.data_retention_date:
            self.data_retention_date = timezone.now() + timezone.timedelta(days=30)
        
        # Make password unusable
        self.set_unusable_password()
        
        # Save all changes
        self.save()
        
        # Return old username for logging
        return old_username

    # Encryption/Decryption Methods
    @property
    def email(self):
        if self._encrypted_email:
            try:
                decrypted_email = decrypt_data(self._encrypted_email)
                # Ensure we always return a string
                return str(decrypted_email) if decrypted_email is not None else ""
            except Exception as e:
                # If decryption fails, log the error and return empty string
                print(f"Error decrypting email: {e}")
                return ""
        return ""
    
    @email.setter
    def email(self, value):
        if value:
            self._encrypted_email = encrypt_data(value)
        else:
            self._encrypted_email = None

    @property
    def bio(self):
        if self._encrypted_bio:
            return decrypt_data(self._encrypted_bio)
        return ""

    @bio.setter
    def bio(self, value):
        if value:
            self._encrypted_bio = encrypt_data(value)
        else:
            self._encrypted_bio = None
    
    # Additional fields
    university = models.ForeignKey('University', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    
    def __str__(self):
        return self.username

class University(models.Model):
    """University model to store information about educational institutions"""
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    website = models.URLField()
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='university_logos/', null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Universities"
    
    def __str__(self):
        return self.name

class Course(models.Model):
    """Course model to store information about courses offered by universities"""
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.TextField()
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('code', 'university')
    
    def __str__(self):
        return f"{self.code}: {self.title}"

class Avatar(models.Model):
    """Avatar model for user customization"""
    name = models.CharField(max_length=100)
    image_url = models.URLField()
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class UniversityContent(models.Model):
    """Model to store scraped or manually added content about universities and courses"""
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='content')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='content')
    title = models.CharField(max_length=255)
    content = models.TextField()
    date = models.DateField(auto_now_add=True)
    url_source = models.URLField(blank=True, null=True)
    content_type = models.CharField(max_length=50, choices=[
        ('course_info', 'Course Information'),
        ('syllabus', 'Syllabus'),
        ('faq', 'FAQ'),
        ('policy', 'University Policy'),
        ('other', 'Other')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class ChatHistory(models.Model):
    """Model to store chat history between users and the AI"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_history')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    _encrypted_message = models.TextField()
    _encrypted_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Chat Histories"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Chat with {self.user.username} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

    @property
    def message(self):
        return decrypt_data(self._encrypted_message)

    @message.setter
    def message(self, value):
        self._encrypted_message = encrypt_data(value) if value else None

    @property
    def response(self):
        return decrypt_data(self._encrypted_response)

    @response.setter
    def response(self, value):
        self._encrypted_response = encrypt_data(value) if value else None

    def save(self, *args, **kwargs):
        # Ensure message and response are encrypted before saving
        if hasattr(self, 'message') and self.message:
            self._encrypted_message = encrypt_data(self.message)
        if hasattr(self, 'response') and self.response:
            self._encrypted_response = encrypt_data(self.response)
        super().save(*args, **kwargs)

class ChatSession(models.Model):
    """Model to track chat conversation sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=255, default="New Conversation")
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_archived = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-last_updated']
        verbose_name = "Chat Session"
        verbose_name_plural = "Chat Sessions"
    
    def __str__(self):
        return f"{self.title} - {self.user.username} ({self.created_at.strftime('%Y-%m-%d')})"

class ChatMessage(models.Model):
    """Model to store messages within a chat session"""
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    _encrypted_message = models.TextField()
    is_user_message = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    context_data = models.JSONField(default=dict, blank=True)  # For storing any additional metadata
    
    class Meta:
        ordering = ['timestamp']
        verbose_name = "Chat Message"
        verbose_name_plural = "Chat Messages"
    
    def __str__(self):
        sender = "User" if self.is_user_message else "AI"
        preview = self.message[:50] + "..." if len(self.message) > 50 else self.message
        return f"{sender} message: {preview}"
    
    @property
    def message(self):
        return decrypt_data(self._encrypted_message)
    
    @message.setter
    def message(self, value):
        self._encrypted_message = encrypt_data(value) if value else None
    
    def save(self, *args, **kwargs):
        # Ensure message is encrypted before saving
        if hasattr(self, 'message') and self.message:
            self._encrypted_message = encrypt_data(self.message)
        
        # Update the last_updated timestamp on the parent session
        if self.session:
            self.session.save()  # This triggers auto_now on last_updated
            
        super().save(*args, **kwargs)

class UserProfile(models.Model):
    """Model to store detailed user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    
    # Academic Information
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.CharField(max_length=100, blank=True)
    course_year = models.CharField(max_length=50, blank=True)
    academic_level = models.CharField(max_length=50, blank=True)
    
    # Avatar preferences
    avatar = models.IntegerField(default=0)
    voice_id = models.CharField(max_length=50, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.username}"


