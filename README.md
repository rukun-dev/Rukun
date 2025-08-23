# 🏘️ Rukun App - RT Management System

A comprehensive digital management system for Indonesian RT (Rukun Tetangga) communities, built with modern web technologies to streamline administrative tasks, citizen data management, financial tracking, and community communication.

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
