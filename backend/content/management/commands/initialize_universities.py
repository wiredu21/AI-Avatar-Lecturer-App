from django.core.management.base import BaseCommand
from core.models import University
from content.models import ContentSource, ContentType

class Command(BaseCommand):
    help = 'Initialize universities and content sources for the VirtuAId application'

    def handle(self, *args, **options):
        # Create University of Northampton if it doesn't exist
        northampton, created = University.objects.get_or_create(
            name="University of Northampton",
            defaults={
                'location': 'Northampton, UK',
                'website': 'https://www.northampton.ac.uk',
                'description': 'The University of Northampton is a public university based in Northampton, England.'
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created University: {northampton.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'University already exists: {northampton.name}'))
        
        # Create content sources for Northampton if they don't exist
        news_source, created = ContentSource.objects.get_or_create(
            name="Northampton University News",
            university=northampton,
            defaults={
                'url': 'https://www.northampton.ac.uk/news/',
                'content_type': ContentType.NEWS,
                'active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created content source: {news_source.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Content source already exists: {news_source.name}'))
        
        events_source, created = ContentSource.objects.get_or_create(
            name="Northampton University Events",
            university=northampton,
            defaults={
                'url': 'https://www.northampton.ac.uk/events/',
                'content_type': ContentType.EVENT,
                'active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created content source: {events_source.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Content source already exists: {events_source.name}'))
            
        self.stdout.write(self.style.SUCCESS('Initialization completed')) 