"""
Django settings for config project.
"""
from pathlib import Path
from datetime import timedelta
import os
from urllib.parse import urlsplit
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def _env_list(name, default=""):
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


def _normalize_origin(origin):
    parsed = urlsplit(origin)
    if not parsed.scheme or not parsed.netloc:
        return origin.rstrip("/")
    return f"{parsed.scheme}://{parsed.netloc}"


def _redis_hosts():
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        return [redis_url]
    return [(os.getenv("REDIS_HOST", "127.0.0.1"), int(os.getenv("REDIS_PORT", "6379")))]


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ====================== SECURITY ======================
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-&gis75^+e$m4#f66)h%szqim!l$yvr5qj_i#8)+s!)y1-abrba')

DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# ALLOWED_HOSTS - Critical for production (400 error fix)
ALLOWED_HOSTS = _env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")
if DEBUG:
    ALLOWED_HOSTS.append('*')   # Safe only in development

# CSRF_TRUSTED_ORIGINS - This is the #1 reason for 400 on POST/login in production
CSRF_TRUSTED_ORIGINS = _env_list("CSRF_TRUSTED_ORIGINS", "https://arturturkce.online,https://www.arturturkce.online")

# ====================== APPS & MIDDLEWARE ======================
INSTALLED_APPS = [
    "daphne",
    "channels",
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'csp',
    # REST
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    'auditlog',
    'simple_history',
    # Custom apps
    "apps.common",
    "apps.authentication",
    "apps.users",
    "apps.groups",
    "apps.courses",
    "apps.attendance",
    "apps.system",
    "apps.videos",
    # Swagger
    "drf_yasg",
]

AUTH_USER_MODEL = "users.User"

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",   # Must be near the top
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'csp.middleware.CSPMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'apps.system.middleware.SystemMaintenanceMiddleware',
]

# ====================== CORS ======================
# Better logic: allow all only in development
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [_normalize_origin(origin) for origin in _env_list("CORS_ALLOWED_ORIGINS")]

if DEBUG and not CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",   # if using Vite
    ]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'accept',
    'accept-encoding',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'range',
    "sec-websocket-key",
    "sec-websocket-version",
    "sec-websocket-protocol",
    "sec-websocket-extensions",
]

# ====================== DATABASE ======================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'myappdb'),
        'USER': os.getenv('DB_USER', 'myuser'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'ATOMIC_REQUESTS': True,
    }
}

# ====================== REST FRAMEWORK ======================
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "rest_framework.schemas.coreapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [],  # Allow views to set their own permissions
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "EXCEPTION_HANDLER": "config.exception_handler.custom_exception_handler",
}

# ====================== SIMPLE JWT ======================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ====================== OTHER SETTINGS ======================
AUTHENTICATION_BACKENDS = [
    'apps.users.backends.UsernameOrPhoneBackend',
]

ASGI_APPLICATION = 'config.asgi.application'
WSGI_APPLICATION = 'config.wsgi.application'
ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Tashkent'
USE_I18N = True
USE_TZ = True

# Static & Media
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Frontend build (if serving from Django)
FRONTEND_DIST_DIR = Path(os.getenv('FRONTEND_DIST_DIR', BASE_DIR.parent / 'crm_front' / 'dist'))
FRONTEND_INDEX_FILE = FRONTEND_DIST_DIR / 'index.html'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Redis / Channels
if os.getenv("REDIS_URL") or os.getenv("REDIS_HOST"):
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": _redis_hosts()},
        },
    }
else:
    CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
    }

# ====================== PRODUCTION SECURITY ======================
if not DEBUG:
    SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'True'
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'True') == 'True'
    CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'True') == 'True'

    SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000'))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'True') == 'True'
    SECURE_HSTS_PRELOAD = os.getenv('SECURE_HSTS_PRELOAD', 'True') == 'True'

    X_FRAME_OPTIONS = 'DENY'

    # CSP (you can expand this later)
    CONTENT_SECURITY_POLICY = {
        "DIRECTIVES": {
            "default-src": ("'self'",),
            "script-src": ("'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"),
            "style-src": ("'self'", "'unsafe-inline'", "https://fonts.googleapis.com"),
            "font-src": ("'self'", "https://fonts.gstatic.com"),
            "img-src": ("'self'", "data:"),
            "connect-src": ("'self'", "wss://*", "https://*"),
            "frame-src": ("'self'", "http://localhost:*", "https://localhost:*", "blob:"),
            "object-src": ("'self'", "blob:"),
        }
    }
else:
    # Development overrides
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
