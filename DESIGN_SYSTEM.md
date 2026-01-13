# Centinel - Design System

> **Note:** This design system document is based on analysis of the existing codebase structure and data schema. All design tokens, measurements, and component specifications should be validated against the Figma design file.

**Figma File:** https://www.figma.com/design/Plo0FsVIRBuDRmv8N5eX79/personal-finance-app?node-id=182-285&m=dev&t=byAYhpFqn8rqfPsQ-1

---

## 1. Design Token Extraction

### 1.1 Colors

#### Primary Colors
Based on the theme colors found in `data.json`:

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| **Turquoise/Teal** | `#277C78` | Budgets (Entertainment), Pots (Savings) |
| **Cyan** | `#82C9D7` | Budgets (Bills), Pots (Gift) |
| **Beige/Peach** | `#F2CDAC` | Budgets (Dining Out), Pots (New Laptop) |
| **Slate Grey** | `#626070` | Budgets (Personal Care), Pots (Concert Ticket) |
| **Purple** | `#826CB0` | Pots (Holiday) |

#### Semantic Colors (To be validated in Figma)
| Purpose | Color (Estimated) | Usage |
|---------|-------------------|-------|
| **Success** | TBD (likely green variant) | Positive transactions, successful states |
| **Error/Warning** | TBD (likely red variant) | Negative transactions, errors, overdue bills |
| **Info** | TBD (likely blue variant) | Informational messages, neutral states |
| **Background Primary** | TBD | Main app background |
| **Background Secondary** | TBD | Card backgrounds, elevated surfaces |
| **Text Primary** | TBD (likely dark grey/black) | Primary text content |
| **Text Secondary** | TBD (likely medium grey) | Secondary text, labels |
| **Text Tertiary** | TBD (likely light grey) | Helper text, placeholders |
| **Border** | TBD (likely light grey) | Dividers, card borders |

#### Theme Palette (Available in UI)
The application supports 15 theme colors for budgets and pots:
- Green
- Yellow
- Cyan
- Navy
- Red
- Purple
- Turquoise
- Brown
- Magenta
- Blue
- Navy Grey
- Army Green
- Pink
- Gold
- Orange

**Action Required:** Extract exact hex values for each theme color from Figma.

---

### 1.2 Typography

#### Font Family
- **Primary Font:** Public Sans (Variable Font)
  - Variable font file: `PublicSans-VariableFont_wght.ttf`
  - Italic variable: `PublicSans-Italic-VariableFont_wght.ttf`
  - Static fonts available:
    - Regular: `PublicSans-Regular.ttf`
    - Bold: `PublicSans-Bold.ttf`

#### Typography Scale (To be validated in Figma)

| Style | Font Size | Font Weight | Line Height | Usage | Example |
|-------|-----------|-------------|-------------|-------|---------|
| **H1 / Display** | TBD (likely 32-40px) | Bold (700) | TBD | Page titles, main headings | "Overview" |
| **H2 / Headline** | TBD (likely 24-28px) | Bold (700) | TBD | Section headers | "Budgets", "Transactions" |
| **H3 / Subhead** | TBD (likely 20-22px) | Bold (700) or Semi-bold (600) | TBD | Card titles, subsection headers | "Current Balance" |
| **Body Large** | TBD (likely 18px) | Regular (400) | TBD | Important body text | Transaction amounts |
| **Body** | TBD (likely 16px) | Regular (400) | TBD | Standard body text | Transaction names, descriptions |
| **Body Small** | TBD (likely 14px) | Regular (400) | TBD | Secondary information | Dates, categories |
| **Caption** | TBD (likely 12px) | Regular (400) | TBD | Helper text, labels | "See Details", metadata |
| **Button** | TBD (likely 16-18px) | Semi-bold (600) or Bold (700) | TBD | Button labels | "Add New Budget" |

**CSS Font Loading:**
```css
@font-face {
  font-family: 'Public Sans';
  src: url('./assets/fonts/PublicSans-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
}

@font-face {
  font-family: 'Public Sans';
  src: url('./assets/fonts/PublicSans-Italic-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: italic;
}
```

