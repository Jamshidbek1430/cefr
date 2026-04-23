from rest_framework import serializers

from .models import Homework, HomeworkSubmission, LibraryItem, Submission, Video


class HomeworkSerializer(serializers.ModelSerializer):
    submitted = serializers.SerializerMethodField()
    answer = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    student_ids = serializers.ListField(child=serializers.UUIDField(), write_only=True, required=False)
    students_count = serializers.SerializerMethodField()
    submissions_count = serializers.SerializerMethodField()

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
            "teacher",
            "teacher_name",
            "subject",
            "student_ids",
            "students_count",
            "submissions_count",
            "submitted",
            "answer",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["teacher", "teacher_name", "students_count", "submissions_count"]

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
    
    def get_teacher_name(self, obj):
        if obj.teacher:
            return obj.teacher.full_name or obj.teacher.username or "Teacher"
        return "Teacher"
    
    def get_students_count(self, obj):
        return obj.students.count()
    
    def get_submissions_count(self, obj):
        return obj.homework_submissions.filter(is_submitted=True).count()

    def create(self, validated_data):
        student_ids = validated_data.pop('student_ids', [])
        homework = Homework.objects.create(**validated_data)
        if student_ids:
            homework.students.set(student_ids)
        return homework

    def update(self, instance, validated_data):
        student_ids = validated_data.pop('student_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if student_ids is not None:
            instance.students.set(student_ids)
        return instance


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
    file = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = Video
        fields = ["id", "title", "video_url", "teacher_name", "upload_date", "file"]
        extra_kwargs = {
            'video': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        # Handle 'file' field and map it to 'video'
        file_data = validated_data.pop('file', None)
        if file_data:
            validated_data['video'] = file_data
        return super().create(validated_data)

    def get_teacher_name(self, obj):
        if obj.uploaded_by and obj.uploaded_by.full_name:
            return obj.uploaded_by.full_name
        if obj.uploaded_by and obj.uploaded_by.telegram_username:
            return obj.uploaded_by.telegram_username
        return "Teacher"

    def get_video_url(self, obj):
        if obj.video and obj.video.name:
            # Always return public URL
            return f"https://arturturkce.online{obj.video.url}"
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
        if obj.file_url:
            return obj.file_url
        if obj.file and obj.file.name:
            relative_url = obj.file.url
            if relative_url.startswith("http"):
                return relative_url
            # Always return public URL
            return f"https://arturturkce.online{relative_url}"
        return None

