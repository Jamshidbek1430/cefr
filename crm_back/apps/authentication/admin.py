from django.contrib import admin

from .models import VerificationCode


@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "is_used", "created_at")
    list_filter = ("is_used",)
    search_fields = ("code",)

