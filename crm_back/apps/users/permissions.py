from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Admin darajasidagi foydalanuvchilargina ruxsat oladi.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return bool(
            getattr(request.user, "is_superuser", False)
            or request.user.role == "admin"
        )
