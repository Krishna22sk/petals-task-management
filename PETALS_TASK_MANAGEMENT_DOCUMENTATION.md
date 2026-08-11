# 🌸 PETALS TASK MANAGEMENT & SAAS AUTOMATION PLATFORM
## Comprehensive System Architecture & Technical Documentation

---

## 1. Executive Summary

**Petals Task Management** is a full-featured, enterprise-grade Task & Sprint Management SaaS Platform engineered specifically for engineering teams, team leaders, and HR administrators. Built using a modern JavaScript stack, the application features strict tri-role Access Control (Admin/HR, Team Leader, Employee), real-time runtime tracking, persistent database state across page refreshes (F5), downloadable reports (Excel CSV & PDF), support query ticketing, and user profile management.

---

## 2. Technology Stack & Programming Languages

| Layer | Technology / Tool | Purpose & Usage |
| :--- | :--- | :--- |
| **Frontend Language** | **JavaScript (ES6+ / JSX)** | Reactive UI components, state management, asynchronous REST calls |
| **Markup & Styling** | **HTML5 & Vanilla CSS3 / TailwindCSS** | Glassmorphism styling, responsive flex/grid layouts, custom themes |
| **Frontend Framework** | **React 18** | Functional component architecture, hooks (`useState`, `useEffect`, `useCallback`, `useRef`) |
| **Build Tool & Bundler**| **Vite** | Ultra-fast HMR dev server and optimized production bundling |
| **Backend Runtime** | **Node.js (v18+)** | Asynchronous event-driven backend API execution environment |
| **Backend Framework** | **Express.js (v4)** | Modular REST API routing, CORS preflight, middleware pipelines |
| **Database Engine** | **SQLite (`dev.db`) / PostgreSQL** | ACID-compliant relational data storage |
| **Database ORM** | **Prisma ORM (v5+)** | Schema modeling, migrations, type-safe database queries |
| **Authentication** | **JWT (JSON Web Tokens)** | Bearer authorization header tokens for secure API access |
| **Security & Hashing** | **Bcrypt.js & Helmet.js** | Password hashing, security headers, rate limiting |
| **UI Icon Library** | **Lucide React** | High-definition vector icons across all dashboard modules |

---

## 3. Core System Architecture & Role-Based Access Control (RBAC)

The application enforces a strict **Tri-Role RBAC Model**:

```
+-------------------------------------------------------------------+
|                        ADMIN / HR ROLE                            |
|  - Full System Control & Analytics                                |
|  - Employee Management (Add / Delete / Toggle Status)             |
|  - View & Respond to Employee Queries                             |
|  - Export Excel CSV & PDF Reports                                 |
|  - Filter Tasks by Specific Employees                             |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                       TEAM LEADER (TL) ROLE                       |
|  - Assign Tasks to Sprint Engineers                               |
|  - Monitor Live Runtime & Work Logs                               |
|  - Edit Tasks, Deadlines & Project Assignments                    |
|  - Filter Tasks by Specific Employees                             |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                          EMPLOYEE ROLE                            |
|  - View Assigned Work Items                                       |
|  - Start / Pause (Hold) / Complete Live Task Timers               |
|  - Enter Hold & Completion Remarks                                |
|  - Upload Custom Profile Picture from PC                          |
|  - Submit HR Support Queries                                      |
+-------------------------------------------------------------------+
```

---

## 4. Key Database Schema Models (Prisma ORM)

### **A. User & Profile Schema**
- `id` (UUID string, primary key)
- `email` (Unique string)
- `name` (String)
- `password` (Hashed string)
- `profile_image` (Base64 data URL / string)
- `role` (Relation to Role model)

### **B. Employee Schema**
- `id` (UUID string, primary key)
- `user_id` (Foreign key to User)
- `name`, `email`, `role`, `designation`, `department`
- `avatar` (Base64 profile image string)
- `status` (`Active` / `Inactive`)

### **C. Task Schema**
- `id` (UUID primary key)
- `task_code` (Formatted human-readable string e.g., `TSK-801`)
- `task_title`, `description`, `category`, `priority`
- `status` (`Pending`, `In Progress`, `On Hold`, `Review`, `Completed`)
- `assigned_to` (Employee ID), `assigned_by` (TL Name)
- `actual_hours` (Float), `completion_percentage` (Int)
- `start_date`, `due_date`, `completed_at`

