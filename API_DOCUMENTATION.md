# Petals Automation Task Management REST API Specification

This document details the RESTful API endpoints, request schemas, parameters, and authentication rules for the **Petals Automation Task Management System**.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /auth/login`
Authenticates a user and issues a JSON Web Token (JWT).

**Request Body:**
```json
{
  "email": "vikram.s@petalsautomation.com",
  "password": "SecretPassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-101",
    "name": "Vikram Sharma",
    "email": "vikram.s@petalsautomation.com",
    "role": "Admin",
    "designation": "Principal Embedded Systems Engineer"
  }
}
```

---

## 2. Task Management Endpoints

### `GET /tasks`
Retrieves a list of tasks with optional query string filters.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Query Parameters:**
- `status`: Filter by `Pending`, `In Progress`, `Review`, `Completed`
- `priority`: Filter by `Low`, `Medium`, `High`, `Critical`
- `employeeId`: Filter tasks assigned to a specific engineer ID
- `search`: Free text search term

**Response (200 OK):**
```json
[
  {
    "id": "TSK-801",
    "title": "Implement Fieldbus CANopen Driver Protocol Stack",
    "project": "STM32 Dual-Core Motor Controller Firmware",
    "category": "Embedded Software",
    "priority": "Critical",
    "status": "In Progress",
    "dueDate": "2026-08-08",
    "estimatedTime": 24,
    "actualTime": 18
  }
]
```

### `POST /tasks`
Dispatches a new task card into the workflow.

**Request Body:**
```json
{
  "title": "Design 24V Isolated Power Supply Circuit",
  "projectId": "prj-103",
  "category": "Hardware & PCB",
  "priority": "High",
  "assigneeId": "emp-02",
  "dueDate": "2026-08-20",
  "estimatedTime": 20,
  "description": "High-efficiency buck regulator design with low EMI emissions."
}
```

### `PATCH /tasks/:id/status`
Updates the workflow column status of a task.

**Request Body:**
```json
{
  "status": "Completed"
}
```

---

## 3. Reports & Performance Endpoints

### `GET /reports/performance`
Retrieves completion velocity and employee efficiency metrics.

**Response (200 OK):**
```json
{
  "overallVelocity": 84.5,
  "totalHoursLogged": 890,
  "sprintEfficiency": 93.8
}
```
