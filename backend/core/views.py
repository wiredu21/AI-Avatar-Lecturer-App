from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, authenticate
from .models import ChatHistory, User, University, Course, UniversityContent
from .serializers import (
    ChatHistorySerializer, ChatHistoryCreateSerializer,
    UserSerializer, UniversitySerializer, CourseSerializer,
    UniversityContentSerializer, UserRegistrationSerializer, UserLoginSerializer
)
from .email_utils import send_verification_email, verify_user_email

from rest_framework import generics, status
from rest_framework.response import Response
from .models import University, Course
from .serializers import UniversitySerializer, CourseSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    
    @action(detail=True, methods=['get'])
    def courses(self, request, pk=None):
        university = self.get_object()
        courses = Course.objects.filter(university=university)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def get_queryset(self):
        queryset = Course.objects.all()
        university_id = self.request.query_params.get('university', None)
        if university_id is not None:
            queryset = queryset.filter(university__id=university_id)
        return queryset
    
    @action(detail=True, methods=['get'])
    def content(self, request, pk=None):
        course = self.get_object()
        content = UniversityContent.objects.filter(course=course)
        serializer = UniversityContentSerializer(content, many=True)
        return Response(serializer.data)

from .ai import ai_response_generator

class ChatHistoryViewSet(viewsets.ModelViewSet):
    queryset = ChatHistory.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ChatHistoryCreateSerializer
        return ChatHistorySerializer
    
    def get_queryset(self):
        # Filter chat history by the requesting user
        return ChatHistory.objects.filter(user=self.request.user).order_by('timestamp')
    
    def perform_create(self, serializer):
        # Save the user message
        user_message = serializer.save(user=self.request.user)
        
        # If it's a user message, generate an AI response
        if user_message.is_user_message:
            course = user_message.course
            context_data = user_message.context_data
            
            # Generate AI response
            ai_response = ai_response_generator.generate_response(
                user_message.message,
                course=course,
                context_data=context_data
            )
            
            # Create a new chat history entry for the AI response
            ai_message = ChatHistory.objects.create(
                user=self.request.user,
                course=course,
                message=ai_response,
                is_user_message=False,
                response="",
                context_data=context_data
            )
            
            # Return both the user message and AI response
            return Response({
                "user_message": ChatHistorySerializer(user_message).data,
                "ai_response": ChatHistorySerializer(ai_message).data
            })
        
        return serializer
    
    @action(detail=False, methods=['get'])
    def by_course(self, request):
        course_id = request.query_params.get('course_id', None)
        if course_id:
            chat_history = ChatHistory.objects.filter(
                user=request.user,
                course__id=course_id
            ).order_by('timestamp')
            serializer = self.get_serializer(chat_history, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "course_id is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class UniversityListAPIView(generics.ListAPIView):
    """API view to list all universities"""
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

class CourseListAPIView(generics.ListAPIView):
    """API view to list all courses, with optional filtering by university"""
    serializer_class = CourseSerializer

    def get_queryset(self):
        queryset = Course.objects.all()
        university_id = self.request.query_params.get('university_id')
        if university_id:
            queryset = queryset.filter(university_id=university_id)
        return queryset

class ChatAPIView(APIView):
    """API view for chat interactions with the AI"""

    def post(self, request, *args, **kwargs):
        # This is a placeholder for AI chat functionality
        # In a real implementation, this would connect to an LLM like Llama 3
        user_message = request.data.get('message', '')
        course_id = request.data.get('course_id')

        # Placeholder response
        ai_response = f"You asked about course {course_id}: {user_message}"

        return Response({"response": ai_response}, status=status.HTTP_200_OK)

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Create user but set as inactive until email is verified
            user = serializer.save()
            user.is_active = False  # Set inactive until email verified
            user.save()
            
            # Send verification email
            email_sent = send_verification_email(user, request)
            
            if email_sent:
                return Response({
                    "message": "Registration successful. Please check your email to verify your account.",
                    "user": UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            else:
                # If email sending fails, still create account but inform user
                return Response({
                    "message": "Registration successful but verification email could not be sent. Please contact support.",
                    "user": UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, uidb64, token):
        """Verify user's email with token"""
        user = verify_user_email(uidb64, token)
        
        if user:
            # Set email as verified
            user.email_verified = True
            user.save()
            
            # Log the user in
            login(request, user)
            
            return Response({
                "message": "Email verified successfully. You are now logged in.",
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            "message": "Invalid or expired verification link."
        }, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)