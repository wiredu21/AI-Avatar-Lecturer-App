from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .utils.ai_service import try_ollama_connection

@csrf_exempt
@require_http_methods(["GET"])
def chat_status(request):
    """
    Check if the Ollama chat service is available
    """
    service_available = try_ollama_connection()
    
    if service_available:
        return JsonResponse({
            'service_available': True,
            'message': 'Chat service is running'
        })
    else:
        return JsonResponse({
            'service_available': False,
            'message': 'Chat service is currently unavailable'
        }, status=200)  # Still return 200 as this is an expected state, not an error 