# 🌸 Petals Automation - Enterprise Task Management SaaS Platform

A complete, enterprise-grade Task Management SaaS solution built with **React, Node.js, Express.js, PostgreSQL, Prisma ORM, JWT, Zod, Multer, Nodemailer, Winston, Helmet, CORS, and Docker**.

---

## 🚀 Technology Stack

- **Frontend**: React, Vite, TailwindCSS (100% Unchanged UI/UX)
- **Backend Framework**: Node.js, Express.js (ES Modules)
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with Refresh Tokens & Role-Based Access Control (RBAC)
- **Password Security**: bcrypt password hashing
- **Validation**: Zod Schema Validation
- **Uploads**: Multer with file type filtering (Images, PDF, Excel, ZIP) and size limits
- **Email Notifications**: Nodemailer
- **Logging**: Winston Structured Logger
- **Security Headers & Protection**: Helmet, CORS, Express Rate Limiter
- **Deployment & DevOps**: Docker, Docker Compose, Prisma Migrations & Seeders

---

## 🛠️ Getting Started & Local Development

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher) or Docker Desktop

### 1. Database Setup & Seeding

Navigate to the `server/` directory:

```bash
cd server
npm install
```

Copy the `.env.example` file to `.env` and configure your PostgreSQL database connection:

```bash
cp .env.example .env
```

Run Prisma migrations and seed default data:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 2. Start the Backend API Server

```bash
npm run dev
```

The Express API server will start on `http://localhost:5000/api`.

### 3. Start the Frontend Application

In the root workspace directory:

```bash
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🐳 Docker Deployment

To run the complete production environment using Docker Compose:

```bash
docker-compose up --build -d
```

This starts:
- **PostgreSQL 16 Container** on port `5432`
- **Express Backend API Container** on port `5000`

---

## 🔐 Default Demo Accounts

| Role | Email | Default Password |
| --- | --- | --- |
| **Admin** | `admin@petals.com` | `admin123` |
| **Team Leader** | `tl@petals.com` | `tl123` |

---

## 📡 Key REST API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/change-password`

### Task Management
- `GET /api/tasks` (Supports filtering by status, priority, employeeId, search)
- `POST /api/tasks` (Create Task)
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `PATCH /api/tasks/:id/priority`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/comments`
- `POST /api/tasks/:id/attachments` (Multer upload)
- `POST /api/tasks/:id/time-tracking`

### Projects & Employees
- `GET /api/projects` | `POST /api/projects` | `PUT /api/projects/:id` | `DELETE /api/projects/:id`
- `GET /api/employees` | `POST /api/employees` | `PUT /api/employees/:id` | `DELETE /api/employees/:id`

### Analytics & Reports
- `GET /api/reports/dashboard`
- `GET /api/reports/performance`
- `GET /api/reports/task-analytics`
- `GET /api/activity-logs`
- `GET /api/search?q=...`
