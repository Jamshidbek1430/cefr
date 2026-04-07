from django.contrib import admin
from .models import Homework, HomeworkSubmission, Submission, Video, LibraryItem

admin.site.register(Homework)
admin.site.register(Submission)
admin.site.register(HomeworkSubmission)
admin.site.register(Video)
admin.site.register(LibraryItem)
