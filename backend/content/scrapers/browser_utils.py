import logging
import time
from typing import Optional, List, Dict, Any, Callable
import random

# Import Playwright components
try:
    from playwright.sync_api import sync_playwright, Page, Browser
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

# Import Selenium components
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

logger = logging.getLogger(__name__)

def random_delay(min_seconds=1, max_seconds=3):
    """Add a random delay to make scraping more human-like"""
    delay = random.uniform(min_seconds, max_seconds)
    time.sleep(delay)
    return delay

class BrowserScraper:
    """Browser-based scraper with fallback mechanism"""
    
    def __init__(self, headless=True, prefer_playwright=True):
        self.headless = headless
        self.prefer_playwright = prefer_playwright
        self._playwright = None
        self._browser = None
        self._page = None
        self._selenium_driver = None
        
    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
    
    def _init_playwright(self):
        """Initialize Playwright browser"""
        if not PLAYWRIGHT_AVAILABLE:
            logger.warning("Playwright is not available")
            return False
        
        try:
            self._playwright = sync_playwright().start()
            self._browser = self._playwright.chromium.launch(headless=self.headless)
            self._page = self._browser.new_page()
            self._page.set_default_timeout(30000)  # 30 seconds timeout
            
            # Set realistic viewport
            self._page.set_viewport_size({"width": 1366, "height": 768})
            
            # Set user agent
            self._page.set_extra_http_headers({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
            })
            
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Playwright: {str(e)}")
            self._cleanup_playwright()
            return False
    
    def _init_selenium(self):
        """Initialize Selenium browser"""
        if not SELENIUM_AVAILABLE:
            logger.warning("Selenium is not available")
            return False
        
        try:
            options = Options()
            if self.headless:
                options.add_argument('--headless')
            
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1366,768')
            options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36')
            
            self._selenium_driver = webdriver.Chrome(options=options)
            self._selenium_driver.set_page_load_timeout(30)
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Selenium: {str(e)}")
            self._cleanup_selenium()
            return False
    
    def _cleanup_playwright(self):
        """Clean up Playwright resources"""
        try:
            if self._page:
                self._page.close()
                self._page = None
            
            if self._browser:
                self._browser.close()
                self._browser = None
            
            if self._playwright:
                self._playwright.stop()
                self._playwright = None
        except Exception as e:
            logger.error(f"Error cleaning up Playwright: {str(e)}")
    
    def _cleanup_selenium(self):
        """Clean up Selenium resources"""
        try:
            if self._selenium_driver:
                self._selenium_driver.quit()
                self._selenium_driver = None
        except Exception as e:
            logger.error(f"Error cleaning up Selenium: {str(e)}")
    
    def open(self):
        """Initialize browser with fallback mechanism"""
        # Try preferred browser first
        if self.prefer_playwright:
            if self._init_playwright():
                return "playwright"
            elif self._init_selenium():
                return "selenium"
        else:
            if self._init_selenium():
                return "selenium"
            elif self._init_playwright():
                return "playwright"
        
        # If both failed
        raise RuntimeError("Failed to initialize any browser")
    
    def close(self):
        """Close all browser resources"""
        self._cleanup_playwright()
        self._cleanup_selenium()
    
    def navigate(self, url):
        """Navigate to URL with proper error handling and fallback"""
        active_browser = None
        
        # Try to ensure a browser is open
        if self._page or self._selenium_driver:
            active_browser = "playwright" if self._page else "selenium"
        else:
            try:
                active_browser = self.open()
            except RuntimeError as e:
                logger.error(f"Failed to open any browser: {str(e)}")
                return False
        
        # Add random delay to mimic human behavior
        random_delay()
        
        # Navigate to the page
        try:
            if active_browser == "playwright":
                self._page.goto(url, wait_until="domcontentloaded")
                # Wait a bit more for dynamic content
                self._page.wait_for_load_state("networkidle", timeout=10000)
                return True
            elif active_browser == "selenium":
                self._selenium_driver.get(url)
                # Wait for page to be loaded
                WebDriverWait(self._selenium_driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                return True
        except Exception as e:
            logger.error(f"Error navigating to {url}: {str(e)}")
            
            # Try fallback if one browser failed
            if active_browser == "playwright" and SELENIUM_AVAILABLE:
                logger.info("Falling back to Selenium")
                self._cleanup_playwright()
                if self._init_selenium():
                    try:
                        self._selenium_driver.get(url)
                        WebDriverWait(self._selenium_driver, 10).until(
                            EC.presence_of_element_located((By.TAG_NAME, "body"))
                        )
                        return True
                    except Exception as e2:
                        logger.error(f"Selenium fallback also failed: {str(e2)}")
            elif active_browser == "selenium" and PLAYWRIGHT_AVAILABLE:
                logger.info("Falling back to Playwright")
                self._cleanup_selenium()
                if self._init_playwright():
                    try:
                        self._page.goto(url, wait_until="domcontentloaded")
                        self._page.wait_for_load_state("networkidle", timeout=10000)
                        return True
                    except Exception as e2:
                        logger.error(f"Playwright fallback also failed: {str(e2)}")
        
        return False
    
    def get_element_text(self, selector):
        """Get text from an element"""
        if self._page:
            try:
                element = self._page.query_selector(selector)
                if element:
                    return element.inner_text()
            except Exception as e:
                logger.error(f"Playwright error getting text from {selector}: {str(e)}")
        
        if self._selenium_driver:
            try:
                element = self._selenium_driver.find_element(By.CSS_SELECTOR, selector)
                if element:
                    return element.text
            except Exception as e:
                logger.error(f"Selenium error getting text from {selector}: {str(e)}")
        
        return None
    
    def get_element_attribute(self, selector, attribute):
        """Get attribute from an element"""
        if self._page:
            try:
                element = self._page.query_selector(selector)
                if element:
                    return element.get_attribute(attribute)
            except Exception as e:
                logger.error(f"Playwright error getting attribute {attribute} from {selector}: {str(e)}")
        
        if self._selenium_driver:
            try:
                element = self._selenium_driver.find_element(By.CSS_SELECTOR, selector)
                if element:
                    return element.get_attribute(attribute)
            except Exception as e:
                logger.error(f"Selenium error getting attribute {attribute} from {selector}: {str(e)}")
        
        return None
    
    def get_elements(self, selector):
        """Get all elements matching selector"""
        if self._page:
            try:
                return self._page.query_selector_all(selector)
            except Exception as e:
                logger.error(f"Playwright error getting elements {selector}: {str(e)}")
        
        if self._selenium_driver:
            try:
                return self._selenium_driver.find_elements(By.CSS_SELECTOR, selector)
            except Exception as e:
                logger.error(f"Selenium error getting elements {selector}: {str(e)}")
        
        return []
    
    def get_page_content(self):
        """Get full page HTML content"""
        if self._page:
            try:
                return self._page.content()
            except Exception as e:
                logger.error(f"Playwright error getting page content: {str(e)}")
        
        if self._selenium_driver:
            try:
                return self._selenium_driver.page_source
            except Exception as e:
                logger.error(f"Selenium error getting page content: {str(e)}")
        
        return None

def scrape_with_browser(url: str, scrape_function: Callable, headless: bool = True) -> Any:
    """
    Generic function to scrape with browser and apply a scraping function
    
    Args:
        url: URL to scrape
        scrape_function: Function that takes a BrowserScraper and extracts data
        headless: Whether to run browser in headless mode
        
    Returns:
        Whatever the scrape_function returns
    """
    with BrowserScraper(headless=headless) as browser:
        try:
            success = browser.navigate(url)
            if not success:
                logger.error(f"Failed to navigate to {url}")
                return None
            
            # Allow time for JavaScript to execute and content to load
            random_delay(2, 4)
            
            # Apply the scrape function
            return scrape_function(browser)
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return None 