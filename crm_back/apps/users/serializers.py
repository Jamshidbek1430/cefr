import re
from django.conf import settings
from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken

def create_custom_jwt_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh["user_id"] = str(user.id)
    access = refresh.access_token
    access["user_id"] = str(user.id)
    return {
        "refresh": str(refresh),
        "access": str(access),
    }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "telegram_username",
            "role",
            "is_staff",
            "is_superuser",
            "is_active",
            "created_at",
            "updated_at",
        ]

class AdminListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "telegram_username",
            "role",
            "is_staff",
            "is_superuser",
            "is_active",
            "created_at",
            "updated_at",
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            "username",
            "full_name",
            "telegram_username",
            "role",
            "password",
        ]

    def validate(self, attrs):
        username = attrs.get("username")
        full_name = (attrs.get("full_name") or "").strip()
        telegram_username = (attrs.get("telegram_username") or "").strip().lstrip("@")
        role = attrs.get("role", "student")

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "❌ Bu username allaqachon ro'yxatdan o'tgan."})
        if not full_name:
            raise serializers.ValidationError({"full_name": "❌ Full name kiritilishi shart."})
        if not telegram_username:
            raise serializers.ValidationError({"telegram_username": "❌ Telegram username kiritilishi shart."})
        if User.objects.filter(telegram_username=telegram_username).exists():
            raise serializers.ValidationError({"telegram_username": "❌ Bu telegram username allaqachon band."})

        # Phone validation (if provided)
        phone = attrs.get("phone_number", "")
        if phone:
            phone = phone.strip()
            if not phone.startswith("+"):
                phone = "+" + phone
            if not re.match(r"^\+998\d{9}$", phone):
                raise serializers.ValidationError({"phone_number": "❌ Telefon raqam formati noto'g'ri. Misol: +998901234567"})
            attrs["phone_number"] = phone

        attrs["full_name"] = full_name
        attrs["telegram_username"] = telegram_username
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get("username"),
            full_name=validated_data.get("full_name"),
            telegram_username=validated_data.get("telegram_username"),
            role=validated_data.get("role", "student"),
            password=validated_data.get("password"),
        )
        return user
