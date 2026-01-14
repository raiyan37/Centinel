/**
 * API Client
 * 
 * CONCEPT: This file contains all API functions for communicating with the backend.
 * Using Axios for HTTP requests with a configured base client.
 * 
 * All API functions are exported from this single file for easy imports:
 *   import { getTransactions, createBudget } from '@/lib/api';
 * 
 * Features:
 * - Request/response interceptors for error handling
 * - Automatic error logging in development
 * - Network error detection
 * - Authorization header authentication (for proxy setups)
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

// =============================================================================
// TOKEN STORAGE
// =============================================================================

const TOKEN_KEY = 'auth_token';

/**
 * Get stored auth token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store auth token
 */
export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove stored auth token
 */
export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// =============================================================================
// AXIOS CONFIGURATION
// =============================================================================

/**
 * Axios instance with default configuration
 * 
 * - baseURL: Points to the backend server
 * - withCredentials: Enables sending cookies (for auth)
 * - timeout: Request timeout in ms
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Uses env var in production, proxy in development
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================================================
// REQUEST INTERCEPTOR
// =============================================================================

/**
 * Request interceptor for logging and adding auth headers
 * 
 * - Logs requests in development mode
 * - Adds Authorization header with stored token (for proxy setups)
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add Authorization header if token exists
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => {
    // Log request errors in development
    if (import.meta.env.DEV) {
      console.error('[API] Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// RESPONSE INTERCEPTOR
// =============================================================================

/**
 * Response interceptor for error handling and logging
 * 
 * - Logs responses in development mode
 * - Normalizes error responses
 * - Handles network errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      if (error.response) {
        // Server responded with error status
        console.error(
          `[API] ${error.response.status} ${error.config?.url}:`,
          error.response.data
        );
      } else if (error.request) {
        // Request made but no response received (network error)
        console.error('[API] Network error:', error.message);
      } else {
        // Error in request setup
        console.error('[API] Request setup error:', error.message);
      }
    }

    // Re-throw the error for handling by query hooks
    return Promise.reject(error);
  }
);

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface User {
  _id: string;
  email: string;
  fullName: string;
  balance: number;
  avatarUrl?: string;
  verified: boolean;
  authProvider: 'local' | 'google';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token?: string; // Token for Authorization header auth (proxy setups)
  };
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// =============================================================================
// AUTH API
// =============================================================================

/**
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  // Store token for Authorization header auth
  if (response.data.data.token) {
    setStoredToken(response.data.data.token);
  }
  return response.data;
}

/**
 * Login with email and password
 */
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  // Store token for Authorization header auth
  if (response.data.data.token) {
    setStoredToken(response.data.data.token);
  }
  return response.data;
}

/**
 * Sign in with Google
 */
export async function googleAuth(credential: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/google', { credential });
  // Store token for Authorization header auth
  if (response.data.data.token) {
    setStoredToken(response.data.data.token);
  }
  return response.data;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await apiClient.get<AuthResponse>('/auth/me');
  return response.data;
}

/**
 * Logout
 */
export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  // Clear stored token
  removeStoredToken();
  const response = await apiClient.post('/auth/logout');
  return response.data;
}

/**
 * Refresh token
 */
export async function refreshToken(): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
}

// =============================================================================
// TYPES
// =============================================================================

// Transaction types
export interface Transaction {
  _id: string;
  userId: string;
  avatar: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  recurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface TransactionParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'Latest' | 'Oldest' | 'A to Z' | 'Z to A' | 'Highest' | 'Lowest';
  filter?: string;
}

