from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("groups", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="lesson",
            name="daily_room_url",
            field=models.URLField(blank=True, null=True, verbose_name="Daily room URL"),
        ),
        migrations.AddField(
            model_name="lesson",
            name="recorded_video_url",
            field=models.URLField(blank=True, null=True, verbose_name="Recorded video URL"),
        ),
        migrations.AddField(
            model_name="lesson",
            name="title",
            field=models.CharField(default="Live Lesson", max_length=255, verbose_name="Sarlavha"),
        ),
    ]
