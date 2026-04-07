# Universe CRM API Guide

Base prefix: `/api/`

Auth: JWT Bearer token
- Login: `POST /api/auth/login/`
- Send header: `Authorization: Bearer <access_token>`
- Logout (token blacklist): `POST /api/auth/logout/`

Docs/UI:
- Swagger: `/swagger/`
- ReDoc: `/redoc/`

## 1) Authentication

### `POST /api/auth/login/`
Login with credentials (phone/password based on serializer).

Response:
- `refresh`
- `access`
- `user`

### `POST /api/auth/logout/`
Blacklists refresh token.
Body:
```json
{ "refresh": "<refresh_token>" }
```

## 2) Users (Admin panel APIs)
Prefix: `/api/users/`

- `GET /api/users/` -> list users (admin)
- `GET /api/users/admins/` -> list admins (authenticated)
- `POST /api/users/add/` -> create user (admin)
- `GET /api/users/check/?uuid=<uuid>` -> user check (admin)
- `GET /api/users/export/` -> CSV export (admin role)
- `GET /api/users/export/template/` -> XLSX template (admin role)
- `POST /api/users/import/` -> XLSX import (admin role)
- `GET|PUT|PATCH|DELETE /api/users/<user_uuid>/` -> user detail/update/delete (admin)
- `POST /api/users/<user_uuid>/change-password/` -> admin or self (student rules in view)

## 3) Profile
Prefix: `/api/profile/`

- `GET|PUT|PATCH /api/profile/me/`
- `POST /api/profile/change-password/`
- `GET /api/profile/statistics/`
- `GET /api/profile/attendance/?year=YYYY&month=MM&group_id=<optional>`
- `GET /api/profile/attendance/analytics/?year=YYYY&month=MM`

## 4) Groups
Prefix: `/api/groups/`

Standard DRF routes:
- `GET /api/groups/`
- `POST /api/groups/` (admin)
- `GET /api/groups/<id>/`
- `PUT|PATCH /api/groups/<id>/` (admin or group teacher)
- `DELETE /api/groups/<id>/` (admin)

Custom actions:
- `GET|POST|DELETE /api/groups/<id>/students/`
- `POST /api/groups/<id>/transfer-student/`
- `GET /api/groups/<id>/available-students/` (admin)

Notes:
- Student listing supports `?search=` and pagination.
- Add-student checks course enrollment before attaching to group.

## 5) Rooms
Prefix: `/api/rooms/`

Standard DRF routes for active rooms:
- `GET /api/rooms/`, `GET /api/rooms/<id>/`
- `POST|PUT|PATCH|DELETE` are admin-only by runtime checks.

## 6) Attendance
Prefix: `/api/attendance/`

- `GET /api/attendance/?group_id=<id>&date=YYYY-MM-DD`
- `POST /api/attendance/` (bulk create)
- `GET /api/attendance/group/<group_id>/<date>/`

Bulk create body:
```json
{
  "group_id": 1,
  "date": "2026-03-06",
  "students": [
    {"id": "<student_uuid>", "status": "present", "coins": 50},
    {"id": "<student_uuid>", "status": "excuse", "reason": "Sick", "coins": 0}
  ]
}
```

Recent upgrade:
- Attendance write is now limited to `admin` or the assigned group `teacher`.
- Attendance can now be created only for users with `student` role who are members of that group.

## 7) Courses & Enrollments
Prefix: `/api/courses/`

Courses:
- `GET /api/courses/`
- `POST /api/courses/create/` (admin)
- `GET|PUT|PATCH|DELETE /api/courses/<id>/`

Enrollments:
- `POST /api/courses/enrollment/` (admin; sells/enrolls student)
- `GET /api/courses/enrollments/` (my enrollments)
- `GET /api/courses/enrollments/<uuid:id>/` (my enrollment detail)
- `POST /api/courses/enrollments/<uuid:id>/payment/` (owner)
- `GET /api/courses/enrollments-all/` (admin)
- `POST /api/courses/enrollments/<uuid:id>/status/` (admin)
- `GET /api/courses/user/<uuid:user_id>/enrollments/` (admin)

## 8) Chat (internal messages between users)
Prefix: `/api/message/`

- `GET /api/message/conversations/`
- `GET /api/message/messages/?user_id=<uuid>`
- `GET /api/message/unread-count/`
- `POST /api/message/mark-read/`
- `POST /api/message/add/`
- `GET /api/message/debug-conversations/`

WebSocket route:
- `/ws/chat/<user_id>/?token=<JWT_ACCESS_TOKEN>`

## 9) Broadcast/SMS Messages
Prefix: `/api/messages/`

Admin side (owner-scoped ModelViewSet):
- `GET|POST /api/messages/`
- `GET|PUT|PATCH|DELETE /api/messages/<id>/`

Android-device side:
- `GET /api/messages/ms/user_message/?status=<optional>`
- `PATCH /api/messages/ms/user_message/<id>/`

## 10) News
Prefix: `/api/news/`

Standard DRF routes:
- `GET /api/news/`, `GET /api/news/<id>/`
- `POST|PUT|PATCH|DELETE` admin role only
- `POST /api/news/<id>/update_status/` (admin role enforced in view)

## 11) Certificates
Prefix: `/api/certificates/`

Standard DRF routes:
- `GET /api/certificates/` (admin sees all, others only own)
- `GET /api/certificates/<id>/`
- `POST|PUT|PATCH|DELETE` admin role only

## 12) Notifications
Prefix: `/api/notifications/`

- `GET /api/notifications/`
- `POST /api/notifications/mark-read/`
Body:
```json
{ "notification_id": "<uuid>" }
```

## 13) System Health (public)
Prefix: `/api/system/`

- `GET /api/system/health/`

Response wrapper:
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "status_display": "Faol",
    "message": "Tizim normal ishlayapti",
    "updated_at": "..."
  }
}
```

## Notes for Frontend Team
- Most endpoints expect trailing slash.
- API permission is role-heavy (`admin`, `teacher`, `student`), so frontend should branch by `user.role` from login response.
- Keep refresh token securely and rotate access token on expiry.
