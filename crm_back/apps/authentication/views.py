from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
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


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        print(request.data)
        
        # User requested explicit validation and error return format: {"error": "missing field X"}
        required_fields = ["username", "password", "role", "verification_code"]
        
        data = request.data.copy()
        # Map telegram_username (from our old frontend) to username if username is missing
        if "telegram_username" in data and "username" not in data:
            data["username"] = data["telegram_username"]
        if "full_name" in data and "username" not in data:
            data["username"] = data["full_name"]
            
        if "role" not in data:
            data["role"] = "student"

        for field in required_fields:
            if field not in data or not data[field]:
                return Response({"error": f"missing field {field}"}, status=status.HTTP_400_BAD_REQUEST)
                
        # Fix the payload for our serializer which expects telegram_username
        if "telegram_username" not in data:
            data["telegram_username"] = data["username"]
        if "full_name" not in data:
            data["full_name"] = data["username"]

        serializer = PublicRegisterSerializer(data=data)
        if not serializer.is_valid():
            # Return specific error array as string
            errors = serializer.errors
            first_error_key = list(errors.keys())[0]
            first_error_msg = errors[first_error_key][0]
            return Response({"error": f"{first_error_key}: {first_error_msg}"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = serializer.save()

        return Response(
            {
                "detail": "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
