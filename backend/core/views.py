
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatHistory, User, University, Course, UniversityContent
from .serializers import (
    ChatHistorySerializer, ChatHistoryCreateSerializer,
    UserSerializer, UniversitySerializer, CourseSerializer,
    UniversityContentSerializer
)

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
