# 🏘️ Rukun App - RT Management System

A comprehensive digital management system for Indonesian RT (Rukun Tetangga) communities, built with modern web technologies to streamline administrative tasks, citizen data management, financial tracking, and community communication.

## 🚀 **PROJECT STATUS UPDATE**

### ✅ **BACKEND DEVELOPER 1 - COMPLETED** 🎉
**All authentication, user management, and system APIs are fully implemented and production-ready!**

**📋 Completed Features:**
- **🔐 Complete Authentication System** - Registration, login, logout, password management
- **👥 User Management APIs** - Full CRUD operations with advanced search and analytics
- **📸 Avatar Management** - Cloudinary integration for user profile pictures
- **🏢 RT Profile System** - Complete RT management with logo upload capabilities
- **📊 Activity Logging** - Comprehensive audit trail with batch processing
- **⚙️ System Settings** - Dynamic configuration management
- **🛡️ Advanced Security** - Role-based access control, rate limiting, session management

**📡 Ready for Frontend Integration:** All BE1 APIs documented in Postman collection with examples and tests.

## 📊 Development Progress

### ✅ Completed Components
| Component | Developer | Status | Progress |
|-----------|-----------|--------|----------|
| **Authentication System** | BE1 | ✅ Complete | 100% |
| **User Management** | BE1 | ✅ Complete | 100% |
| **Profile Management** | BE1 | ✅ Complete | 100% |
| **RT Profile System** | BE1 | ✅ Complete | 100% |
| **Activity Logging** | BE1 | ✅ Complete | 100% |
| **System Settings** | BE1 | ✅ Complete | 100% |
| **File Upload (Avatar/Logo)** | BE1 | ✅ Complete | 100% |

### 🔄 In Progress / Pending
| Component | Developer | Status | Next Steps |
|-----------|-----------|--------|------------|
| **Citizens Management** | BE2 | 🟡 Pending | Start development |
| **Document System** | BE2 | 🟡 Pending | Start development |
| **Announcements** | BE2 | 🟡 Pending | Start development |
| **Frontend Authentication** | FE1 | 🟡 Pending | Integrate with BE1 APIs |
| **Frontend Dashboard** | FE1 | 🟡 Pending | Integrate with BE1 APIs |
| **Frontend User Management** | FE1 | 🟡 Pending | Integrate with BE1 APIs |

### 🎯 Next Phase Priorities
1. **Frontend Integration (FE1)** - Connect to completed BE1 APIs
2. **Citizens Management APIs (BE2)** - Start development
3. **Integration Testing** - Test BE1 APIs with frontend
4. **Document System APIs (BE2)** - Prepare for development

## 🔗 Frontend Integration Guide

### 📋 Available APIs (Ready for Integration)

**Base URL:** `http://localhost:3000` (development)

#### 🔐 Authentication Endpoints
```typescript
// User Registration
POST /api/auth/register
Body: { name, email, password, phone, role }

// User Login  
POST /api/auth/login
Body: { email, password }

// Get Current User
GET /api/auth/me
Headers: { Cookie: session_token }

// Logout
POST /api/auth/logout

// Change Password
POST /api/auth/change-password
Body: { currentPassword, newPassword }

// Forgot Password
POST /api/auth/forgot-password
Body: { email }

// Reset Password
POST /api/auth/reset-password
Body: { token, email, newPassword }
```

#### 👥 User Management Endpoints
```typescript
// Get All Users (with pagination)
GET /api/users?page=1&limit=10&search=query&role=WARGA

// Create User
POST /api/users
Body: { name, email, password, phone, role }

// Get User by ID
GET /api/users/:id

// Update User
PUT /api/users/:id
Body: { name, email, phone, role, isActive }

// Delete User
DELETE /api/users/:id

// Advanced User Search
GET /api/users/search?q=searchTerm&filters={}

// User Analytics
GET /api/users/analytics
```

#### 📸 Profile & Avatar Management
```typescript
// Get User Profile
GET /api/users/profile/:id

// Update User Profile
PUT /api/users/profile/:id
Body: { name, phone, address, bio }

// Upload Avatar
POST /api/users/avatar/upload
Body: FormData with 'avatar' file

// Get User Avatar
GET /api/users/avatar/:id

// Delete Avatar
DELETE /api/users/avatar/:id
```

#### 🏢 RT Profile Management
```typescript
// Get RT Profile
GET /api/rt-profile

// Update RT Profile
PUT /api/rt-profile
Body: { name, address, ketua, sekretaris, etc }

// Upload RT Logo
POST /api/rt-profile/logo
Body: FormData with 'logo' file
```

#### 📊 System & Logging
```typescript
// Get Activity Logs
GET /api/activity-logs?page=1&limit=10&userId=123

// Get System Settings
GET /api/system/settings

// Update System Settings
PUT /api/system/settings
Body: { key: value, key2: value2 }
```

### 🛠️ Integration Tips

