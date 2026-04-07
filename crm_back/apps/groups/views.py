from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Lesson
from .serializers import LessonSerializer
from django.utils import timezone

class LessonViewSet(viewsets.ModelViewSet):
    """
    CRUD for Lesson model:
    - Admin: All permissions
    - Teacher: Read/Update own lessons
    - Student: Read all lessons (since only one group)
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date']
    search_fields = ['date']
    ordering_fields = ['date', 'time']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.all()

    @action(detail=False, methods=['get'])
    def active(self, request):
        active_lesson = Lesson.objects.filter(status="live").first()
        if not active_lesson:
            active_lesson = Lesson.objects.filter(status="scheduled").order_by('date', 'time').first()
        
        if active_lesson:
            serializer = self.get_serializer(active_lesson)
            return Response(serializer.data)
        
        return Response({"detail": "No active or scheduled lessons found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"], url_path="start")
    def start(self, request, pk=None):
        if request.user.role not in ["teacher", "admin"]:
            return Response({"detail": "Only teachers or admins can start a live lesson."}, status=status.HTTP_403_FORBIDDEN)
        
        lesson = self.get_object()
        lesson.status = "live"
        lesson.is_live = True
        lesson.started_at = timezone.now()
        lesson.save(update_fields=["status", "is_live", "started_at", "updated_at"])
        
        serializer = self.get_serializer(lesson)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="end")
    def end(self, request, pk=None):
        if request.user.role not in ["teacher", "admin"]:
            return Response({"detail": "Only teachers or admins can end a live lesson."}, status=status.HTTP_403_FORBIDDEN)
        
        lesson = self.get_object()
        lesson.status = "finished"
        lesson.is_live = False
        lesson.save(update_fields=["status", "is_live", "updated_at"])
        
        serializer = self.get_serializer(lesson)
        return Response(serializer.data, status=status.HTTP_200_OK)
