from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from apps.attendance.models import Attendance
from apps.groups.models import Group
from apps.rooms.models import Room
from apps.users.models import User


class AttendanceCreatePermissionTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            phone_number="+998900000001",
            password="pass12345",
            role="admin",
        )
        self.teacher = User.objects.create_user(
            username="teacher1",
            phone_number="+998900000002",
            password="pass12345",
            role="teacher",
        )
        self.other_teacher = User.objects.create_user(
            username="teacher2",
            phone_number="+998900000003",
            password="pass12345",
            role="teacher",
        )
        self.student = User.objects.create_user(
            username="student1",
            phone_number="+998900000004",
            password="pass12345",
            role="student",
        )
        self.outsider_student = User.objects.create_user(
            username="student2",
            phone_number="+998900000005",
            password="pass12345",
            role="student",
        )

        self.room = Room.objects.create(name="101", floor=1)
        self.group = Group.objects.create(
            name="G-1",
            start_time="09:00",
            end_time="10:00",
            teacher=self.teacher,
            room=self.room,
        )
        self.group.students.add(self.student)
        self.url = "/api/attendance/"
        self.target_date = date.today() + timedelta(days=1)

    def test_student_cannot_create_attendance(self):
        self.client.force_authenticate(self.student)
        payload = {
            "group_id": self.group.id,
            "date": self.target_date.isoformat(),
            "students": [
                {"id": str(self.student.id), "status": "present", "coins": 10},
            ],
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_other_teacher_cannot_create_attendance(self):
        self.client.force_authenticate(self.other_teacher)
        payload = {
            "group_id": self.group.id,
            "date": self.target_date.isoformat(),
            "students": [
                {"id": str(self.student.id), "status": "present", "coins": 10},
            ],
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_group_teacher_can_create_attendance(self):
        self.client.force_authenticate(self.teacher)
        payload = {
            "group_id": self.group.id,
            "date": self.target_date.isoformat(),
            "students": [
                {"id": str(self.student.id), "status": "present", "coins": 10},
            ],
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.count(), 1)

    def test_admin_can_create_attendance(self):
        self.client.force_authenticate(self.admin)
        payload = {
            "group_id": self.group.id,
            "date": self.target_date.isoformat(),
            "students": [
                {"id": str(self.student.id), "status": "present", "coins": 10},
            ],
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.count(), 1)

    def test_cannot_create_attendance_for_student_not_in_group(self):
        self.client.force_authenticate(self.teacher)
        payload = {
            "group_id": self.group.id,
            "date": self.target_date.isoformat(),
            "students": [
                {"id": str(self.outsider_student.id), "status": "present", "coins": 10},
            ],
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["success"]), 0)
        self.assertEqual(len(response.data["errors"]), 1)
        self.assertEqual(Attendance.objects.count(), 0)
