from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/verify-email/<str:uidb64>/<str:token>/', views.EmailVerificationView.as_view(), name='verify-email'),
    path('universities/', views.UniversityListAPIView.as_view(), name='university-list'),
    path('courses/', views.CourseListAPIView.as_view(), name='course-list'),
    path('chat/', views.ChatAPIView.as_view(), name='chat'),
]
