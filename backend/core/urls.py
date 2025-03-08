
from django.urls import path
from . import views

urlpatterns = [
    path('universities/', views.UniversityListAPIView.as_view(), name='university-list'),
    path('courses/', views.CourseListAPIView.as_view(), name='course-list'),
    path('chat/', views.ChatAPIView.as_view(), name='chat'),
]
