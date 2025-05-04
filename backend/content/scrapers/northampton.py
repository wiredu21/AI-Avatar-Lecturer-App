import logging
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
import time
import random
from urllib.parse import urljoin

from .browser_utils import scrape_with_browser, BrowserScraper

logger = logging.getLogger(__name__)

# Constants
NEWS_SELECTORS = {
    'card': '.card, article, .news-item, .news-card, .grid article, li.news-article, li.event-result',
    'link': 'a[href*="/news/"]',
    'title': 'h1, h2, h3, .title, .heading',
    'date': '.date, time, .published-date, .article-date, time[datetime], p:last-child, .card-footer, article footer, footer, .article-footer',
    'content': '.content, article, main, .article-content',
    'image': 'img'
}

EVENT_SELECTORS = {
    'card': '.card, article, .event-item, .event-card, li.event-result',
    'link': 'a[href*="/events/"]',
    'title': 'h1, h2, h3, .title, .heading, .event-title',
    'date': '.date, time, .event-date, .event-time, span.date',
    'content': '.content, article, main, .event-content, .event-description',
    'image': 'img',
    'event_container': '.events-results-content, .events-list, .events-container',
    'detail_date': 'h1 + div, .event-date-display, .date-display'
}

def parse_date(date_string):
    """Parse date strings from Northampton website"""
    try:
        # Clean up the date string first
        date_string = date_string.strip()
        
        # Handle empty or None values
        if not date_string:
            return None
            
        # Try to parse various date formats
        date_formats = [
            "%d %B %Y",        # 23 April 2025 (primary format from website)
            "%d %b %Y",        # 23 Apr 2025
            "%d.%m.%Y",        # 14.04.2022
            "%d/%m/%Y",        # 14/04/2022
            "%B %d, %Y",       # April 14, 2022
            "%Y-%m-%d",        # 2022-04-14
            "%a %d %b %Y",     # Thu 15 May 2025
            "%a %d %B %Y",     # Thu 15 May 2025
        ]
        
        # First try direct datetime parsing with expected formats
        for date_format in date_formats:
            try:
                return datetime.strptime(date_string.strip(), date_format).date()
            except ValueError:
                continue
        
        # If direct parsing failed, try pattern matching
        # Look for patterns in the format: DD Month YYYY (most common on Northampton website)
        day_month_year_pattern = r'(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})'
        match = re.search(day_month_year_pattern, date_string)
        if match:
            day, month, year = match.groups()
            
            # Convert month name to number
            try:
                month_name = month.strip().lower()
                months = {
                    "january": 1, "february": 2, "march": 3, "april": 4, 
                    "may": 5, "june": 6, "july": 7, "august": 8, 
                    "september": 9, "october": 10, "november": 11, "december": 12,
                    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
                    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
                }
                
                # Find the closest month match in case of slight variations
                month_num = None
                for month_key, month_value in months.items():
                    if month_name.startswith(month_key) or month_key.startswith(month_name):
                        month_num = month_value
                        break
                
                if month_num:
                    try:
                        return datetime(int(year), month_num, int(day)).date()
                    except ValueError:
                        # Handle edge cases like Feb 30
                        pass
            except (ValueError, IndexError):
                pass
        
        # Try reverse format: Month DD, YYYY
        month_day_year_pattern = r'([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})'
        match = re.search(month_day_year_pattern, date_string)
        if match:
            month, day, year = match.groups()
            
            # Convert month name to number using the same dictionary as above
            try:
                month_name = month.strip().lower()
                months = {
                    "january": 1, "february": 2, "march": 3, "april": 4, 
                    "may": 5, "june": 6, "july": 7, "august": 8, 
                    "september": 9, "october": 10, "november": 11, "december": 12,
                    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
                    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
                }
                
                # Find the closest month match in case of slight variations
                month_num = None
                for month_key, month_value in months.items():
                    if month_name.startswith(month_key) or month_key.startswith(month_name):
                        month_num = month_value
                        break
                
                if month_num:
                    try:
                        return datetime(int(year), month_num, int(day)).date()
                    except ValueError:
                        # Handle edge cases like Feb 30
                        pass
            except (ValueError, IndexError):
                pass
                
        # Last resort - look for just digits that might be a date
        year_pattern = r'\b(20\d{2})\b'  # Look for years like 2023, 2024, etc.
        year_match = re.search(year_pattern, date_string)
        if year_match:
            # If we found a year, assume it's the current date in that year
            # This is better than nothing, but not ideal
            current_date = datetime.now()
            year = int(year_match.group(1))
            logger.warning(f"Only found year {year} in: '{date_string}', using current month/day")
            return datetime(year, current_date.month, current_date.day).date()
        
        # If we couldn't parse the date, log and return None
        logger.warning(f"Could not parse date: '{date_string}'")
        return None
    except Exception as e:
        logger.error(f"Error parsing date '{date_string}': {str(e)}")
        return None