**Action Required:** Extract exact font sizes, line heights, and letter spacing from Figma text styles.

---

### 1.3 Spacing & Layout

#### Grid System (To be validated in Figma)
**Estimated:** 8px base grid system (common in modern design systems)

#### Spacing Scale (To be validated in Figma)

| Token Name | Value (Estimated) | Usage | CSS Variable |
|------------|-------------------|-------|--------------|
| **XS** | 4px | Tight spacing, icon padding | `--spacing-xs` |
| **SM** | 8px | Component internal padding | `--spacing-sm` |
| **MD** | 16px | Standard gap between elements | `--spacing-md` |
| **LG** | 24px | Section spacing | `--spacing-lg` |
| **XL** | 32px | Large section spacing | `--spacing-xl` |
| **2XL** | 48px | Page-level spacing | `--spacing-2xl` |
| **3XL** | 64px | Major section separation | `--spacing-3xl` |

#### Layout Breakpoints (To be validated in Figma)

| Breakpoint | Width | Usage |
|------------|-------|-------|
| **Mobile** | < 768px | Mobile-first design (primary) |
| **Tablet** | 768px - 1024px | Tablet layouts |
| **Desktop** | > 1024px | Desktop layouts |

#### Container Max Widths (To be validated in Figma)
- Mobile: Full width with padding
- Tablet: ~700px
- Desktop: ~1200px (TBD)

**Action Required:** Measure exact spacing values from Figma using spacing tools/measurements.

---

### 1.4 Border Radius

| Token Name | Value (Estimated) | Usage |
|------------|-------------------|-------|
| **None** | 0px | Square elements |
| **SM** | 4px | Small elements, tags |
| **MD** | 8px | Standard buttons, inputs |
| **LG** | 12px | Cards, modals |
| **XL** | 16px | Large cards, containers |
| **Full** | 9999px | Pills, avatars |

**Action Required:** Extract exact border radius values from Figma.

---

### 1.5 Shadows & Elevation

| Elevation Level | Shadow (To be validated) | Usage |
|-----------------|--------------------------|-------|
| **0 (None)** | None | Flat elements |
| **1** | TBD | Subtle elevation, cards |
| **2** | TBD | Modals, dropdowns |
| **3** | TBD | Floating action buttons, tooltips |

**Action Required:** Extract exact shadow values (offset, blur, spread, color, opacity) from Figma.

---

## 2. Component Architecture

### 2.1 Atomic Components (Smallest building blocks)

#### Buttons
- **Primary Button**: Main actions (Add New Budget, Save Changes)
- **Secondary Button**: Secondary actions
- **Text Button**: Tertiary actions (See Details, View All)
- **Icon Button**: Icon-only actions (Minimize Menu, Close Modal)
- **States**: Default, Hover, Active, Disabled, Loading

#### Input Fields
- **Text Input**: Single-line text (Pot Name, Search)
- **Number Input**: Numeric values (Maximum Spend, Target, Amount)
- **Select/Dropdown**: Category selection, Sort options
- **States**: Default, Focused, Error, Disabled

#### Typography
- **Headings**: H1, H2, H3
- **Body Text**: Regular, Small
- **Labels**: Form labels, metadata
- **Links**: Text links

#### Icons
- **Navigation Icons**: Overview, Transactions, Budgets, Pots, Recurring Bills
- **Action Icons**: Caret (down/left/right), Close, Search, Filter, Sort, Ellipsis
- **Status Icons**: Bill Due, Bill Paid, Selected, Show/Hide Password
- **Illustrations**: Authentication illustration
- **Sizes**: Small (16px), Medium (24px), Large (32px), Extra Large (48px)

#### Avatar
- **Circular Avatar**: Transaction recipients/senders, user profile
- **Sizes**: Small (32px), Medium (48px), Large (64px)

#### Badge/Tag
- **Category Badge**: Transaction categories
- **Status Badge**: Bill paid/due status

#### Progress Bar
- **Budget Progress**: Visual indicator of budget usage
- **Pot Progress**: Visual indicator of savings progress

---

### 2.2 Molecular Components (Combinations of atoms)

