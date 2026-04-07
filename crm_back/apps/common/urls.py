from django.urls import path, include

from apps.attendance.views import (
    ChatImageUploadView,
    EndLiveLessonView,
    LiveLessonMessagesView,
    LiveStreamView,
    StudentDashboardView,
    ChatRoomListView,
)

urlpatterns = [
    path("auth/", include("apps.authentication.urls")),
    path("student/dashboard/", StudentDashboardView.as_view()),
    path("lessons/<int:lesson_id>/messages/", LiveLessonMessagesView.as_view()),
    path("live/stream/", LiveStreamView.as_view()),
    path("live/end/", EndLiveLessonView.as_view()),
    path("live/chat/upload/", ChatImageUploadView.as_view()),
    path("chat/rooms", ChatRoomListView.as_view()),
    path("messages", LiveLessonMessagesView.as_view()),
    path("upload", ChatImageUploadView.as_view()),
    path("lessons/", include("apps.groups.urls")),
    path("attendance/", include("apps.attendance.urls")),
    path("homework/", include("apps.courses.urls")),
    path("videos/", include("apps.courses.urls_videos")),
    path("library/", include("apps.courses.urls_library")),
    path("users/", include("apps.users.urls")),
]
