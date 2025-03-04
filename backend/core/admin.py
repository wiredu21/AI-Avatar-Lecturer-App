
from django.contrib import admin
from .models import User, University, Course, Avatar, UniversityContent, ChatHistory

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'university', 'bio')
    list_filter = ('university',)
    search_fields = ('username', 'email', 'bio')

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'website')
    search_fields = ('name', 'location')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'university', 'created_at')
    list_filter = ('university', 'created_at')
    search_fields = ('title', 'code', 'description')
    date_hierarchy = 'created_at'

@admin.register(Avatar)
class AvatarAdmin(admin.ModelAdmin):
    list_display = ('user', 'model_type', 'hair_color', 'skin_tone')
    list_filter = ('model_type', 'hair_color', 'eye_color', 'skin_tone')
    search_fields = ('user__username',)

@admin.register(UniversityContent)
class UniversityContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'course', 'content_type', 'created_at')
    list_filter = ('university', 'course', 'content_type', 'created_at')
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'is_user_message', 'timestamp')
    list_filter = ('user', 'course', 'is_user_message', 'timestamp')
    search_fields = ('message', 'response')
    date_hierarchy = 'timestamp'