#### Card Components
- **Stat Card**: Current Balance, Income, Expenses
- **Budget Card**: Budget item with progress bar
- **Pot Card**: Pot item with progress and actions
- **Transaction Card**: Transaction row with avatar, name, category, date, amount
- **Bill Card**: Recurring bill with status and details

#### Form Components
- **Budget Form**: Category select + Maximum spend input + Theme selector
- **Pot Form**: Name input + Target input + Theme selector
- **Add to Pot Form**: Amount input with current/target display
- **Withdraw from Pot Form**: Amount input with current/target display

#### Navigation Components
- **Sidebar Navigation**: Main navigation menu (Overview, Transactions, Budgets, Pots, Recurring Bills)
- **Bottom Navigation**: Mobile navigation (likely same items as sidebar)
- **Breadcrumbs**: Page hierarchy (if applicable)

#### Modal/Dialog Components
- **Add/Edit Budget Modal**: Form modal for budget creation/editing
- **Delete Budget Modal**: Confirmation modal
- **Add/Edit Pot Modal**: Form modal for pot creation/editing
- **Delete Pot Modal**: Confirmation modal
- **Add to Pot Modal**: Amount input modal
- **Withdraw from Pot Modal**: Amount input modal

#### List Components
- **Transaction List**: Sortable, filterable list of transactions
- **Budget List**: Grid/list of budget cards
- **Pot List**: Grid/list of pot cards
- **Bill List**: List of recurring bills

#### Search & Filter Components
- **Search Input**: With search icon, placeholder text
- **Sort Dropdown**: Latest, Oldest, A-Z, Z-A, Highest, Lowest
- **Category Filter**: Multi-select or single-select category filter

#### Pagination
- **Pagination Controls**: Prev/Next buttons for transaction list

---

### 2.3 Organism Components (Complete UI sections)

#### Header
- **Page Title**: Section heading
- **Action Button**: Primary action (e.g., "Add New Budget")
- **Menu Toggle**: Minimize menu button (desktop)

#### Dashboard/Overview Section
- **Balance Summary**: Current Balance, Income, Expenses cards
- **Pots Summary**: Total saved with "See Details" link
- **Budgets Summary**: Budget overview with "See Details" link
- **Recent Transactions**: Transaction list preview with "View All" link
- **Recurring Bills Summary**: Bills overview with "See Details" link

#### Transaction Page
- **Page Header**: Title + Search bar
- **Filters Section**: Sort dropdown + Category filter
- **Transaction Table/List**: Data table with columns (Recipient/Sender, Category, Date, Amount)
- **Pagination**: Prev/Next navigation

#### Budget Page
- **Page Header**: Title + "Add New Budget" button
- **Budget Grid/List**: Collection of budget cards
- **Empty State**: When no budgets exist

#### Pot Page
- **Page Header**: Title + "Add New Pot" button
- **Pot Grid/List**: Collection of pot cards
- **Empty State**: When no pots exist

#### Recurring Bills Page
- **Page Header**: Title
- **Summary Section**: Total Bills, Paid Bills, Total Upcoming, Due Soon
- **Search Bar**: Filter bills
- **Sort Dropdown**: Sort options
- **Bill List**: List of recurring bills

---

### 2.4 Suggested Folder Structure (MERN Stack)

