from django.db import models
from django.conf import settings


class Video(models.Model):
    title = models.CharField(max_length=255)
    video = models.FileField(upload_to="videos/")
    created_at = models.DateTimeField(auto_now_add=True)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="videos"
    )

    def __str__(self):
        return self.title