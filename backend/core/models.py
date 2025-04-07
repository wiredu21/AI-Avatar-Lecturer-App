from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .encryption import encrypt_data, decrypt_data

class User(AbstractUser):
    """Extended User model with additional fields for VirtuAid"""
    # GDPR Fields
    consent_given = models.BooleanField(default=False)
    data_retention_date = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)  # Soft delete flag
    
    # Email verification
    email_verified = models.BooleanField(default=False)

    # Encrypted Fields
    _encrypted_email = models.TextField(blank=True, null=True)
    _encrypted_bio = models.TextField(blank=True, null=True)

    # Override save() to set data retention date and handle encryption
    def save(self, *args, **kwargs):
        if self.consent_given and not self.data_retention_date:
            self.data_retention_date = timezone.now() + timezone.timedelta(days=365)
        
        # Encrypt sensitive fields before saving
        if hasattr(self, 'email') and self.email:
            self._encrypted_email = encrypt_data(self.email)
            self.email = ""  # Clear plaintext email
        if hasattr(self, 'bio') and self.bio:
            self._encrypted_bio = encrypt_data(self.bio)
            self.bio = ""  # Clear plaintext bio
            
        super().save(*args, **kwargs)

    # Encryption/Decryption Methods
    @property
    def email(self):
        if self._encrypted_email:
            return decrypt_data(self._encrypted_email)
        return super().email

    @email.setter
    def email(self, value):
        self._encrypted_email = encrypt_data(value) if value else None
        super().email = ""  # Clear plaintext email

    @property
    def bio(self):
        if self._encrypted_bio:
            return decrypt_data(self._encrypted_bio)
        return super().bio

    @bio.setter
    def bio(self, value):
        self._encrypted_bio = encrypt_data(value) if value else None
        super().bio = ""  # Clear plaintext bio
        
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


