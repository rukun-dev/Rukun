# **📋 RUKUN - Task Distribution (RT/RW Management System)**
*Schema DB sudah final, fokus development sesuai schema*

## **🌐 SYSTEM ARCHITECTURE OVERVIEW**

### **Platform Structure:**
1. **RUKUN Web App** - RT/RW Management System
2. **Setup Wizard** - First-time RT profile configuration
3. **Admin Panel** - System administration
4. **User Portal** - Interface untuk warga

---

## **🎨 FRONTEND TASKS**

### **👨‍💻 FRONTEND DEVELOPER 1**
**Focus: Setup, Admin Dashboard & Warga Management**

#### **🔧 Initial Setup Wizard**
- **rt_profile_setup_form** - Setup RT profile (rt_number, rw_number, location)
- **leadership_setup_form** - Input ketua, sekretaris, bendahara
- **contact_setup_form** - Phone, email RT
- **settings_setup_form** - Basic RT settings (timezone, currency)
- **setup_completion_page** - Welcome page dengan overview
- **setup_progress_indicator** - Progress steps dengan validation

#### **🏠 Admin Dashboard (Based on RtProfile)**
- **admin_main_dashboard** - Dashboard dengan statistics cards
- **rt_profile_management** - View/edit RT profile info
- **rt_settings_page** - Manage email settings, payment settings, document settings
- **statistics_overview** - Total warga, families, pending documents, kas
- **activity_timeline** - Real-time activity logs dari ActivityLog model
- **quick_actions_panel** - Quick access ke fungsi utama

#### **👥 Warga & Family Management (Sesuai Schema)**
- **warga_list_page** - Table dengan filter by status, gender, family
- **warga_create_form** - Form sesuai Warga model (NIK, personal info, contact)
- **warga_detail_page** - Detail view dengan tabs (info, family, documents, payments)
- **warga_edit_form** - Edit form dengan validation NIK unique
- **warga_search_component** - Search dengan fulltext pada full_name
- **family_management_page** - Manage families berdasarkan Family model
- **family_tree_visualization** - Visual family relationships
- **warga_status_management** - Update status (ACTIVE, MOVED, DECEASED)
- **bulk_warga_operations** - Import/export warga data

#### **💰 Financial Management (Transaction & Budget)**
- **transaction_list_page** - List berdasarkan TransactionCategory
- **transaction_create_form** - Form input dengan category selection
- **transaction_detail_modal** - Detail dengan receipt preview
- **budget_management_page** - Budget vs actual tracking
- **financial_dashboard** - Charts untuk income/expense analysis
- **transaction_category_management** - CRUD categories dengan color coding
- **financial_reports_generator** - Generate laporan periode tertentu

#### **📊 Charts & Analytics**
- **financial_overview_charts** - Chart.js untuk cash flow
- **warga_demographics_charts** - Gender, age distribution
- **payment_collection_charts** - Iuran collection rate
- **monthly_summary_charts** - Monthly income/expense trends

---

### **👨‍💻 FRONTEND DEVELOPER 2**
**Focus: User Interface, Documents & Communication**

#### **🔐 Authentication System (Single Tenant)**
- **login_page** - Login dengan role-based redirect
- **setup_check_middleware** - Redirect ke setup jika RT belum setup
- **role_based_navigation** - Navigation sesuai UserRole
- **user_profile_management** - Edit user profile
- **password_change_form** - Change password dengan validation

#### **👤 User Dashboard (Untuk Warga)**
- **warga_dashboard** - Dashboard untuk role WARGA
- **personal_info_view** - View info pribadi dari Warga model
- **family_info_display** - Info keluarga berdasarkan Family relationship
- **document_request_interface** - Request surat dengan DocumentType enum
- **payment_history_view** - Riwayat payments
- **announcement_viewer** - View pengumuman untuk warga

#### **📄 Document Management (Sesuai DocumentType Enum)**
- **document_request_form** - Form request dengan DocumentType selection
- **document_list_admin** - List untuk admin dengan DocumentStatus filter
- **document_approval_interface** - Approve/reject dengan approval_notes
- **document_template_manager** - Manage DocumentTemplate
- **pdf_generation_preview** - Preview generated document
- **digital_signature_canvas** - Signature pad untuk document signing
- **document_numbering_display** - Display document_number generation
- **document_history_tracking** - Track document status changes

#### **📢 Announcement System (Sesuai AnnouncementTargetType)**
- **announcement_create_form** - Form dengan AnnouncementTargetType selection
- **announcement_list_page** - List dengan AnnouncementStatus filter
- **announcement_editor** - WYSIWYG editor untuk content_html
- **recipient_selector_component** - Select berdasarkan target_type
- **email_analytics_dashboard** - Email delivery statistics
- **announcement_preview_modal** - Preview sebelum send
- **email_log_viewer** - View EmailLog untuk tracking

#### **💳 Iuran & Payment System**
- **iuran_create_form** - Form dengan category dan amount
- **iuran_list_management** - List dengan IuranStatus filter
- **payment_interface** - Interface untuk warga bayar iuran
- **payment_proof_upload** - Upload bukti pembayaran
- **payment_verification_admin** - Admin verify payments
- **payment_method_selector** - Select PaymentMethod (QRIS, BANK, CASH)
- **payment_dashboard** - Collection dashboard dengan analytics
- **qris_code_display** - Display static QRIS dari settings

#### **🔄 Shared Components**
- **role_aware_navigation** - Navigation berdasarkan UserRole
- **notification_system** - Toast notifications
- **file_upload_component** - File upload dengan validation
- **data_table_component** - Reusable table dengan sorting/filtering
- **modal_dialogs** - Reusable modals
- **form_validation_components** - Validation dengan Prisma schema rules

