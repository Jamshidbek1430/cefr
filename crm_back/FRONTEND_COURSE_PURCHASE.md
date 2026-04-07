# Frontend: Kurs Sotib Olish Oqimi

## 📋 Talabaning Kurs Sotib Olish Jarayoni

### 1️⃣ Kurs Tanlash
```
User tanlaydi: "Kurs sotib olish" yoki "Mening kurslarim"
↓
GET /api/courses/
Frontend ko'rsatadi: Barcha active kurslar ro'yxati
- Kurs nomi
- Oylik narx (monthly_price)
- Umumiy narx (total_price = monthly_price × duration_months)
- Guruhlar soni (groups_list - ID lar)
```

### 2️⃣ Guruh Tanlash
```
Student kursni tanlaganda, u kursdagi guruhlarni ko'radi:

GET /api/courses/{course_id}/  (yoki GET /api/groups/?course_id=1)
Frontend ko'rsatadi:
- O'qituvchi (teacher)
- Dars kunlari (class_days)
- Vaqtlar (start_time, end_time)
- Xona (room)
- Talabalar soni (student_count)

Student tanlaydi: "Bu guruhda o'qimoqchiman"
```

### 3️⃣ To'lov Usuli Va Miqdori
```
Frontend ko'rsatadi:
- To'lov turi: Card / Naqd (payment_method)
- To'lov miqdori inputi
  * Min: 0
  * Max: oylik narx (monthly_price)
  * Example: 100,000 so'm (oylik to'lov)

Student kiradi: "Dastlabki to'lov miqdori"
```

### 4️⃣ Saqlash / Sotib Olish
```
POST /api/courses/enrollment/

Request:
{
    "student_id": "uuid-uuid-uuid",  // Current user
    "course_id": 1,                  // Tanlangan kurs
    "group_id": 2,                   // Tanlangan guruh
    "payment_method": "card",        // "card" yoki "cash"
    "payment_amount": "100000.00"    // Dastlabki to'lov
}

Response: EnrollmentDetailSerializer
{
    "id": 9,
    "user_name": "student1 student1",
    "course_name": "Matematika rus",
    "total_price": 800000.0,
    "paid_amount": 100000.0,
    "debt": 700000.0,
    "payments_history": [
        {
            "id": 1,
            "amount": 100000.0,
            "payment_type": "card",
            "payment_type_display": "Card",
            "note": "Dastlabki to'lov - Matematika rus",
            "is_confirmed": true,
            "created_at": "2026-02-07T..."
        }
    ]
}

✅ Avtomatik:
- Enrollment yaratiladi
- Payment receipt yaratiladi va tasdiqlanadb
- Student guruhga qo'shiladi
- Debt hisoblanadi (total_price - paid_amount)
```

## 🔐 Validation / Xatolar

### Error: Student hali ro'yxatdan o'tmagan
❌ `Bu student allaqachon shu kursga ro'yxatdan o'tgan.`

**Sababi:** Student allaqachon bu kursga ro'yxatdan o'tgan
**Yechimi:** Boshqa kurs tanlash kerak

### Error: To'lov oylik narxdan oshgan
❌ `Ilk to'lov oylik narxdan (500000.00) oshishi mumkin emas.`

**Sababi:** Kiritilgan to'lov miqdori oylik narxdan katta
**Yechimi:** Oylik narxdan kam miqdor kiritish

### Error: Guruh kursga bog'lanmagan
❌ `Bu guruh ushbu kursga bog'lanmagan.`

**Sababi:** Tanlangan guruh boshqa kursga oid
**Yechimi:** Shu kurs uchun to'g'ri guruh tanlash

## 📊 Frontend UI Mockup

```
┌─────────────────────────────────────────────────────┐
│  KURS SOTIB OLISH                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. KURS TANLASH                                   │
│  ┌───────────────────────────────────────────────┐ │
│  │ Matematika Rus         ⬇️                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Oylik narx: 500,000 so'm                         │
│  Davomiyligi: 2 oy                                │
│  Umumiy narx: 1,000,000 so'm                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  2. GURUH TANLASH                                  │
│  ┌───────────────────────────────────────────────┐ │
│  │ ○ demo (Payshanba 10:00-11:00)              │ │
│  │ ○ group2 (Juma 14:00-15:00)                 │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  3. TO'LOV                                         │
│  ┌───────────────────────────────────────────────┐ │
│  │ To'lov turi: [Card ▼]                       │ │
│  │                                               │ │
│  │ To'lov miqdori: [_____________] so'm        │ │
│  │                 (max: 500,000)               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│         [SAQLASH VA SOTIB OLISH] [ORTGA]          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🔗 API Endpoints

### Get Courses (Kurslar ro'yxati)
```
GET /api/courses/
Query params:
  - page: 1
  - ordering: -created_at
```

### Get Course Detail (Kurs ma'lumotlari)
```
GET /api/courses/{course_id}/
Returns: Barcha guruhlar ID lari groups_list'da
```

### Get Groups (Guruhlar ro'yxati)
```
GET /api/groups/?course={course_id}
```

### Create Enrollment (Sotib olish)
```
POST /api/courses/enrollment/
{
    "student_id": "uuid",
    "course_id": 1,
    "group_id": 2,
    "payment_method": "card|cash",
    "payment_amount": "100000.00"
}
```

## ✅ Qo'shimcha Xususiyatlar

1. **Avtomatik Guruhga Qo'shish** ✅
   - Sotib olish vaqtida student avtomatik guruhga qo'shiladi
   - Admin/Teacher guruhga qo'shishi shart emas

2. **Duplicate Prevention** ✅
   - Bir kursni 2 marta sotib bo'lmaydi
   - Ikkinchi martta xato qaytadi

3. **Payment Receipt** ✅
   - Har bir sotib olish uchun to'lov cheki avtomatik yaratiladi
   - Payments history'da ko'rish mumkin

4. **Flexible Guruh Tanlash** ✅
   - Harbirto'lov uchun boshqa guruh tanlab bo'ladi (keyingi kurslar uchun)

## 🎯 Frontend Checklist

- [ ] GET /api/courses/ - Kurslar ro'yxati olish
- [ ] GET /api/courses/{id}/ - Kurs details + groups_list
- [ ] GET /api/groups/?course={id} - Guruhlar ro'yxati
- [ ] POST /api/courses/enrollment/ - Enrollment yaratish
- [ ] Error handling va validation xabarlar
- [ ] Loading states va success messages
- [ ] Payment receipt ko'rsatish (payments_history)
- [ ] User's enrollments page - GET /api/courses/enrollments/
