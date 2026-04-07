# System Health Check API & Maintenance Mode

## Umumiy ma'lumot

Bu API tizimning ishlaydimi yoki tamir jarayonidami tekshirishning mohiyatini bajaradigan public endpoint.

**Asosiy xususiyatlari:**
- **Login talab qilmaydi** - Barcha foydalanuvchilar (tizmga kirmaganlar ham) foydalanishi mumkin
- **Advanced Rate Limiting** - Smart surge protection:
  - Oddiy: Har 1 soniyada 1 marta so'rov normal
  - Surge: 1 soniya ichida 3+ marta → 10 soniyaga BLOCK
- **GET request** - Faqat GET so'rovlar qabul qilinadi
- **Admin boshqaruvi** - Django admin panelidan tizim holati o'zgartiriladi
- **Middleware** - Har API chaqirilinganida tizim holatini tekshiradi

---

## Maintenance Mode Tizimi

### Ishlanish Logikasi

1. **Operational** (Faol) - Barcha yo'lar normal ishlaydi
2. **Maintenance** (Tamir) - Faqat quyidagilar ishlaydi:
   - Django admin panel (`/superadmin-cyber-topdingku/*`)
   - Health check API (`/api/system/health/`)
   - Boshqa barcha yo'lar **503 Service Unavailable** qaytaradi
3. **Degraded** (Qisman faol) - Barcha yo'lar ishlaydi, lekin response'larga warning header qo'shiladi

### Middleware Ishlanishi

Har so'rovda **middleware** darhol tekshiradi:

```
User so'rov → Middleware tekshirish → Status kaliti
                                    ↓
                        ┌───────────┼───────────┐
                        ↓           ↓           ↓
                   operational  maintenance  degraded
                        ↓           ↓           ↓
                    Ishlaydi    Admin+Health  Ishlaydi
                               + 503 others   + Warning
```

**Maintenance Mode'da:**
- ✅ `/superadmin-cyber-topdingku/` - Django admin
- ✅ `/api/system/health/` - System status
- ❌ `/api/courses/`, `/api/users/`, `/api/*` - 503 qaytaradi
- ❌ `/swagger/`, `/redoc/` - 503 qaytaradi


---

## API Endpoint

### Health Check
```
GET /api/system/health/
```

**Javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "status_display": "Faol",
    "message": "Tizim normal ishlayapti",
    "updated_at": "2026-02-06T10:30:00Z"
  }
}
```

---

## Status Turлари

| Status | Display | Ma'nosi |
|--------|---------|---------|
| `operational` | Faol | Tizim normal ishlayapti - barcha yo'lar ishlaydi |
| `maintenance` | Tamir | Tamir jarayoni ketmoqda - faqat admin va health check ishlaydi, boshqa barcha 503 qaytaradi |
| `degraded` | Qisman faol | Ba'zi xizmatlar ishlammayapti - barcha yo'lar ishlaydi, lekin warning beradi |

---

## Maintenance Mode Javoblari

### Operational - Normal Ishlash
**Request:** Istalgan yo'l/API
```bash
GET /api/courses/
```

**Javob (200 OK):**
```json
{
  "count": 5,
  "results": [...]
}
```

---

### Maintenance - Admin Panel Ishlaydi
**Request:** Admin panelga kirish
```bash
GET /superadmin-cyber-topdingku/
```

**Javob (200 OK):**
```html
<!-- Django admin paneli normal ishlaydi -->
<!-- Admin sozlamalarni o'zgartira oladi -->
```

---

### Maintenance - Health Check Ishlaydi
**Request:** System status tekshirish
```bash
GET /api/system/health/
```

**Javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "maintenance",
    "status_display": "Tamir",
    "message": "Tamir ishlari: 2026-02-06 22:00 - 02:00",
    "updated_at": "2026-02-06T20:00:00Z"
  }
}
```

---

### Maintenance - Boshqa API'lar Ishlamaydi
**Request:** Boshqa istalgan API
```bash
GET /api/courses/
GET /api/users/
GET /api/chat/
# Va hokazo...
```

**Javob (503 Service Unavailable):**
```json
{
  "success": false,
  "error": "Tizim ta'mirlash jarayonida",
  "message": "Tamir ishlari: 2026-02-06 22:00 - 02:00. Saytga kirish o'tkazilgan",
  "status": "maintenance",
  "updated_at": "2026-02-06T20:00:00Z"
}
```

