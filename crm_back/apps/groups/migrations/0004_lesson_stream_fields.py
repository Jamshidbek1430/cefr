from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("groups", "0003_merge_0002_initial_0002_lesson_live_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="lesson",
            name="is_live",
            field=models.BooleanField(default=False, verbose_name="Hozir jonli"),
        ),
        migrations.AddField(
            model_name="lesson",
            name="youtube_embed_url",
            field=models.URLField(blank=True, null=True, verbose_name="YouTube embed URL"),
        ),
    ]
