# Centinel | Personal Finance Management

![Centinel Demo](./centinel.gif)

**Link:** [https://centinel-finance.vercel.app/](https://centinel-finance.vercel.app/)

Centinel is a modern, full-stack web application designed to simplify personal finance. It provides a centralized dashboard for tracking transactions, managing category-based budgets, monitoring savings goals (Pots), and keeping tabs on recurring bills.

Built with a focus on security and performance, Centinel utilizes **React 19**, **PostgreSQL**, **Supabase**, and **TypeScript** to deliver a seamless, type-safe financial tracking experience with serverless architecture.

---

## Features

- **Financial Dashboard** – High-level overview of total balance, monthly income, and expenses with interactive charts.
- **Transaction Management** – Full CRUD capabilities with advanced filtering, sorting, and pagination.
- **Budgeting** – Set monthly limits per category and visualize spending progress in real time.
- **Savings Pots** – Dedicated tracking for specific goals with easy deposit and withdrawal workflows.
- **Recurring Bills** – Automated tracking of fixed expenses with status indicators (Paid, Upcoming, Due Soon).
- **Secure Auth** – Supabase Auth with Google OAuth 2.0 integration and Row-Level Security (RLS) policies.
- **Responsive UI** – A mobile-first design built with Tailwind CSS and Radix UI components.

---

## Tech Stack

### Frontend

| Technology | Usage |
|-----------|-------|
| **React 19** | UI Library (TypeScript) |
| **Vite** | Build Tooling |
| **TanStack Query** | Server State Management & Caching |
| **Tailwind CSS** | Utility-first Styling |
| **Radix UI** | Accessible Component Primitives |
| **Recharts** | Data Visualization |
| **Zod** | Schema Validation |

### Backend

| Technology | Usage |
|-----------|-------|
| **PostgreSQL** | Relational Database |
| **Supabase** | Backend-as-a-Service Platform |
| **Supabase Auth** | Authentication & User Management |
| **Row-Level Security** | Database-level Authorization |
| **Supabase Edge Functions** | Serverless Functions (Deno Runtime) |
| **PostgreSQL Functions** | Server-side Business Logic |

---

## Getting Started

Follow these steps to run the application locally for testing and development.

### Prerequisites

- **Node.js** (v20 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/centinel.git
cd centinel
