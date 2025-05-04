from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, authenticate, logout
from django.utils import timezone
from django.db import transaction
from .models import (
    ChatHistory, User, University, Course, UniversityContent, UserProfile,
    ChatSession, ChatMessage
)
from .serializers import (
    ChatHistorySerializer, ChatHistoryCreateSerializer,
    UserSerializer, UniversitySerializer, CourseSerializer,
    UniversityContentSerializer, UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, PasswordChangeSerializer,
    ChatSessionSerializer, ChatMessageSerializer, ChatMessageDetailSerializer
)
from .email_utils import send_verification_email, verify_user_email
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import generics, status
from rest_framework.response import Response
from .models import University, Course
from .serializers import UniversitySerializer, CourseSerializer

from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from .decorators import jwt_view_csrf_exempt

# Import the OllamaService from the ai app
from ai.ai_service import OllamaService

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

@jwt_view_csrf_exempt
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

@jwt_view_csrf_exempt
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
            # Log the user in using Django's session-based auth (for backward compatibility)
            login(request, user)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Return user data with onboarding status and tokens
            return Response({
                "user": UserSerializer(user).data,
                "onboarding_status": {
                    "has_completed_onboarding": user.has_completed_onboarding,
                    "is_first_time_login": user.is_first_time_login
                },
                "token": str(refresh.access_token),
                "refresh": str(refresh)
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

@jwt_view_csrf_exempt
class UserLogoutView(APIView):
    """
    API view to handle user logout
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Use Django's built-in logout function to end the session
        logout(request)
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)

@jwt_view_csrf_exempt
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

@jwt_view_csrf_exempt
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

@jwt_view_csrf_exempt
class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Change user password
        """
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Get the authenticated user
            user = request.user
            
            # Set the new password for the user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Update stored credentials (needed for session-based auth)
            # Log the user back in since password change logs them out
            login(request, user)
            
            # Generate new JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "message": "Password changed successfully.",
                "token": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@jwt_view_csrf_exempt
class ChatHistoryAPIView(APIView):
    """
    API view for chat history and interaction with the Ollama LLM
    This endpoint handles the chat requests from the frontend
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get chat history for the current user
        """
        # Optional filtering by course ID
        course_id = request.query_params.get('course', None)
        
        # Get the user's chat history
        queryset = ChatHistory.objects.filter(user=request.user)
        
        # Filter by course if provided
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Order by timestamp (oldest first)
        queryset = queryset.order_by('timestamp')
        
        # Serialize and return the data
        serializer = ChatHistorySerializer(queryset, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """
        Process a new chat message and generate a response using Ollama
        """
        # Initialize the Ollama service
        ollama_service = OllamaService()
        
        # Extract data from the request
        user_message = request.data.get('message', '')
        course_id = request.data.get('course')
        is_user_message = request.data.get('is_user_message', True)
        context_data = request.data.get('context_data', {})
        
        # Validate required fields
        if not user_message:
            return Response(
                {"error": "Message is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get course if ID provided
            course = None
            if course_id:
                try:
                    course = Course.objects.get(id=course_id)
                except Course.DoesNotExist:
                    # Course not found, but we'll still process the message
                    pass
            
            # Create a new chat history entry for the user message
            chat_entry = ChatHistory.objects.create(
                user=request.user,
                course=course,
                message=user_message,
                is_user_message=is_user_message,
                context_data=context_data
            )
            
            # Only generate a response for user messages
            if is_user_message:
                # Check for availability of LLM service
                if not ollama_service.is_model_available():
                    # Try to pull the model
                    ollama_service.pull_model()
                    
                # Check if message might be inappropriate
                if ollama_service.is_off_topic(user_message):
                    ai_response = "I'm sorry, but I can't assist with that type of request. Please ask something related to your academic studies."
                else:
                    # Generate AI response using Ollama
                    try:
                        # Include user details for personalization
                        course_name = course.name if course else "general topic"
                        user_prompt = f"""
                        The user is asking about {course_name}. 
                        Their message is: {user_message}
                        
                        Provide a helpful, educational response.
                        """
                        
                        # Get response from Ollama
                        ai_response = ollama_service.generate_response(user_prompt)
                        
                        # If generation fails, use fallback
                        if ai_response.startswith("Error"):
                            ai_response = ollama_service.get_fallback_message()
                    except Exception as e:
                        # Use fallback response if generation fails
                        print(f"Error generating response: {str(e)}")
                        ai_response = ollama_service.get_fallback_message()
                
                # Create a new chat entry for the AI response
                ai_entry = ChatHistory.objects.create(
                    user=request.user,
                    course=course,
                    message=ai_response,
                    is_user_message=False,
                    context_data=context_data
                )
                
                # Return both the user message and AI response
                serialized_ai_response = ChatHistorySerializer(ai_entry).data
                return Response(serialized_ai_response)
            
            # If not a user message, just return the created entry
            return Response(
                ChatHistorySerializer(chat_entry).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            # Handle any unexpected errors
            print(f"Error processing chat message: {str(e)}")
            return Response(
                {"error": f"Failed to process message: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@jwt_view_csrf_exempt
class ChatStatusAPIView(APIView):
    """
    API view for checking the status of the chat service (Ollama)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Check if the Ollama service is available and functioning properly
        """
        # Initialize the Ollama service
        ollama_service = OllamaService()
        
        # Check service status
        is_available, message = ollama_service.get_service_status()
        
        # Return status information
        return Response({
            "service_available": is_available,
            "message": message,
            "model": ollama_service.model_name,
            "server_url": ollama_service.base_url
        }, status=status.HTTP_200_OK if is_available else status.HTTP_503_SERVICE_UNAVAILABLE)

# REST framework views for ChatSession
@jwt_view_csrf_exempt
class ChatSessionViewSet(viewsets.ModelViewSet):
    """API endpoint for managing chat sessions"""
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only the current user's chat sessions"""
        return ChatSession.objects.filter(
            user=self.request.user
        ).order_by('-last_updated')
    
    def perform_create(self, serializer):
        """Create a new chat session for the current user"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a specific chat session"""
        try:
            session = self.get_object()
            messages = ChatMessage.objects.filter(session=session).order_by('timestamp')
            serializer = ChatMessageDetailSerializer(messages, many=True)
            return Response(serializer.data)
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Chat session not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def message(self, request):
        """Create a new message in a chat session and generate AI response"""
        session_id = request.data.get('session_id')
        message_text = request.data.get('message')
        course_id = request.data.get('course')
        
        if not session_id or not message_text:
            return Response(
                {"error": "session_id and message are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the session and course if provided
            session = ChatSession.objects.get(id=session_id, user=request.user)
            course = None
            if course_id:
                try:
                    course = Course.objects.get(id=course_id)
                except Course.DoesNotExist:
                    pass  # Continue without course
            
            # Initialize the Ollama service
            ollama_service = OllamaService()
            
            with transaction.atomic():
                # Create user message
                user_message = ChatMessage.objects.create(
                    session=session,
                    user=request.user,
                    message=message_text,
                    is_user_message=True,
                    course=course,
                    context_data={}
                )
                
                # Get context from previous messages for better continuity
                context_messages = ChatMessage.objects.filter(
                    session=session
                ).order_by('-timestamp')[:10]  # Get last 10 messages
                
                context = []
                for msg in reversed(list(context_messages)):
                    role = "user" if msg.is_user_message else "assistant"
                    context.append({"role": role, "content": msg.message})
                
                # Generate AI response
                ai_response = ollama_service.generate_response(
                    message_text,
                    context=context,
                    course=course
                )
                
                # Create AI message
                ai_message = ChatMessage.objects.create(
                    session=session,
                    user=request.user,
                    message=ai_response,
                    is_user_message=False,
                    course=course,
                    context_data={}
                )
                
                # Return AI message details
                serializer = ChatMessageDetailSerializer(ai_message)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Chat session not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@jwt_view_csrf_exempt
class UserAccountDeleteView(APIView):
    """
    API view to handle user account deletion (GDPR right to be forgotten)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Handle the account deletion request
        """
        user = request.user
        user_id = user.id  # Store for logging
        
        try:
            # Use transaction.atomic to ensure all database changes are atomic
            with transaction.atomic():
                print(f"[ACCOUNT_DELETION] Starting deletion process for user {user_id}")
                
                # Use the User model's delete_user method which handles all the anonymization
                old_username = user.delete_user()
                print(f"[ACCOUNT_DELETION] User {user_id} data anonymized: username changed from {old_username} to {user.username}")
                
                # Also anonymize related profile data
                try:
                    profile = UserProfile.objects.get(user=user)
                    profile.first_name = "Deleted"
                    profile.surname = "User"
                    profile.date_of_birth = None
                    profile.gender = ""
                    profile.nationality = ""
                    profile.course = ""
                    profile.save()
                    print(f"[ACCOUNT_DELETION] User {user_id} profile anonymized")
                except UserProfile.DoesNotExist:
                    print(f"[ACCOUNT_DELETION] No profile found for user {user_id}")
                
                # In a real system, you'd queue a task to permanently delete after retention period
                print(f"[ACCOUNT_DELETION] User {user_id} scheduled for permanent deletion after retention period")
            
            # Only log the user out after the transaction has successfully committed
            logout(request)
            print(f"[ACCOUNT_DELETION] User {user_id} logged out successfully after deletion")
            
            return Response(
                {
                    "message": "Your account has been successfully marked for deletion. Your data will be retained for 30 days before permanent deletion.",
                    "success": True,
                    "deletion_date": user.data_retention_date.isoformat() if user.data_retention_date else None
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            error_message = str(e)
            print(f"[ACCOUNT_DELETION_ERROR] Failed to delete account for user {user_id}: {error_message}")
            
            # Provide more specific error messages based on the exception type
            if "IntegrityError" in error_message:
                return Response(
                    {"error": "Database integrity error. Please try again later.", "details": error_message},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            elif "OperationalError" in error_message:
                return Response(
                    {"error": "Database operation failed. Please try again later.", "details": error_message},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            else:
                return Response(
                    {"error": f"Failed to delete account: {error_message}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

@jwt_view_csrf_exempt
class UserDataExportView(APIView):
    """
    API view to export all user data (GDPR right to data portability)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Export all data related to the current user
        """
        user = request.user
        
        try:
            # Gather all user-related data in a structured format
            
            # 1. Basic user information
            user_data = UserSerializer(user).data
            
            # 2. User profile (more detailed information)
            try:
                profile = UserProfile.objects.get(user=user)
                profile_data = UserProfileSerializer(profile).data
            except UserProfile.DoesNotExist:
                profile_data = None
            
            # 3. Chat history
            chat_sessions = ChatSession.objects.filter(user=user)
            chat_sessions_data = ChatSessionSerializer(chat_sessions, many=True).data
            
            # Get detailed messages for each session
            for i, session in enumerate(chat_sessions_data):
                session_id = session.get('id')
                messages = ChatMessage.objects.filter(chat_session_id=session_id)
                chat_sessions_data[i]['messages'] = ChatMessageDetailSerializer(messages, many=True).data
            
            # 4. Other user data (you can expand this for other data types)
            chat_history = ChatHistory.objects.filter(user=user)
            chat_history_data = ChatHistorySerializer(chat_history, many=True).data
            
            # 5. Data modification log
            # For a real system, this would come from an audit log table
            # Here we'll just use created/updated timestamps from various models
            data_modifications = [
                {
                    "date": user.date_joined.isoformat(),
                    "action": "Account created",
                    "details": "Initial account registration"
                }
            ]
            
            # Add profile creation/updates
            if profile_data:
                if profile.created_at:
                    data_modifications.append({
                        "date": profile.created_at.isoformat(),
                        "action": "Profile created",
                        "details": "Initial profile setup"
                    })
                
                if profile.updated_at and profile.updated_at != profile.created_at:
                    data_modifications.append({
                        "date": profile.updated_at.isoformat(),
                        "action": "Profile updated",
                        "details": "Profile information modified"
                    })
            
            # Add onboarding completion if applicable
            if user.onboarding_completed_date:
                data_modifications.append({
                    "date": user.onboarding_completed_date.isoformat(),
                    "action": "Onboarding completed",
                    "details": "User completed the onboarding process"
                })
            
            # Sort modifications by date (most recent first)
            data_modifications.sort(key=lambda x: x['date'], reverse=True)
            
            # Compile the complete export
            export_data = {
                "user": user_data,
                "profile": profile_data,
                "chat_sessions": chat_sessions_data,
                "chat_history": chat_history_data,
                "account_activity": {
                    "data_modifications": data_modifications,
                    "last_login": user.last_login.isoformat() if user.last_login else None
                },
                "export_date": timezone.now().isoformat()
            }
            
            return Response(export_data)
            
        except Exception as e:
            print(f"Error exporting user data: {str(e)}")
            return Response(
                {"detail": f"Error exporting user data: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )