from django.contrib import admin
from .models import User, University, Course, Avatar, UniversityContent, ChatHistory, ChatSession, ChatMessage

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'consent_given', 'data_retention_date', 'is_deleted', 'university', 'is_staff')
    readonly_fields = ('data_retention_date',)
    search_fields = ('username', 'email')
    list_filter = ('university', 'is_staff', 'is_active')

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'website')
    search_fields = ('name', 'location')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'university')
    search_fields = ('title', 'code')
    list_filter = ('university',)

@admin.register(Avatar)
class AvatarAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')
    search_fields = ('name', 'description')

@admin.register(UniversityContent)
class UniversityContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'content_type', 'created_at')
    search_fields = ('title', 'content')
    list_filter = ('university', 'content_type')

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('user', 'course', 'created_at')

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at', 'last_updated', 'is_archived')
    list_filter = ('user', 'is_archived', 'created_at')
    search_fields = ('title', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'last_updated')

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'user', 'is_user_message', 'timestamp')
    list_filter = ('user', 'is_user_message', 'session', 'timestamp')
    search_fields = ('user__username',)
    readonly_fields = ('timestamp',)
