import logging
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
from urllib.parse import urljoin

logger = logging.getLogger(__name__)

def parse_date(date_string):
    """Parse date strings from Northampton website"""
    try:
        # Try to parse various date formats
        date_formats = [
            "%d %B %Y",        # 15 April 2025
            "%B %d, %Y",       # April 15, 2025  
            "%d/%m/%Y",        # 15/04/2025
            "%Y-%m-%d",        # 2025-04-15
        ]
        
        for date_format in date_formats:
            try:
                return datetime.strptime(date_string.strip(), date_format).date()
            except ValueError:
                continue
        
        # If we couldn't parse the date, log and return None
        logger.warning(f"Could not parse date: {date_string}")
        return None
    except Exception as e:
        logger.error(f"Error parsing date {date_string}: {str(e)}")
        return None

def clean_html_content(html_content):
    """Clean HTML content by removing unnecessary elements and whitespace"""
    # Remove script and style elements
    for script in html_content.find_all(["script", "style"]):
        script.decompose()
    
    # Get text with some basic formatting preserved
    text = html_content.get_text(separator="\n", strip=True)
    
    # Remove extra whitespace and newlines
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    
    return text.strip()

def scrape_northampton_news_page(url, max_items=20):
    """
    Scrape news items from the University of Northampton news page
    
    Args:
        url: URL of the news page
        max_items: Maximum number of items to scrape
        
    Returns:
        List of dictionaries containing news items
    """
    logger.info(f"Scraping news from: {url}")
    news_items = []
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find news article containers - adjust selectors based on actual site structure
        news_containers = soup.select('.news-article, .news-item, article.post')
        
        for idx, container in enumerate(news_containers):
            if idx >= max_items:
                break
                
            try:
                # Extract title and URL - adjust selectors as needed
                title_element = container.select_one('h2, h3, .title')
                if not title_element:
                    continue
                    
                title = title_element.get_text(strip=True)
                
                # Get URL from the title link
                link_element = container.select_one('a')
                if not link_element:
                    continue
                    
                article_url = urljoin(url, link_element.get('href', ''))
                
                # Get summary if available
                summary_element = container.select_one('.summary, .excerpt, .description')
                summary = summary_element.get_text(strip=True) if summary_element else ""
                
                # Get date if available
                date_element = container.select_one('.date, .published, time')
                published_date = None
                if date_element:
                    date_text = date_element.get_text(strip=True)
                    published_date = parse_date(date_text)
                
                # Get image if available
                image_element = container.select_one('img')
                image_url = None
                if image_element and 'src' in image_element.attrs:
                    image_url = urljoin(url, image_element['src'])
                
                # Fetch the full article content
                article_content = ""
                try:
                    article_response = requests.get(article_url, timeout=30)
                    article_response.raise_for_status()
                    article_soup = BeautifulSoup(article_response.text, 'html.parser')
                    
                    # Get the article content - adjust selector as needed
                    content_element = article_soup.select_one('.content, .entry-content, article')
                    if content_element:
                        article_content = clean_html_content(content_element)
                    else:
                        article_content = summary  # Use summary if content not found
                except Exception as e:
                    logger.error(f"Error fetching article content for {article_url}: {str(e)}")
                    article_content = summary  # Use summary if content fetch failed
                
                # Add the news item to our results
                news_items.append({
                    'title': title,
                    'url': article_url,
                    'summary': summary,
                    'content': article_content,
                    'published_date': published_date,
                    'image_url': image_url
                })
                
            except Exception as e:
                logger.error(f"Error processing news item: {str(e)}")
                continue
        
    except Exception as e:
        logger.error(f"Error scraping news from {url}: {str(e)}")
    
    logger.info(f"Scraped {len(news_items)} news items from {url}")
    return news_items

def scrape_northampton_events_page(url, max_items=20):
    """
    Scrape event items from the University of Northampton events page
    
    Args:
        url: URL of the events page
        max_items: Maximum number of items to scrape
        
    Returns:
        List of dictionaries containing event items
    """
    logger.info(f"Scraping events from: {url}")
    event_items = []
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find event containers - adjust selectors based on actual site structure
        event_containers = soup.select('.event, .event-item, .calendar-event')
        
        for idx, container in enumerate(event_containers):
            if idx >= max_items:
                break
                
            try:
                # Extract title and URL
                title_element = container.select_one('h2, h3, .title')
                if not title_element:
                    continue
                    
                title = title_element.get_text(strip=True)
                
                # Get URL from the title link
                link_element = container.select_one('a')
                if not link_element:
                    continue
                    
                event_url = urljoin(url, link_element.get('href', ''))
                
                # Get event date
                date_element = container.select_one('.date, .event-date, time')
                event_date = None
                if date_element:
                    date_text = date_element.get_text(strip=True)
                    event_date = parse_date(date_text)
                
                # Get location if available
                location_element = container.select_one('.location, .venue')
                location = location_element.get_text(strip=True) if location_element else ""
                
                # Get image if available
                image_element = container.select_one('img')
                image_url = None
                if image_element and 'src' in image_element.attrs:
                    image_url = urljoin(url, image_element['src'])
                
                # Get description/summary if available
                summary_element = container.select_one('.summary, .description, .excerpt')
                summary = summary_element.get_text(strip=True) if summary_element else ""
                
                # Fetch the full event details
                event_content = ""
                try:
                    event_response = requests.get(event_url, timeout=30)
                    event_response.raise_for_status()
                    event_soup = BeautifulSoup(event_response.text, 'html.parser')
                    
                    # Get the event content
                    content_element = event_soup.select_one('.content, .event-content, .description')
                    if content_element:
                        event_content = clean_html_content(content_element)
                    else:
                        event_content = summary
                        
                    # If we didn't get a location from the list page, try to get it from the detail page
                    if not location:
                        location_detail = event_soup.select_one('.location, .venue')
                        if location_detail:
                            location = location_detail.get_text(strip=True)
                            
                except Exception as e:
                    logger.error(f"Error fetching event content for {event_url}: {str(e)}")
                    event_content = summary
                
                # Combine all the information into the content
                full_content = f"Event: {title}\n"
                if event_date:
                    full_content += f"Date: {event_date}\n"
                if location:
                    full_content += f"Location: {location}\n\n"
                full_content += event_content
                
                # Add the event item to our results
                event_items.append({
                    'title': title,
                    'url': event_url,
                    'summary': summary,
                    'content': full_content,
                    'event_date': event_date,
                    'location': location,
                    'image_url': image_url
                })
                
            except Exception as e:
                logger.error(f"Error processing event item: {str(e)}")
                continue
        
    except Exception as e:
        logger.error(f"Error scraping events from {url}: {str(e)}")
    
    logger.info(f"Scraped {len(event_items)} event items from {url}")
    return event_items 