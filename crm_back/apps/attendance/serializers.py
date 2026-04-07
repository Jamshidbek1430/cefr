from rest_framework import serializers
from .models import Attendance, LiveMessage

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='user.full_name')

    class Meta:
        model = Attendance
        fields = ['id', 'user', 'student_name', 'lesson', 'attended', 'date']
        read_only_fields = ['id', 'date', 'student_name']


class LiveMessageSerializer(serializers.ModelSerializer):
    type = serializers.ReadOnlyField(source='message_type')
    sender_name = serializers.ReadOnlyField(source='sender.full_name')
    sender_username = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()
    is_teacher = serializers.SerializerMethodField()

    class Meta:
        model = LiveMessage
        fields = [
            'id',
            'lesson',
            'sender',
            'type',
            'content',
            'sender_name',
            'sender_username',
            'sender_role',
            'is_teacher',
            'is_pinned',
            'sent_at',
        ]
        read_only_fields = [
            'id',
            'sender',
            'sent_at',
            'sender_name',
            'sender_username',
            'sender_role',
            'is_teacher',
            'is_pinned',
        ]

    def get_sender_username(self, obj):
        username = obj.sender.telegram_username or obj.sender.username or ""
        return username.lstrip("@")

    def get_sender_role(self, obj):
        return (obj.sender.role or "").upper()

    def get_is_teacher(self, obj):
        return obj.sender.role in {"teacher", "admin"}
