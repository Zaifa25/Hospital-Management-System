# 🏥 Medicare Core — Modern Hospital Management System (HMS)

Medicare Core is a modern, high-performance, full-stack **Hospital Management System (HMS)** designed to optimize clinical operations, staff management, patient registration, appointment scheduling, and billing workflows. 

This repository is structured as a monorepo consisting of:
*   **Frontend (`/admin`)**: A visually rich, responsive administrator dashboard powered by **Next.js 15 (React 19)**, **Tailwind CSS v4**, and **Shadcn/UI**.
*   **Backend (`/backend`)**: A robust, secure RESTful API built on **Node.js & Express.js**, utilising **Prisma ORM** with a **PostgreSQL** database.

---

## 🌟 Key Features

### 🔐 1. Role-Based Access Control (RBAC)
*   Pre-configured role profiles for **Admins**, **Doctors**, and **DSAs (Doctor Support Assistants)**.
*   Secure JSON Web Token (JWT) based user authentication with hashed credentials via `bcryptjs`.

### 📊 2. Operational Analytics Dashboard
*   Real-time statistics displaying KPIs (Total Appointments, Active Patients, On-Duty Doctors, and Total Payments).
*   Interactive analytical charts displaying clinic trends and patient traffic.
*   Live list of recent appointments and system configurations (e.g., active procedures, departments, support staff).

### 👥 3. Patient Lifecycle Management
*   Full CRUD operations to register, search, and update patient files.
*   Unique Medical Record Number (MR No) generation for tracking and billing history.
*   Tracks patient demographics, age, occupation, marital status, membership status, and registration details.

### 📅 4. Appointment Booking & Scheduler
*   Book and manage appointments under specific departments and assigned doctors.
*   Automated token numbers and appointment tracking indices.
*   Flexible scheduling controls including date, day, time, and reason fields.

### 💳 5. Billing & Payments Engine
*   Manage transactions, ledger statements, and receipts.
*   Tracks billing balance sheets (Previous balance, Net totals, Current paid amount, and payment status).
*   Support for miscellaneous procedural fees (e.g., dedicated X-Ray charge and X-Ray paid tracker).

### 🏢 6. Master Hospital Entities Configuration
*   **Departments**: Create and organize clinical departments (e.g., OPD, Cardiology, Orthopedics).
*   **Procedures**: Manage medical procedure catalogs with custom costs, sequences, and active/inactive status codes.
*   **Support Staff (DSA)**: Register and track Doctor Support Assistants with background metadata, joining dates, qualifications, and contact logs.

---

## 🛠️ Technology Stack

### Frontend (`/admin`)
*   **Core Framework**: Next.js 15.2.4 (App Router) & React 19
*   **Styling**: Tailwind CSS v4 & Tailwind Animate
*   **UI Components**: Radix UI Primitives, Lucide Icons, Shadcn UI config, TanStack Table
*   **Data Fetching**: Axios & SWR (Stale-While-Revalidate for real-time reactivity)
*   **Data Visualization**: Recharts (for dynamic graphs)

### Backend (`/backend`)
*   **Server Runtime**: Node.js & Express.js
*   **Database Client**: Prisma ORM (v6.16)
*   **Database engine**: PostgreSQL
*   **Authentication**: JSON Web Tokens (JWT) & Bcrypt.js (Password Hashing)
*   **Development Tools**: Nodemon, Docker (Deployment ready)

---

## 📂 Repository Structure

```filepath
HMS/
├── README.md                 # Project root documentation (This file)
├── admin/                    # Next.js 15 Admin Dashboard Application
│   ├── app/                  # Next.js App Router (pages, dashboard sub-views)
│   ├── components/           # Reusable UI parts & custom analytics widgets
│   ├── hooks/                # Custom React hooks (dashboard metrics, data fetching)
│   ├── lib/                  # Utility functions and API clients
│   └── package.json          # Frontend packages and build scripts
└── backend/                  # Node.js REST API
    ├── config/               # Database and system configs
    ├── controllers/          # Express route handler logic
    ├── middlewares/          # JWT Auth validation and CORS configuration
    ├── prisma/               # Prisma Database Schema and migrations
    ├── routes/               # Express API endpoints definition
    ├── Dockerfile            # Container deployment manifest
    └── package.json          # Backend packages and launch scripts
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.x or higher)
*   [PostgreSQL](https://www.postgresql.org/) (Running locally or hosted)

---

### 🔧 1. Backend Setup & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environmental variables. Create a `.env` file in the `/backend` folder:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/hms_db?schema=public"
   JWT_SECRET="your_super_secret_jwt_key_here"
   CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
   ```

4. Push the database schema and apply migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed roles (Admin, Doctor, DSA) to the database:
   ```bash
   node seed-roles.js
   ```

6. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The backend server will run at `http://localhost:5000`.*

---

### 💻 2. Frontend Setup & Run

1. Navigate to the admin directory:
   ```bash
   cd ../admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the `/admin` folder to point to the backend API:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend dashboard will run at `http://localhost:3000`.*

---

## 📡 REST API Endpoint Documentation

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Register a new administrator / user |
| **Auth** | `/api/auth/login` | `POST` | Authenticate user and issue JWT |
| **Patients** | `/api/patients` | `GET` / `POST` | Fetch all patients / Admit new patient |
| **Patients** | `/api/patients/:id` | `GET` / `PUT` | View/Edit patient record |
| **Doctors** | `/api/doctors` | `GET` / `POST` | Get doctors list / Register a doctor |
| **Appointments**| `/api/appointments` | `GET` / `POST` | Fetch schedule / Create appointment token |
| **Payments** | `/api/payments` | `GET` / `POST` | Log transaction history / Record invoice |
| **Departments** | `/api/departments`| `GET` / `POST` | List hospital clinics / Create new department |
| **Procedures** | `/api/procedures` | `GET` / `POST` | Manage medical procedures and base costs |
| **DSA Support** | `/api/dsas` | `GET` / `POST` | Manage Doctor Support Assistant directory |
