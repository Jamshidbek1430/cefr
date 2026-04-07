from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HomeworkViewSet, SubmissionViewSet

router = DefaultRouter()
router.register(r'', HomeworkViewSet, basename='homework')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
]
