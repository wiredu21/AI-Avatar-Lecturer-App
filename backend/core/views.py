from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, authenticate, logout
from django.utils import timezone
from django.db import transaction
from .models import ChatHistory, User, University, Course, UniversityContent, UserProfile
from .serializers import (
    ChatHistorySerializer, ChatHistoryCreateSerializer,
    UserSerializer, UniversitySerializer, CourseSerializer,
    UniversityContentSerializer, UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer
)
from .email_utils import send_verification_email, verify_user_email

from rest_framework import generics, status
from rest_framework.response import Response
from .models import University, Course
from .serializers import UniversitySerializer, CourseSerializer

from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token

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

@method_decorator(ensure_csrf_cookie, name='dispatch')
class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # No authentication required for registration

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Create user and make them active by default
                user = serializer.save()
                user.is_active = True  # Make user active immediately
                user.email_verified = True  # Mark email as verified by default
                user.save()
                
                # Log in the user immediately after registration
                login(request, user)
                
                return Response({
                    "message": "Registration successful. You are now logged in.",
                    "user": UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({
                    "message": f"Registration failed: {str(e)}",
                }, status=status.HTTP_400_BAD_REQUEST)
        
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
            
            # Return user data with onboarding status
            return Response({
                "user": UserSerializer(user).data,
                "onboarding_status": {
                    "has_completed_onboarding": user.has_completed_onboarding,
                    "is_first_time_login": user.is_first_time_login
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        # This will force Django to send the CSRF token in the session
        csrf_token = get_token(request)
        return Response({'csrfToken': csrf_token})

class UserLogoutView(APIView):
    """
    API view to handle user logout
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Use Django's built-in logout function to end the session
        logout(request)
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get the user's profile information
        """
        user = request.user
        try:
            profile = UserProfile.objects.get(user=user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "Profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request):
        """
        Create or update user profile during onboarding
        """
        user = request.user
        
        # Get the profile data from request
        # Use transaction.atomic to ensure both profile and user status update
        # happen together or not at all
        with transaction.atomic():
            # Check if profile exists
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Process the data before validation
            data = request.data.copy()
            
            # Log the raw data for debugging
            print(f"Raw profile data: {data}")
            
            # Handle university as a string by finding the corresponding University object
            university_name = data.get('university')
            if university_name and isinstance(university_name, str):
                try:
                    # Map common university slug/code values to full names for matching
                    university_mapping = {
                        'northampton': 'University of Northampton',
                        'oxford': 'University of Oxford',
                        'cambridge': 'University of Cambridge',
                        'imperial': 'Imperial College London',
                        'ucl': 'University College London',
                        'lse': 'London School of Economics',
                        'edinburgh': 'University of Edinburgh',
                        'manchester': 'University of Manchester',
                        'bristol': 'University of Bristol',
                        'warwick': 'University of Warwick',
                        'glasgow': 'University of Glasgow',
                    }
                    
                    # Try to map the university code to a full name
                    full_name = university_mapping.get(university_name.lower(), university_name)
                    
                    # Try to find the university by name
                    university = University.objects.filter(name__icontains=full_name).first()
                    
                    if not university:
                        # If not found, create a new university record
                        university = University.objects.create(
                            name=full_name,
                            location='United Kingdom',
                            website=f'https://www.{university_name}.ac.uk',
                            description=f'{full_name} - created from onboarding'
                        )
                    
                    # Set the university ID
                    data['university'] = university.id
                except Exception as e:
                    print(f"Error handling university: {e}")
                    data['university'] = None
            
            # Convert avatar to integer if it's a string
            if 'avatar' in data and isinstance(data['avatar'], str):
                try:
                    data['avatar'] = int(data['avatar'])
                except ValueError:
                    print(f"Error converting avatar to integer: {data['avatar']}")
                    data['avatar'] = 0
            
            # Ensure all strings are properly handled
            for field in ['first_name', 'surname', 'gender', 'nationality', 'course', 'course_year', 'academic_level', 'voice_id']:
                if field in data and data[field] is None:
                    if field in ['first_name', 'surname']:
                        # These are required fields
                        print(f"Required field {field} is None")
                    else:
                        # These can be blank
                        data[field] = ""
            
            print(f"Processed profile data: {data}")
            
            serializer = UserProfileSerializer(profile, data=data)
            
            if serializer.is_valid():
                # Save the profile
                serializer.save()
                
                # Update the user's onboarding status
                user.has_completed_onboarding = True
                user.is_first_time_login = False
                user.onboarding_completed_date = timezone.now()
                user.save()
                
                return Response({
                    "message": "Onboarding complete!",
                    "profile": serializer.data
                })
            else:
                # Will automatically roll back transaction on error
                print(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserOnboardingStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get the user's onboarding status
        """
        user = request.user
        return Response({
            "has_completed_onboarding": user.has_completed_onboarding,
            "is_first_time_login": user.is_first_time_login
        })
    
    def patch(self, request):
        """
        Update the user's onboarding status
        """
        user = request.user
        
        # Get status values from request
        has_completed_onboarding = request.data.get('has_completed_onboarding')
        is_first_time_login = request.data.get('is_first_time_login')
        
        # Update status values if provided
        if has_completed_onboarding is not None:
            user.has_completed_onboarding = has_completed_onboarding
            if has_completed_onboarding:
                user.onboarding_completed_date = timezone.now()
        
        if is_first_time_login is not None:
            user.is_first_time_login = is_first_time_login
        
        user.save()
        
        return Response({
            "has_completed_onboarding": user.has_completed_onboarding,
            "is_first_time_login": user.is_first_time_login
        })