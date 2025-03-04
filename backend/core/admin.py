
from django.contrib import admin
from .models import User, University, Course, Avatar, UniversityContent, ChatHistory

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'university')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('university',)

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
    list_display = ('user', 'model_type', 'hair_color', 'skin_tone')
    list_filter = ('model_type', 'hair_color', 'skin_tone')

@admin.register(UniversityContent)
class UniversityContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'course', 'content_type')
    search_fields = ('title', 'content')
    list_filter = ('university', 'course', 'content_type')

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'timestamp', 'is_user_message')
    search_fields = ('message', 'response')
    list_filter = ('user', 'course', 'is_user_message')
