import logging
from django.core.management.base import BaseCommand
from content.embeddings import content_embedding_service

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Update embeddings for all scraped university content'

    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.SUCCESS('Starting content embeddings update...'))
            count = content_embedding_service.update_content_embeddings()
            self.stdout.write(self.style.SUCCESS(f'Successfully updated embeddings for {count} content items'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error updating embeddings: {str(e)}'))
            logger.error(f'Error in update_embeddings command: {str(e)}') 