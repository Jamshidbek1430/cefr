import os
import uuid
from datetime import datetime, timedelta

from django.core.files.storage import default_storage
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.models import Homework, HomeworkSubmission
from apps.groups.models import Lesson

from .models import Attendance, LiveMessage
from .serializers import AttendanceSerializer, LiveMessageSerializer


def _lesson_datetime(lesson):
    return timezone.make_aware(datetime.combine(lesson.date, lesson.time), timezone.get_current_timezone())


def _percentage(numerator, denominator):
    if denominator <= 0:
        return 0
    return round((numerator / denominator) * 100)


def _cumulative_history(items, success_attr):
    successes = 0
    history = []
    for index, item in enumerate(items, start=1):
        successes += 1 if getattr(item, success_attr) else 0
        history.append(round((successes / index) * 100))
    if not history:
        history = [0]
    while len(history) < 8:
        history.insert(0, history[0])
    return history[-8:]


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Attendance.objects.select_related("user", "lesson", "lesson__teacher").all()
        if user.role == "teacher":
            return Attendance.objects.select_related("user", "lesson", "lesson__teacher").filter(lesson__teacher=user)
        return Attendance.objects.select_related("user", "lesson", "lesson__teacher").filter(user=user)


class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "student":
            return Response({"detail": "Only students can access this dashboard."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        lesson_qs = Lesson.objects.order_by("date", "time")
        past_lessons = [lesson for lesson in lesson_qs if _lesson_datetime(lesson) <= now]
        upcoming_lessons = [lesson for lesson in lesson_qs if _lesson_datetime(lesson) > now]

        attendance_records = {
            record.lesson_id: record
            for record in Attendance.objects.filter(user=request.user).select_related("lesson")
        }

        total_past_lessons = len(past_lessons)
        attended_lessons = sum(1 for lesson in past_lessons if attendance_records.get(lesson.id) and attendance_records[lesson.id].attended)
        attendance_percentage = _percentage(attended_lessons, total_past_lessons)

        recent_attendance_source = []
        for lesson in past_lessons[-8:]:
            record = attendance_records.get(lesson.id)
            recent_attendance_source.append(
                type("AttendanceSnapshot", (), {"attended": bool(record and record.attended)})()
            )
        attendance_history = _cumulative_history(recent_attendance_source, "attended")

        homeworks = list(
            Homework.objects.select_related("lesson", "video")
            .order_by("due_date", "created_at")
        )
        submission_map = {
            submission.homework_id: submission
            for submission in HomeworkSubmission.objects.filter(student=request.user).select_related("homework")
        }

        total_homework = len(homeworks)
        submitted_homework = sum(
            1
            for homework in homeworks
            if submission_map.get(homework.id) and submission_map[homework.id].is_submitted
        )
        homework_percentage = _percentage(submitted_homework, total_homework)

        recent_homework_source = []
        for homework in homeworks[-8:]:
            submission = submission_map.get(homework.id)
            recent_homework_source.append(
                type("HomeworkSnapshot", (), {"submitted": bool(submission and submission.is_submitted)})()
            )
        homework_history = _cumulative_history(recent_homework_source, "submitted")

        upcoming_homework = []
        for homework in homeworks:
            if homework.due_date and homework.due_date >= now:
                submission = submission_map.get(homework.id)
                if submission and submission.is_submitted:
                    continue
                upcoming_homework.append(
                    {
                        "id": homework.id,
                        "title": homework.title,
                        "due_date": homework.due_date.isoformat(),
                    }
                )

        next_lesson = None
        if upcoming_lessons:
            lesson = upcoming_lessons[0]
            lesson_datetime = _lesson_datetime(lesson)
            next_lesson = {
                "id": lesson.id,
                "datetime": lesson_datetime.isoformat(),
                "title": lesson.title,
                "room_url": lesson.daily_room_url,
                "recorded_video_url": lesson.recorded_video_url,
            }

        return Response(
            {
                "attendance_percentage": attendance_percentage,
                "homework_percentage": homework_percentage,
                "attendance_history": attendance_history,
                "homework_history": homework_history,
                "upcoming_homework": upcoming_homework[:5],
                "next_lesson": next_lesson,
            }
        )


class LiveLessonMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id=None):
        lesson_id = lesson_id or request.query_params.get("lesson_id")
        if not lesson_id:
            return Response({"detail": "lesson_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        lesson = Lesson.objects.filter(id=lesson_id).first()
        if not lesson:
            return Response({"detail": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

        messages = LiveMessage.objects.filter(lesson=lesson).select_related("sender", "lesson").order_by("sent_at")
        return Response(LiveMessageSerializer(messages, many=True).data)

    def post(self, request, lesson_id):
        lesson = Lesson.objects.filter(id=lesson_id).first()
        if not lesson:
            return Response({"detail": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

        content = (request.data.get("content") or request.data.get("message") or "").strip()
        message_type = request.data.get("type") or request.data.get("message_type") or "text"
        if message_type not in {"text", "image"} or not content:
            return Response({"detail": "Content is required."}, status=status.HTTP_400_BAD_REQUEST)

        live_message = LiveMessage.objects.create(
            lesson=lesson,
            sender=request.user,
            message_type=message_type,
            content=content,
            is_pinned=request.user.role in {"teacher", "admin"},
        )
        return Response(LiveMessageSerializer(live_message).data, status=status.HTTP_201_CREATED)


def _current_live_window():
    now = timezone.now()
    return now - timedelta(hours=3), now + timedelta(hours=3)


def _find_active_lesson():
    window_start, window_end = _current_live_window()
    lessons = Lesson.objects.order_by("date", "time")
    for lesson in lessons:
        lesson_datetime = _lesson_datetime(lesson)
        if window_start <= lesson_datetime <= window_end:
            return lesson
    return None


class LiveStreamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lesson = _find_active_lesson()
        if not lesson or not lesson.is_live or not lesson.youtube_embed_url:
            return Response({"detail": "No active live stream."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"embed_url": lesson.youtube_embed_url, "lesson_id": lesson.id})


class StartLiveLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in {"teacher", "admin"}:
            return Response({"detail": "Only teachers or admins can start a live lesson."}, status=status.HTTP_403_FORBIDDEN)

        lesson_id = request.data.get("lesson_id")
        lesson = None
        if lesson_id:
            lesson = Lesson.objects.filter(id=lesson_id).first()
        if not lesson:
            # Find nearest scheduled lesson
            lesson = Lesson.objects.filter(status="scheduled").order_by("date", "time").first()

        if not lesson:
            return Response({"detail": "No scheduled lesson found to start."}, status=status.HTTP_404_NOT_FOUND)

        lesson.is_live = True
        lesson.status = "live"
        lesson.save(update_fields=["is_live", "status", "updated_at"])
        return Response({
            "detail": "Lesson started.",
            "lesson_id": lesson.id,
            "lesson": {
                "id": lesson.id,
                "title": lesson.title,
                "status": lesson.status,
                "is_live": lesson.is_live,
                "hls_url": lesson.hls_url,
            },
        })


class EndLiveLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in {"teacher", "admin"}:
            return Response({"detail": "Only teachers or admins can end the live lesson."}, status=status.HTTP_403_FORBIDDEN)

        lesson = _find_active_lesson()
        if not lesson or not lesson.is_live:
            return Response({"detail": "No active live lesson to end."}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role == "teacher" and lesson.teacher_id and lesson.teacher_id != request.user.id:
            return Response({"detail": "You can only end your own lesson."}, status=status.HTTP_403_FORBIDDEN)

        lesson.is_live = False
        lesson.status = "finished"
        lesson.save(update_fields=["is_live", "status", "updated_at"])
        return Response({
            "detail": "Lesson ended.",
            "lesson_id": lesson.id,
            "lesson": {
                "id": lesson.id,
                "status": lesson.status,
                "is_live": lesson.is_live,
                "video_uploaded": lesson.video_uploaded,
            },
        })


class ChatImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        image = request.FILES.get("image")
        if not image:
            return Response({"error": "No image"}, status=status.HTTP_400_BAD_REQUEST)

        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if image.content_type not in allowed_types:
            return Response({"error": "Invalid file type"}, status=status.HTTP_400_BAD_REQUEST)

        if image.size > 500 * 1024:
            return Response({"error": "Image too large"}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(image.name)[1] or ".jpg"
        filename = f"chat/{uuid.uuid4().hex}{ext.lower()}"
        path = default_storage.save(filename, image)
        return Response({
            "image_url": request.build_absolute_uri(default_storage.url(path)),
        })


class ChatRoomListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lessons = Lesson.objects.all().order_by("-date", "-time")
        return Response([
            {"id": l.id, "name": l.title, "date": l.date, "is_live": l.is_live, "status": l.status}
            for l in lessons
        ])
