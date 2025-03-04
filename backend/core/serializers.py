
from rest_framework import serializers
from .models import ChatHistory, User, Course, University, UniversityContent, Avatar

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio']

class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avatar
        fields = ['id', 'name', 'image_url', 'description']

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['id', 'name', 'location', 'website', 'description', 'logo']

class CourseSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'code', 'title', 'description', 'university', 'created_at', 'updated_at']

class UniversityContentSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = UniversityContent
        fields = [
            'id', 'university', 'course', 'title', 'content', 
            'date', 'url_source', 'content_type', 'created_at', 'updated_at'
        ]

class ChatHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta:
        model = ChatHistory
        fields = ['id', 'user', 'course', 'message', 'is_user_message', 
                 'response', 'timestamp', 'context_data']
        read_only_fields = ['timestamp']

class ChatHistoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ['course', 'message', 'is_user_message', 'response', 'context_data']
