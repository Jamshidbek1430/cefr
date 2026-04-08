# Courses System - Implementation Summary

## ✅ Completed Tasks

### 1. Models (Already Existed)
- ✅ **Course model**: name, description, duration_months, price, discount_price
- ✅ **Enrollment model**: user, course, total_price, paid_amount, status
- ✅ **Group-Course relationship**: Group.course (FK to Course)

### 2. Serializers Created
- ✅ **CourseSerializer**: List/detail view with final_price and groups_count
- ✅ **EnrollmentSerializer**: Simple enrollment list
- ✅ **EnrollmentCreateSerializer**: Create enrollment with validations
- ✅ **EnrollmentDetailSerializer**: Detailed view with monthly breakdown

**Files:**
- `/apps/courses/serializers.py` ✅

### 3. Views Created
- ✅ **CourseListView**: GET /api/courses/
- ✅ **CourseDetailView**: GET /api/courses/{id}/
- ✅ **EnrollmentCreateView**: POST /api/courses/enrollment/
- ✅ **EnrollmentListView**: GET /api/courses/enrollments/
- ✅ **EnrollmentDetailView**: GET /api/courses/enrollments/{id}/
- ✅ **EnrollmentPaymentView**: POST /api/courses/enrollments/{id}/payment/
- ✅ **EnrollmentListAllView**: GET /api/courses/enrollments-all/ (Admin)
- ✅ **EnrollmentStatusView**: POST /api/courses/enrollments/{id}/status/ (Admin)
- ✅ **UserEnrollmentsView**: GET /api/courses/user/{user_id}/enrollments/ (Admin)

**Files:**
- `/apps/courses/views.py` ✅

### 4. URLs Configuration
- ✅ `/apps/courses/urls.py` - Barcha endpoints
- ✅ `/apps/common/urls.py` - 'courses/' path qo'shildi

**Files:**
- `/apps/courses/urls.py` ✅
- `/apps/common/urls.py` ✅

### 5. Group Kirishida Course Enrollment Check
- ✅ **HasCourseEnrollment permission**: Student'lar guruha kirish uchun kurs enrollment kerak
- ✅ **GroupsViewSet updated**: retrieve action'da permission qo'shildi

**Files:**
- `/apps/groups/permissions.py` ✅
- `/apps/groups/views.py` ✅

### 6. Migrations
- ✅ `/apps/chat/migrations/0002_update_message_model.py` - Message model refactor
- ✅ `/apps/courses/migrations/` - Already exists, no action needed

## API Endpoints

### Public (Authenticated)
```
GET  /api/courses/                          - Kurslar ro'yxati
GET  /api/courses/{id}/                     - Kurs batafsil
POST /api/courses/enrollment/               - Kurs sotish (enrollment yaratish)
GET  /api/courses/enrollments/              - User enrollmentlari
GET  /api/courses/enrollments/{id}/         - Enrollment batafsil (oy bo'yicha hisob)
POST /api/courses/enrollments/{id}/payment/ - To'lov qo'shish
```

### Admin Only
```
GET  /api/courses/enrollments-all/                      - Barcha enrollmentlar
POST /api/courses/enrollments/{id}/status/              - Status o'zgartirish
GET  /api/courses/user/{user_id}/enrollments/           - User enrollmentlari
```

## Features

### ✅ Course Management
- [x] Multiple courses with different durations
- [x] Price and discount price tracking
- [x] Course-to-group relationship
- [x] Active/inactive status

### ✅ Enrollment System
- [x] User can enroll in course
- [x] Prevent duplicate enrollment
- [x] Track total_price (course_price) and paid_amount
- [x] Calculate debt
- [x] Status tracking (active/blocked/finished)

### ✅ Payment Tracking
- [x] Initial payment on enrollment
- [x] Additional payments
- [x] Prevent overpayment
- [x] Auto-finish enrollment when fully paid
- [x] Monthly breakdown calculation

### ✅ Monthly Payment Breakdown
For each month:
- Due amount for that month
- Amount paid this month
- Remaining debt
- Status (to'langan/to'lanmagan)

**Example Response:**
```json
"monthly_breakdown": [
    {
        "month": 1,
        "month_name": "Fevral 2026",
        "due_amount": 56250.00,
        "paid_this_month": 56250.00,
        "remaining_debt": 393750.00,
        "status": "to'langan"
    }
]
```

