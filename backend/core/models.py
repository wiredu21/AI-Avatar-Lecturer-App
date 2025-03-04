from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    university = models.ForeignKey('University', on_delete=models.SET_NULL, null=True)
    course = models.ForeignKey('Course', on_delete=models.SET_NULL, null=True)
    avatar = models.OneToOneField('Avatar', on_delete=models.SET_NULL, null=True)

class University(models.Model):
    name = models.CharField(max_length=100)

class Course(models.Model):
    name = models.CharField(max_length=100)

class Avatar(models.Model):
    name = models.CharField(max_length=100)
    image_url = models.URLField()

class UniversityContent(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    date = models.DateField()
    category = models.CharField(max_length=50)

class ChatHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.TextField()
    answer = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)