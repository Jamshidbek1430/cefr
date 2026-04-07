from rest_framework.permissions import BasePermission


class IsAdminOrReadOnly(BasePermission):
    """
    Permission: Admin yaratadi, o'zgartiradi, o'chiradi.
    Qolganlari faqat o'qiy oladi.
    """
    
    def has_permission(self, request, view):
        # Admin har doim
        if request.user and request.user.role == 'admin':
            return True
        
        # Boshqalari faqat GET uchun
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        return False


class IsTeacherOrAdminForCourse(BasePermission):
    """
    Permission: Admin va Teacher kurs ko'rishi mumkin.
    - Admin: hamma kurslarni
    - Teacher: o'ziga tegishli guruhlardagi kurslarni
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin va Teacher
        return request.user.role in ['admin', 'teacher']
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin hamma kurslarni
        if user.role == 'admin':
            return True
        
        # Teacher - o'ziga tegishli guruhlardagi kurslarni
        if user.role == 'teacher':
            # Qaysidir gruppaga shu user o'qituvchimi?
            return obj.groups.filter(teacher=user).exists()
        
        return False


class CanManageCourses(BasePermission):
    """
    Permission: Faqat Admin kurs qo'sha, o'zgartira, o'chira oladi
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Faqat Admin
        return request.user.role == 'admin'


class CanViewEnrollment(BasePermission):
    """
    Permission: 
    - User o'zining enrollmentlarini ko'rishi mumkin
    - Admin hamma enrollmentlarni ko'rishi mumkin
    """
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin hamma
        if user.role == 'admin':
            return True
        
        # User o'zini ko'rish
        if obj.user == user:
            return True
        
        return False
