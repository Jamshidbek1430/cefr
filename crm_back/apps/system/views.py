from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SystemSettings
from .serializers import SystemSettingsSerializer
from .permissions import AllowAny, HealthCheckThrottle


class SystemHealthViewSet(viewsets.ViewSet):
    """
    Sistema sog'lig'i uchun API
    Login qilmasdan murojaat qilish mumkin
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [HealthCheckThrottle]
    
    @action(detail=False, methods=['get'], url_path='health')
    def health(self, request):
        """
        GET /api/system/health/
        
        Tizim ishlayaptimi yo'qmi tekshirish
        Response:
        {
            "status": "operational",  // operational, maintenance, degraded
            "status_display": "Faol",
            "message": "Tizim normal ishlayapti",
            "updated_at": "2026-02-06T10:30:00Z"
        }
        """
        try:
            system_settings = SystemSettings.get_instance()
            serializer = SystemSettingsSerializer(system_settings)
            
            return Response({
                "success": True,
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
