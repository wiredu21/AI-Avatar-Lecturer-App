import os

from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'virtuaid.settings')

app = Celery('virtuaid')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure the periodic tasks
app.conf.beat_schedule = {
    'scrape-northampton-news-daily': {
        'task': 'content.tasks.scrape_northampton_news',
        'schedule': crontab(hour=3, minute=0),  # Run at 3:00 AM daily
    },
    'scrape-northampton-events-daily': {
        'task': 'content.tasks.scrape_northampton_events',
        'schedule': crontab(hour=4, minute=0),  # Run at 4:00 AM daily
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 