#### **Authentication Flow**
1. Use `POST /api/auth/login` for authentication
2. Session cookie is automatically set (HTTP-only)
3. Use `GET /api/auth/me` to check authentication status
4. All protected routes require session cookie

#### **Error Handling**
All APIs return standardized responses:
```typescript
interface ApiResponse<T> {
  success: boolean
  status_code: number
  message: string
  data: T | null
  error: ApiError | null
  meta: {
    request_id: string
    timestamp: string
    execution_time: string
  }
  pagination?: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}
```

#### **File Uploads**
- Use `FormData` for file uploads
- Supported formats: JPG, PNG, WebP
- Max size: 5MB
- Auto-optimization via Cloudinary

#### **Role-Based Access**
Check user role from `/api/auth/me` response:
- `SUPER_ADMIN` (100) - Full access
- `KETUA_RT` (80) - Management access  
- `SEKRETARIS` (60) - Administrative access
- `BENDAHARA` (60) - Financial focus
- `STAFF` (40) - Limited access
- `WARGA` (20) - Basic access

### 📚 Postman Collection
Import the complete API collection from `postman/Rukun App API Backend 1 Collection.postman_collection.json` for:
- Full API documentation
- Example requests/responses
- Test scenarios
- Environment variables

## 🚀 Features

### 🔐 Advanced Authentication & Authorization
- **Session-based Authentication**: Secure JWT tokens with HTTP-only cookies
- **Role-Based Access Control (RBAC)**: 6-level hierarchical permission system
- **Multi-factor Security**: Password complexity, rate limiting, session management
- **Password Reset Flow**: Email-based secure password reset with token expiration
- **Activity Logging**: Comprehensive audit trail for all user actions

### 👥 User & Role Management
- **6-Level Role Hierarchy**: SUPER_ADMIN → KETUA_RT → SEKRETARIS/BENDAHARA → STAFF → WARGA
- **Granular Permissions**: Fine-grained access control for different resources
- **User Profile Management**: Complete profiles with avatar support via Cloudinary
- **Bulk Operations**: Mass user management capabilities

### 📋 Document & Administration
- **Digital Document Processing**: Automated RT document generation
- **Approval Workflows**: Multi-step document approval system
- **Template Management**: Customizable document templates
- **File Management**: Secure cloud storage with Cloudinary integration

### 💰 Financial Management
- **Transaction Tracking**: Income/expense management with proof attachments
- **Payment Processing**: Monthly fees, donations, penalty tracking
- **Budget Management**: Annual budget planning and monitoring
- **Financial Reporting**: Comprehensive analytics and reports

### 📢 Communication System
- **Announcement Management**: Priority-based community announcements
- **Email Campaigns**: Bulk email with template support
- **Role-based Messaging**: Targeted communication by user roles
- **Read Status Tracking**: Monitor engagement metrics

## 🏗️ System Architecture

### 🛡️ Security Layers

#### **Authentication Middleware**
```typescript
// Automatic route protection based on URL patterns
const protectedPrefixes = [
    '/api/protected/',
    '/api/user/',
    '/api/admin/',
    '/api/dashboard',
    '/api/reports',
    '/api/residents',
    '/api/announcements'
]
```

#### **Role-Based Access Control (RBAC)**
| Role | Level | Permissions | Access Control |
|------|-------|------------|----------------|
| **SUPER_ADMIN** | 100 | `*` (All) | Full system access |
| **KETUA_RT** | 80 | Manage users, finances, documents | RT leadership functions |
| **SEKRETARIS** | 60 | Documents, announcements (read finances) | Administrative tasks |
| **BENDAHARA** | 60 | Financial management (read-only others) | Treasury functions |
| **STAFF** | 40 | Limited read/write access | Operational support |
| **WARGA** | 20 | Own profile, public info, announcements | Basic citizen access |

#### **Permission System**
- **Read Permissions**: `read:all`, `read:residents`, `read:announcements`, `read:reports`
- **Write Permissions**: `write:residents`, `write:announcements`, `write:reports`
- **Management Permissions**: `manage:users`, `manage:finances`, `manage:documents`
- **Special Permissions**: `*` (super admin), `read:own_profile`, `write:own_profile`

### 🔧 Core Utilities

#### **Activity Logger**
```typescript
// Batched logging system with auto-flush
class ActivityLogger {
    private logQueue: ActivityLogData[] = []
    private batchSize: number = 50
    private flushInterval: number = 5000 // 5 seconds
}
```
- **Batch Processing**: Groups logs for better performance
- **Auto-flush**: Time and size-based automatic writing
- **Pre-built Helpers**: Common activity logging functions
- **Error Resilience**: Retry mechanism for failed writes

#### **Authentication Utils**
- **Multi-header IP Detection**: Supports various proxy configurations
- **Role Hierarchy**: Numerical levels for role comparison
- **Permission Checking**: Fine-grained access control
- **Session Management**: Database-backed session validation

#### **Cloudinary Service**
- **Specialized Uploads**: Different optimization for avatars, logos, documents
- **Auto-transformation**: Image optimization and format conversion
- **Cleanup Utilities**: Maintenance functions for old files
- **Health Monitoring**: Service status checking