def clean_html_content(html_content):
    """Clean HTML content by removing unnecessary elements and whitespace"""
    if not html_content:
        return ""
        
    # Convert to BeautifulSoup if it's a string
    if isinstance(html_content, str):
        html_content = BeautifulSoup(html_content, 'html.parser')
    
    # Remove script and style elements
    for script in html_content.find_all(["script", "style"]):
        script.decompose()
    
    # Get text with some basic formatting preserved
    text = html_content.get_text(separator="\n", strip=True)
    
    # Remove extra whitespace and newlines
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    
    return text.strip()

def extract_news_article_data(browser, base_url):
    """Extract news article data from the detail page in a targeted way"""
    try:
        # Get the page HTML content as a simple string
        html_content = browser.get_page_content()
        if not html_content:
            return None
            
        # Parse with BeautifulSoup
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
        except Exception as e:
            logger.error(f"Error parsing HTML: {str(e)}")
            return None
        
        # Get the URL (fallback to base_url if needed)
        try:
            current_url = browser._page.url() if browser._page else browser._selenium_driver.current_url
        except:
            current_url = base_url
        
        # Extract title - basic approach
        title = None
        try:
            # Get the first h1 element
            h1_element = soup.find('h1')
            if h1_element:
                title = h1_element.text.strip()
            
            # Fallback to head > title
            if not title and soup.title:
                title = soup.title.text.strip()
        except Exception as e:
            logger.error(f"Error extracting title: {str(e)}")
        
        # Fallback title
        if not title:
            title = "News Article"
            
        # Basic extraction of date
        published_date = None
        try:
            # Look for date text anywhere in the page
            page_text = soup.get_text()
            
            # Try to find date patterns
            date_patterns = [
                r'\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}',
                r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}',
                r'(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}'
            ]
            
            for pattern in date_patterns:
                matches = re.findall(pattern, page_text, re.IGNORECASE)
                if matches:
                    for match in matches:
                        try:
                            # Use our parse_date function
                            date_result = parse_date(match)
                            if date_result:
                                published_date = date_result
                                break
                        except:
                            continue
                if published_date:
                    break
        except Exception as e:
            logger.error(f"Error extracting date: {str(e)}")
        
        # Extract content - very basic approach
        article_content = ""
        article_summary = ""
        
        try:
            # Try to find main content containers
            for tag_name in ['article', 'main', 'div.content', '.news-content']:
                try:
                    content_elem = None
                    
                    if '.' in tag_name:
                        # It's a CSS selector
                        content_elem = soup.select_one(tag_name)
                    else:
                        # It's a tag name
                        content_elem = soup.find(tag_name)
                    
                    if content_elem:
                        # Extract text, being careful not to call any strings as functions
                        article_content = content_elem.get_text(" ", strip=True)
                        break
                except Exception as e:
                    logger.warning(f"Error with content container {tag_name}: {str(e)}")
                    continue
            
            # Fallback to body text
            if not article_content and soup.body:
                try:
                    article_content = soup.body.get_text(" ", strip=True)
                except:
                    # Last resort
                    article_content = soup.get_text(" ", strip=True) 
            
            # Create summary
            if article_content:
                article_summary = article_content[:200] + "..." if len(article_content) > 200 else article_content
        except Exception as e:
            logger.error(f"Error extracting content: {str(e)}")
        
        # Extract image - basic approach
        image_url = None
        try:
            # Find the first image that looks like a featured image
            for img_selector in ['img.featured', 'img.article-image', '.article-header img', 'article img', '.news-image img']:
                try:
                    img_tag = soup.select_one(img_selector)
                    if img_tag and img_tag.has_attr('src'):
                        img_src = img_tag['src']
                        if img_src:
                            # Handle relative URLs
                            if img_src.startswith('/'):
                                image_url = urljoin(base_url, img_src)
                            else:
                                image_url = img_src
                            break
                except:
                    continue
                    
            # Fallback to any image
            if not image_url:
                for img_tag in soup.find_all('img'):
                    if img_tag.has_attr('src'):
                        img_src = img_tag['src']
                        if img_src:
                            # Handle relative URLs
                            if img_src.startswith('/'):
                                image_url = urljoin(base_url, img_src)
                            else:
                                image_url = img_src
                            break
        except Exception as e:
            logger.error(f"Error extracting image: {str(e)}")
        
        # Return the data we were able to extract
        return {
            'title': title,
            'url': current_url,
            'summary': article_summary,
            'content': article_content,
            'published_date': published_date,
            'image_url': image_url
        }
    except Exception as e:
        logger.error(f"Error extracting news article data: {str(e)}")
        return None

