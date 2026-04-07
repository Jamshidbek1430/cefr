# To'lov Cheki va Enrollment Xususiyatlari

## 📋 Xususiyat Tavsifi

Admin studentga kurs sotib olayotganda (Enrollment yaratganda), sistema avtomatik ravishda **to'lov cheki (Payment Receipt)** yaratib saqlaydi.

## 🔧 Qanday Ishlaydi?

### 1️⃣ Admin Enrollment Yaratadi
```
POST /api/courses/enrollment/

{
    "student_id": "uuid",
    "course_id": 1,
    "payment_method": "card",      // 'card' yoki 'cash'
    "payment_amount": 150000
}
```

### 2️⃣ Avtomatik Jarayonlar
```
a) Enrollment yaratiladi
   ├─ student: Tanlangan student
   ├─ course: Tanlangan kurs
   ├─ total_price: oylik_narx × oylar_soni
   └─ paid_amount: Kiritilgan to'lov miqdori

b) Payment cheki yaratiladi va tasdiqlanadb
   ├─ enrollment: Yuqoridagi enrollment
   ├─ amount: Kiritilgan to'lov miqdori
   ├─ payment_type: card/cash
   ├─ note: "Dastlabki to'lov - [Kurs nomi]"
   └─ is_confirmed: TRUE (avtomatik tasdiqlangan)
```

### 3️⃣ API Response (Enrollment Detail)
```json
{
    "id": 6,
    "user_id": "uuid",
    "user_name": "student1 student1",
    "course_name": "Matematika rus",
    "course_description": "jnn",
    "course_duration": 2,
    "start_date": "2026-02-07",
    "end_date": null,
    "total_price": 800000.0,
    "paid_amount": 150000.0,
    "debt": 650000.0,
    "monthly_payment": 400000.0,
    "paid_percentage": 18.75,
    "status": "active",
    "payments_history": [
        {
            "id": 1,
            "amount": 150000.0,
            "payment_type": "card",
            "payment_type_display": "Card",
            "note": "Dastlabki to'lov - Matematika rus",
            "is_confirmed": true,
            "created_at": "2026-02-07T07:25:01.809965+00:00"
        }
    ],
    "monthly_breakdown": [...]
}
```

## 💾 Database Models

### Payment Model
```python
class Payment(models.Model):
    enrollment = ForeignKey(Enrollment)  # Enrollment bilan bog'lanish
    amount = DecimalField                 # To'lov miqdori
    payment_type = CharField              # 'card' yoki 'cash'
    note = CharField                      # Izoh (masalan: karta oxirgi 4 raqam)
    is_confirmed = BooleanField          # Tasdiqlangan yoki yo'q
    created_at = DateTimeField            # Yaratilgan sana
```

### Enrollment Model
```python
class Enrollment(models.Model):
    user = ForeignKey(User)              # Student
    course = ForeignKey(Course)          # Kurs
    total_price = DecimalField           # Umumiy kurs narxi
    paid_amount = DecimalField           # To'langan miqdor
    payments = RelatedManager            # Barcha to'lovlar (Payment.objects)
    
    @property
    def debt(self):
        return total_price - paid_amount  # Qolgan qarzi
```

## 🔗 Serializers

### EnrollmentCreateSerializer
- Enrollment yaratish uchun
- Avtomatik Payment record yaratadi va tasdiqlaydi
- Request fields: student_id, course_id, payment_method, payment_amount

### EnrollmentDetailSerializer
- Enrollment batafsil ma'lumotlarini qaytaradi
- **NEW**: `payments_history` - barcha to'lovlar
- **NEW**: `monthly_breakdown` - oy bo'yicha hisob tutuvi

### PaymentSerializer
- Yagona to'lov chekining ma'lumotlari
- Fields: id, enrollment_id, student_name, course_name, amount, payment_type, note, is_confirmed, created_at

## 📊 Jadval

| Field | Qiymati | Tavsif |
|-------|---------|--------|
| `student_id` | UUID | Studentning ID'si |
| `course_id` | Integer | Kurs ID'si |
| `payment_method` | 'card'/'cash' | To'lov usuli |
| `payment_amount` | Decimal | To'lov miqdori (oylik narxdan oshmasligi kerak) |
| `total_price` | Calculated | oylik_narx × duration_months |
| `paid_amount` | Cumulative | Barcha to'lovlarning yig'indisi |
| `debt` | Calculated | total_price - paid_amount |

## ✅ Namuna

### Request
```bash
POST /api/courses/enrollment/
Content-Type: application/json

{
    "student_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "course_id": 4,
    "payment_method": "card",
    "payment_amount": 150000
}
```

### Response (201 Created)
```json
{
    "id": 6,
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_name": "student1 student1",
    "course_name": "Red Busters",
    "total_price": 300000.0,
    "paid_amount": 150000.0,
    "debt": 150000.0,
    "payments_history": [
        {
            "id": 1,
            "amount": 150000.0,
            "payment_type": "card",
            "payment_type_display": "Card",
            "note": "Dastlabki to'lov - Red Busters",
            "is_confirmed": true,
            "created_at": "2026-02-07T07:25:01.809965+00:00"
        }
    ]
}
```

## 🎯 Faydaliliklari

✅ **Avtomatik chek yaratiladi** - admin qo'shimcha ish qilish shart emas
✅ **To'lov tarixchasi saqlanadi** - barcha to'lovlar ichida bo'ladi
✅ **Sanoat standartiga mos** - invoice/receipt xususiyatlari mavjud
✅ **Auditi bo'ladi** - har bir to'lov vaqti va usuli bilan saqlanadi

## 📝 Eslatma

- Dastlabki to'lov oylik narxdan oshishi mumkin emas
- Har bir to'lov avtomatik tasdiqlanadiEasy
- To'lovlar enrollment bilan bog'langan bo'lib, o'chirish yoki o'zgartirilganda to'lovlar ham o'zgaradi