#### **Response System**
```typescript
interface ApiResponse<T> {
    success: boolean
    status_code: number
    message: string
    data: T | null
    error: ApiError | null
    meta: ResponseMeta
    pagination?: PaginationMeta
    next_step?: NextStepInfo
    links?: ApiLinks
}
```
- **Standardized Format**: Consistent API responses
- **Request Tracking**: Performance monitoring with execution time
- **Rich Metadata**: Pagination, next steps, related links
- **Error Categorization**: Specific error codes and detailed messages

### ✅ Validation System

#### **User Validation**
- **Indonesian Phone Format**: `+62/62/0` with 8-13 digits
- **Strong Password Policy**: Uppercase, lowercase, numbers, 8+ chars
- **Email Normalization**: Automatic lowercase and trimming
- **NIK Validation**: 16-digit Indonesian ID number format

#### **RT Profile Validation**
- **Indonesian Address System**: RT, RW, Kelurahan, Kecamatan, Kabupaten, Provinsi
- **Postal Code Format**: Exactly 5 digits
- **Administrative Hierarchy**: Proper Indonesian administrative structure

#### **Query Parameter Validation**
- **Pagination**: Page numbers, limits with bounds checking
- **Sorting**: Field validation with allowed sort fields
- **Search**: Query sanitization and length limits
- **Filtering**: JSON-based filter validation

## 🛠️ Tech Stack

### **Core Technologies**
- **Frontend**: Nuxt 3 + TypeScript + Vue 3 Composition API
- **Backend**: Nuxt 3 Server API with H3
- **Database**: MySQL + Prisma ORM
- **File Storage**: Cloudinary CDN
- **Email**: Nodemailer + SMTP
- **Validation**: Zod schema validation

### **Security & Performance**
- **Authentication**: JWT + HTTP-only cookies
- **Password Hashing**: bcrypt with salt rounds 12
- **Rate Limiting**: IP-based request throttling
- **Connection Pooling**: Prisma connection management
- **Image Optimization**: Automatic WebP conversion

### **Developer Experience**
- **Type Safety**: Full TypeScript integration
- **Code Generation**: Prisma schema-to-types
- **Hot Reload**: Development server with HMR
- **Error Handling**: Comprehensive error responses

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **Database**: MySQL 8.0+
- **Cloud Storage**: Cloudinary account
- **Email Service**: SMTP provider
- **Memory**: 2GB+ RAM recommended
- **Storage**: 10GB+ available space

## 🚀 Installation & Setup

### 1. **Clone Repository**
```bash
git clone <repository-url>
cd rukun-app
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Configuration**
Create `.env` file in root directory:
```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/rukun_app"

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"  
CLOUDINARY_API_SECRET="your_api_secret"

# Email Configuration (for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Application Configuration
JWT_SECRET="your-super-secret-jwt-key"
SESSION_SECRET="your-session-secret-key"
APP_URL="http://localhost:3000"

# Development
NODE_ENV="development"
```

### 4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

### 5. **Start Development Server**
```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### 6. **Verify Installation**
- Open browser: `http://localhost:3000`
- Check API status: `http://localhost:3000/api/health`
- Import Postman collection from `/postman` folder
- Test authentication endpoints

## 🧪 Testing the APIs

### **Quick Test Sequence:**
1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"name":"Test User","email":"test@example.com","password":"Test123!","phone":"08123456789","role":"WARGA"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"test@example.com","password":"Test123!"}' \
   -c cookies.txt
   ```

3. **Get current user:**
   ```bash
   curl -X GET http://localhost:3000/api/auth/me \
   -b cookies.txt
   ```

4. **Get all users:**
   ```bash
   curl -X GET http://localhost:3000/api/users \
   -b cookies.txt
   ```

### **Using Postman Collection:**
1. Import `postman/Rukun App API Backend 1 Collection.postman_collection.json`
2. Set environment variable `base_url` to `http://localhost:3000`
3. Run authentication tests
4. Explore all available endpoints

## 🔧 Development Guidelines

### **Project Structure**
```
rukun-app/
├── prisma/              # Database schema and migrations
├── server/              # Nuxt 3 server API routes
│   └── api/            # API endpoints
├── postman/            # API documentation & tests
├── components/         # Vue components (frontend)
├── pages/              # Nuxt pages (frontend)
├── utils/              # Shared utilities
├── middleware/         # Authentication & validation
└── types/              # TypeScript type definitions
```

### **Adding New Features**
1. **Backend APIs**: Add routes in `server/api/`
2. **Database**: Update Prisma schema, run migrations
3. **Frontend**: Create components and pages
4. **Testing**: Add requests to Postman collection
5. **Documentation**: Update README and TASK.md

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **Validation**: Use Zod schemas for all inputs
- **Error Handling**: Standardized API responses
- **Security**: Authentication required for protected routes
- **Logging**: Activity logging for all user actions
