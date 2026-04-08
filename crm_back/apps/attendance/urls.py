from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AttendanceViewSet, 
    LiveLessonMessagesView, 
    ChatImageUploadView, 
    LiveStreamView, 
    StartLiveLessonView,
    EndLiveLessonView
)

router = DefaultRouter()
router.register(r"", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("", include(router.urls)),
    path("lessons/<int:lesson_id>/messages/", LiveLessonMessagesView.as_view(), name="lesson-messages"),
    path("upload_chat_image/", ChatImageUploadView.as_view(), name="chat-image-upload"),
    path("active_stream/", LiveStreamView.as_view(), name="active-stream"),
    path("start_live/", StartLiveLessonView.as_view(), name="start-live"),
    path("end_live/", EndLiveLessonView.as_view(), name="end-live"),
]
