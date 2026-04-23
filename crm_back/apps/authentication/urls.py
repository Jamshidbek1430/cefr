from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import LoginView, LogoutView, RegisterView

urlpatterns = [
    path("login/", csrf_exempt(LoginView.as_view()), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("register/", csrf_exempt(RegisterView.as_view()), name="register"),
]
