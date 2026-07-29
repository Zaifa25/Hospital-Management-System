# 🏥 Medicare Core — Modern Hospital Management System (HMS)

Medicare Core is a modern, high-performance, full-stack **Hospital Management System (HMS)** designed to optimize clinical operations, staff management, HR & payroll workflows, patient registration, appointment scheduling, and billing.

This repository is structured as a monorepo consisting of:
* **Frontend (`/admin`)**: A visually rich, responsive administrator dashboard powered by **Next.js 15 (React 19)**, **Tailwind CSS v4**, and **Shadcn/UI**.
* **Backend (`/backend`)**: A robust, secure RESTful API built on **Node.js & Express.js**, utilizing **Prisma ORM** with a **PostgreSQL** database.

---

## 🌟 Key Features

### 🔐 1. Role-Based Access Control (RBAC)
* Pre-configured role profiles for **Admin**, **HR Manager**, **Doctor**, and **Receptionist**.
* Dedicated role permissions ensuring HR users access only HR & Staff Management modules.
* Secure JSON Web Token (JWT) based authentication with hashed credentials via `bcryptjs`.

### 👔 2. HR & Employee Management Module
* **Staff Directory (`/admin/employees`)**: Register and manage hospital staff (Nurses, OT Assistants, Technicians, Receptionists, Administrative Staff) with salaries, CNIC, and joining details.
* **Daily Attendance Sheet (`/admin/attendance`)**: Interactive bulk attendance sheet for quick daily staff attendance check-ins (Present, Late, Half-day, On Leave, Absent).
* **Monthly Payroll & Salary Slips (`/admin/payroll`)**: Month-by-month salary sheet generation, status tracking (`Paid` / `Pending`), bulk payout approvals, and printable official hospital salary slips.

### 👥 3. Patient Lifecycle Management
* Full CRUD operations to register, search, and update patient files.
* Unique Medical Record Number (MR No) generation for tracking and billing history.
* Tracks patient demographics, age, occupation, marital status, and registration details.

### 📅 4. Appointment Booking & Scheduler
* Book and manage appointments under specific departments and assigned doctors.
* Automated token numbers and appointment tracking indices.
* Flexible scheduling controls including date, day, time, and reason fields.

### 💳 5. Billing & Payments Engine
* Manage transactions, ledger statements, and receipts.
* Tracks billing balance sheets (Previous balance, Net totals, Current paid amount, and payment status).

---

## 🔑 Pre-Configured Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@hospital.com` | `password123` |
| **HR Manager** | `hr@hospital.com` | `password123` |
| **Receptionist** | `receptionist@hospital.com` | `password123` |

---

## 🚀 Quick Start & Setup Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **PostgreSQL**: Local instance or cloud database (e.g. Neon, Supabase)
* **npm** or **yarn** package manager

### 1. Backend Setup (`/backend`)
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Admin Dashboard Setup (`/admin`)
```bash
cd admin
npm install
npm run dev
```

The admin portal will be running at `http://localhost:3000` and the API server at `http://localhost:5001`.

---

## 🛠️ Technology Stack

### Frontend (`/admin`)
* **Core Framework**: Next.js 15.2.4 (App Router) & React 19
* **Styling**: Tailwind CSS v4 & Tailwind Animate
* **UI Components**: Radix UI Primitives, Lucide Icons, Shadcn UI config, TanStack Table
* **Data Fetching**: Axios & SWR for real-time reactivity

### Backend (`/backend`)
* **Runtime**: Node.js & Express.js
* **Database & ORM**: PostgreSQL & Prisma ORM
* **Security & Auth**: JWT (`jsonwebtoken`) & `bcryptjs`
