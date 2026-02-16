# Centinel | Personal Finance Management

![Centinel Demo](./centinel.gif)

Link: https://centinel-finance.vercel.app/

Centinel is a modern, full-stack web application designed to simplify personal finance. It provides a centralized dashboard for tracking transactions, managing category-based budgets, monitoring savings goals (Pots), and keeping tabs on recurring bills.

Built with a focus on security and performance, Centinel utilizes **React 19**, **Node.js**, and **TypeScript** to deliver a seamless, type-safe financial tracking experience.

---

## Features

- **Financial Dashboard** – High-level overview of total balance, monthly income, and expenses with interactive charts.
- **Transaction Management** – Full CRUD capabilities with advanced filtering, sorting, and pagination.
- **Budgeting** – Set monthly limits per category and visualize spending progress in real time.
- **Savings Pots** – Dedicated tracking for specific goals with easy deposit and withdrawal workflows.
- **Recurring Bills** – Automated tracking of fixed expenses with status indicators (Paid, Upcoming, Due Soon).
- **Secure Auth** – JWT-based authentication complemented by Google OAuth integration.
- **Responsive UI** – A mobile-first design built with Tailwind CSS and Radix UI components.

---

## Tech Stack

### Frontend

| Technology | Usage |
|-----------|-------|
| **React 19** | UI Library (TypeScript) |
| **Vite** | Build Tooling |
| **React Query** | Server State Management |
| **Tailwind CSS** | Utility-first Styling |
| **Recharts** | Data Visualization |
| **Zod** | Schema Validation |

### Backend

| Technology | Usage |
|-----------|-------|
| **Node.js** | Runtime Environment |
| **Express 5** | Web Framework |
| **MongoDB** | NoSQL Database |
| **Mongoose** | ODM for MongoDB |
| **Passport / JWT** | Authentication & Security |
| **Helmet / Rate Limit** | Middleware Security |

---

## Getting Started

### Prerequisites

- **Node.js** (v20 or higher)
- **MongoDB** (Local instance or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/centinel.git
cd centinel
```

2. **Setup Server**
```bash
cd server
npm install
```

3. **Setup Client**
```bash
cd ../client
npm install
```

---

## Configuration

Create a `.env` file in both the `server` and `client` directories.

### Server (`server/.env`)
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_id
```

### Client (`client/.env`)
```env
VITE_GOOGLE_CLIENT_ID=your_google_id
```

---

## 💻 Usage

### Development Mode

Run the **Server**
```bash
cd server
npm run dev
```

Run the **Client**
```bash
cd client
npm run dev
```

The app will run at:
```
http://localhost:5173
```

### Production Build

1. **Server**
```bash
cd server
npm run build
npm start
```

2. **Client**
```bash
cd client
npm run build
```

---

## Security Features

- **JWT Authentication** – Stateless, secure API authentication
- **Bcrypt** – Industry-standard password hashing
- **Helmet** – Sets secure HTTP headers
- **Rate Limiting** – Prevents brute-force attacks

---

## License

Centinel is released under the MIT License. See the LICENSE file for more details..

---
