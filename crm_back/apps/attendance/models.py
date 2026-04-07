from django.db import models
from apps.groups.models import Lesson
from apps.common.models import Basemodel
from auditlog.registry import auditlog

class Attendance(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='attendances', verbose_name="User")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attendances', verbose_name="Lesson")
    attended = models.BooleanField(default=False, verbose_name="Attended")
    date = models.DateField(auto_now_add=True) # Adding for record keeping

    class Meta:
        unique_together = ('user', 'lesson')
        verbose_name = "Davomat"
        verbose_name_plural = "Davomatlar"

    def __str__(self):
        return f"{self.user.username} - {self.lesson} - {'Present' if self.attended else 'Absent'}"


class LiveMessage(Basemodel):
    MESSAGE_TYPES = (
        ("text", "Text"),
        ("image", "Image"),
    )

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='live_messages')
    sender = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='live_messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default="text")
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_pinned = models.BooleanField(default=False)

    class Meta:
        ordering = ['sent_at']
        verbose_name = "Live message"
        verbose_name_plural = "Live messages"

    def __str__(self):
        return f"{self.sender} @ {self.lesson}: {self.content[:30]}"

auditlog.register(Attendance)
auditlog.register(LiveMessage)
