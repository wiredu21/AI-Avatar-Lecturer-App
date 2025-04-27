from rest_framework import serializers
from .models import ChatHistory, User, Course, University, UniversityContent, Avatar, UserProfile
from django.contrib.auth import authenticate

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'id', 'first_name', 'surname', 'date_of_birth', 
            'gender', 'nationality', 'university', 'course', 
            'course_year', 'academic_level', 'avatar', 'voice_id'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'bio', 
            'has_completed_onboarding', 'is_first_time_login',
            'profile'
        ]

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

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirmPassword = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirmPassword']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmPassword')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        return attrs

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        # Check if new passwords match
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "New password fields didn't match."})
        
        # Password complexity validation
        if len(attrs['new_password']) < 8:
            raise serializers.ValidationError({"new_password": "Password must be at least 8 characters long."})
            
        return attrs
        
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
