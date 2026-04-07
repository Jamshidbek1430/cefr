from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SystemHealthViewSet

router = DefaultRouter()
router.register(r'system', SystemHealthViewSet, basename='system')

urlpatterns = [
    path('', include(router.urls)),
]