#### Frontend (React + TypeScript)
```
client/
├── public/
│   └── assets/
│       ├── fonts/
│       ├── images/
│       └── icons/
│
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Avatar/
│   │   │   ├── Icon/
│   │   │   ├── Badge/
│   │   │   ├── ProgressBar/
│   │   │   └── Typography/
│   │   │
│   │   ├── molecules/
│   │   │   ├── Card/
│   │   │   │   ├── StatCard/
│   │   │   │   ├── BudgetCard/
│   │   │   │   ├── PotCard/
│   │   │   │   ├── TransactionCard/
│   │   │   │   └── BillCard/
│   │   │   ├── Form/
│   │   │   │   ├── BudgetForm/
│   │   │   │   ├── PotForm/
│   │   │   │   └── AddToPotForm/
│   │   │   ├── Navigation/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── BottomNav/
│   │   │   │   └── Breadcrumbs/
│   │   │   ├── Modal/
│   │   │   │   ├── BaseModal/
│   │   │   │   ├── ConfirmModal/
│   │   │   │   └── FormModal/
│   │   │   ├── Search/
│   │   │   ├── Filter/
│   │   │   └── Pagination/
│   │   │
│   │   ├── organisms/
│   │   │   ├── Header/
│   │   │   ├── Dashboard/
│   │   │   ├── TransactionPage/
│   │   │   ├── BudgetPage/
│   │   │   ├── PotPage/
│   │   │   └── RecurringBillsPage/
│   │   │
│   │   └── templates/
│   │       ├── AppLayout/
│   │       └── AuthLayout/
│   │
│   ├── pages/
│   │   ├── Overview/
│   │   ├── Transactions/
│   │   ├── Budgets/
│   │   ├── Pots/
│   │   ├── RecurringBills/
│   │   └── Auth/
│   │
│   ├── hooks/
│   │   ├── useTransactions.ts
│   │   ├── useBudgets.ts
│   │   ├── usePots.ts
│   │   └── useAuth.ts
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── transactions.ts
│   │   │   ├── budgets.ts
│   │   │   ├── pots.ts
│   │   │   ├── bills.ts
│   │   │   └── auth.ts
│   │   └── axios.ts
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   │
│   ├── types/
│   │   ├── transaction.ts
│   │   ├── budget.ts
│   │   ├── pot.ts
│   │   ├── bill.ts
│   │   └── user.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── styles/
│   │   ├── tokens/
│   │   │   ├── colors.css
│   │   │   ├── typography.css
│   │   │   ├── spacing.css
│   │   │   ├── shadows.css
│   │   │   └── index.css
│   │   ├── base/
│   │   │   ├── reset.css
│   │   │   ├── fonts.css
│   │   │   └── global.css
│   │   └── utilities/
│   │       ├── layout.css
│   │       └── helpers.css
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env
```

#### Backend (Node.js + Express + TypeScript)
```
server/
├── src/
│   ├── models/
│   │   ├── User.ts
│   │   ├── Transaction.ts
│   │   ├── Budget.ts
│   │   ├── Pot.ts
│   │   └── RecurringBill.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── transactions.routes.ts
│   │   ├── budgets.routes.ts
│   │   ├── pots.routes.ts
│   │   └── bills.routes.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── transactions.controller.ts
│   │   ├── budgets.controller.ts
│   │   ├── pots.controller.ts
│   │   └── bills.controller.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── balance.service.ts
│   │   └── recurring-bill.service.ts
│   │
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── db.ts
│   │   ├── jwt.ts
│   │   └── validators.ts
│   │
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   │
│   └── app.ts
│
├── package.json
├── tsconfig.json
└── .env
```

---

## 3. Data Schema Inference

### 3.1 TypeScript Interfaces

Based on `data.json` structure:

