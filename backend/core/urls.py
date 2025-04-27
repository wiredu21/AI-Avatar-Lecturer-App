from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter

# Create a router for ViewSet-based APIs
router = DefaultRouter()
router.register(r'chat-sessions', views.ChatSessionViewSet, basename='chat-session')

urlpatterns = [
    # Include router-generated URLs
    path('', include(router.urls)),
    
    # Auth endpoints
    path('auth/csrf/', views.CsrfTokenView.as_view(), name='csrf-token'),
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', views.UserLogoutView.as_view(), name='user-logout'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify-email/<str:uidb64>/<str:token>/', views.EmailVerificationView.as_view(), name='verify-email'),
    path('auth/change-password/', views.PasswordChangeView.as_view(), name='change-password'),
    path('auth/delete-account/', views.UserAccountDeleteView.as_view(), name='user-delete-account'),
    
    # User data endpoints
    path('user/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('user/onboarding-status/', views.UserOnboardingStatusView.as_view(), name='user-onboarding-status'),
    
    # University & course data endpoints
    path('universities/', views.UniversityListAPIView.as_view(), name='university-list'),
    path('courses/', views.CourseListAPIView.as_view(), name='course-list'),
    
    # Chat endpoints
    path('chat/', views.ChatAPIView.as_view(), name='chat'),
    path('chat-history/', views.ChatHistoryAPIView.as_view(), name='chat-history'),
    path('chat-status/', views.ChatStatusAPIView.as_view(), name='chat-status'),
]
