from rest_framework import serializers
from .models import ContentSource, ScrapedContent, ContentProcessingLog
from core.models import University

class ContentSourceSerializer(serializers.ModelSerializer):
    university_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentSource
        fields = ['id', 'name', 'url', 'content_type', 'university', 'university_name', 
                  'active', 'last_scraped']
    
    def get_university_name(self, obj):
        return obj.university.name if obj.university else None

class ScrapedContentSerializer(serializers.ModelSerializer):
    source_name = serializers.SerializerMethodField()
    university_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ScrapedContent
        fields = ['id', 'title', 'summary', 'content', 'url', 'published_date', 
                  'image_url', 'content_type', 'scraped_at', 'source', 
                  'source_name', 'university_name']
    
    def get_source_name(self, obj):
        return obj.source.name if obj.source else None
    
    def get_university_name(self, obj):
        return obj.source.university.name if obj.source and obj.source.university else None

class ContentProcessingLogSerializer(serializers.ModelSerializer):
    source_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentProcessingLog
        fields = ['id', 'source', 'source_name', 'start_time', 'end_time', 
                  'success', 'items_processed', 'items_added', 'items_updated', 
                  'error_message']
    
    def get_source_name(self, obj):
        return obj.source.name if obj.source else None

class UniversityContentSerializer(serializers.ModelSerializer):
    """Serializer for returning content grouped by university"""
    latest_news = serializers.SerializerMethodField()
    latest_events = serializers.SerializerMethodField()
    
    class Meta:
        model = University
        fields = ['id', 'name', 'website', 'latest_news', 'latest_events']
    
    def get_latest_news(self, obj):
        # Get the latest news for this university
        news = ScrapedContent.objects.filter(
            source__university=obj,
            content_type='news'
        ).order_by('-published_date', '-scraped_at')[:5]
        
        return ScrapedContentSerializer(news, many=True).data
    
    def get_latest_events(self, obj):
        # Get the latest events for this university
        events = ScrapedContent.objects.filter(
            source__university=obj,
            content_type='event'
        ).order_by('-published_date', '-scraped_at')[:5]
        
        return ScrapedContentSerializer(events, many=True).data 