from django.db import models
from django.utils import timezone
from core.models import University, Course

class ContentType(models.TextChoices):
    NEWS = 'news', 'News'
    EVENT = 'event', 'Event'
    COURSE_INFO = 'course_info', 'Course Information'
    POLICY = 'policy', 'University Policy'
    FAQ = 'faq', 'FAQ'
    OTHER = 'other', 'Other'

class ContentSource(models.Model):
    """Sources for university content like news pages, events pages, etc."""
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='content_sources')
    name = models.CharField(max_length=100)
    url = models.URLField()
    content_type = models.CharField(max_length=20, choices=ContentType.choices)
    active = models.BooleanField(default=True)
    last_scraped = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.university.name} - {self.name}"
    
    class Meta:
        unique_together = ('university', 'url')

class ScrapedContent(models.Model):
    """Content scraped from university sources"""
    source = models.ForeignKey(ContentSource, on_delete=models.CASCADE, related_name='contents')
    title = models.CharField(max_length=255)
    content = models.TextField()
    summary = models.TextField(blank=True)
    url = models.URLField(blank=True, null=True)
    published_date = models.DateField(null=True, blank=True)
    image_url = models.URLField(blank=True, null=True)
    content_type = models.CharField(max_length=20, choices=ContentType.choices)
    scraped_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-published_date', '-scraped_at']
        unique_together = ('url', 'source')

class ContentProcessingLog(models.Model):
    """Log for content processing operations"""
    source = models.ForeignKey(ContentSource, on_delete=models.CASCADE, related_name='logs')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    success = models.BooleanField(default=False)
    items_processed = models.IntegerField(default=0)
    items_added = models.IntegerField(default=0)
    items_updated = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.source} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    
    def complete(self, success=True, items_processed=0, items_added=0, items_updated=0, error_message=""):
        self.end_time = timezone.now()
        self.success = success
        self.items_processed = items_processed
        self.items_added = items_added
        self.items_updated = items_updated
        self.error_message = error_message
        self.save()
