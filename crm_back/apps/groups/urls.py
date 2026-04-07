from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LessonViewSet

router = DefaultRouter()
router.register(r'', LessonViewSet, basename='lessons')

urlpatterns = [
    path('', include(router.urls)),
]
# students endpoint GET va POST uchun maxsus URL router orqali yo'naltiriladi
