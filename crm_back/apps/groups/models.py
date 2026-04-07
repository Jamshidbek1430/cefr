from django.db import models
from apps.common.models import Basemodel
from auditlog.registry import auditlog

class Lesson(Basemodel):
    """
    Lesson modeli - darslar vaqtini saqlash uchun
    """
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("live", "Live"),
        ("finished", "Finished"),
    ]

    title = models.CharField(max_length=255, default="Live Lesson", verbose_name="Sarlavha")
    date = models.DateField(verbose_name="Sana")
    time = models.TimeField(verbose_name="Vaqt")
    daily_room_url = models.URLField(blank=True, null=True, verbose_name="Daily room URL")
    recorded_video_url = models.URLField(blank=True, null=True, verbose_name="Recorded video URL")
    youtube_embed_url = models.URLField(blank=True, null=True, verbose_name="YouTube embed URL")
    twitch_channel = models.CharField(max_length=255, blank=True, null=True, verbose_name="Twitch Channel Name")
    hls_url = models.URLField(blank=True, null=True, verbose_name="HLS Stream URL",
                              help_text="Ant Media HLS link, e.g. http://YOUR_IP:5080/LiveApp/streams/test_stream.m3u8")
    is_live = models.BooleanField(default=False, verbose_name="Hozir jonli")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    started_at = models.DateTimeField(blank=True, null=True, verbose_name="Boshlangan vaqti")
    video_uploaded = models.BooleanField(default=False)
    
    teacher = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='lessons',
        limit_choices_to={'role': 'teacher'},
        verbose_name="O'qituvchi",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Dars"
        verbose_name_plural = "Darslar"
        ordering = ['-date', '-time']
        
    def __str__(self):
        return self.title
auditlog.register(Lesson)
