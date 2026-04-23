from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.utils import timezone

from .models import VerificationCode

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    telegram_username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data["telegram_username"].strip().lstrip("@"),
            password=data["password"]
        )

        if not user:
            raise serializers.ValidationError("Login yoki parol noto'g'ri")
        
        if not user.is_active:
            raise serializers.ValidationError("Sizning profilingiz aktiv emas. Admin tomonidan bloklangansiz.")

        data["user"] = user
        return data
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        user = instance.get('user')
        if user:
            refresh = RefreshToken.for_user(user)
            ret['access'] = str(refresh.access_token)
            ret['refresh'] = str(refresh)
        return ret


class PublicRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    verification_code = serializers.CharField(write_only=True, max_length=20)

    class Meta:
        model = User
        fields = [
            "full_name",
            "username",
            "verification_code",
            "password",
        ]

    def validate_full_name(self, value):
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Full name is required.")
        return normalized

    def validate_username(self, value):
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username=normalized).exists():
            raise serializers.ValidationError("This username is already taken.")
        return normalized

    def validate_verification_code(self, value):
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Verification code is required.")
        return normalized

    def create(self, validated_data):
        verification_code = validated_data.pop("verification_code")

        with transaction.atomic():
            code = VerificationCode.objects.select_for_update().filter(
                code=verification_code,
            ).first()

            if not code:
                raise serializers.ValidationError({"verification_code": "invalid code"})
            
            user = User.objects.create_user(
                username=validated_data["username"],
                full_name=validated_data.get("full_name", ""),
                telegram_username=validated_data["username"], # Keep fallback for legacy fields
                role="student",
                password=validated_data["password"],
            )

            # Code is reusable - do not mark as used

        return user
