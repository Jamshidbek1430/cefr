from rest_framework import serializers
from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "video",
            "created_at",
            "video_url",
            "teacher_name",
        ]

    def get_video_url(self, obj):
        request = self.context.get("request")
        if obj.video:
            if request:
                return request.build_absolute_uri(obj.video.url)
            return obj.video.url
        return None

    def get_teacher_name(self, obj):
        if obj.teacher:
            return str(obj.teacher)
        return "Teacher"