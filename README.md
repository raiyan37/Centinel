# Centinel | Personal Finance Management

![Centinel Demo](./centinel.gif)

Link: https://centinel-finance.vercel.app/

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

### Prerequisites

- **Node.js** (v20 or higher)
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))
- **npm** or **yarn**

### Installation

1. **Clone the repository**

git clone https://github.com/your-username/centinel.git
cd centinel

2. **Setup Client**

cd client
npm install

3. **Setup Supabase Project**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migrations from `supabase/migrations/` in your Supabase SQL Editor
   - Enable Google OAuth provider in Authentication settings

---

## Configuration

Create a `.env` file in the `client` directory.

### Client (`client/.env`)

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

**Get these values from:**
- Supabase Dashboard → Project Settings → API

---

## 💻 Usage

### Development Mode

Run the **Client**

cd client
npm run dev

The app will run at:

http://localhost:5173

### Production Build

**Client**

cd client
npm run build

Deploy the `dist` folder to Vercel, Netlify, or any static hosting service.

---

## Database Schema

The application uses PostgreSQL with the following core tables:

- **profiles** – User account information and balance
- **transactions** – Financial transactions with categorization
- **budgets** – Category-based spending limits
- **pots** – Savings goals and targets

All tables are protected by **Row-Level Security (RLS)** policies that ensure users can only access their own data.

---

## Security Features

- **Supabase Auth** – Managed authentication with automatic JWT handling
- **OAuth 2.0** – Google sign-in integration
- **Row-Level Security (RLS)** – Database-level access control
- **PostgreSQL Functions** – Server-side validation and atomic operations
- **Automatic Token Refresh** – Seamless session management

---

## Architecture Highlights

- **Serverless** – No backend server to maintain; all logic runs in PostgreSQL functions and Supabase Edge Functions
- **Type-Safe** – End-to-end TypeScript with Zod schema validation
- **Optimistic Updates** – TanStack Query provides instant UI feedback
- **Real-time Capable** – Built on Supabase's real-time infrastructure

---

## License

Centinel is released under the MIT License. See the LICENSE file for more details.

---
