# University Content Module

This module provides functionality for scraping, storing, and displaying content from university websites, such as news articles and event information.

## Features

- Web scraping of university news and events
- Scheduled scraping using Celery
- API endpoints for accessing scraped content
- Frontend component for displaying university content

## Setup

1. Initialize the database with university data by running:

   ```bash
   python manage.py initialize_universities
   ```

2. Test the scrapers without saving to the database:

   ```bash
   python manage.py test_scrapers
   ```

3. Run a manual scrape to populate the database:
   ```bash
   python manage.py scrape_northampton --type=all
   ```

## Celery Tasks

The module includes several Celery tasks for automated scraping:

- `scrape_northampton_news`: Scrapes news from the University of Northampton website
- `scrape_northampton_events`: Scrapes events from the University of Northampton website
- `refresh_all_content`: Refreshes all content sources

These tasks are scheduled to run automatically:

- News scraping: Daily at 3:00 AM
- Events scraping: Daily at 4:00 AM
- Complete refresh: Weekly on Sunday at 2:00 AM

To manually run a task, use the Celery command line:

```bash
celery -A virtuaid call content.tasks.scrape_northampton_news
```

## Frontend Integration

The module provides a React component `UniversityContent.js` for displaying the scraped content in the dashboard.

To access the university content:

1. Log in to the application
2. Navigate to the dashboard
3. Click on "University Updates" in the sidebar

## API Endpoints

- `GET /api/content/sources/`: List all content sources
- `GET /api/content/items/`: List all scraped content
- `GET /api/content/university-content/{university_id}/`: Get university content grouped by type
- `POST /api/content/sources/{source_id}/scrape_now/`: Trigger immediate scraping for a content source
- `POST /api/content/refresh_all/`: Trigger scraping for all active sources

## Adding Support for New Universities

To add support for a new university:

1. Create a new scraper module in `scrapers/`
2. Add Celery tasks for the new university in `tasks.py`
3. Update the Celery schedule in `virtuaid/celery.py`
4. Add the university data using the admin interface or a management command

## Troubleshooting

If the scraper fails to retrieve content:

1. Check if the website structure has changed
2. Update the selectors in the scraper file
3. Test with the `test_scrapers` management command
4. Check the logs for error messages

If the content doesn't appear in the frontend:

1. Check the API response using the browser's network tools
2. Verify that the university content exists in the database
3. Check for JavaScript console errors
