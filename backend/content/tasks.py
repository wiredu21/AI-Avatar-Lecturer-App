import logging
from datetime import datetime
from celery import shared_task
from django.utils import timezone
from .models import ContentSource, ScrapedContent, ContentProcessingLog, ContentType
from .scrapers.northampton import scrape_northampton_news_page, scrape_northampton_events_page

logger = logging.getLogger(__name__)

@shared_task
def scrape_northampton_news():
    """Task to scrape news from University of Northampton website"""
    try:
        # Get or create the content source
        source, created = ContentSource.objects.get_or_create(
            name="Northampton University News",
            defaults={
                'url': 'https://www.northampton.ac.uk/news/',
                'content_type': ContentType.NEWS,
                'university_id': 1  # Assuming ID 1 is University of Northampton
            }
        )
        
        # Create a processing log entry
        log = ContentProcessingLog.objects.create(source=source)
        
        # Call the scraper function
        news_items = scrape_northampton_news_page(source.url)
        
        # Process the scraped items
        items_processed = len(news_items)
        items_added = 0
        items_updated = 0
        
        for item in news_items:
            content, created = ScrapedContent.objects.update_or_create(
                source=source,
                url=item['url'],
                defaults={
                    'title': item['title'],
                    'content': item['content'],
                    'summary': item.get('summary', ''),
                    'published_date': item.get('published_date'),
                    'image_url': item.get('image_url'),
                    'content_type': ContentType.NEWS
                }
            )
            
            if created:
                items_added += 1
            else:
                items_updated += 1
        
        # Update the source's last_scraped timestamp
        source.last_scraped = timezone.now()
        source.save()
        
        # Complete the log entry
        log.complete(
            success=True,
            items_processed=items_processed,
            items_added=items_added,
            items_updated=items_updated
        )
        
        return f"Scraped {items_processed} news items: {items_added} added, {items_updated} updated"
    
    except Exception as e:
        logger.error(f"Error scraping Northampton news: {str(e)}")
        if 'log' in locals():
            log.complete(success=False, error_message=str(e))
        return f"Error scraping Northampton news: {str(e)}"

@shared_task
def scrape_northampton_events():
    """Task to scrape events from University of Northampton website"""
    try:
        # Get or create the content source
        source, created = ContentSource.objects.get_or_create(
            name="Northampton University Events",
            defaults={
                'url': 'https://www.northampton.ac.uk/events/',
                'content_type': ContentType.EVENT,
                'university_id': 1  # Assuming ID 1 is University of Northampton
            }
        )
        
        # Create a processing log entry
        log = ContentProcessingLog.objects.create(source=source)
        
        # Call the scraper function
        event_items = scrape_northampton_events_page(source.url)
        
        # Process the scraped items
        items_processed = len(event_items)
        items_added = 0
        items_updated = 0
        
        for item in event_items:
            content, created = ScrapedContent.objects.update_or_create(
                source=source,
                url=item['url'],
                defaults={
                    'title': item['title'],
                    'content': item['content'],
                    'summary': item.get('summary', ''),
                    'published_date': item.get('event_date'),
                    'image_url': item.get('image_url'),
                    'content_type': ContentType.EVENT
                }
            )
            
            if created:
                items_added += 1
            else:
                items_updated += 1
        
        # Update the source's last_scraped timestamp
        source.last_scraped = timezone.now()
        source.save()
        
        # Complete the log entry
        log.complete(
            success=True,
            items_processed=items_processed,
            items_added=items_added,
            items_updated=items_updated
        )
        
        return f"Scraped {items_processed} event items: {items_added} added, {items_updated} updated"
    
    except Exception as e:
        logger.error(f"Error scraping Northampton events: {str(e)}")
        if 'log' in locals():
            log.complete(success=False, error_message=str(e))
        return f"Error scraping Northampton events: {str(e)}"

@shared_task
def refresh_all_content():
    """Task to refresh all content from active sources"""
    results = []
    
    # Get all active content sources
    sources = ContentSource.objects.filter(active=True)
    
    for source in sources:
        if source.content_type == ContentType.NEWS and 'northampton' in source.url.lower():
            result = scrape_northampton_news.delay()
            results.append(f"Started news scraping task: {result.id}")
        elif source.content_type == ContentType.EVENT and 'northampton' in source.url.lower():
            result = scrape_northampton_events.delay()
            results.append(f"Started events scraping task: {result.id}")
    
    return ", ".join(results) 