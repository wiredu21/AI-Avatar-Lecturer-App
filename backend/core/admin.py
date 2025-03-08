
from django.contrib import admin
from .models import User, University, Course, Avatar, UniversityContent, ChatHistory

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'university', 'is_staff')
    search_fields = ('username', 'email')
    list_filter = ('university', 'is_staff', 'is_active')

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'website')
    search_fields = ('name', 'location')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'university')
    search_fields = ('code', 'title')
    list_filter = ('university',)

@admin.register(Avatar)
class AvatarAdmin(admin.ModelAdmin):
    list_display = ('name', 'image_url')
    search_fields = ('name',)

@admin.register(UniversityContent)
class UniversityContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'course', 'content_type', 'created_at')
    search_fields = ('title', 'content')
    list_filter = ('university', 'course', 'content_type')

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'created_at')
    search_fields = ('message', 'response')
    list_filter = ('user', 'course', 'created_at')
