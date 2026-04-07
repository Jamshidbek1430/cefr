from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager as DjangoUserManager
from django.utils import timezone
import uuid
from auditlog.registry import auditlog


class UserManager(DjangoUserManager):
    use_in_migrations = True

    def _normalize_telegram_username(self, telegram_username):
        normalized = (telegram_username or "").strip().lstrip("@")
        if not normalized:
            raise ValueError("The Telegram username must be set")
        return normalized

    def _generate_username(self, base_username):
        candidate = base_username
        suffix = 1
        while self.model.objects.filter(username=candidate).exists():
            suffix += 1
            candidate = f"{base_username}{suffix}"
        return candidate

    def _create_user(self, telegram_username, password, **extra_fields):
        telegram_username = self._normalize_telegram_username(telegram_username)

        email = extra_fields.get("email")
        if email:
            extra_fields["email"] = self.normalize_email(email)

        username = (extra_fields.get("username") or "").strip()
        if not username:
            username = self._generate_username(telegram_username)

        extra_fields["username"] = username
        extra_fields["telegram_username"] = telegram_username
        extra_fields.setdefault("phone_number", telegram_username)

        user = self.model(**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, telegram_username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", "student")
        return self._create_user(telegram_username, password, **extra_fields)

    def create_superuser(self, telegram_username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(telegram_username, password, **extra_fields)

class User(AbstractUser):
    ROLES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=20, verbose_name="Phone number", unique=True, blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Full Name")
    telegram_username = models.CharField(max_length=150, blank=True, null=True, unique=True, verbose_name="Telegram username")
    
    role = models.CharField(choices=ROLES, max_length=50, default='student', verbose_name="Foydalanuvchi roli")
    is_active = models.BooleanField(default=True, verbose_name="Faol foydalanuvchi")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 

    objects = UserManager()

    USERNAME_FIELD = "telegram_username"
    REQUIRED_FIELDS = ["full_name"]

    def __str__(self):
        return self.full_name or self.telegram_username or self.username
    
    def save(self, *args, **kwargs):
        if self.is_superuser and self.role != 'admin':
            self.role = 'admin'
        if not self.telegram_username and self.username:
            self.telegram_username = self.username
        if self.telegram_username:
            self.telegram_username = self.telegram_username.strip().lstrip("@")
        if not self.phone_number and self.telegram_username:
            self.phone_number = self.telegram_username
        if not self.username and self.telegram_username:
            self.username = self.telegram_username
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Foydalanuvchi"
        verbose_name_plural = "Foydalanuvchilar"
auditlog.register(User)
