from rest_framework.permissions import BasePermission


def _role(user):
    return getattr(user, "role", None)


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "is_superuser", False) or _role(user) == "admin")
        )


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and _role(user) == "teacher")


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and _role(user) == "student")
