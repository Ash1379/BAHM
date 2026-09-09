بله. مرحله Authentication Core از نظر عملکردی تکمیل شده است و تست واقعی Expiration → Refresh → Retry را هم انجام دادیم. بنابراین می‌توانیم آن را به‌عنوان یک Milestone مستقل در Git ثبت کنیم.

اما یک نکته: «تکمیل Authentication Core» به معنی تمام شدن کل Authentication محصول نیست. مواردی مثل Password Reset، Email Verification، تغییر رمز و ... در صورت نیاز در مراحل بعدی اضافه می‌شوند. هسته فعلی آماده است.

ساختار فعلی Authentication Core
Frontend/src/
│
├── api/
│   ├── client.js          ← هسته ارتباط API + 401 + Refresh + Retry
│   └── auth.js            ← Login / Register / Logout / Me
│
├── auth/
│   ├── storage.js         ← ذخیره و مدیریت Access/Refresh Token
│   ├── token.js           ← Refresh Access Token + refreshPromise
│   └── AuthContext.jsx    ← وضعیت Authentication در React
│
└── routes/
    └── ProtectedRoute.jsx ← محافظت از Routeهای خصوصی

در Backend نیز هسته مربوط به Authentication در این بخش‌ها قرار دارد:

Backend/apps/accounts/
│
├── models.py              ← Custom User
├── managers.py            ← UserManager
├── serializers.py         ← User/Register/Login serializers
├── views.py               ← Register/Login/Logout/Me
├── urls.py                ← Authentication endpoints
├── admin.py               ← User Admin
└── migrations/

و تنظیمات اصلی در:

Backend/config/
└── settings.py            ← DRF / JWT / CORS / AUTH_USER_MODEL

Backend/config/urls.py     ← /api/auth/
سند معرفی Authentication Core

پیشنهاد می‌کنم این سند را در پروژه ایجاد کنیم:

docs/
└── architecture/
    └── authentication-core.md

محتوای پیشنهادی:

# Authentication Core

## 1. Overview

Authentication Core is the central authentication architecture
of the BAHM application.

It provides a reusable foundation for user authentication
between the Django REST Framework backend and React frontend.

The system uses:

- Custom User Model
- Django REST Framework
- JWT Authentication
- Access Token
- Refresh Token
- Automatic Token Refresh
- Request Retry
- Protected Routes
- React Authentication Context
- CORS configuration

---

## 2. Architecture

The authentication flow is divided into two main layers:

### Backend

```text
Django
    │
    └── apps/accounts/
        ├── models.py
        ├── managers.py
        ├── serializers.py
        ├── views.py
        ├── urls.py
        └── admin.py
Frontend
React
    │
    ├── api/
    │   ├── client.js
    │   └── auth.js
    │
    ├── auth/
    │   ├── storage.js
    │   ├── token.js
    │   └── AuthContext.jsx
    │
    └── routes/
        └── ProtectedRoute.jsx
3. Backend Components
3.1 Custom User Model

File:

apps/accounts/models.py

The project uses a custom User model based on:

AbstractBaseUser
PermissionsMixin

The primary authentication identifier is:

email

Therefore:

USERNAME_FIELD = "email"
3.2 User Manager

File:

apps/accounts/managers.py

Responsible for:

Creating normal users
Creating superusers
Normalizing email addresses
Setting passwords securely

Main methods:

create_user()
create_superuser()
3.3 Authentication Serializers

File:

apps/accounts/serializers.py

Contains:

UserSerializer
RegisterSerializer
LoginSerializer

Responsibilities:

User data serialization
Registration validation
Password confirmation
Email validation
Login authentication
3.4 Authentication Views

File:

apps/accounts/views.py

Current endpoints:

POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/token/refresh/
POST /api/auth/logout/
GET  /api/auth/me/
4. JWT Authentication

JWT is configured through Django REST Framework and Simple JWT.

Access Token:

15 minutes

Refresh Token:

7 days

Refresh token rotation is enabled:

ROTATE_REFRESH_TOKENS = True
BLACKLIST_AFTER_ROTATION = True

The Access Token is used for authenticated API requests.

The Refresh Token is used to obtain a new Access Token after expiration.

5. Frontend Authentication
5.1 storage.js

File:

src/auth/storage.js

Responsible for:

saveTokens()
getAccessToken()
getRefreshToken()
clearTokens()

Token keys:

bahm_access_token
bahm_refresh_token
5.2 token.js

File:

src/auth/token.js

Responsible for refreshing the Access Token.

The module uses:

refreshPromise

to prevent multiple simultaneous refresh requests.

Example:

Request A → 401 ─┐
Request B → 401 ─┼→ One Refresh Request
Request C → 401 ─┘
                  ↓
             New Token
                  ↓
          Retry Requests
6. API Client

File:

src/api/client.js

This is the central API communication layer.

Responsibilities:

Build API requests
Add Authorization header
Send JSON requests
Parse API responses
Detect HTTP 401
Refresh expired Access Token
Retry the original request once
Prevent infinite retry loops

Flow:

API Request
    ↓
Django
    ↓
200 ───────────────→ Return response

401
 ↓
Refresh Token
 ↓
New Access Token
 ↓
Retry original request
 ↓
200

The following endpoints are excluded from automatic refresh:

/auth/login/
/auth/register/
/auth/token/refresh/
/auth/logout/
7. Auth API

File:

src/api/auth.js

Provides functions for:

login()
register()
getMe()
logout()

This module communicates with the Django authentication API.

8. AuthContext

File:

src/auth/AuthContext.jsx

Provides authentication state to React.

Main state:

user
loading
isAuthenticated

Main actions:

login()
logout()

Components can access authentication through:

useAuth()
9. Protected Routes

File:

src/routes/ProtectedRoute.jsx

Protected routes require authentication.

Flow:

User
 ↓
Protected Route
 ↓
Authenticated?
 ├── Yes → Page
 └── No  → /login
10. Authentication Flow
Login
React Login
    ↓
POST /api/auth/login/
    ↓
Django Authentication
    ↓
Access + Refresh Token
    ↓
storage.js
    ↓
AuthContext
    ↓
Dashboard
Application Initialization
React starts
    ↓
AuthContext
    ↓
getMe()
    ↓
client.js
    ↓
Authenticated → User loaded

Expired Access Token
    ↓
401
    ↓
token.js
    ↓
Refresh
    ↓
Retry getMe()
    ↓
User loaded
Logout
Logout
    ↓
POST /api/auth/logout/
    ↓
Refresh Token Blacklisted
    ↓
Clear local tokens
    ↓
Clear React user state
    ↓
/login
11. Testing

Authentication Core has been tested for:

User Login
JWT authentication
Protected /me/ endpoint
Expired Access Token
Automatic Refresh
Retry after Refresh
Refresh Token Rotation
Logout
Protected Route
React StrictMode development behavior
CORS requests

A real expiration test was performed with:

ACCESS_TOKEN_LIFETIME = timedelta(seconds=5)

The observed backend flow was:

GET /api/auth/me/                 401
POST /api/auth/token/refresh/     200
GET /api/auth/me/                 200

This confirms that Automatic Token Refresh and request retry are working.

12. Current Status

Authentication Core:

STATUS: COMPLETE

The core authentication infrastructure is ready
to support the next application features.

13. Future Authentication Features

The following features are intentionally outside
the current Authentication Core milestone:

Email verification
Password reset
Change password
Account recovery
Two-factor authentication
Session/device management
Production cookie-based authentication
Advanced security policies

These can be implemented as extensions to the core architecture.
