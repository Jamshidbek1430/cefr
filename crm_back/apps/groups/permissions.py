from rest_framework.permissions import BasePermission
from apps.courses.models import Enrollment


class HasCourseEnrollment(BasePermission):
    """
    Permission: User shu guruhga kirishdan oldin, guruhdagi kurs uchun 
    enrollment (ro'yxatdan o'tish) bo'lishi kerak.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        obj - Group instansi
        Tekshirish: User shu grup uchun course'ni sotib olganmi?
        """
        # Teacher va Admin'ga hamma joyga ruxsat
        if request.user.role in ['teacher', 'admin']:
            return True
        
        # Student uchun tekshirish
        if request.user.role == 'student':
            # Group'dagi course'ni olish
            if hasattr(obj, 'course') and obj.course:
                # User shu course uchun enrollment bormi?
                enrollment = Enrollment.objects.filter(
                    user=request.user,
                    course=obj.course,
                    status='active'
                ).exists()
                return enrollment
        
        return False
