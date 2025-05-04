from django.core.management.base import BaseCommand
import json
from content.scrapers.northampton import scrape_northampton_news_page, scrape_northampton_events_page

class Command(BaseCommand):
    help = 'Test the Northampton University scrapers without saving to the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['news', 'events', 'all'],
            default='all',
            help='Type of content to scrape: news, events, or all'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=5,
            help='Maximum number of items to scrape'
        )
        parser.add_argument(
            '--debug',
            action='store_true',
            help='Enable debug mode for detailed logging'
        )

    def handle(self, *args, **options):
        content_type = options['type']
        limit = options['limit']
        debug = options['debug']
        
        if content_type == 'news' or content_type == 'all':
            self.stdout.write(self.style.SUCCESS('Testing Northampton news scraper...'))
            news_url = 'https://www.northampton.ac.uk/news/'
            
            news_items = scrape_northampton_news_page(news_url, max_items=limit, debug=debug)
            
            self.stdout.write(self.style.SUCCESS(f'Scraped {len(news_items)} news items'))
            
            # Display the scraped items
            for i, item in enumerate(news_items, 1):
                self.stdout.write(self.style.SUCCESS(f'\nNews Item {i}:'))
                self.stdout.write(f'Title: {item.get("title", "No title")}')
                self.stdout.write(f'URL: {item.get("url", "No URL")}')
                self.stdout.write(f'Date: {item.get("published_date", "No date")}')
                self.stdout.write(f'Summary: {item.get("summary", "No summary")[:100]}...')
                self.stdout.write(f'Has image: {"Yes" if item.get("image_url") else "No"}')
        
        if content_type == 'events' or content_type == 'all':
            self.stdout.write(self.style.SUCCESS('\nTesting Northampton events scraper...'))
            events_url = 'https://www.northampton.ac.uk/events/'
            
            event_items = scrape_northampton_events_page(events_url, max_items=limit, debug=debug)
            
            self.stdout.write(self.style.SUCCESS(f'Scraped {len(event_items)} event items'))
            
            # Display the scraped items
            for i, item in enumerate(event_items, 1):
                self.stdout.write(self.style.SUCCESS(f'\nEvent Item {i}:'))
                self.stdout.write(f'Title: {item.get("title", "No title")}')
                self.stdout.write(f'URL: {item.get("url", "No URL")}')
                self.stdout.write(f'Date: {item.get("event_date", "No date")}')
                self.stdout.write(f'Location: {item.get("location", "No location")}')
                self.stdout.write(f'Summary: {item.get("summary", "No summary")[:100]}...')
                self.stdout.write(f'Has image: {"Yes" if item.get("image_url") else "No"}')
        
        self.stdout.write(self.style.SUCCESS('Scraper testing completed')) 