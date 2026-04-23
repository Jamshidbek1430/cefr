
from django.db import models
from apps.groups.models import Lesson
from auditlog.registry import auditlog

class Attendance(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='attendances', verbose_name="User")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attendances', verbose_name="Lesson")
    attended = models.BooleanField(default=False, verbose_name="Attended")
    date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'lesson')
        verbose_name = "Davomat"
        verbose_name_plural = "Davomatlar"

    def __str__(self):
        return f"{self.user.username} - {self.lesson} - {'Present' if self.attended else 'Absent'}"

auditlog.register(Attendance)