### ✅ Group Access Control
- [x] Student must have active enrollment to access group
- [x] Teacher/Admin always have access
- [x] HasCourseEnrollment permission on retrieve

## Testing

### Create Course (Admin in Django admin)
```python
Course.objects.create(
    name="Python Asoslari",
    description="...",
    duration_months=8,
    price=400000,
    discount_price=350000,
    is_active=True
)
```

### Enroll Student
```bash
POST /api/courses/enrollment/
{
    "course_id": "uuid",
    "payment_method": "card",
    "payment_amount": 100000
}
```

### Add Payment
```bash
POST /api/courses/enrollments/{enrollment_id}/payment/
{
    "payment_amount": 50000,
    "payment_method": "card"
}
```

### View Breakdown
```bash
GET /api/courses/enrollments/{enrollment_id}/
# Returns monthly_breakdown
```

## Technical Details

### Validations
- ✅ Course must exist and be active
- ✅ User can't enroll twice in same course
- ✅ Payment amount can't exceed course price
- ✅ Payment amount can't exceed remaining debt

### Automatic Fields
- ✅ start_date: auto_now_add on enrollment
- ✅ total_price: set from course.final_price()
- ✅ Status transitions: active → finished (auto on full payment)
- ✅ Debt calculation: total_price - paid_amount

### Relationships
```
User → Enrollment → Course
↓
Group.course = Course
↓
User can access Group only if:
  - User enrolled in Group.course
  - Enrollment.status = 'active'
  - OR User.role in ['teacher', 'admin']
```

## Files Modified/Created

### Created
- [x] `/apps/courses/serializers.py` - All serializers
- [x] `/apps/courses/views.py` - All views
- [x] `/apps/courses/urls.py` - URL configuration
- [x] `/apps/groups/permissions.py` - HasCourseEnrollment permission
- [x] `/apps/chat/migrations/0002_update_message_model.py` - Message model migration
- [x] `COURSES_API.md` - Complete API documentation

### Modified
- [x] `/apps/courses/models.py` - Already had Enrollment and Course
- [x] `/apps/common/urls.py` - Added courses path
- [x] `/apps/groups/views.py` - Added HasCourseEnrollment permission
- [x] `/apps/groups/models.py` - Already had course FK

## Next Steps (Optional)

1. **PaymentHistory Model** - Track individual payments with method/date
2. **Installment Plans** - Allow splitting payments across months
3. **Refund Policy** - Handle course cancellations
4. **Invoice Generation** - Auto-generate invoices
5. **Email Notifications** - Notify students of debt
6. **SMS Payment Reminders** - Remind students before payment due

## Syntax Validation

All files have been syntax checked:
- ✅ `/apps/courses/serializers.py`
- ✅ `/apps/courses/views.py`
- ✅ `/apps/courses/urls.py`
- ✅ `/apps/groups/permissions.py`
- ✅ `/apps/groups/views.py`
- ✅ `/apps/chat/migrations/0002_update_message_model.py`

## Quick Reference

### Complete Enrollment Flow

```
1. Student sees available courses
   GET /api/courses/

2. Student chooses course and enrolls with initial payment
   POST /api/courses/enrollment/
   Body: { course_id, payment_amount, payment_method }
   
3. System creates Enrollment with:
   - total_price = course.final_price()
   - paid_amount = payment_amount
   - status = 'active'
   
4. Student can now access groups of that course
   GET /api/groups/ (filtered to their courses)
   GET /api/groups/{id}/ (HasCourseEnrollment check passes)
   
5. Student can make additional payments
   POST /api/courses/enrollments/{id}/payment/
   
6. Student can track their debt
   GET /api/courses/enrollments/{id}/
   → Shows monthly breakdown
   
7. When paid_amount >= total_price
   - Enrollment.status changes to 'finished'
   - Payment is no longer accepted
```

## Debt Calculation Example

Course: Python Asoslari (8 months, 400,000 UZS)
- Monthly rate: 400,000 / 8 = 50,000 per month

Student payments:
- Day 1: Enrolls, pays 100,000
- Week 2: Pays 50,000
- Month 1: Total paid = 150,000
  - Month 1 due: 50,000 → PAID
  - Month 2 due: 50,000 → PARTIALLY PAID (50,000)
  - Month 3-8: Still due (100,000)
  
Remaining debt: 400,000 - 150,000 = 250,000
