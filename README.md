# Household Service Application

A comprehensive web-based platform connecting customers with service professionals for various household services. Built with Flask (Backend), Vue.js (Frontend), and Celery for asynchronous task processing.

## Features

### Core Functionality

- **Multi-Role System**: Admin, Customer, and Professional user roles
- **Service Management**: Create, update, delete, and search services
- **Service Request Workflow**: Request → Assign → Complete → Review
- **Professional Approval System**: Admin approval required for professionals
- **User Management**: Block/unblock users, approve/reject professionals
- **Rating & Review System**: Customers can rate and review completed services
- **Search Functionality**: Search services, professionals, and service requests
- **Dashboard Analytics**: Role-specific dashboards with statistics

### Advanced Features

- **Asynchronous Task Processing**: Using Celery for background jobs
- **Automated Reports**: 
  - Monthly customer activity reports (email)
  - Daily professional reminders (Google Chat webhook)
  - CSV export of service requests
- **Email Notifications**: HTML email templates for reports
- **Real-time Updates**: Professional reminders via Google Chat
- **Secure Authentication**: Token-based authentication with Flask-Security
- **Password Hashing**: Bcrypt encryption for user passwords

---

## Tech Stack

### Backend
- **Framework**: Flask 3.1.0
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: Flask-Security-Too 5.6.1
- **Task Queue**: Celery with Redis broker
- **Email**: SMTP (via mail.py)

### Frontend
- **Framework**: Vue.js 3
- **UI Framework**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Routing**: Vue Router

### Task Processing
- **Celery**: 5.x with Redis backend
- **Redis**: 6380 (broker and result backend)
- **Scheduler**: Celery Beat for periodic tasks

### Additional Libraries
- Flask-RESTful: API development
- Flask-Login: User session management
- Jinja2: Email template rendering
- Pandas/CSV: Report generation

---

## System Architecture

```
┌─────────────────┐
│   Vue.js SPA    │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Flask Backend  │
│   (REST API)    │
└────────┬────────┘
         │
    ┌────┴────┬─────────┬──────────┐
    │         │         │          │
┌───▼──┐  ┌──▼───┐  ┌──▼────┐  ┌─▼──────┐
│SQLite│  │Redis │  │Celery │  │ SMTP   │
│  DB  │  │      │  │Worker │  │Server  │
└──────┘  └──────┘  └───────┘  └────────┘
```

---

## User Roles

### 1. Admin
**Default Credentials:**
- Email: `admin@gmail.com`
- Password: `Pass@123`

**Capabilities:**
- Manage all services (create, update, delete)
- Approve/reject service professionals
- Block/unblock users
- View all service requests
- Export reports
- View analytics dashboard

### 2. Customer
**Registration Required**

**Capabilities:**
- Browse available services
- Create service requests
- View assigned professionals
- Close completed requests
- Rate and review services
- View personal dashboard
- Update profile

### 3. Professional
**Registration Required + Admin Approval**

**Capabilities:**
- View pending service requests for their service type
- Accept/reject service requests
- Mark requests as complete
- Add remarks to requests
- View assigned requests
- Update profile
- Receive daily reminders for pending requests

---

## Database Schema

### User Table
```sql
users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── password (HASHED)
├── phone
├── active (BOOLEAN)
└── fs_uniquifier (UNIQUE)
```

### Role Table
```sql
roles
├── id (PK)
├── name (UNIQUE)
└── description
```

### Customer Table
```sql
customers
├── id (PK)
├── user_id (FK -> users.id)
├── name
├── address
├── pincode
└── date_created
```

### Professional Table
```sql
professionals
├── id (PK)
├── user_id (FK -> users.id)
├── service_id (FK -> services.id)
├── name
├── description
├── experience
├── is_approved (BOOLEAN)
├── is_blocked (BOOLEAN)
└── date_created
```

### Service Table
```sql
services
├── id (PK)
├── name
├── description
├── price
├── time_required
└── date_created
```

### Service Request Table
```sql
service_requests
├── id (PK)
├── service_id (FK -> services.id)
├── customer_id (FK -> customers.id)
├── professional_id (FK -> professionals.id)
├── date_of_request
├── date_of_completion
├── service_status (requested/assigned/closed)
├── remarks
├── rating
└── review
```

---

## Scheduled Tasks

### 1. Daily Professional Reminders
**Schedule**: Every 2 minutes (for testing) - Change in production
**Function**: `daily_professional_reminders()`
**Purpose**: Sends reminders to professionals with pending service requests via Google Chat webhook

### 2. Monthly Customer Reports
**Schedule**: Every 2 minutes (for testing) - Change in production
**Function**: `monthly_customer_report()`
**Purpose**: Generates and emails monthly activity reports to all customers

### 3. CSV Export
**Type**: On-demand task
**Function**: `csv_report()`
**Purpose**: Exports all service requests to CSV file

---

## Acknowledgments

- Flask documentation
- Vue.js community
- Celery documentation
