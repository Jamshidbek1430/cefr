from rest_framework import serializers

from .models import Homework, HomeworkSubmission, LibraryItem, Submission, Video


class HomeworkSerializer(serializers.ModelSerializer):
    submitted = serializers.SerializerMethodField()
    answer = serializers.SerializerMethodField()

    class Meta:
        model = Homework
        fields = [
            "id",
            "title",
            "instructions",
            "description",
            "due_date",
            "lesson",
            "video",
            "submitted",
            "answer",
            "created_at",
            "updated_at",
        ]

    def get_submitted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        submission = obj.homework_submissions.filter(student=request.user, is_submitted=True).first()
        return bool(submission)

    def get_answer(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return ""
        submission = obj.homework_submissions.filter(student=request.user).first()
        return submission.answer if submission else ""


class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="user.full_name")

    class Meta:
        model = Submission
        fields = ["id", "user", "student_name", "homework", "submitted", "text", "created_at", "updated_at"]


class HomeworkSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.full_name")

    class Meta:
        model = HomeworkSubmission
        fields = [
            "id",
            "homework",
            "student",
            "student_name",
            "answer",
            "submitted_at",
            "is_submitted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "student", "student_name", "submitted_at", "created_at", "updated_at"]


class VideoListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    upload_date = serializers.ReadOnlyField(source="uploaded_at")
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ["id", "title", "video_url", "teacher_name", "upload_date"]

    def get_teacher_name(self, obj):
        if obj.uploaded_by and obj.uploaded_by.full_name:
            return obj.uploaded_by.full_name
        if obj.uploaded_by and obj.uploaded_by.telegram_username:
            return obj.uploaded_by.telegram_username
        return "Teacher"

    def get_video_url(self, obj):
        request = self.context.get("request")
        if obj.video and obj.video.name:
            if request:
                return request.build_absolute_uri(obj.video.url)
            return obj.video.url
        # Fall back to stored URL field
        return obj.video_url or obj.url or ""


class VideoDetailSerializer(VideoListSerializer):
    homework = serializers.SerializerMethodField()

    class Meta(VideoListSerializer.Meta):
        fields = VideoListSerializer.Meta.fields + ["homework"]

    def get_homework(self, obj):
        homework = obj.homework or obj.linked_homeworks.first()
        if not homework:
            return None
        return {
            "id": homework.id,
            "title": homework.title,
            "instructions": homework.instructions or homework.description,
            "due_date": homework.due_date.isoformat() if homework.due_date else None,
        }


class LibraryItemSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = LibraryItem
        fields = ["id", "title", "file", "file_url", "file_type", "type", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at", "file_url"]
        extra_kwargs = {"file": {"write_only": True, "required": False}}

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
