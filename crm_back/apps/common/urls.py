from django.urls import path, include
from apps.attendance.views import StudentDashboardView

urlpatterns = [
    path("auth/", include("apps.authentication.urls")),
    path("student/dashboard/", StudentDashboardView.as_view()),
    path("lessons/", include("apps.groups.urls")),
    path("attendance/", include("apps.attendance.urls")),
    path("homework/", include("apps.courses.urls")),
    path("videos/", include("apps.courses.urls_videos")),
    path("library/", include("apps.courses.urls_library")),
    path("users/", include("apps.users.urls")),
]

