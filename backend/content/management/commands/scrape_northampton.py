from django.core.management.base import BaseCommand
from content.tasks import scrape_northampton_news, scrape_northampton_events

class Command(BaseCommand):
    help = 'Scrape content from the University of Northampton'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['news', 'events', 'all'],
            default='all',
            help='Type of content to scrape: news, events, or all'
        )

    def handle(self, *args, **options):
        content_type = options['type']
        
        if content_type == 'news' or content_type == 'all':
            self.stdout.write(self.style.SUCCESS('Scraping Northampton news...'))
            result = scrape_northampton_news()
            self.stdout.write(self.style.SUCCESS(f'News scraping result: {result}'))
        
        if content_type == 'events' or content_type == 'all':
            self.stdout.write(self.style.SUCCESS('Scraping Northampton events...'))
            result = scrape_northampton_events()
            self.stdout.write(self.style.SUCCESS(f'Events scraping result: {result}'))
            
        self.stdout.write(self.style.SUCCESS('Scraping completed')) 