---

### Degraded - Ba'zi Xizmatlar Qisman Ishlaydi
**Request:** Istalgan yo'l/API
```bash
GET /api/courses/
```

**Javob (200 OK, lekin warning header'lar bilan):**
```
HTTP/1.1 200 OK
X-System-Status: degraded
X-System-Message: Ba'zi xizmatlar qisqa vaqtga ishlamayapti

{
  "count": 5,
  "results": [...]
}
```

---

## Advanced Rate Limiting

### Ishlanish Logikasi

**Oddiy Holat:**
```
So'rov 1 → ✅ Ruxsat (1-soniyada 1-so'rov)
So'rov 2 → ⏳ Kutiladi (1+ soniya keyin)
So'rov 3 → ✅ Ruxsat
```

**Surge Attack Aniqlash:**
```
So'rov 1 → ✅ Ruxsat (1-soniyada)
So'rov 2 → ✅ Ruxsat (1-soniyada)
So'rov 3 → ✅ Ruxsat (1-soniyada) ← 3 marta = ZARARLI!
        ↓
    🔒 BLOKIROVKA 10 SONIYA!
```

### Javoblar

**Oddiy Limit (OK):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Surge Block (FAIL):**
```json
{
  "detail": "Request was throttled. Expected available in 9 seconds."
}
```

### IP'lar Uchun Alohida Limit

Har IP'ning o'z tarixchasi:
- `123.45.67.89` → Normal (har 1 soniyada 1 so'rov)
- `111.22.33.44` → **BLOCKED** (1 soniyada 3 so'rov)
- `222.33.44.55` → Normal

---

## Django Admin Qismida Sozlash

1. Django admin panelini oching: `/superadmin-cyber-topdingku/`
2. "Sistema" → "Sistema sozlamalari" bo'limiga kirish
3. Yagona yozuvni oching va o'zgartiring:
   - **Status**: 
     - `operational` - Barcha yo'lar ishlaydi
     - `maintenance` - Faqat admin panel + health check ishlaydi
     - `degraded` - Barcha yo'lar ishlaydi + warning
   - **Xabar**: Foydalanuvchilarga ko'rsatiladigan xabar

**Maintenance Mode'da Qilinishi:**
```
1. Status → "maintenance" o'zgartir
2. Xabar → "Tamir ishlari: 22:00 - 02:00. Saytga kirish o'tkazilgan" yoz
3. Save qil
4. Darhol barcha API'lar (admin+health'dan tashqari) 503 qaytara boshlaydi
```

**Misol:**
- **Status**: `maintenance` 
- **Xabar**: "Tamir ishlari: 2026-02-06 22:00 - 02:00. Saytga kirish o'tkazilgan"

---

## Frontend'dan Foydalanish Misoli

### JavaScript/Fetch - System Health Check
```javascript
// Tizim holatini tekshirish
fetch('/api/system/health/', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    const system = data.data;
    
    if (system.status === 'operational') {
      console.log("✅ Tizim faol:", system.message);
      // API'larga murojaat qilish mumkin
    } else if (system.status === 'maintenance') {
      console.log("🔧 Tamir:", system.message);
      // Foydalanuvchiga xabar ko'rsatish
      showMaintenanceMessage(system.message);
    } else if (system.status === 'degraded') {
      console.log("⚠️ Qisman faol:", system.message);
      // Warning ko'rsatish, lekin API'lar ishlaydi
    }
  }
})
.catch(error => {
  console.error("API xato:", error);
});
```

### JavaScript/Fetch - Ordinary API Call
```javascript
// Oddiy API (masalan: kurslarni olish)
async function getCourses() {
  try {
    const response = await fetch('/api/courses/');
    
    // Agar maintenance mode bo'lsa
    if (response.status === 503) {
      const error = await response.json();
      console.error("Tamir ishlari:", error.message);
      showErrorModal({
        title: error.error,
        message: error.message,
        waitTime: "Dargoh 5 minut kutin..."
      });
      return;
    }
    
    // Agar 200 bo'lsa
    if (response.ok) {
      const data = await response.json();
      console.log("Kurslar:", data);
      
      // Agar degraded mode bo'lsa (warning headerlarni tekshirish)
      const systemStatus = response.headers.get('X-System-Status');
      if (systemStatus === 'degraded') {
        showWarning(response.headers.get('X-System-Message'));
      }
    }
  } catch (error) {
    console.error('Xato:', error);
  }
}
```

### React Hook - Comprehensive Status Management
```jsx
import { useEffect, useState } from 'react';

export default function SystemStatusManager() {
  const [status, setStatus] = useState(null);
  const [maintenanceActive, setMaintenanceActive] = useState(false);

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch('/api/system/health/');
        const data = await response.json();
        
        if (data.success) {
          setStatus(data.data);
          
          // Maintenance mode'ni aktual qilish
          if (data.data.status === 'maintenance') {
            setMaintenanceActive(true);
          } else {
            setMaintenanceActive(false);
          }
        }
      } catch (error) {
        console.error('Health check xato:', error);
      }
    };

    // Darhol tekshirish
    checkSystemHealth();
    
    // Har 30 sekundda tekshirish
    const interval = setInterval(checkSystemHealth, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // API call'ni wrap qilish
  const makeAPICall = async (url, options = {}) => {
    // Avval system status tekshirish
    if (maintenanceActive) {
      throw new Error({
        status: 503,
        message: status.message,
        type: 'MAINTENANCE_MODE'
      });
    }
    
    // Normal API call
    const response = await fetch(url, options);
    
    if (response.status === 503) {
      const error = await response.json();
      setMaintenanceActive(true);
      throw error;
    }
    
    return response.json();
  };

  return (
    <div>
      {maintenanceActive && (
        <div className="maintenance-banner">
          <h2>🔧 Tizim Tamirlash Jarayonida</h2>
          <p>{status?.message}</p>
          <p className="countdown">Dargoh 5 minut kutin...</p>
        </div>
      )}
      
      <MainApp makeAPICall={makeAPICall} />
    </div>
  );
}
```

### React Component - Maintenance Banner
```jsx
export function MaintenanceBanner({ status }) {
  if (status === 'operational') return null;
  
  if (status === 'maintenance') {
    return (
      <div className="banner-error">
        <div className="icon">🔧</div>
        <h3>Sayt Tamirlash Jarayonida</h3>
        <p>Tez orada tamirlashni yakunlab qo'yamiz. Iltimos, biroz vaqt kutin.</p>
        <p className="timer">Tahmini: 5 minut</p>
      </div>
    );
  }
  
  if (status === 'degraded') {
    return (
      <div className="banner-warning">
        <div className="icon">⚠️</div>
        <h3>Ba'zi Xizmatlar Vaqtinchalik Ishlamayapti</h3>
        <p>Biz masalani hal qilyapmiz. Sabrli bo'ling.</p>
      </div>
    );
  }
  
  return null;
}
```

      <small>{new Date(status.updated_at).toLocaleString('uz')}</small>
    </div>
  );
}
```

---

## Rate Limiting Xatosi

Agar 10 sekund ichida 2 marta so'rov yuborgan bo'lsa:

**Javob:**
```
HTTP 429 Too Many Requests
```

**Frontend'da topshiruv:**
```javascript
.catch(error => {
  if (error.response.status === 429) {
    console.error("Xato: 10 sekund ichida 1 martaga ruxsat");
  }
});
```

---

## Texnik Tafsilotlar

- **Model**: `apps.system.models.SystemSettings`
- **Serializer**: `apps.system.serializers.SystemSettingsSerializer`
- **ViewSet**: `apps.system.views.SystemHealthViewSet`
- **Permission**: `AllowAny` (Login qilmasdan ham ishladi)
- **Throttle**: `HealthCheckThrottle` (10 sekund = 60 sekundga oid)
- **Cache**: Django default cache (Redis yoki local cache)

---

## Misollar

### cURL bilan
```bash
curl -X GET http://localhost:8000/api/system/health/
```

### Python bilan
```python
import requests

response = requests.get('http://localhost:8000/api/system/health/')
print(response.json())
```

### Postman bilan
- **Method**: GET
- **URL**: http://localhost:8000/api/system/health/
- **Headers**: Hech qanday talab yo'q
- **Body**: Bo'sh

---

## Savollar?

API haqida savollar bo'lsa, Django admin panelida System Settings'ni o'zgartirib ko'ring!
