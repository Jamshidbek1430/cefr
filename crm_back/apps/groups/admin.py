from django.contrib import admin
from .models import Lesson

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'date', 'time', 'teacher', 'created_at', 'updated_at')
    list_filter = ('date', 'teacher')
    search_fields = ('title', 'teacher__username', 'teacher__full_name')
    ordering = ('-date', '-time')
    readonly_fields = ('created_at', 'updated_at')
