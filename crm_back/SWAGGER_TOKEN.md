# Swagger API Dokumentatsiya - JWT Token Bilan

## Swagger'da API Test Qilish

### 1. Token Olish

Swagger URL: `http://localhost:8000/swagger/`

#### Token Olish Yo'li:

1. Swagger'da `/api/token/` endpoint'ini toping (yoki `/auth/login/`)
2. **POST** so'rovni bosing
3. Username va password kiriting
4. **Execute** bosing

**Javob Example:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIn0...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Token'ni Swagger'da Foydalanish

#### Usuli 1: Header'da Token (Eng Oson)

1. Swagger'da API endpoint'ni toping (masalan: `/api/courses/`)
2. **Try it out** bosing
3. Top-right'da "🔒" icon bo'ladi, uni bosing
4. Quyidagi oyna ochiladi:

```
Authorization: Bearer <access_token>
```

5. `access` token'ni ushbu format'da kiriting:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

6. **Authorize** bosing
7. Endi barcha API'lar token bilan ishlaydi

#### Usuli 2: Authorization Header'i Qo'shish

API so'rovida **Authorization** header qo'shib kiriting:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. Token Bilan API Test Qilish

**Misol: Kurslarni Olish**

```bash
curl -X GET "http://localhost:8000/api/courses/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Swagger'da:**
1. `/api/courses/` GET endpoint'ni toping
2. **Try it out** bosing
3. Top-right'da 🔒 bosing, token qo'shish
4. **Execute** bosing

---

### 4. Token Yangilash (Refresh)

Token soni chekli vaqtga amal qiladi (odatda 15-30 minut). Yangilash uchun:

1. `/api/token/refresh/` endpoint'ni toping
2. **POST** so'rovni bosing
3. Quyidagi JSON kiriting:

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

4. **Execute** bosing
5. Yangi `access` token'ni olasiz

---

### 5. Token Noto'g'ri Bo'lsa

**Xato Javob:**
```json
{
  "detail": "Given token not valid for any token type"
}
```

**Yechim:**
1. Token'ni qayta olish
2. Token format'ini tekshirish: `Bearer <token>` (bo'sh joy muhim)
3. Token soni tugagan bo'lsa, refresh qilish

---

## Frontend Misollar

### JavaScript/Fetch Bilan Token Olish

```javascript
// Login - Token olish
async function getToken(username, password) {
  const response = await fetch('/api/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });
  
  const data = await response.json();
  // Token'ni localStorage'da saqlash
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  
  return data.access;
}

// API call bilan token
async function getCourses() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/api/courses/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}
```

### React Bilan Token Management

```jsx
import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    setToken(savedToken);
  }, []);

  const login = async (username, password) => {
    const response = await fetch('/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setToken(data.access);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
  };

  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return { token, login, logout, getHeaders };
}

// Foydalanish:
export function MyComponent() {
  const { token, login, getHeaders } = useAuth();

  const fetchData = async () => {
    const response = await fetch('/api/courses/', {
      headers: getHeaders()
    });
    return await response.json();
  };

  return (
    <button onClick={() => login('admin', 'password')}>
      Login
    </button>
  );
}
```

---

## Token Xatolari va Yechimlar

| Xato | Sababi | Yechim |
|------|--------|--------|
| 401 Unauthorized | Token yo'q yoki xato | Token'ni qayta olish |
| 403 Forbidden | Token yaroqli lekin ruxsat yo'q | Boshqa user bilan login qilish |
| 400 Bad Request | Format xato | `Bearer <token>` format'ni tekshirish |
| Token Expired | Token soni tugagan | Refresh endpoint bilan yangilash |

---

## Environment Variables (Production)

`.env` faylida quyidagilini qo'shish mumkin:

```
# JWT Settings
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=7

# API Base URL
API_BASE_URL=https://api.yourdomain.com
SWAGGER_URL=https://api.yourdomain.com/swagger/
```

---

## Savollar?

- **Token qo'shish**: `/` top-right'da 🔒 bosing
- **Token yangilash**: `refresh` endpoint'ni ishlating
- **Debug**: Browser DevTools → Network → Authorization header'ni tekshiring