---

## **⚙️ BACKEND TASKS**

### **👨‍💻 BACKEND DEVELOPER 1**
**Focus: Core System, Setup & Warga Management**

#### **🔧 Initial Setup System**
- **rt_profile_controller** - CRUD untuk RtProfile model
- **rt_settings_controller** - Manage RtSettings (email, payment, document)
- **setup_wizard_service** - Handle setup completion flow
- **initial_data_seeder** - Seed default categories, templates
- **setup_validation_service** - Validate setup completion

#### **🔐 Authentication & User Management**
- **auth_controller** - Login/logout dengan role checking
- **user_management_controller** - CRUD users sesuai UserRole enum
- **role_permission_middleware** - Check permissions berdasarkan role
- **session_management** - Handle user sessions
- **security_middleware** - CSRF, rate limiting
- **activity_log_service** - Log ke ActivityLog model

#### **👥 Warga & Family Management API**
- **warga_controller** - CRUD sesuai Warga model
- **warga_search_service** - Implement fulltext search pada full_name
- **family_controller** - CRUD Family dengan family relationships
- **warga_validation_service** - Validate NIK uniqueness, data integrity
- **bulk_operations_service** - Import/export warga
- **warga_status_service** - Handle status changes (ACTIVE, MOVED, etc)
- **family_relationship_service** - Manage FamilyRelation enum

#### **💰 Financial System API**
- **transaction_controller** - CRUD Transaction dengan TransactionCategory
- **transaction_category_controller** - Manage categories
- **budget_controller** - CRUD Budget model
- **financial_calculation_service** - Calculate totals, balances
- **financial_reports_service** - Generate reports by period
- **audit_trail_service** - Financial audit logging

#### **📊 Analytics & Reports**
- **dashboard_analytics_service** - Generate dashboard statistics
- **financial_analytics_service** - Financial charts data
- **warga_analytics_service** - Demographics analysis
- **report_generator_service** - PDF/Excel report generation

---

### **👨‍💻 BACKEND DEVELOPER 2**
**Focus: Communication, Documents & Payment Systems**

#### **📧 Email Management System**
- **email_service** - Send emails menggunakan RtSettings SMTP
- **email_queue_service** - Queue system untuk bulk emails
- **email_template_service** - Process AnnouncementTemplate
- **email_tracking_service** - Update EmailLog status
- **email_bounce_handler** - Handle bounced emails
- **email_analytics_service** - Email statistics

#### **📢 Announcement System API**
- **announcement_controller** - CRUD Announcement
- **announcement_service** - Business logic untuk sending
- **recipient_resolver_service** - Resolve recipients berdasarkan AnnouncementTargetType
- **announcement_recipient_service** - Manage AnnouncementRecipient
- **scheduled_announcement_service** - Handle scheduled sending
- **email_personalization_service** - Personalize content per recipient

#### **📄 Document Management System**
- **document_controller** - CRUD Document sesuai DocumentType
- **document_workflow_service** - Handle DocumentStatus workflow
- **pdf_generation_service** - Generate PDF dari DocumentTemplate
- **document_template_controller** - CRUD DocumentTemplate
- **digital_signature_service** - Handle signature_data
- **document_numbering_service** - Auto-generate document_number using DocumentCounter
- **document_archive_service** - Archive completed documents

#### **💳 Iuran & Payment System**
- **iuran_controller** - CRUD Iuran dengan IuranStatus
- **payment_controller** - Handle Payment dengan PaymentMethod
- **payment_verification_service** - Verify uploaded payment proofs
- **payment_tracking_service** - Track PaymentStatus
- **iuran_generation_service** - Auto-generate monthly iuran
- **payment_reminder_service** - Send payment reminders
- **collection_analytics_service** - Payment collection analytics
- **qris_management_service** - Handle QRIS dari RtSettings

#### **🔗 Integration & Utilities**
- **file_upload_service** - Handle FileUpload model
- **file_validation_service** - Validate uploaded files
- **image_processing_service** - Process images (compress, resize)
- **system_settings_service** - Manage SystemSetting model
- **backup_service** - Database backup functionality
- **health_check_service** - System health monitoring
- **job_scheduler_service** - Background job processing

---

## **🔄 APPLICATION FLOW**

### **Initial Setup Flow:**
1. **Check Setup Status** - Check RtProfile.is_setup_completed
2. **Setup Wizard** - Complete RT profile, settings, admin user
3. **Mark Complete** - Set is_setup_completed = true
4. **Redirect to Login** - Normal application flow

### **Authentication Flow:**
1. **Login** - Standard login dengan User model
2. **Role Check** - Redirect berdasarkan UserRole
3. **Session Management** - Maintain user session
4. **Activity Logging** - Log ke ActivityLog model

### **User Role Access:**
- **KETUA_RT** - Full access ke semua fitur
- **SEKRETARIS** - Documents, announcements, warga management
- **BENDAHARA** - Financial, payments, transactions
- **STAFF** - Limited access sesuai assignment
- **WARGA** - View personal info, request documents, pay iuran

### **Key Features Per Schema:**
- **Multi-document Types** - 9 jenis surat sesuai DocumentType enum
- **Family Management** - Complete family relationships
- **Financial Tracking** - Income/expense dengan categories
- **Payment Methods** - QRIS, Bank Transfer, Cash
- **Email System** - Announcements dengan tracking
- **Digital Signatures** - Document signing capability
- **Audit Trail** - Complete activity logging