def extract_event_date_from_page(browser):
    """Extract event date from the event detail page in a more targeted way"""
    try:
        # Get the page HTML content
        html = browser.get_page_content()
        if not html:
            return None
            
        soup = BeautifulSoup(html, 'html.parser')
        
        # Try multiple strategies to find the date
        
        # Strategy 1: Look for date display elements
        for selector in [EVENT_SELECTORS['detail_date'], '.date', 'time', '.event-date']:
            date_elements = soup.select(selector)
            for date_element in date_elements:
                date_text = date_element.get_text(strip=True)
                if any(month.lower() in date_text.lower() for month in 
                      ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
                       "january", "february", "march", "april", "may", "june", "july", "august", 
                       "september", "october", "november", "december"]):
                    event_date = parse_date(date_text)
                    if event_date:
                        return event_date
        
        # Strategy 2: Look for date patterns in the page content
        content_text = soup.get_text(strip=True)
        # Look for patterns like "Thu 15 May 2025"
        date_patterns = [
            r'(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}',
            r'\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}',
            r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, content_text, re.IGNORECASE)
            for match in matches:
                event_date = parse_date(match)
                if event_date:
                    return event_date
        
        return None
    except Exception as e:
        logger.error(f"Error extracting event date: {str(e)}")
        return None

def scrape_northampton_news_page(url, max_items=20, debug=False):
    """
    Scrape news items from the University of Northampton news page using headless browser
    
    Args:
        url: URL of the news page
        max_items: Maximum number of items to scrape
        debug: If True, print additional debugging information
        
    Returns:
        List of dictionaries containing news items
    """
    logger.info(f"Scraping news from: {url}")
    
    def process_news_page(browser):
        news_items = []
    
        try:
            # Get the page HTML
            html = browser.get_page_content()
            if not html:
                return news_items
                
            soup = BeautifulSoup(html, 'html.parser')
            
            if debug:
                logger.info(f"Page title: {soup.title.text if soup.title else 'No title found'}")
            
            # First look for news cards/containers
            news_cards = soup.select(NEWS_SELECTORS['card'])
            
            # If no specific cards found, try to find links directly
            news_links = []
            
            # Store card details for link matching
            card_details = {}
            
            if news_cards:
                # Extract links and metadata from cards
                for card in news_cards:
                    link = card.select_one(NEWS_SELECTORS['link'])
                    if link and 'href' in link.attrs:
                        news_links.append(link)
                        
                        # Try to extract the date directly from the card
                        date_text = None
                        
                        # Method 1: Try standard date selectors
                        for date_selector in NEWS_SELECTORS['date'].split(','):
                            date_elem = card.select_one(date_selector.strip())
                            if date_elem:
                                date_text = date_elem.get_text(strip=True)
                                break
                        
                        # Method 2: If no date found, scan all text at the bottom of the card
                        if not date_text:
                            # Check the last paragraph or div in the card
                            for elem in card.select('p, div, span'):
                                text = elem.get_text(strip=True)
                                # Look for elements with numbers and month names
                                if re.search(r'\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}', text, re.IGNORECASE):
                                    date_text = text
                                    break
                        
                        # Method 3: Direct regex search in the whole card text
                        if not date_text:
                            card_text = card.get_text(strip=True)
                            date_matches = re.findall(r'\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}', card_text, re.IGNORECASE)
                            if date_matches:
                                date_text = date_matches[0]
                        
                        # Store details for this link
                        if date_text:
                            logger.info(f"Found date directly from card: {date_text}")
                            href = link.get('href', '')
                            card_details[href] = {
                                'date_text': date_text,
                                'published_date': parse_date(date_text)
                            }
            else:
                # Try to find any links to news articles
                news_links = soup.select(NEWS_SELECTORS['link'])
                
                # If still no luck, try more general selectors
                if not news_links:
                    news_links = soup.select('a[href*="/news/"], a[href*="news"]')
            
            if debug:
                logger.info(f"Found {len(news_links)} potential news links")
                for i, link in enumerate(news_links[:5]):
                    logger.info(f"Link {i+1}: {link.get('href', 'No href')}")
            
            # Process the links to get detailed news information
            for idx, link in enumerate(news_links):
                if idx >= max_items:
                    break
                
                href = link.get('href', '')
                if not href or href == '#':
                    continue
                    
                # Make sure we have an absolute URL
                article_url = urljoin(url, href)
                
                # Skip if not a news article
                if '/news/' not in article_url and 'news' not in article_url:
                    continue
                
                if debug:
                    logger.info(f"Navigating to article: {article_url}")
                
                # Navigate to the article page
                success = browser.navigate(article_url)
                if not success:
                    logger.error(f"Failed to navigate to {article_url}")
                    continue
                
                # Extract article information using our dedicated function
                article_info = extract_news_article_data(browser, url)
                if article_info:
                    # Check if we have a date from the card
                    if href in card_details and card_details[href]['published_date']:
                        article_info['published_date'] = card_details[href]['published_date']
                        logger.info(f"Using date from card: {card_details[href]['date_text']}")
                    
                    news_items.append({
                        'title': article_info['title'],
                        'url': article_info['url'],
                        'summary': article_info['summary'],
                        'content': article_info['content'],
                        'published_date': article_info['published_date'],
                        'image_url': article_info['image_url']
                    })
                    
                    logger.info(f"Scraped article: {article_info['title']}, Date: {article_info['published_date']}")
        
        except Exception as e:
            logger.error(f"Error processing news page: {str(e)}")
    
        logger.info(f"Scraped {len(news_items)} news items from {url}")
        return news_items

    # Use the browser scraper
    return scrape_with_browser(url, process_news_page, headless=True)

