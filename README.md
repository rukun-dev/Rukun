# RT Management System

A comprehensive digital management system for Indonesian RT (Rukun Tetangga) communities, built with modern web technologies to streamline administrative tasks, citizen data management, financial tracking, and community communication.

## 🚀 Features

### 👥 User & Citizen Management
- **Multi-role Authentication**: Super Admin, Ketua RT, Sekretaris, Bendahara, Staff, and Warga
- **Comprehensive Citizen Database**: Complete warga (citizen) profiles with NIK, family relationships, and personal details
- **Family Management**: Kartu Keluarga (KK) integration with family member relationships
- **Profile Management**: Detailed user profiles with Cloudinary avatar integration

### 📋 Document Management
- **Digital Document Processing**: Automated generation of RT documents (Surat Pengantar, Surat Keterangan, etc.)
- **Document Templates**: Customizable templates with variable support
- **Approval Workflow**: Multi-step document approval process
- **Document Archiving**: Organized document storage and retrieval

### 💰 Financial Management
- **Transaction Tracking**: Income and expense management with proof attachments
- **Budget Planning**: Annual budget creation and monitoring
- **Payment System**: Monthly fees, cleaning fees, donations, and penalty tracking
- **Financial Reporting**: Comprehensive financial analytics and reports

### 📢 Communication & Announcements
- **Digital Announcements**: Priority-based community announcements
- **Email Campaigns**: Bulk email communication with templates
- **Targeted Messaging**: Role-based and specific recipient targeting
- **Read Status Tracking**: Monitor announcement engagement

### 🗃️ File Management
- **Cloudinary Integration**: Secure cloud storage for documents, images, and files
- **Multi-format Support**: Images, documents, videos with automatic optimization
- **Organized Storage**: Folder-based organization with tagging system

### 🛠️ System Administration
- **Backup Management**: Automated and manual backup solutions
- **Scheduled Jobs**: Automated tasks for reminders, cleanup, and reporting
- **System Settings**: Configurable application settings
- **Activity Logging**: Comprehensive audit trail

## 🛠️ Tech Stack

- **Frontend**: Nuxt 3 with TypeScript
- **Backend**: Nuxt 3 Server API
- **Database**: MySQL with Prisma ORM
- **File Storage**: Cloudinary
- **Email Service**: SMTP
- **Authentication**: Custom session-based authentication

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- MySQL database
- Cloudinary account
- SMTP email service credentials

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rt-management-system
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/rt_management"
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # SMTP Configuration
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_password
   SMTP_FROM=your_email@example.com
   
   # Application
   NUXT_SECRET_KEY=your_secret_key_for_sessions
   BASE_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed initial data
   npx prisma db seed
   ```

5. **Development Server**
   ```bash
   yarn run dev
   ```

   The application will be available at `http://localhost:3000`

## 🚀 Production Deployment

1. **Build the application**
   ```bash
   yarn run build
   ```

2. **Start production server**
   ```bash
   yarn run start
   ```

3. **Environment Variables**
   
   Ensure all production environment variables are properly configured:
   - Update `BASE_URL` to your production domain
   - Use production database credentials
   - Configure production SMTP settings
   - Set secure `NUXT_SECRET_KEY`

## 📁 Project Structure

```
rt-management-system/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── server/
│   └── api/                   # Nuxt server API routes
├── pages/                     # Application pages
├── components/                # Vue components
├── composables/               # Vue composables
├── middleware/                # Route middleware
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
└── public/                    # Static assets
```

## 🔧 Configuration

### Database Configuration
The application uses Prisma as the ORM. Configure your database connection in the `.env` file and run migrations to set up the schema.

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Configure folder structure for organized file storage

### SMTP Configuration
Configure your email service provider settings for sending announcements and notifications.

## 👤 Default Admin Setup

After initial setup, create a super admin user through the database or create a seeding script:

```sql
INSERT INTO users (id, email, password, name, role) 
VALUES ('admin123', 'admin@rt.local', 'hashed_password', 'Super Admin', 'SUPER_ADMIN');
```

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/register        # User registration
GET    /api/auth/me              # Get current user
POST   /api/auth/refresh         # Refresh session
POST   /api/auth/forgot-password # Password reset request
POST   /api/auth/reset-password  # Reset password
```

### User Management
```
GET    /api/users                # Get all users
GET    /api/users/:id            # Get user by ID
POST   /api/users                # Create new user
PUT    /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user
GET    /api/users/profile/:id    # Get user profile
PUT    /api/users/profile/:id    # Update user profile
POST   /api/users/avatar/:id     # Upload user avatar
DELETE /api/users/avatar/:id     # Delete user avatar
```

### Citizen Management (Warga)
```
GET    /api/warga                # Get all citizens
GET    /api/warga/:id            # Get citizen by ID
POST   /api/warga                # Create new citizen
PUT    /api/warga/:id            # Update citizen
DELETE /api/warga/:id            # Delete citizen
GET    /api/warga/search         # Search citizens
GET    /api/warga/by-nik/:nik    # Get citizen by NIK
GET    /api/warga/by-kk/:noKk    # Get citizens by KK number
POST   /api/warga/import         # Import citizens from CSV/Excel
GET    /api/warga/export         # Export citizens data
```

### Family Management
```
GET    /api/families             # Get all families
GET    /api/families/:id         # Get family by ID
POST   /api/families             # Create new family
PUT    /api/families/:id         # Update family
DELETE /api/families/:id         # Delete family
GET    /api/families/by-kk/:noKk # Get family by KK number
POST   /api/families/:id/members # Add family member
DELETE /api/families/:id/members/:memberId # Remove family member
PUT    /api/families/:id/head/:memberId    # Set family head
```

### Document Management
```
GET    /api/documents            # Get all documents
GET    /api/documents/:id        # Get document by ID
POST   /api/documents            # Create new document
PUT    /api/documents/:id        # Update document
DELETE /api/documents/:id        # Delete document
GET    /api/documents/by-warga/:wargaId # Get documents by citizen
POST   /api/documents/:id/approve     # Approve document
POST   /api/documents/:id/reject      # Reject document
GET    /api/documents/:id/download    # Download document
POST   /api/documents/generate        # Generate document from template
GET    /api/documents/archive         # Get archived documents
POST   /api/documents/:id/archive     # Archive document
```

### Document Templates
```
GET    /api/document-templates    # Get all templates
GET    /api/document-templates/:id # Get template by ID
POST   /api/document-templates    # Create new template
PUT    /api/document-templates/:id # Update template
DELETE /api/document-templates/:id # Delete template
POST   /api/document-templates/:id/preview # Preview template
```

### Financial Management
```
GET    /api/transactions         # Get all transactions
GET    /api/transactions/:id     # Get transaction by ID
POST   /api/transactions         # Create new transaction
PUT    /api/transactions/:id     # Update transaction
DELETE /api/transactions/:id     # Delete transaction
POST   /api/transactions/:id/verify   # Verify transaction
POST   /api/transactions/:id/proof    # Upload transaction proof
GET    /api/transactions/summary      # Get financial summary
GET    /api/transactions/report       # Get financial report
```

### Budget Management
```
GET    /api/budgets              # Get all budgets
GET    /api/budgets/:id          # Get budget by ID
POST   /api/budgets              # Create new budget
PUT    /api/budgets/:id          # Update budget
DELETE /api/budgets/:id          # Delete budget
GET    /api/budgets/year/:year   # Get budget by year
GET    /api/budgets/:id/items    # Get budget items
POST   /api/budgets/:id/items    # Add budget item
PUT    /api/budgets/:id/items/:itemId # Update budget item
DELETE /api/budgets/:id/items/:itemId # Delete budget item
```

### Payment Management
```
GET    /api/payments             # Get all payments
GET    /api/payments/:id         # Get payment by ID
POST   /api/payments             # Create new payment
PUT    /api/payments/:id         # Update payment
DELETE /api/payments/:id         # Delete payment
GET    /api/payments/by-warga/:wargaId # Get payments by citizen
POST   /api/payments/:id/pay          # Process payment
POST   /api/payments/:id/verify       # Verify payment
POST   /api/payments/:id/proof        # Upload payment proof
GET    /api/payments/overdue          # Get overdue payments
GET    /api/payments/monthly-report   # Get monthly payment report
```

### Announcement Management
```
GET    /api/announcements        # Get all announcements
GET    /api/announcements/:id    # Get announcement by ID
POST   /api/announcements        # Create new announcement
PUT    /api/announcements/:id    # Update announcement
DELETE /api/announcements/:id    # Delete announcement
POST   /api/announcements/:id/publish   # Publish announcement
GET    /api/announcements/published     # Get published announcements
POST   /api/announcements/:id/read      # Mark as read
GET    /api/announcements/unread        # Get unread announcements
```

### Email Campaign Management
```
GET    /api/email-campaigns      # Get all campaigns
GET    /api/email-campaigns/:id  # Get campaign by ID
POST   /api/email-campaigns      # Create new campaign
PUT    /api/email-campaigns/:id  # Update campaign
DELETE /api/email-campaigns/:id  # Delete campaign
POST   /api/email-campaigns/:id/send     # Send campaign
GET    /api/email-campaigns/:id/stats    # Get campaign statistics
GET    /api/email-campaigns/:id/emails   # Get campaign emails
```

### Email Template Management
```
GET    /api/email-templates      # Get all email templates
GET    /api/email-templates/:id  # Get template by ID
POST   /api/email-templates      # Create new template
PUT    /api/email-templates/:id  # Update template
DELETE /api/email-templates/:id  # Delete template
POST   /api/email-templates/:id/preview # Preview template
```

### File Management
```
POST   /api/files/upload         # Upload file to Cloudinary
GET    /api/files                # Get all file uploads
GET    /api/files/:id            # Get file by ID
DELETE /api/files/:id            # Delete file
POST   /api/files/upload-avatar  # Upload user avatar
POST   /api/files/upload-proof   # Upload transaction/payment proof
POST   /api/files/upload-document # Upload document file
GET    /api/files/by-folder/:folder # Get files by folder
```

### RT Profile & Settings
```
GET    /api/rt-profile           # Get RT profile
PUT    /api/rt-profile           # Update RT profile
POST   /api/rt-profile/logo      # Upload RT logo
GET    /api/rt-settings          # Get RT settings
PUT    /api/rt-settings/:key     # Update RT setting
POST   /api/rt-settings          # Create new setting
DELETE /api/rt-settings/:key     # Delete setting
```

### System Management
```
GET    /api/system/settings      # Get system settings
PUT    /api/system/settings/:key # Update system setting
GET    /api/system/backups       # Get all backups
POST   /api/system/backups       # Create new backup
GET    /api/system/backups/:id   # Get backup by ID
DELETE /api/system/backups/:id   # Delete backup
POST   /api/system/restore/:id   # Restore from backup
```

### Activity Logs
```
GET    /api/activity-logs        # Get all activity logs
GET    /api/activity-logs/:userId # Get logs by user
POST   /api/activity-logs        # Create activity log
DELETE /api/activity-logs/:id    # Delete activity log
GET    /api/activity-logs/export # Export activity logs
```

### Scheduled Jobs
```
GET    /api/scheduled-jobs       # Get all scheduled jobs
GET    /api/scheduled-jobs/:id   # Get job by ID
POST   /api/scheduled-jobs       # Create new job
PUT    /api/scheduled-jobs/:id   # Update job
DELETE /api/scheduled-jobs/:id   # Delete job
POST   /api/scheduled-jobs/:id/run # Run job manually
GET    /api/scheduled-jobs/:id/logs # Get job execution logs
```

### Reports & Analytics
```
GET    /api/reports/dashboard    # Get dashboard statistics
GET    /api/reports/financial    # Get financial reports
GET    /api/reports/citizens     # Get citizen reports
GET    /api/reports/documents    # Get document reports
GET    /api/reports/payments     # Get payment reports
GET    /api/reports/export/:type # Export reports (PDF/Excel)
```

### Query Parameters
Most GET endpoints support the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (e.g., 'createdAt', 'name')
- `order`: Sort order ('asc' or 'desc')
- `search`: Search term
- `filter`: Filter criteria (JSON string)
- `include`: Include related data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

## 🎯 Roadmap

- [ ] Mobile application (React Native/Flutter)
- [ ] WhatsApp integration for notifications
- [ ] Advanced reporting and analytics
- [ ] Multi-RT support for RW management
- [ ] Integration with government systems
- [ ] Real-time notifications
- [ ] Advanced document workflow
- [ ] Payment gateway integration

## 🔒 Security

- Session-based authentication
- Role-based access control
- Input validation and sanitization
- File upload security with Cloudinary
- Activity logging and audit trails
- Secure password hashing

---