```typescript
// Balance
interface Balance {
  current: number;      // Current account balance (e.g., 4836.00)
  income: number;       // Total income (e.g., 3814.25)
  expenses: number;     // Total expenses (e.g., 1700.50)
}

// Transaction
interface Transaction {
  avatar: string;       // Path to avatar image (e.g., "./assets/images/avatars/emma-richardson.jpg")
  name: string;         // Recipient or sender name (e.g., "Emma Richardson")
  category: TransactionCategory;
  date: string;         // ISO 8601 date string (e.g., "2024-08-19T14:23:11Z")
  amount: number;       // Positive for income, negative for expenses (e.g., 75.50 or -55.50)
  recurring: boolean;   // Whether transaction is recurring
}

type TransactionCategory =
  | "Entertainment"
  | "Bills"
  | "Groceries"
  | "Dining Out"
  | "Transportation"
  | "Personal Care"
  | "Education"
  | "Lifestyle"
  | "Shopping"
  | "General";

// Budget
interface Budget {
  category: TransactionCategory;
  maximum: number;      // Maximum spending limit (e.g., 50.00)
  theme: string;        // Hex color code (e.g., "#277C78")
  // Calculated fields (derived from transactions):
  // spent?: number;    // Total spent in this category
  // remaining?: number; // Remaining budget
  // percentage?: number; // Percentage of budget used
}

// Pot (Savings Goal)
interface Pot {
  name: string;         // Pot name (e.g., "Savings", "Concert Ticket")
  target: number;       // Target amount (e.g., 2000.00)
  total: number;        // Current total saved (e.g., 159.00)
  theme: string;        // Hex color code (e.g., "#277C78")
  // Calculated fields:
  // percentage?: number; // Percentage of target reached
  // remaining?: number;  // Remaining amount to reach target
}

// Recurring Bill
interface RecurringBill {
  id?: string;          // Unique identifier
  name: string;         // Bill name (e.g., "Spark Electric Solutions")
  avatar: string;       // Path to avatar image
  category: TransactionCategory;
  amount: number;       // Bill amount (always negative/expense)
  dueDate: string;      // ISO 8601 date string for next due date
  frequency: "monthly" | "weekly" | "yearly"; // Recurrence frequency
  isPaid: boolean;      // Whether bill has been paid
  lastPaidDate?: string; // ISO 8601 date string of last payment
  // Additional fields that may exist:
  // nextDueDate?: string;
  // daysUntilDue?: number;
}

// User (if needed for authentication)
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// App State
interface AppState {
  balance: Balance;
  transactions: Transaction[];
  budgets: Budget[];
  pots: Pot[];
  recurringBills: RecurringBill[]; // Derived from transactions where recurring: true
}
```

### 3.2 MongoDB Schema (Mongoose Models)

```typescript
// User Model
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  name: string;
  password: string; // hashed password
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);

// Transaction Model
interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  avatar: string;
  name: string;
  category: TransactionCategory;
  date: Date;
  amount: number;
  recurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    avatar: { type: String, required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Entertainment',
        'Bills',
        'Groceries',
        'Dining Out',
        'Transportation',
        'Personal Care',
        'Education',
        'Lifestyle',
        'Shopping',
        'General',
      ],
      index: true,
    },
    date: { type: Date, required: true, index: true },
    amount: { type: Number, required: true },
    recurring: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

// Budget Model
interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: TransactionCategory;
  maximum: number;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Entertainment',
        'Bills',
        'Groceries',
        'Dining Out',
        'Transportation',
        'Personal Care',
        'Education',
        'Lifestyle',
        'Shopping',
        'General',
      ],
    },
    maximum: { type: Number, required: true },
    theme: { type: String, required: true }, // Hex color code
  },
  {
    timestamps: true,
  }
);

// Ensure unique category per user
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);

// Pot Model
interface IPot extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  target: number;
  total: number;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

const potSchema = new Schema<IPot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    target: { type: Number, required: true },
    total: { type: Number, default: 0.0 },
    theme: { type: String, required: true }, // Hex color code
  },
  {
    timestamps: true,
  }
);

export const Pot = mongoose.model<IPot>('Pot', potSchema);

// Recurring Bill Model
interface IRecurringBill extends Document {
  userId: mongoose.Types.ObjectId;
  transactionId?: mongoose.Types.ObjectId;
  name: string;
  avatar: string;
  category: TransactionCategory;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  nextDueDate: Date;
  isPaid: boolean;
  lastPaidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recurringBillSchema = new Schema<IRecurringBill>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Entertainment',
        'Bills',
        'Groceries',
        'Dining Out',
        'Transportation',
        'Personal Care',
        'Education',
        'Lifestyle',
        'Shopping',
        'General',
      ],
    },
    amount: { type: Number, required: true },
    frequency: {
      type: String,
      required: true,
      enum: ['monthly', 'weekly', 'yearly'],
    },
    nextDueDate: { type: Date, required: true, index: true },
    isPaid: { type: Boolean, default: false },
    lastPaidDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const RecurringBill = mongoose.model<IRecurringBill>('RecurringBill', recurringBillSchema);
```

---

## 4. User Flow & Navigation

### 4.1 Navigation Structure