// Budget types
export interface Budget {
  _id: string;
  userId: string;
  category: string;
  maximum: number;
  theme: string;
  spent: number;
  remaining: number;
  latestTransactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetsResponse {
  success: boolean;
  data: {
    budgets: Budget[];
  };
}

export interface CreateBudgetData {
  category: string;
  maximum: number;
  theme: string;
}

// Pot types
export interface Pot {
  _id: string;
  userId: string;
  name: string;
  target: number;
  total: number;
  theme: string;
  percentage: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface PotsResponse {
  success: boolean;
  data: {
    pots: Pot[];
  };
}

export interface CreatePotData {
  name: string;
  target: number;
  theme: string;
}

export interface PotTransactionData {
  amount: number;
}

// Overview types
export interface OverviewResponse {
  success: boolean;
  data: {
    balance: {
      current: number;
      income: number;
      expenses: number;
    };
    pots: {
      totalSaved: number;
      items: Pot[];
    };
    budgets: {
      items: Budget[];
    };
    transactions: {
      recent: Transaction[];
    };
    recurringBills: {
      total: number;
      totalAmount: number;
      paid: { count: number; amount: number };
      upcoming: { count: number; amount: number };
      dueSoon: { count: number; amount: number };
    };
  };
}

// =============================================================================
// TRANSACTION API
// =============================================================================

/**
 * Get transactions with pagination, search, sort, and filter
 */
export async function getTransactions(params?: TransactionParams): Promise<TransactionsResponse> {
  const response = await apiClient.get<TransactionsResponse>('/transactions', { params });
  return response.data;
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(id: string): Promise<{ success: boolean; data: { transaction: Transaction } }> {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: Partial<Transaction>): Promise<{ success: boolean; data: { transaction: Transaction } }> {
  const response = await apiClient.post('/transactions', data);
  return response.data;
}

/**
 * Update a transaction
 */
export async function updateTransaction(id: string, data: Partial<Transaction>): Promise<{ success: boolean; data: { transaction: Transaction } }> {
  const response = await apiClient.put(`/transactions/${id}`, data);
  return response.data;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete(`/transactions/${id}`);
  return response.data;
}

// =============================================================================
// BUDGET API
// =============================================================================

/**
 * Get all budgets with spent amounts
 */
export async function getBudgets(): Promise<BudgetsResponse> {
  const response = await apiClient.get<BudgetsResponse>('/budgets');
  return response.data;
}

/**
 * Get a single budget by ID
 */
export async function getBudget(id: string): Promise<{ success: boolean; data: { budget: Budget } }> {
  const response = await apiClient.get(`/budgets/${id}`);
  return response.data;
}

/**
 * Create a new budget
 */
export async function createBudget(data: CreateBudgetData): Promise<{ success: boolean; data: { budget: Budget } }> {
  const response = await apiClient.post('/budgets', data);
  return response.data;
}

/**
 * Update a budget
 */
export async function updateBudget(id: string, data: Partial<CreateBudgetData>): Promise<{ success: boolean; data: { budget: Budget } }> {
  const response = await apiClient.put(`/budgets/${id}`, data);
  return response.data;
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete(`/budgets/${id}`);
  return response.data;
}

// =============================================================================
// POT API
// =============================================================================

/**
 * Get all pots
 */
export async function getPots(): Promise<PotsResponse> {
  const response = await apiClient.get<PotsResponse>('/pots');
  return response.data;
}

/**
 * Get a single pot by ID
 */
export async function getPot(id: string): Promise<{ success: boolean; data: { pot: Pot } }> {
  const response = await apiClient.get(`/pots/${id}`);
  return response.data;
}

/**
 * Create a new pot
 */
export async function createPot(data: CreatePotData): Promise<{ success: boolean; data: { pot: Pot } }> {
  const response = await apiClient.post('/pots', data);
  return response.data;
}

/**
 * Update a pot
 */
export async function updatePot(id: string, data: Partial<CreatePotData>): Promise<{ success: boolean; data: { pot: Pot } }> {
  const response = await apiClient.put(`/pots/${id}`, data);
  return response.data;
}

/**
 * Delete a pot (returns money to balance)
 */
export async function deletePot(id: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete(`/pots/${id}`);
  return response.data;
}

/**
 * Deposit money into a pot
 */
export async function depositToPot(id: string, data: PotTransactionData): Promise<{ success: boolean; data: { pot: Pot; newBalance: number } }> {
  const response = await apiClient.post(`/pots/${id}/deposit`, data);
  return response.data;
}

/**
 * Withdraw money from a pot
 */
export async function withdrawFromPot(id: string, data: PotTransactionData): Promise<{ success: boolean; data: { pot: Pot; newBalance: number } }> {
  const response = await apiClient.post(`/pots/${id}/withdraw`, data);
  return response.data;
}

// =============================================================================
// OVERVIEW API
// =============================================================================

/**
 * Get overview/dashboard data
 */
export async function getOverview(): Promise<OverviewResponse> {
  const response = await apiClient.get<OverviewResponse>('/overview');
  return response.data;
}

/**
 * Get current balance
 */
export async function getBalance(): Promise<{ success: boolean; data: { currentBalance: number; income: number; expenses: number } }> {
  const response = await apiClient.get('/overview/balance');
  return response.data;
}

// =============================================================================
// RECURRING BILLS API
// =============================================================================

/**
 * Recurring Bill type (derived from Transaction)
 */
export interface RecurringBill extends Transaction {
  // Status is calculated client-side based on date
  status: 'paid' | 'upcoming' | 'due-soon';
  dueDay: number; // Day of month the bill is due
}

export interface RecurringBillsParams {
  search?: string;
  sort?: 'Latest' | 'Oldest' | 'A to Z' | 'Z to A' | 'Highest' | 'Lowest';
}

export interface RecurringBillsSummary {
  total: number;
  totalAmount: number;
  paid: { count: number; amount: number };
  upcoming: { count: number; amount: number };
  dueSoon: { count: number; amount: number };
}

export interface RecurringBillsResponse {
  bills: RecurringBill[];
  summary: RecurringBillsSummary;
}

/**
 * Get recurring bills with summary stats
 * 
 * CONCEPT: Fetches all recurring transactions and processes them client-side
 * to calculate paid/upcoming/due-soon status based on August 2024 context.
 */
export async function getRecurringBills(params?: RecurringBillsParams): Promise<RecurringBillsResponse> {
  // Fetch all transactions (recurring ones will be filtered)
  const response = await apiClient.get<TransactionsResponse>('/transactions', {
    params: { limit: 500 }, // Get all transactions
  });

  const allTransactions = response.data.data.transactions;

  // Filter for recurring expense transactions only
  const recurringTransactions = allTransactions.filter(
    (tx) => tx.recurring && tx.amount < 0
  );

  // Calculate status for each bill (based on current month)
  // Use actual current date for dynamic monthly reset
  const now = new Date();
  const CURRENT_DATE = now.getDate();
  const CURRENT_MONTH = now.getMonth();
  const CURRENT_YEAR = now.getFullYear();
  
  // Get first and last day of current month
  const CURRENT_MONTH_START = new Date(CURRENT_YEAR, CURRENT_MONTH, 1);
  const CURRENT_MONTH_END = new Date(CURRENT_YEAR, CURRENT_MONTH + 1, 0, 23, 59, 59, 999);

  // Group all transactions by vendor name
  const transactionsByVendor = new Map<string, Transaction[]>();
  recurringTransactions.forEach((tx) => {
    const existing = transactionsByVendor.get(tx.name) || [];
    existing.push(tx);
    transactionsByVendor.set(tx.name, existing);
  });

  // For each vendor, find the bill template (oldest) and check for payments (current month)
  const bills: RecurringBill[] = [];
  
  transactionsByVendor.forEach((transactions, vendorName) => {
    // Sort by date ascending to find the oldest (bill template)
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // The bill template is the OLDEST transaction (first created)
    const billTemplate = sorted[0];
    const dueDay = new Date(billTemplate.date).getDate();
    
    // Check if ANY transaction for this vendor is in the current month (paid)
    const hasPaidThisMonth = transactions.some((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= CURRENT_MONTH_START && txDate <= CURRENT_MONTH_END;
    });

    let status: 'paid' | 'upcoming' | 'due-soon';

    if (hasPaidThisMonth) {
      status = 'paid';
    } else if (dueDay > CURRENT_DATE && dueDay <= CURRENT_DATE + 5) {
      // Due within next 5 days
      status = 'due-soon';
    } else {
      status = 'upcoming';
    }

    bills.push({
      ...billTemplate,
      status,
      dueDay,
    });
  });

  // Apply search filter if provided
  let filteredBills = bills;
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredBills = bills.filter((bill) =>
      bill.name.toLowerCase().includes(searchLower)
    );
  }

  // Apply sort
  const sortOption = params?.sort || 'Latest';
  filteredBills.sort((a, b) => {
    switch (sortOption) {
      case 'Latest':
        return a.dueDay - b.dueDay; // Earliest in month first
      case 'Oldest':
        return b.dueDay - a.dueDay;
      case 'A to Z':
        return a.name.localeCompare(b.name);
      case 'Z to A':
        return b.name.localeCompare(a.name);
      case 'Highest':
        return Math.abs(b.amount) - Math.abs(a.amount);
      case 'Lowest':
        return Math.abs(a.amount) - Math.abs(b.amount);
      default:
        return 0;
    }
  });

  // Calculate summary
  const paidBills = bills.filter((b) => b.status === 'paid');
  const upcomingBills = bills.filter((b) => b.status === 'upcoming' || b.status === 'due-soon');
  const dueSoonBills = bills.filter((b) => b.status === 'due-soon');

  const summary: RecurringBillsSummary = {
    // Total shows only UNPAID bills (upcoming + due soon)
    total: upcomingBills.length,
    totalAmount: upcomingBills.reduce((sum, b) => sum + Math.abs(b.amount), 0),
    paid: {
      count: paidBills.length,
      amount: paidBills.reduce((sum, b) => sum + Math.abs(b.amount), 0),
    },
    upcoming: {
      count: upcomingBills.length,
      amount: upcomingBills.reduce((sum, b) => sum + Math.abs(b.amount), 0),
    },
    dueSoon: {
      count: dueSoonBills.length,
      amount: dueSoonBills.reduce((sum, b) => sum + Math.abs(b.amount), 0),
    },
  };

  return { bills: filteredBills, summary };
}
