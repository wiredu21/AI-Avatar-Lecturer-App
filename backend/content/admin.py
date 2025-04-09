from django.contrib import admin
from .models import ContentSource, ScrapedContent, ContentProcessingLog

@admin.register(ContentSource)
class ContentSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'url', 'content_type', 'active', 'last_scraped')
    list_filter = ('university', 'content_type', 'active')
    search_fields = ('name', 'url')

@admin.register(ScrapedContent)
class ScrapedContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'source', 'content_type', 'published_date', 'scraped_at')
    list_filter = ('content_type', 'source__university', 'published_date')
    search_fields = ('title', 'content', 'summary')
    date_hierarchy = 'published_date'

@admin.register(ContentProcessingLog)
class ContentProcessingLogAdmin(admin.ModelAdmin):
    list_display = ('source', 'start_time', 'end_time', 'success', 'items_processed', 'items_added')
    list_filter = ('success', 'source__university')
    readonly_fields = ('start_time', 'end_time', 'items_processed', 'items_added', 'items_updated', 'error_message')
