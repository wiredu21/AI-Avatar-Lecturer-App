
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatHistoryViewSet

router = DefaultRouter()
router.register(r'chat-history', ChatHistoryViewSet, basename='chat-history')

urlpatterns = [
    path('api/', include(router.urls)),
]
