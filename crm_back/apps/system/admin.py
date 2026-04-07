from django.contrib import admin
from .models import SystemSettings


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    """
    Sistema sozlamalari admin paneli
    """
    list_display = ['get_status_display', 'message', 'updated_at']
    fields = ['status', 'message', 'updated_at']
    readonly_fields = ['updated_at']
    
    def has_add_permission(self, request):
        """Yangi yozuv qo'shishni to'xtatish (faqat 1 ta bo'lishi kerak)"""
        # Agar allaqachon 1 ta yozuv bo'lsa, yangi qo'shishni ruxsat bermaslik
        return SystemSettings.objects.count() == 0
    
    def has_delete_permission(self, request, obj=None):
        """O'chirishni to'xtatish"""
        return False
    
    def changelist_view(self, request, extra_context=None):
        """Faqat bitta yozuvni editar qilish uchun"""
        # Agar yozuv bo'lsa, uni osongina ochish
        system_settings = SystemSettings.get_instance()
        if system_settings:
            return self.change_view(
                request,
                str(system_settings.pk),
                extra_context=extra_context
            )
        return super().changelist_view(request, extra_context)
