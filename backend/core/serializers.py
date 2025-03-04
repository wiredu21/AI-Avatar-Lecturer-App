
from rest_framework import serializers
from .models import ChatHistory, User, Course

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'code', 'title']

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
        fields = ['user', 'course', 'message', 'is_user_message', 'response', 'context_data']
