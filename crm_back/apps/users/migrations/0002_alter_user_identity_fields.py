from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="phone_number",
            field=models.CharField(blank=True, max_length=20, null=True, unique=True, verbose_name="Phone number"),
        ),
        migrations.AlterField(
            model_name="user",
            name="telegram_username",
            field=models.CharField(blank=True, max_length=150, null=True, unique=True, verbose_name="Telegram username"),
        ),
    ]
