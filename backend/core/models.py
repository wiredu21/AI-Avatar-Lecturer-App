
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """Extended User model with additional fields for VirtuAid"""
    bio = models.TextField(blank=True)
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
    """Model to store chat history between users and the AI assistant"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_history')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_sessions')
    message = models.TextField()
    is_user_message = models.BooleanField(default=True)
    response = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    context_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        verbose_name_plural = "Chat histories"
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.user.username} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
