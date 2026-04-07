from django.db import models
from apps.common.models import Basemodel
from django.conf import settings
from apps.groups.models import Lesson
from auditlog.registry import auditlog

class Homework(Basemodel):
    title = models.CharField(max_length=255, default="Homework", verbose_name="Sarlavha")
    instructions = models.TextField(blank=True, default="", verbose_name="Ko'rsatmalar")
    due_date = models.DateTimeField(blank=True, null=True, verbose_name="Topshirish muddati")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='homeworks', verbose_name="Dars", blank=True, null=True)
    description = models.TextField(null=True, blank=True, verbose_name="Tavsif")
    video = models.ForeignKey('Video', on_delete=models.SET_NULL, related_name='linked_homeworks', blank=True, null=True)

    class Meta:
        verbose_name = "Uy vazifasi"
        verbose_name_plural = "Uy vazifalari"
        ordering = ['due_date', 'created_at']

    def __str__(self):
        return self.title

class Submission(Basemodel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions', verbose_name="O'quvchi")
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name='submissions', verbose_name="Uy vazifasi")
    submitted = models.BooleanField(default=False, verbose_name="Topshirildi")
    text = models.TextField(null=True, blank=True, verbose_name="Matn")

    class Meta:
        verbose_name = "Topshiriq"
        verbose_name_plural = "Topshiriqlar"

    def __str__(self):
        return f"Submission by {self.user} for {self.homework}"


class HomeworkSubmission(Basemodel):
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name='homework_submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='homework_submissions')
    answer = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_submitted = models.BooleanField(default=True)

    class Meta:
        unique_together = ('homework', 'student')
        ordering = ['-submitted_at']
        verbose_name = "Homework submission"
        verbose_name_plural = "Homework submissions"

    def __str__(self):
        return f"{self.student} - {self.homework}"

class Video(Basemodel):
    title = models.CharField(max_length=255, verbose_name="Sarlavha")
    video = models.FileField(upload_to="videos/", blank=True, null=True, verbose_name="Video fayl")
    video_url = models.URLField(blank=True, default="", verbose_name="Video URL")
    url = models.URLField(blank=True, default="", verbose_name="Legacy Video URL")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_videos')
    uploaded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name="Yuklangan sana")
    homework = models.ForeignKey(Homework, null=True, blank=True, on_delete=models.SET_NULL, related_name='videos')
    date = models.DateTimeField(auto_now_add=True, verbose_name="Sana")

    class Meta:
        verbose_name = "Video"
        verbose_name_plural = "Videolar"
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title

class LibraryItem(Basemodel):
    FILE_TYPES = (
        ('pdf', 'PDF'),
        ('audio', 'Audio'),
        ('image', 'Rasm'),
    )
    type = models.CharField(max_length=10, choices=FILE_TYPES, verbose_name="Tur", blank=True, default='pdf')
    file_type = models.CharField(max_length=10, choices=FILE_TYPES, verbose_name="Fayl turi", blank=True, default='pdf')
    title = models.CharField(max_length=255, verbose_name="Sarlavha")
    file = models.FileField(upload_to="library/", blank=True, null=True, verbose_name="Fayl")
    file_url = models.URLField(verbose_name="Fayl URL", blank=True, default="")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_library_items')
    uploaded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name="Yuklangan sana")

    class Meta:
        verbose_name = "Kutubxona elementi"
        verbose_name_plural = "Kutubxona elementlari"
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title

auditlog.register(Homework)
auditlog.register(Submission)
auditlog.register(HomeworkSubmission)
auditlog.register(Video)
auditlog.register(LibraryItem)