### **D. Employee Query Schema**
- `id` (UUID primary key)
- `query_code` (Formatted ticket code e.g., `#QRY-101`)
- `employee_name`, `employee_email`, `subject`, `message`
- `status` (`Pending`, `Resolved`)
- `reply` (JSON string with HR response text, author, timestamp)

---

## 5. Main Features & Technical Highlights

### **1. Continuous F5 Timer Persistence**
- When an employee starts a task (**▶ Start**), the precise timestamp (`Date.now()`) and base seconds are saved to `localStorage` under `petals_active_timers`.
- Upon browser refresh (F5), the app calculates `elapsed = baseSeconds + Math.floor((Date.now() - timerStartedAt) / 1000)` and continues running seamlessly without resetting to `00:00:00`.

### **2. Employee Profile Photo Upload & Synchronization**
- Includes a client-side HTML5 Canvas auto-compression engine that resizes high-res PC photos into crisp 400x400 ~30KB JPEGs.
- Server payload limit raised to `50mb` (`express.json({ limit: '50mb' })`).
- Updates `User` and `Employee` database tables. The avatar syncs immediately across top Header, Sidebar, User Menu, Task Tables, and Employee Directory.

### **3. HR & TL Employee Task Filter**
- A dedicated **`Employee: All Employees`** dropdown is embedded in the Task Directory header for HR and Team Leaders.
- Selecting any engineer filters the directory in real-time to show **only that employee's assigned tasks**.

### **4. Clean Task & Ticket Identifiers**
- Replaced 36-character database UUID strings (`a0816b32-76b9-...`) with clean, professional codes (`TSK-801`, `TSK-A0816B`, `#QRY-101`) across all UI tables, Kanban cards, Calendar day boxes, and Timeline bars.

### **5. Reports & Data Exports**
- **Excel Spreadsheet Export**: Downloads task logs in `.CSV` format with columns for Employee Name, Task Name, TL Name, Status, Runtime, Start & End Dates.
- **PDF Report Export**: Generates printable PDF summary documents.

---

## 6. REST API Endpoints

### **Authentication (`/api/auth`)**
- `POST /api/auth/login` — Login user and issue JWT bearer token
- `POST /api/auth/logout` — Invalidate user session
- `GET /api/auth/me` — Fetch current logged-in user profile
- `PUT /api/auth/profile` — Save compressed Base64 profile photo to database

### **Tasks (`/api/tasks`)**
- `GET /api/tasks` — Fetch all tasks
- `POST /api/tasks` — Create new task (TL/Admin)
- `POST /api/tasks/:id` — Update task status, runtime hours, and hold notes
- `DELETE /api/tasks/:id` — Delete task permanently from database

### **Employees (`/api/employees`)**
- `GET /api/employees` — Fetch employee directory
- `POST /api/employees` — Register new employee record
- `PUT /api/employees/:id` — Update employee designation/department
- `DELETE /api/employees/:id` — Remove employee record

### **Queries & Support (`/api/queries`)**
- `GET /api/queries` — Fetch employee support tickets
- `POST /api/queries` — Submit new employee query
- `POST /api/queries/:id/reply` — Submit HR official response and mark as Resolved

### **Notifications (`/api/notifications`)**
- `GET /api/notifications` — Fetch user notifications
- `PATCH /api/notifications/mark-read` — Mark all user notifications as read in database

---

## 7. Deployment Instructions

### **A. Local Command Execution**
```cmd
# 1. Start Server
cd server
npx prisma db push
node server.js

# 2. Build Frontend Production Assets
cd ..
npm run build
```

### **B. Hosting on Netlify (Frontend)**
- The workspace includes [netlify.toml](file:///c:/Users/Admin/.gemini/antigravity-ide/scratch/petals-task-management/netlify.toml) and [public/_redirects](file:///c:/Users/Admin/.gemini/antigravity-ide/scratch/petals-task-management/public/_redirects).
- Live Frontend URL: `https://petaltask.netlify.app`
- Configured with explicit CORS headers (`Access-Control-Allow-Origin: https://petaltask.netlify.app`) for seamless REST API integration.

---
*Documentation compiled for Petals Automation SaaS Platform.*