```
App Navigation Tree:
├── Overview (Dashboard)          [index.html]
│   ├── View Pots Details         → Pots Page
│   ├── View Budgets Details      → Budgets Page
│   ├── View All Transactions     → Transactions Page
│   └── View Recurring Bills      → Recurring Bills Page
│
├── Transactions                  [transactions.html]
│   ├── Search transactions
│   ├── Sort by (Latest/Oldest/A-Z/Z-A/Highest/Lowest)
│   ├── Filter by Category
│   └── Pagination (Prev/Next)
│
├── Budgets                       [budgets.html]
│   ├── Add New Budget            → Budget Form Modal
│   ├── Edit Budget               → Budget Form Modal (edit mode)
│   └── Delete Budget             → Confirm Delete Modal
│
├── Pots                          [pots.html]
│   ├── Add New Pot               → Pot Form Modal
│   ├── Edit Pot                  → Pot Form Modal (edit mode)
│   ├── Delete Pot                → Confirm Delete Modal
│   ├── Add to Pot                → Add to Pot Modal
│   └── Withdraw from Pot         → Withdraw from Pot Modal
│
└── Recurring Bills               [recurring.html]
    ├── Search bills
    ├── Sort by (Latest/Oldest/A-Z/Z-A/Highest/Lowest)
    └── View Bill Details         → (Potential detail view)
```

### 4.2 Primary User Flows

#### Flow 1: View Financial Overview
1. User lands on **Overview** page
2. Sees current balance, income, expenses
3. Can click "See Details" on Pots → Navigate to Pots page
4. Can click "See Details" on Budgets → Navigate to Budgets page
5. Can click "View All" on Transactions → Navigate to Transactions page
6. Can click "See Details" on Recurring Bills → Navigate to Recurring Bills page

#### Flow 2: Create a New Budget
1. User navigates to **Budgets** page
2. Clicks "Add New Budget" button
3. Modal opens with form:
   - Select Category (dropdown)
   - Enter Maximum Spend (number input)
   - Select Theme (color selector)
4. User fills form and clicks "Add Budget"
5. Modal closes, new budget appears in list

#### Flow 3: Edit an Existing Budget
1. User navigates to **Budgets** page
2. User clicks edit action on a budget card (likely ellipsis menu)
3. Modal opens with pre-filled form
4. User modifies values and clicks "Save Changes"
5. Modal closes, budget updates in list

#### Flow 4: Delete a Budget
1. User navigates to **Budgets** page
2. User clicks delete action on a budget card
3. Confirm Delete Modal opens with warning message
4. User clicks "Yes, Confirm Deletion" or "No, Go Back"
5. If confirmed, budget is removed from list

#### Flow 5: Create a New Pot
1. User navigates to **Pots** page
2. Clicks "Add New Pot" button
3. Modal opens with form:
   - Enter Pot Name (text input)
   - Enter Target (number input)
   - Select Theme (color selector)
4. User fills form and clicks "Add Pot"
5. Modal closes, new pot appears in list

#### Flow 6: Add Money to a Pot
1. User navigates to **Pots** page
2. User clicks "Add to Pot" action on a pot card
3. Modal opens showing:
   - Current amount and target
   - Amount input field
4. User enters amount and clicks "Confirm Addition"
5. Money is deducted from current balance, added to pot
6. Modal closes, pot total updates

#### Flow 7: Withdraw Money from a Pot
1. User navigates to **Pots** page
2. User clicks "Withdraw from Pot" action on a pot card
3. Modal opens showing:
   - Current amount and target
   - Amount input field
4. User enters amount and clicks "Confirm Withdrawal"
5. Money is removed from pot, added back to current balance
6. Modal closes, pot total updates

#### Flow 8: View and Filter Transactions
1. User navigates to **Transactions** page
2. Optionally uses search bar to search transactions
3. Optionally sorts by: Latest, Oldest, A-Z, Z-A, Highest, Lowest
4. Optionally filters by category
5. Views transaction list/table
6. Uses pagination (Prev/Next) if needed

#### Flow 9: View Recurring Bills
1. User navigates to **Recurring Bills** page
2. Views summary stats: Total Bills, Paid Bills, Total Upcoming, Due Soon
3. Optionally uses search bar
4. Optionally sorts bills
5. Views list of bills with status (paid/due)

