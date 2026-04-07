from django.db import migrations, models
from django.utils import timezone


VERIFICATION_CODES = ["483729", "915604", "372891", "640258", "829173"]


def seed_verification_codes(apps, schema_editor):
    VerificationCode = apps.get_model("authentication", "VerificationCode")
    for code in VERIFICATION_CODES:
        VerificationCode.objects.update_or_create(
            code=code,
            defaults={
                "is_active": True,
                "used_at": None,
            },
        )


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="VerificationCode",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=6, unique=True)),
                ("is_active", models.BooleanField(default=True)),
                ("used_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Verification code",
                "verbose_name_plural": "Verification codes",
                "ordering": ["code"],
            },
        ),
        migrations.RunPython(seed_verification_codes, migrations.RunPython.noop),
    ]
