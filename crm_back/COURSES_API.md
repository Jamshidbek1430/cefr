# Course va Enrollment System API

## O'zlashtirish

Bu hujjatda Course va Enrollment system'ining barcha API endpoints va features'lari yozilgan.

## System Architecture

```
User
  ├── Student
  │   ├── Enrolls in Course
  │   │   └── Enrollment: payment tracking, debt calculation
  │   │       └── Gains access to Group (if enrolled + paid)
  │   └── Group membership (requires course enrollment)
  │       └── Can access group content
  │
  ├── Teacher
  │   └── Teaches Group
  │       └── Full access to group management
  │
  └── Admin
      └── Full access to all courses and enrollments
```

## Models

### Course Model
```python
class Course:
    - id: UUID
    - name: CharField (kurs nomi)
    - description: TextField
    - duration_months: PositiveSmallIntegerField (necha oy davomiyligi)
    - price: DecimalField (doimiy narxi)
    - discount_price: DecimalField (chegirma narxi, o'zgarishi mumkin)
    - image: ImageField
    - is_active: BooleanField
    - created_at: DateTimeField
    
    Method:
    - final_price(): discount_price yoki price qaytaradi
```

### Enrollment Model
```python
class Enrollment:
    - id: AutoField
    - user: ForeignKey(User)
    - course: ForeignKey(Course)
    - start_date: DateField (auto_now_add=True)
    - end_date: DateField (optional)
    - total_price: DecimalField (kurs narxi * duration_months)
    - paid_amount: DecimalField (default=0)
    - status: CharField (active, blocked, finished)
    
    Properties:
    - debt: total_price - paid_amount (qolgan qarzi)
    
    Unique: (user, course) - user bir kursga faqat bir marta ro'yxatdan o'tishi mumkin
```

### Group Model (Updated)
```python
class Group:
    - course: ForeignKey(Course)  # Shu guruh qaysidir kurs uchun
    - students: ManyToMany(User)  # Student'lar
    # ... boshqa field'lar
```

## API Endpoints

### 1. Kurslarni Ko'rish

#### Barcha kurslarni list
```
GET /api/courses/

Response:
[
    {
        "id": "uuid",
        "name": "Python Asoslari",
        "description": "...",
        "duration_months": 8,
        "monthly_price": "500000.00",
        "monthly_discount_price": "450000.00",
        "total_price": 4000000.0,
        "total_discount_price": 3600000.0,
        "final_price": 3600000.0,
        "image": "https://...",
        "is_active": true,
        "groups_list": [1, 2, 3]
    }
]
```

#### Kurs batafsil ma'lumotlari
```
GET /api/courses/{course_id}/

Response:
{
    "id": "uuid",
    "name": "Python Asoslari",
    "description": "...",
    "duration_months": 8,
    "monthly_price": "500000.00",
    "monthly_discount_price": "450000.00",
    "total_price": 4000000.0,
    "total_discount_price": 3600000.0,
    "final_price": 3600000.0,
    "image": "https://...",
    "is_active": true,
    "groups_list": [1, 2, 3]
}
```

### 2. Enrollment - Kurs Sotish

#### Yangi enrollment yaratish (Kurs sotish)
```
POST /api/courses/enrollment/

Request:
{
    "course_id": "uuid",
    "payment_method": "card",  // 'card' yoki 'cash'
    "payment_amount": 100000
}

Response: EnrollmentDetail (quyida ko'ring)

Status Codes:
- 201: Enrollment created successfully
- 400: Bad request (kurs topilmadi, user allaqachon ro'yxatdan o'tgan, etc)
- 403: Unauthorized
```

**Validations:**
- Course aktiv bo'lishi kerak
- User shu kursga hali ro'yxatdan o'tmagan bo'lishi kerak
- To'lov miqdori kurs narxidan oshmasligi kerak

### 3. Enrollment - Barcha Enrollmentlar

#### User'ning o'z enrollmentlarini ko'rish
```
GET /api/courses/enrollments/

Response:
[
    {
        "id": "uuid",
        "user_name": "Ahmadjon Abdullayev",
        "course_name": "Python Asoslari",
        "course_duration": 8,
        "start_date": "2026-02-05",
        "end_date": null,
        "total_price": 450000.00,
        "paid_amount": 100000.00,
        "debt": 350000.00,
        "remaining_debt": 350000.00,
        "paid_percentage": 22.22,
        "monthly_payment": 56250.00,
        "status": "active"
    }
]
```

#### Enrollment batafsil ma'lumotlari (Oy bo'yicha hisob tutuvi)
```
GET /api/courses/enrollments/{enrollment_id}/

Response:
{
    "id": "uuid",
    "user_id": "user-uuid",
    "user_name": "Ahmadjon Abdullayev",
    "course_name": "Python Asoslari",
    "course_description": "...",
    "course_duration": 8,
    "start_date": "2026-02-05",
    "end_date": null,
    "total_price": 450000.00,
    "paid_amount": 100000.00,
    "debt": 350000.00,
    "monthly_payment": 56250.00,
    "paid_percentage": 22.22,
    "status": "active",
    "monthly_breakdown": [
        {
            "month": 1,
            "month_name": "Fevral 2026",
            "due_amount": 56250.00,
            "paid_this_month": 56250.00,
            "remaining_debt": 393750.00,
            "status": "to'langan"
        },
        {
            "month": 2,
            "month_name": "Mart 2026",
            "due_amount": 56250.00,
            "paid_this_month": 43750.00,
            "remaining_debt": 350000.00,
            "status": "to'lanmagan"
        },
        // ... boshqa oylar
    ]
}
```

### 4. Enrollment - To'lov Qo'shish

