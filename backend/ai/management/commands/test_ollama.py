from django.core.management.base import BaseCommand
from ai.ai_service import OllamaService

class Command(BaseCommand):
    help = 'Test the connection to Ollama API and the availability of the model'

    def handle(self, *args, **options):
        service = OllamaService()
        
        # Check if the service is available
        self.stdout.write('Checking Ollama service availability...')
        is_available = service.is_model_available()
        
        if not is_available:
            self.stdout.write(self.style.WARNING('Model not found. Attempting to pull the model...'))
            pulled = service.pull_model()
            if pulled:
                self.stdout.write(self.style.SUCCESS('Model successfully pulled!'))
            else:
                self.stdout.write(self.style.ERROR('Failed to pull the model.'))
                return
        else:
            self.stdout.write(self.style.SUCCESS('Ollama service and model are available!'))
        
        # Test generating a response
        self.stdout.write('Testing response generation...')
        prompt = "What is artificial intelligence? Keep it brief."
        response = service.generate_response(prompt, max_length=100)
        
        if response and not isinstance(response, str) or not response.startswith('Error'):
            self.stdout.write(self.style.SUCCESS('Successfully generated response!'))
            self.stdout.write(f'Response: {response}')
        else:
            self.stdout.write(self.style.ERROR(f'Failed to generate response: {response}')) 