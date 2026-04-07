from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("attendance", "0004_livemessage"),
        ("groups", "0004_lesson_stream_fields"),
    ]

    operations = [
        migrations.RenameField(
            model_name="livemessage",
            old_name="message",
            new_name="content",
        ),
        migrations.AddField(
            model_name="livemessage",
            name="is_pinned",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="livemessage",
            name="message_type",
            field=models.CharField(choices=[("text", "Text"), ("image", "Image")], default="text", max_length=10),
        ),
    ]
