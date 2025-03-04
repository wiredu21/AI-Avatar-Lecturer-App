
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChatHistoryViewSet, UserViewSet, 
    UniversityViewSet, CourseViewSet
)

router = DefaultRouter()
router.register(r'chat-history', ChatHistoryViewSet, basename='chat-history')
router.register(r'users', UserViewSet, basename='users')
router.register(r'universities', UniversityViewSet, basename='universities')
router.register(r'courses', CourseViewSet, basename='courses')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
