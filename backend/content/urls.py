from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sources', views.ContentSourceViewSet)
router.register(r'items', views.ScrapedContentViewSet)
router.register(r'logs', views.ContentProcessingLogViewSet)
router.register(r'university-content', views.UniversityContentViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 