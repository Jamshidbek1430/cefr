from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='user.full_name')

    class Meta:
        model = Attendance
        fields = ['id', 'user', 'student_name', 'lesson', 'attended', 'date']
        read_only_fields = ['id', 'date', 'student_name']

