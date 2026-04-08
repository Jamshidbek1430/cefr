import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("attendance", "0003_initial"),
        ("groups", "0002_lesson_live_fields"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="LiveMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("message", models.TextField()),
                ("sent_at", models.DateTimeField(auto_now_add=True)),
                ("lesson", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="live_messages", to="groups.lesson")),
                ("sender", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="live_messages", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["sent_at"],
                "verbose_name": "Live message",
                "verbose_name_plural": "Live messages",
            },
        ),
    ]
