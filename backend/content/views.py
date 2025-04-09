from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from .models import ContentSource, ScrapedContent, ContentProcessingLog, ContentType
from .serializers import (
    ContentSourceSerializer, 
    ScrapedContentSerializer,
    ContentProcessingLogSerializer,
    UniversityContentSerializer
)
from .tasks import scrape_northampton_news, scrape_northampton_events, refresh_all_content
from core.models import University

class ContentSourceViewSet(viewsets.ModelViewSet):
    """API endpoint for content sources"""
    queryset = ContentSource.objects.all()
    serializer_class = ContentSourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def scrape_now(self, request, pk=None):
        """Trigger immediate scraping for a content source"""
        source = self.get_object()
        
        if not source.active:
            return Response(
                {"detail": "Cannot scrape inactive source"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check which scraper to use based on source type and URL
        if source.content_type == ContentType.NEWS and 'northampton' in source.url.lower():
            task = scrape_northampton_news.delay()
            return Response({"task_id": task.id, "status": "Task started"})
        elif source.content_type == ContentType.EVENT and 'northampton' in source.url.lower():
            task = scrape_northampton_events.delay()
            return Response({"task_id": task.id, "status": "Task started"})
        else:
            return Response(
                {"detail": "No scraper available for this source"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def refresh_all(self, request):
        """Trigger scraping for all active sources"""
        task = refresh_all_content.delay()
        return Response({"task_id": task.id, "status": "Refresh all task started"})

class ScrapedContentViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for scraped content"""
    queryset = ScrapedContent.objects.all().order_by('-published_date', '-scraped_at')
    serializer_class = ScrapedContentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by content type if provided
        content_type = self.request.query_params.get('content_type')
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        
        # Filter by university if provided
        university_id = self.request.query_params.get('university')
        if university_id:
            queryset = queryset.filter(source__university_id=university_id)
        
        # Search in title and content if search term provided
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(content__icontains=search) |
                Q(summary__icontains=search)
            )
        
        # Filter by date if provided
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(published_date__gte=date_from)
            
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(published_date__lte=date_to)
        
        return queryset

class ContentProcessingLogViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for content processing logs"""
    queryset = ContentProcessingLog.objects.all().order_by('-start_time')
    serializer_class = ContentProcessingLogSerializer
    permission_classes = [permissions.IsAuthenticated]

class UniversityContentViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for university content"""
    queryset = University.objects.all()
    serializer_class = UniversityContentSerializer
    permission_classes = [permissions.IsAuthenticated]
