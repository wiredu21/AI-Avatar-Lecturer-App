from django.urls import path
from . import views

urlpatterns = [
    # ... existing code ...
    path('chat/status/', views.chat_status, name='chat_status'),
    # ... existing code ...
] 