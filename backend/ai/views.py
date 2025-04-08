from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import AIQuerySerializer
from .ai_service import OllamaService

class AIQueryView(APIView):
    permission_classes = [IsAuthenticated]
    ai_service = OllamaService()

    def post(self, request):
        # Check if Ollama service is available
        if not self.ai_service.is_model_available():
            try:
                # Try to pull the model if not available
                pulled = self.ai_service.pull_model()
                if not pulled:
                    return Response({
                        'error': 'The AI model is not available.',
                        'fallback_message': self.ai_service.get_fallback_message()
                    }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            except Exception as e:
                return Response({
                    'error': f'Error accessing Ollama service: {str(e)}',
                    'fallback_message': self.ai_service.get_fallback_message()
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Process the query
        serializer = AIQuerySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        query = serializer.validated_data['query']
        context = serializer.validated_data.get('context', '')
        max_length = serializer.validated_data.get('max_length', 512)

        # Check for off-topic queries
        if self.ai_service.is_off_topic(query):
            return Response({
                'error': 'This query appears to be off-topic or inappropriate.',
                'fallback_message': self.ai_service.get_fallback_message()
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate response
        prompt = f"Context: {context}\nQuery: {query}" if context else query
        response = self.ai_service.generate_response(prompt, max_length)

        if isinstance(response, str) and response.startswith("Error"):
            return Response({
                'error': response,
                'fallback_message': self.ai_service.get_fallback_message()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'response': response,
            'query': query
        }, status=status.HTTP_200_OK) 