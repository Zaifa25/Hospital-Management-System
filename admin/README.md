# 🩺 Medicare Core — Admin Dashboard (`/admin`)

This sub-directory contains the frontend administrator dashboard for **Medicare Core Hospital Management System (HMS)**.

## 🧰 Tech Stack
- **Framework**: Next.js 15 (App Router) & React 19
- **Styling**: Tailwind CSS v4, Tailwind Animate
- **UI & Icons**: Radix UI Primitives, Lucide Icons, Shadcn UI
- **Data & Tables**: TanStack Table, Axios, SWR

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in this directory with the following variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the admin application.

## 📜 Available Scripts
- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Compiles optimized production build.
- `npm run start`: Runs the compiled production build server.
- `npm run lint`: Runs ESLint for code formatting checks.
