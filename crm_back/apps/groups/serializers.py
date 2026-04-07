from rest_framework import serializers
from .models import Lesson
from datetime import datetime

class LessonSerializer(serializers.ModelSerializer):
    teacher_name = serializers.ReadOnlyField(source='teacher.full_name')
    datetime = serializers.SerializerMethodField()
    recording_url = serializers.ReadOnlyField(source='recorded_video_url')

    def get_datetime(self, obj):
        return f"{datetime.combine(obj.date, obj.time).isoformat()}+05:00"

    class Meta:
        model = Lesson
        fields = [
            'id',
            'title',
            'date',
            'time',
            'datetime',
            'teacher',
            'teacher_name',
            'recorded_video_url',
            'recording_url',
            'youtube_embed_url',
            'twitch_channel',
            'hls_url',
            'is_live',
            'status',
            'video_uploaded',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'teacher_name']