def scrape_northampton_events_page(url, max_items=20, debug=False):
    """
    Scrape event items from the University of Northampton events page using headless browser
    
    Args:
        url: URL of the events page
        max_items: Maximum number of items to scrape
        debug: If True, print additional debugging information
        
    Returns:
        List of dictionaries containing event items
    """
    logger.info(f"Scraping events from: {url}")
    
    def process_events_page(browser):
        event_items = []
    
        try:
            # Get the page HTML
            html = browser.get_page_content()
            if not html:
                return event_items
                
            soup = BeautifulSoup(html, 'html.parser')
            
            if debug:
                logger.info(f"Page title: {soup.title.text if soup.title else 'No title found'}")
            
            # Look for the container of event results first
            event_container = soup.select_one(EVENT_SELECTORS['event_container'])
            
            # First look for event cards/containers
            event_cards = []
            if event_container:
                event_cards = event_container.select(EVENT_SELECTORS['card'])
            
            # If no events found in container, try searching the whole page
            if not event_cards:
                event_cards = soup.select(EVENT_SELECTORS['card'])
            
            if debug:
                logger.info(f"Found {len(event_cards)} event cards")
            
            # Direct card processing approach - extract info directly from cards if possible
            for idx, card in enumerate(event_cards):
                if idx >= max_items:
                    break
                    
                # Extract basic info from the card
                title_element = card.select_one(EVENT_SELECTORS['title'])
                link_element = card.select_one(EVENT_SELECTORS['link'])
                
                # Skip if we don't have essential information
                if not (title_element and link_element):
                    continue
                    
                title = title_element.get_text(strip=True)
                
                # Get the event URL
                href = link_element.get('href', '')
                if not href or href == '#':
                    continue
                
                # Make sure we have an absolute URL
                event_url = urljoin(url, href)
                
                # Extract time or other basic info
                summary = ""
                content = ""
                
                # Try to find time information or description
                for tag in card.select('p, .description, .summary, .event-time, .time, time'):
                    text = tag.get_text(strip=True)
                    if text and ('–' in text or '-' in text or ':' in text):
                        summary = text
                        content = text
                        break
                
                # If no content found on card, try to get some basic text
                if not content:
                    content_text = card.get_text(strip=True)
                    if title in content_text:
                        # Remove title to get other content
                        content_text = content_text.replace(title, '', 1).strip()
                    if content_text:
                        summary = content_text[:200] + "..." if len(content_text) > 200 else content_text
                        content = content_text
                
                # Navigate to the event detail page to extract the date
                event_date = None
                image_url = None
                try:
                    if debug:
                        logger.info(f"Navigating to event detail page: {event_url}")
                    
                    success = browser.navigate(event_url)
                    if success:
                        # Extract the event date from the detail page
                        event_date = extract_event_date_from_page(browser)
                        
                        if debug:
                            logger.info(f"Extracted event date: {event_date}")
                            
                        # Get additional content if available
                        detail_content = browser.get_page_content()
                        if detail_content:
                            detail_soup = BeautifulSoup(detail_content, 'html.parser')
                            
                            # Try to get a better summary from the detail page
                            description_elements = detail_soup.select('p, .description, .summary')
                            for desc in description_elements:
                                desc_text = desc.get_text(strip=True)
                                if desc_text and len(desc_text) > len(summary) and title not in desc_text:
                                    summary = desc_text[:200] + "..." if len(desc_text) > 200 else desc_text
                                    content = desc_text
                                    break
                            
                            # Try to get image
                            image_element = detail_soup.select_one('img.banner, img.featured-image, img.event-image')
                            if image_element and 'src' in image_element.attrs:
                                image_src = image_element['src']
                                if image_src.startswith('/'):
                                    image_url = urljoin(url, image_src)
                                else:
                                    image_url = image_src
                except Exception as e:
                    logger.warning(f"Error getting event detail info: {str(e)}")
                
                # Create the event item with the extracted information
                event_item = {
                    'title': title,
                    'url': event_url,
                    'summary': summary,
                    'content': content,
                    'published_date': event_date,  # Use the extracted event date
                    'image_url': image_url
                }
                
                event_items.append(event_item)
                logger.info(f"Scraped event: {title}")
            
            # If no event cards found, try a simple link-based approach
            if not event_items:
                logger.info("No event cards found, falling back to link-based approach")
                
                # Try to find any links to event pages
                event_links = soup.select(EVENT_SELECTORS['link'])
                
                for idx, link in enumerate(event_links):
                    if idx >= max_items:
                        break
                        
                    href = link.get('href', '')
                    if not href or href == '#':
                        continue
                    
                    # Make sure we have an absolute URL
                    event_url = urljoin(url, href)
                    
                    # Get the title from the link text
                    title = link.get_text(strip=True)
                    if not title:
                        title = f"Event {idx+1}"
                    
                    # Navigate to get date information
                    event_date = None
                    try:
                        success = browser.navigate(event_url)
                        if success:
                            event_date = extract_event_date_from_page(browser)
                    except Exception as e:
                        logger.warning(f"Error extracting date from event page: {str(e)}")
                    
                    # Simple event item with title, URL and date if available
                    event_items.append({
                        'title': title,
                        'url': event_url,
                        'summary': "",
                        'content': "",
                        'published_date': event_date,
                        'image_url': None
                    })
                    
                    logger.info(f"Scraped event link: {title}")
        
        except Exception as e:
            logger.error(f"Error processing events page: {str(e)}")
    
        logger.info(f"Scraped {len(event_items)} event items from {url}")
        return event_items 
    
    # Use the browser scraper
    return scrape_with_browser(url, process_events_page, headless=True) 