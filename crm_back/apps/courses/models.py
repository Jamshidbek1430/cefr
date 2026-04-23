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
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_homeworks', verbose_name="O'qituvchi", null=True, blank=True)
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='assigned_homeworks', verbose_name="O'quvchilar", blank=True)
    subject = models.CharField(max_length=255, blank=True, null=True, verbose_name="Fan")

    class Meta:
        verbose_name = "Uy vazifasi"
        verbose_name_plural = "Uy vazifalari"
        ordering = ['-due_date', '-created_at']

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
    is_submitted = models.BooleanField(default=False, verbose_name="Topshirildi")

    class Meta:
        verbose_name = "Uy vazifasi topshirig'i"
        verbose_name_plural = "Uy vazifasi topshiriqlari"
        unique_together = ['homework', 'student']

    def __str__(self):
        return f"{self.student} - {self.homework.title}"


class Video(Basemodel):
    title = models.CharField(max_length=255, verbose_name="Sarlavha")
    video = models.FileField(upload_to='videos/', blank=True, null=True, verbose_name="Video fayl")
    video_url = models.URLField(blank=True, null=True, verbose_name="Video URL")
    url = models.URLField(blank=True, null=True, verbose_name="URL")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_videos')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    date = models.DateField(blank=True, null=True)
    homework = models.ForeignKey(Homework, on_delete=models.SET_NULL, null=True, blank=True, related_name='videos')

    class Meta:
        verbose_name = "Video"
        verbose_name_plural = "Videolar"
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title


class LibraryItem(Basemodel):
    TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('audio', 'Audio'),
        ('image', 'Image'),
    ]
    
    title = models.CharField(max_length=255, verbose_name="Sarlavha")
    file = models.FileField(upload_to='library/', blank=True, null=True, verbose_name="Fayl")
    file_url = models.URLField(blank=True, null=True, verbose_name="Fayl URL")
    file_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='pdf', verbose_name="Fayl turi")
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='pdf', verbose_name="Turi")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_library_items')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Kutubxona elementi"
        verbose_name_plural = "Kutubxona elementlari"
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title

