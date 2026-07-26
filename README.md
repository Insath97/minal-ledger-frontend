# Minal Ledger — Point-of-Sale & Financial Management Web Application

> A modern, responsive, full-featured Point-of-Sale (POS) and Ledger Management dashboard built with **Next.js 16 (App Router)**, **TypeScript**, **React 19**, **Tailwind CSS v4**, and **Zustand**. Designed to seamlessly pair with the **Minal Ledger RESTful API (Laravel 12)**.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript / React 19
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, Shadcn UI, Base UI
- **State Management:** Zustand (Auth Store & UI State)
- **Form Handling & Validation:** React Hook Form + Zod (`@hookform/resolvers`)
- **HTTP Client:** Axios (JWT Bearer Token interceptors, request/response handling, mock data fallback)
- **Data Visualization:** Recharts (Interactive charts for revenue, expenses, and dues aging)

---

## Features & Modules

### 🔐 Authentication & Session Security
- JWT-based authentication with automatic token persistence via `Zustand` & `localStorage`
- Protected route layout for authenticated dashboard views
- Login, Forgot Password, and Reset Password workflows
- Google OAuth login integration support

### 📊 Dashboard & Financial Analytics
- **Overview KPI Cards:** Real-time metrics for total sales, payments received, pending dues, and net expenses
- **Recharts Integration:** Visual breakdown of monthly revenue vs. expenses, payment method splits, and expense category distributions
- **Customer Dues Aging:** Visual aging reports categorized by `0-30 days`, `31-60 days`, `61-90 days`, and `90+ days`

### 🛒 Sales & Invoicing
- Interactive sales list with multi-criteria search and filtering (Customer, Payment Status, Business Type, Date Range)
- Automatic invoice number formatting (`INV-YYYYMMDD-XXXXX`)
- Support for bill receipt image uploads and preview
- Real-time status tracking (`Unpaid`, `Partial`, `Paid`)

### 💳 Payments & FIFO Allocation
- Bulk FIFO (First-In, First-Out) payment settlement across outstanding sales
- Multiple payment method support (Cash, Bank Transfer, Cheque, Card)
- Proof of payment upload handling (`proof_image`)
- Payment reversal and detailed transaction logs

### 📑 Cheque Management
- Comprehensive cheque tracking ledger
- Status state machine (`Pending` ➔ `Cleared` / `Bounced`)
- Cheque leaf photo upload & view capability

### 👥 Customer Directory & CRM
- Auto-generated customer codes (`CUST-XXXXX`)
- Multi-file attachments (National Identity Card (NIC) & Profile Photo)
- One-click active/inactive status toggling
- Outstanding balance summary per customer

### 💼 Expense Management
- Categorized expense logging with receipt attachment support
- Monthly and date-range category breakdown summaries
- Expense vs Revenue analytics integration

### 🏦 Bank Account Management
- Bank account directory, status toggling, and payment routing configuration

### 🛡️ User Management & Spatie RBAC
- **4 Pre-configured Roles:** Super Admin, System Admin, Manager, Cashier
- Fine-grained permission assignments (~40 permissions across 11 modules)
- Role-based UI element visibility and action guards

### 📝 Activity & Audit Trail
- Read-only audit log viewer detailing user actions, affected modules, HTTP methods, IP addresses, and payload details (with sensitive fields redacted)

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages (login, forgot-password, reset-password)
│   ├── (dashboard)/     # Main dashboard application routes
│   │   ├── activity-logs/
│   │   ├── analytics/
│   │   ├── banks/
│   │   ├── cheques/
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── permissions/
│   │   ├── reports/
│   │   ├── roles/
│   │   ├── sales/
│   │   ├── settings/
│   │   ├── transactions/
│   │   └── users/
│   ├── globals.css      # CSS styling setup with Tailwind CSS v4
│   └── layout.tsx       # Root layout configuration
├── components/          # Reusable UI components & modal dialogs
├── hooks/               # Custom React hooks
├── lib/
│   ├── api/             # Axios API service clients for each backend module
│   ├── constants.ts     # System constants & dropdown configurations
│   ├── mock-data.ts     # Development fallback data
│   ├── utils.ts         # Class merging and formatting utilities
│   └── validations.ts   # Zod validation schemas
├── stores/
│   ├── auth-store.ts    # Zustand store for user session and JWT state
│   └── sidebar-store.ts # Responsive navigation state
└── types/               # TypeScript interfaces & API response definitions
```

---

## Getting Started

### Requirements
- **Node.js:** v18.0.0 or higher
- **npm** or **pnpm** or **yarn**
- **Backend API:** [Minal Ledger API (Laravel 12)](http://localhost:8000/api/v1)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url> minal-ledger-web
   cd minal-ledger-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Access Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the Minal Ledger Laravel REST API | `http://localhost:8000/api/v1` |

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Starts the Next.js development server with hot-reload |
| `build` | `npm run build` | Compiles the production-ready Next.js application |
| `start` | `npm run start` | Starts the Next.js production server |
| `lint` | `npm run lint` | Runs ESLint checks across the codebase |

---

## License

MIT License. Designed and Developed for Minal Ledger.
