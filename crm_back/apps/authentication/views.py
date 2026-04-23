from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import LoginSerializer, PublicRegisterSerializer
from apps.users.serializers import UserSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Tizimdan muvaffaqiyatli chiqdingiz."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Noto'g'ri token yoki Qora ro'yxatga kiritilgan."}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        print("=== REGISTRATION REQUEST ===")
        print("Request data:", request.data)
        print("Request headers:", dict(request.headers))

        # Required fields (role is now optional, defaults to STUDENT)
        required_fields = ["username", "password", "verification_code"]

        data = request.data.copy()

        # Map telegram_username to username if username is missing
        if "telegram_username" in data and "username" not in data:
            data["username"] = data["telegram_username"]
        if "full_name" in data and "username" not in data:
            data["username"] = data["full_name"]

        # Default role to STUDENT if not provided
        if "role" not in data or not data["role"]:
            data["role"] = "STUDENT"

        # Check required fields
        for field in required_fields:
            if field not in data or not data[field]:
                print(f"Missing field: {field}")
                return Response(
                    {"error": f"missing field {field}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Fix the payload for our serializer
        if "telegram_username" not in data:
            data["telegram_username"] = data["username"]
        if "full_name" not in data:
            data["full_name"] = data["username"]

        print("Processed data:", data)

        serializer = PublicRegisterSerializer(data=data)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            # Return specific error
            errors = serializer.errors
            first_error_key = list(errors.keys())[0]
            first_error_msg = errors[first_error_key][0]
            return Response(
                {"error": f"{first_error_key}: {first_error_msg}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        print("User created successfully:", user.username)

        # Generate tokens for auto-login
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "detail": "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi.",
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )
