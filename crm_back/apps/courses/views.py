from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Homework, HomeworkSubmission, LibraryItem, Submission, Video
from apps.groups.models import Lesson
from .serializers import (
    HomeworkSerializer,
    HomeworkSubmissionSerializer,
    LibraryItemSerializer,
    SubmissionSerializer,
    VideoDetailSerializer,
    VideoListSerializer,
)


class HomeworkViewSet(viewsets.ModelViewSet):
    serializer_class = HomeworkSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "instructions", "description"]

    def get_queryset(self):
        queryset = Homework.objects.select_related("lesson", "video", "teacher").prefetch_related("homework_submissions", "students").order_by("-due_date", "-created_at")
        user = self.request.user
        if user.role == "teacher":
            return queryset.filter(teacher=user)
        elif user.role == "student":
            return queryset.filter(students=user)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    @action(detail=True, methods=["post"], url_path="submit")
    def submit(self, request, pk=None):
        if request.user.role != "student":
            return Response({"detail": "Only students can submit homework."}, status=status.HTTP_403_FORBIDDEN)

        homework = self.get_object()
        answer = (request.data.get("answer") or "").strip()
        if not answer:
            return Response({"detail": "Answer is required."}, status=status.HTTP_400_BAD_REQUEST)

        submission, _ = HomeworkSubmission.objects.update_or_create(
            homework=homework,
            student=request.user,
            defaults={
                "answer": answer,
                "is_submitted": True,
            },
        )
        return Response(HomeworkSubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)


class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Submission.objects.all()
        if user.role == "teacher":
            return Submission.objects.filter(homework__lesson__teacher=user)
        return Submission.objects.filter(user=user)


class VideoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["uploaded_at", "date"]

    def get_queryset(self):
        return Video.objects.select_related("uploaded_by", "homework").prefetch_related("linked_homeworks").order_by("-uploaded_at", "-date")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return VideoDetailSerializer
        return VideoListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        # Accept both file upload and URL-based entry
        video = serializer.save(uploaded_by=self.request.user)
        lesson_id = self.request.data.get("lesson") or self.request.data.get("lesson_id")
        lesson = None
        if lesson_id:
            lesson = Lesson.objects.filter(id=lesson_id).first()
        if lesson is None:
            lesson = (
                Lesson.objects
                .filter(status="finished", video_uploaded=False)
                .order_by("-date", "-time")
                .first()
            )
        if lesson:
            lesson.video_uploaded = True
            resolved_url = video.video_url or (video.video.url if video.video and video.video.name else None)
            if resolved_url and not lesson.recorded_video_url:
                lesson.recorded_video_url = resolved_url
            lesson.save(update_fields=["video_uploaded", "recorded_video_url", "updated_at"])

    def destroy(self, request, *args, **kwargs):
        # Delete video - only teachers and admins
        if request.user.role not in ['teacher', 'admin']:
            return Response(
                {'error': 'Faqat teacher va admin o\'chirira oladi'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

class LibraryItemView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        items = LibraryItem.objects.order_by("-uploaded_at", "-created_at")
        search = (request.query_params.get("search") or "").strip()
        if search:
            items = items.filter(title__icontains=search)

        serialized = LibraryItemSerializer(items, many=True, context={"request": request}).data
        grouped = {"pdfs": [], "audio": [], "images": []}
        for item in serialized:
            if item["file_type"] == "pdf":
                grouped["pdfs"].append(item)
            elif item["file_type"] == "audio":
                grouped["audio"].append(item)
            else:
                grouped["images"].append(item)

        return Response(grouped)

    def post(self, request):
        if request.user.role not in ["admin", "teacher"]:
            return Response({"detail": "Sizda bu amalni bajarish huquqi yo'q."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = LibraryItemSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LibraryItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role not in ["admin", "teacher"]:
            return Response(
                {"detail": "Only teachers and admins can delete files"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            item = LibraryItem.objects.get(pk=pk)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except LibraryItem.DoesNotExist:
            return Response(
                {"detail": "File not found"},
                status=status.HTTP_404_NOT_FOUND
            )

