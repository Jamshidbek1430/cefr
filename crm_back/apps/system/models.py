from django.db import models


class SystemSettings(models.Model):
    """
    Tizim sozlamalari - faqat 1 ta yozuv bo'lishi kerak
    """
    STATUS_CHOICES = (
        ('operational', 'Faol'),
        ('maintenance', 'Tamir'),
        ('degraded', 'Qisman faol'),
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='operational',
        verbose_name="Tizim holati"
    )
    
    message = models.TextField(
        verbose_name="Xabar",
        help_text="Tizim holati haqida xabar",
        blank=True
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Yangilangan vaqti"
    )
    
    class Meta:
        verbose_name = "Sistema sozlamalari"
        verbose_name_plural = "Sistema sozlamalari"
        # Faqat 1 ta yozuv bo'lishi kerak
        constraints = [
            models.UniqueConstraint(
                fields=['id'],
                name='single_system_settings'
            )
        ]
    
    def __str__(self):
        return f"Sistema: {self.get_status_display()}"
    
    @classmethod
    def get_instance(cls):
        """Yagona System Settings yozuvini olish"""
        obj, created = cls.objects.get_or_create(
            id=1,
            defaults={
                'status': 'operational',
                'message': 'Tizim normal ishlayapti'
            }
        )
        return obj