### 4.3 Navigation Patterns

#### Desktop Navigation
- **Sidebar Navigation**: Fixed or collapsible sidebar with menu items
  - Overview
  - Transactions
  - Budgets
  - Pots
  - Recurring Bills
- **Minimize Menu**: Button to collapse/expand sidebar
- **Active State**: Current page highlighted in navigation

#### Mobile Navigation
- **Bottom Navigation Bar**: Fixed bottom navigation (likely same items as sidebar)
- **Hamburger Menu**: Alternative to sidebar on mobile
- **Modal Overlays**: Full-screen or bottom sheet modals for forms

### 4.4 Modal/Dialog Patterns

1. **Form Modals**: 
   - Centered modal with form inputs
   - Header with title and description
   - Form fields
   - Action buttons (Cancel/Submit)

2. **Confirmation Modals**:
   - Centered modal with warning message
   - Destructive action button (Yes, Confirm Deletion)
   - Secondary action button (No, Go Back)

3. **Action Modals** (Add to/Withdraw from Pot):
   - Centered modal with current state display
   - Input field for amount
   - Confirm action button

---

## 5. Implementation Strategy

### 5.1 Technology Stack (MERN + TypeScript)

#### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (for fast development and optimized builds)
- **Styling**: CSS Modules or Styled Components with design tokens
- **Routing**: React Router v6
- **State Management**: React Context API + Custom hooks (consider Zustand for complex state if needed)
- **Form Handling**: React Hook Form with TypeScript
- **HTTP Client**: Axios with TypeScript interceptors
- **Date Handling**: date-fns (lightweight and tree-shakeable)
- **Validation**: Zod (for runtime type validation and form validation)
- **Icons**: SVG icons (already available in assets) with custom Icon component
- **Environment Variables**: dotenv for environment configuration

#### Backend Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing
- **Validation**: express-validator or Zod for request validation
- **Environment Variables**: dotenv for environment configuration
- **CORS**: Express CORS middleware for cross-origin requests
- **Error Handling**: Custom error handling middleware

#### Development Tools
- **Package Manager**: npm or yarn
- **Type Checking**: TypeScript compiler (tsc)
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Git Hooks**: Husky for pre-commit hooks
- **API Testing**: Postman or Insomnia

### 5.2 Implementation Phases

#### Phase 0: Project Setup & Configuration
1. Initialize monorepo or separate frontend/backend repositories
2. Set up frontend with Vite + React + TypeScript
3. Set up backend with Express + TypeScript
4. Configure ESLint, Prettier, and TypeScript configs
5. Set up MongoDB connection and environment variables
6. Create initial folder structure for both frontend and backend
7. Set up Git repository and initial commit

#### Phase 1: Design Token System
1. Extract exact values from Figma
2. Create CSS custom properties file (`client/src/styles/tokens/`)
3. Document all tokens in a centralized location
4. Set up typography system with font loading
5. Create TypeScript types for design tokens (optional)

#### Phase 2: Backend Foundation
1. Set up MongoDB connection with Mongoose
2. Create Mongoose models (User, Transaction, Budget, Pot, RecurringBill)
3. Set up Express server with TypeScript
4. Create authentication middleware (JWT)
5. Implement authentication routes (register, login, logout)
6. Set up error handling middleware
7. Create API route structure
8. Set up CORS configuration

#### Phase 3: Frontend Atomic Components
1. Build Button component with all variants and TypeScript interfaces
2. Build Input components (text, number, select) with form integration
3. Build Icon component system with SVG support
4. Build Avatar component
5. Build Typography components
6. Build ProgressBar component
7. Write unit tests for atomic components (optional)

#### Phase 4: Backend API Development
1. Implement authentication API endpoints
2. Implement Transaction CRUD operations
3. Implement Budget CRUD operations
4. Implement Pot CRUD operations
5. Implement RecurringBill CRUD operations
6. Implement balance calculation service
7. Add request validation middleware
8. Add API documentation (Swagger/OpenAPI optional)

