from django.http import JsonResponse
from .models import SystemSettings


class SystemMaintenanceMiddleware:
    """
    Synchronous Middleware: Har API so'rovida tizim holatini tekshiradi

    Agar maintenance mode'da bo'lsa:
    - Django admin panel ishlaydi (/superadmin-cyber-topdingku/*)
    - Health check API ishlaydi (/api/system/health/)
    - Barcha boshqa API'lar 503 Service Unavailable qaytaradi

    Agar operational bo'lsa:
    - Barcha yo'lar normal ishlaydi
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # System settings olish
        system_settings = SystemSettings.get_instance()

        # --- MAINTENANCE MODE ---
        if system_settings.status == 'maintenance':
            # Django admin panel ishlaydi
            if request.path.startswith('/superadmin-cyber-topdingku/'):
                return self.get_response(request)
            
            # Health check API ishlaydi
            if request.path == '/api/system/health/':
                return self.get_response(request)

            # Boshqa barcha API'larga 503 qaytarish
            return JsonResponse({
                'success': False,
                'error': "Tizim ta'mirlash jarayonida",
                'message': system_settings.message,
                'status': system_settings.status,
                'updated_at': system_settings.updated_at.isoformat(),
            }, status=503)

        # --- DEGRADED MODE ---
        if system_settings.status == 'degraded':
            response = self.get_response(request)
            response['X-System-Status'] = 'degraded'
            response['X-System-Message'] = system_settings.message
            return response

        # --- OPERATIONAL MODE ---
        return self.get_response(request)