#### To'lov qo'shish
```
POST /api/courses/enrollments/{enrollment_id}/payment/

Request:
{
    "payment_amount": 50000,
    "payment_method": "card"  // optional, 'card' yoki 'cash'
}

Response: EnrollmentDetail (yangilangan)

Status Codes:
- 200: Payment added successfully
- 400: Bad request (miqdor noto'g'ri, ko'p to'lovdi, etc)
- 403: Unauthorized (o'z enrollmentini o'zgartirishga ruxsat)
```

**Automatik:**
- Agar `paid_amount >= total_price` bo'lsa, status o'zgaradi: `active` → `finished`

### 5. Admin Uchun - Barcha Enrollmentlar

#### Barcha enrollmentlarni ko'rish (Admin uchun)
```
GET /api/courses/enrollments-all/

Permissions: IsAuthenticated, IsAdmin

Response: [EnrollmentSerializer, ...]
```

#### Qaysidir user'ning barcha enrollmentlarini ko'rish
```
GET /api/courses/user/{user_id}/enrollments/

Permissions: IsAuthenticated, IsAdmin

Response: [EnrollmentSerializer, ...]
```

#### Enrollment status'ni o'zgartirish (Admin uchun)
```
POST /api/courses/enrollments/{enrollment_id}/status/

Request:
{
    "status": "blocked"  // 'active', 'blocked', 'finished'
}

Response: EnrollmentDetail

Permissions: IsAuthenticated, IsAdmin
```

## Guruh Kirishida Tekshirish

### Permission: HasCourseEnrollment

```python
# apps/groups/permissions.py

class HasCourseEnrollment(BasePermission):
    """
    Student'lar guruhga kirishdan oldin, guruhdagi kurs uchun
    enrollment (ro'yxatdan o'tish) bo'lishi kerak.
    """
```

**Logic:**
1. **Teacher/Admin**: Hamma joyga ruxsat
2. **Student**: 
   - Guruhdagi course'ni tekshir
   - User shu course uchun enrollment bormi?
   - Enrollment status = 'active' bo'lishi kerak?
   - ✅ Guruhga kira oladi

### Flow

```
1. Student kurs ro'yxatidan ko'radi
   GET /api/courses/

2. Student kursni sotib oladi (enrollment yaratadi)
   POST /api/courses/enrollment/
   
3. Student guruhlarni ko'radi
   GET /api/groups/
   
4. Student guruhni tanlaydi (retrieve)
   GET /api/groups/{group_id}/
   → Tekshirish: HasCourseEnrollment permission
   → Agar enrollment borsa, guruhni ko'ra oladi
   → Enrollment yo'qsa, 403 Forbidden
```

## Serializers

### CourseSerializer
- id, name, description, duration_months
- price, discount_price, final_price (method)
- image, is_active, created_at
- groups_count (method)

### EnrollmentSerializer
- Oddiy ro'yxat uchun
- user_name, course_name, course_duration
- total_price, paid_amount, debt, remaining_debt
- paid_percentage, monthly_payment
- status

### EnrollmentCreateSerializer
- course_id, payment_method, payment_amount
- Validations: course mavjud, enrollment yo'q, amount kurs narxidan oshmasligi

### EnrollmentDetailSerializer
- Batafsil ma'lumotlar uchun
- monthly_breakdown array (har oy uchun hisob tutuvi)
- Hamma field'lar + method field'lar

## Hisob Tutuvi

### Oy bo'yicha hisob
```
Misol: Python Asoslari - 8 oy, 400,000 so'm

Monthly payment = 400,000 / 8 = 50,000 so'm

Agar user 150,000 so'm to'lasa:
- 1-oy: 50,000 (to'langan)
- 2-oy: 50,000 (to'langan)  
- 3-oy: 50,000 (to'langan)
- 4-oy: 50,000 (to'lanmagan)
- 5-oy - 8-oy: qaysidir qismi qaytadi yoki hama to'lanmagan
```

### Debt calculation
```python
debt = total_price - paid_amount

# Misol
total_price = 400,000
paid_amount = 150,000
debt = 250,000
```

## Status va Flow'lar

### Enrollment Status'lari
1. **active**: User ro'yxatdan o'tgan, to'lovlarni davom qilyapti
2. **blocked**: Admin tomonidan bloklangan (kurs to'xtatildi, muammo bor, etc)
3. **finished**: Kurs tugagan, hamma to'langan

### Transitions
```
active → blocked (admin)
active → finished (paid_amount >= total_price)
blocked → active (admin)
```

## Data Flow

### Enrollment Yaratish
```
1. Student POST /api/courses/enrollment/ yuboradi
2. EnrollmentCreateSerializer tekshiradi
3. Enrollment yaratiladi:
   - total_price = course.final_price()
   - paid_amount = request.payment_amount
   - status = 'active'
4. Response: EnrollmentDetailSerializer (batafsil)
```

### To'lov Qo'shish
```
1. Student POST /api/courses/enrollments/{id}/payment/ yuboradi
2. Validatsiyalar
3. paid_amount += payment_amount
4. Agar paid_amount >= total_price: status = 'finished'
5. Response: EnrollmentDetailSerializer (yangilangan)
```

## Errors

### 400 Bad Request
```json
{
    "detail": "Siz allaqachon shu kursga ro'yxatdan o'tgansiz."
}
```

### 403 Forbidden
```json
{
    "detail": "Siz ko'p to'lov qilyapsiz. Qolgan qarzi: 250000",
    "max_payment": 250000
}
```

## Future Features (To'qish Mumkin)

- [ ] PaymentHistory model va tracking
- [ ] Installment payment schedule (to'lovni bo'laklarga bo'lish)
- [ ] Discount codes / coupon system
- [ ] Refund policy
- [ ] Student attestation/completion tracking
- [ ] Invoice generation
