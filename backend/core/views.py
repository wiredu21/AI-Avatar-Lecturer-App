
from rest_framework import viewsets, permissions
from .models import ChatHistory
from .serializers import ChatHistorySerializer, ChatHistoryCreateSerializer

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
