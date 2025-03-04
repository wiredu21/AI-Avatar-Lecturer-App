
from django.contrib import admin
from .models import User, University, Course, Avatar, UniversityContent, ChatHistory

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'university', 'course')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('university', 'course')

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Avatar)
class AvatarAdmin(admin.ModelAdmin):
    list_display = ('name', 'image_url')
    search_fields = ('name',)

@admin.register(UniversityContent)
class UniversityContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'category')
    search_fields = ('title', 'content')
    list_filter = ('category', 'date')

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'timestamp')
    search_fields = ('question', 'answer')
    list_filter = ('user', 'timestamp')
