from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class UsernameOrPhoneBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        login = username or kwargs.get("telegram_username")

        if not login or not password:
            return None

        try:
            user = User.objects.get(
                Q(username=login) | Q(telegram_username=login) | Q(email=login)
            )
        except User.DoesNotExist:
            return None

        if user.check_password(password):
            return user
        return None
