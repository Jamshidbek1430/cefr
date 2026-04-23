from django.db import models


class VerificationCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["code"]
        verbose_name = "Verification code"
        verbose_name_plural = "Verification codes"

    def __str__(self):
        return self.code

