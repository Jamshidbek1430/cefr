import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0003_initial"),
        ("groups", "0002_lesson_live_fields"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="homework",
            name="due_date",
            field=models.DateTimeField(blank=True, null=True, verbose_name="Topshirish muddati"),
        ),
        migrations.AddField(
            model_name="homework",
            name="instructions",
            field=models.TextField(blank=True, default="", verbose_name="Ko'rsatmalar"),
        ),
        migrations.AddField(
            model_name="homework",
            name="title",
            field=models.CharField(default="Homework", max_length=255, verbose_name="Sarlavha"),
        ),
        migrations.AlterField(
            model_name="homework",
            name="lesson",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="homeworks", to="groups.lesson", verbose_name="Dars"),
        ),
        migrations.AddField(
            model_name="video",
            name="file_url",
            field=models.URLField(blank=True, default="", verbose_name="Video URL"),
        ),
        migrations.AddField(
            model_name="video",
            name="homework",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="videos", to="courses.homework"),
        ),
        migrations.AddField(
            model_name="video",
            name="uploaded_at",
            field=models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name="Yuklangan sana"),
        ),
        migrations.AddField(
            model_name="video",
            name="uploaded_by",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="uploaded_videos", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name="video",
            name="url",
            field=models.URLField(blank=True, default="", verbose_name="Legacy Video URL"),
        ),
        migrations.AddField(
            model_name="libraryitem",
            name="file_type",
            field=models.CharField(blank=True, choices=[("pdf", "PDF"), ("audio", "Audio"), ("image", "Rasm")], default="pdf", max_length=10, verbose_name="Fayl turi"),
        ),
        migrations.AddField(
            model_name="libraryitem",
            name="uploaded_at",
            field=models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name="Yuklangan sana"),
        ),
        migrations.AddField(
            model_name="libraryitem",
            name="uploaded_by",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="uploaded_library_items", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name="libraryitem",
            name="file_url",
            field=models.URLField(blank=True, default="", verbose_name="Fayl URL"),
        ),
        migrations.AlterField(
            model_name="libraryitem",
            name="type",
            field=models.CharField(blank=True, choices=[("pdf", "PDF"), ("audio", "Audio"), ("image", "Rasm")], default="pdf", max_length=10, verbose_name="Tur"),
        ),
        migrations.CreateModel(
            name="HomeworkSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("answer", models.TextField()),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("is_submitted", models.BooleanField(default=True)),
                ("homework", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="homework_submissions", to="courses.homework")),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="homework_submissions", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-submitted_at"],
                "verbose_name": "Homework submission",
                "verbose_name_plural": "Homework submissions",
                "unique_together": {("homework", "student")},
            },
        ),
        migrations.AddField(
            model_name="homework",
            name="video",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="linked_homeworks", to="courses.video"),
        ),
    ]
