from rest_framework.permissions import BasePermission
from rest_framework.throttling import BaseThrottle
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta, datetime


class HealthCheckThrottle(BaseThrottle):
    """
    Health check API uchun advanced rate limiting:
    - Oddiy: Har 1 soniyada 1 marta so'rov ruxsat
    - Blokirovka: 1 soniya ichida 3 marta so'rov bo'lsa → 10 soniyaga qulfla
    """
    
    def allow_request(self, request, view):
        """
        1 soniya ichida 3 marta so'rov bo'lsa, 10 soniyaga block qiladi
        """
        # IP manzilini olish
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        block_key = f'health_check_blocked_{ip}'
        rate_key = f'health_check_rate_{ip}'
        
        # Agar IP bloklanib bo'lsa, ruxsat bermaydi
        if cache.get(block_key):
            return False
        
        # IP'ning so'rovlar tarixchasi
        request_history = cache.get(rate_key, [])
        now = datetime.now().timestamp()
        
        # 1 soniyadan ko'nada bo'lgan so'rovlarni saqlash
        request_history = [req_time for req_time in request_history 
                          if (now - req_time) < 1.0]
        
        # Yangi so'rovni qo'shish
        request_history.append(now)
        
        # Agar 1 soniya ichida 3 ta yoki ko'p so'rov bo'lsa
        if len(request_history) >= 3:
            # 10 soniyaga block qilish
            cache.set(block_key, True, 10)
            return False
        
        # Tarixchani 1 soniyaga saqlash
        cache.set(rate_key, request_history, 1)
        
        return True
    
    def throttle_success(self, request, view):
        """So'rovdan keyin chaqiriladi"""
        return True
    
    def throttle_failure(self, request, view):
        """Rate limit qo'llanilganda chaqiriladi"""
        return False


class AllowAny(BasePermission):
    """
    Barcha foydalanuvchilarga ruxsat (login qilmagan ham)
    """
    
    def has_permission(self, request, view):
        return True