#### Phase 5: Frontend Molecular Components
1. Build Card components (Stat, Budget, Pot, Transaction, Bill)
2. Build Form components with React Hook Form
3. Build Navigation components (Sidebar, BottomNav)
4. Build Modal components
5. Build Search and Filter components
6. Create API service layer with Axios
7. Set up React Context for global state (Auth, App state)

#### Phase 6: Frontend Pages & Routing
1. Set up React Router with protected routes
2. Build Authentication pages (Login, Register if needed)
3. Build Dashboard/Overview page with API integration
4. Build Transactions page with API integration
5. Build Budgets page with API integration
6. Build Pots page with API integration
7. Build Recurring Bills page with API integration

#### Phase 7: Integration & Features
1. Connect all pages to backend API
2. Implement real-time balance calculations
3. Implement budget progress tracking
4. Implement pot progress tracking
5. Implement transaction filtering and sorting
6. Implement pagination
7. Add loading states and skeletons
8. Add error handling and error boundaries
9. Implement form validation (client and server)

#### Phase 8: Polish & Optimization
1. Implement responsive design for all breakpoints
2. Add animations and transitions
3. Optimize API calls (caching, debouncing)
4. Implement optimistic UI updates
5. Add empty states for all pages
6. Accessibility audit and improvements (WCAG AA)
7. Performance optimization (code splitting, lazy loading)
8. SEO optimization (meta tags, semantic HTML)
9. Cross-browser testing

### 5.3 Accessibility Considerations

- **Semantic HTML**: Use proper HTML5 semantic elements
- **ARIA Labels**: Add appropriate ARIA labels for icons and interactive elements
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Focus States**: Clear focus indicators for keyboard navigation
- **Color Contrast**: Ensure WCAG AA compliance for text contrast
- **Screen Reader Support**: Test with screen readers
- **Alt Text**: Add descriptive alt text for images and avatars

### 5.4 Responsive Design Strategy

- **Mobile-First Approach**: Design and develop for mobile first
- **Breakpoint Strategy**: Use the defined breakpoints consistently
- **Touch Targets**: Ensure touch targets are at least 44x44px on mobile
- **Navigation Adaptation**: 
  - Desktop: Sidebar navigation
  - Mobile: Bottom navigation or hamburger menu
- **Table Layout**: Convert table to card layout on mobile for Transactions page

---

## 6. Next Steps

### Immediate Actions Required:
1. ✅ **Access Figma File**: Open the provided Figma link and extract:
   - Exact color values (hex codes) for all colors including semantic colors
   - Typography scale (font sizes, line heights, weights)
   - Spacing scale (padding, margins, gaps)
   - Border radius values
   - Shadow/elevation specifications
   - Component dimensions and measurements

2. ✅ **Validate Component Structure**: Review Figma components to confirm:
   - Button styles and variants
   - Input field styles
   - Card layouts and spacing
   - Modal designs and animations
   - Navigation patterns

3. ✅ **Extract Assets**: Identify any additional assets needed:
   - Icons (already in assets/images/)
   - Illustrations
   - Images

4. ✅ **Review User Flows**: Walk through Figma prototypes to validate:
   - Navigation flows
   - Modal interactions
   - Form validations
   - Error states
   - Loading states
   - Empty states

### Validation Checklist:
- [ ] All color tokens extracted and documented
- [ ] Typography scale complete and validated
- [ ] Spacing system confirmed from Figma measurements
- [ ] Component designs reviewed and documented
- [ ] User flows mapped and validated
- [ ] Breakpoints confirmed
- [ ] Accessibility requirements reviewed
- [ ] Asset inventory complete

---

## 7. Resources & References

- **Figma File**: https://www.figma.com/design/Plo0FsVIRBuDRmv8N5eX79/personal-finance-app?node-id=182-285&m=dev&t=byAYhpFqn8rqfPsQ-1
- **Font**: Public Sans (USWDS) - https://public-sans.digital.gov/
- **Design System Principles**: Follow atomic design methodology
- **Accessibility Guidelines**: WCAG 2.1 Level AA compliance target

---

**Document Version**: 1.0  
**Last Updated**: Initial creation  
**Status**: Draft - Requires Figma validation
