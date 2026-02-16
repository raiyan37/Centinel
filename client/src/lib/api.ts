/**
 * API Client
<<<<<<< HEAD
 *
 * CONCEPT: Supabase-based API - direct client queries and Edge Function invocations.
 * Auth is handled by Supabase Auth; RLS enforces user-level access.
 */

import { supabase } from './supabase';

// =============================================================================
// TYPES (Supabase schema uses snake_case; we normalize for frontend)
// =============================================================================

export interface Transaction {
  id: string;
  user_id: string;
=======
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
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
  avatar: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  recurring: boolean;
<<<<<<< HEAD
  created_at: string;
  updated_at: string;
=======
  isTemplate?: boolean; // Bill templates don't affect balance until paid
  createdAt: string;
  updatedAt: string;
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
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
<<<<<<< HEAD
  category?: string;
}

export interface Budget {
  id: string;
  user_id: string;
=======
}

// Budget types
export interface Budget {
  _id: string;
  userId: string;
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
  category: string;
  maximum: number;
  theme: string;
  spent: number;
  remaining: number;
  latestTransactions: Transaction[];
<<<<<<< HEAD
  created_at: string;
  updated_at: string;
=======
  createdAt: string;
  updatedAt: string;
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
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

<<<<<<< HEAD
export interface Pot {
  id: string;
  user_id: string;
=======
// Pot types
export interface Pot {
  _id: string;
  userId: string;
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
  name: string;
  target: number;
  total: number;
  theme: string;
  percentage: number;
  remaining: number;
<<<<<<< HEAD
  created_at: string;
  updated_at: string;
=======
  createdAt: string;
  updatedAt: string;
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
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

<<<<<<< HEAD
=======
// Overview types
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
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

<<<<<<< HEAD
export interface RecurringBill extends Transaction {
  status: 'paid' | 'upcoming' | 'due-soon';
  dueDay: number;
=======
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
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
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

<<<<<<< HEAD
// =============================================================================
// HELPERS
// =============================================================================

const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  Latest: { column: 'date', ascending: false },
  Oldest: { column: 'date', ascending: true },
  'A to Z': { column: 'name', ascending: true },
  'Z to A': { column: 'name', ascending: false },
  Highest: { column: 'amount', ascending: false },
  Lowest: { column: 'amount', ascending: true },
};

async function invokeEdgeFunction<T>(name: string, body?: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

// =============================================================================
// TRANSACTION API
// =============================================================================

export async function getTransactions(params?: TransactionParams): Promise<TransactionsResponse> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const sort = params?.sort ?? 'Latest';
  const { column, ascending } = SORT_MAP[sort] ?? SORT_MAP['Latest'];
  const category = params?.filter ?? params?.category;

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .order(column, { ascending });

  if (params?.search) {
    query = query.ilike('name', `%${params.search}%`);
  }
  if (category && category !== 'All Transactions') {
    query = query.eq('category', category);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const pages = Math.ceil(total / limit);

  return {
    success: true,
    data: {
      transactions: (data ?? []) as Transaction[],
      total,
      page,
      pages,
      limit,
    },
  };
}

export async function getTransaction(id: string): Promise<{ success: boolean; data: { transaction: Transaction } }> {
  const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();
  if (error) throw error;
  if (!data) throw new Error('Transaction not found');
  return { success: true, data: { transaction: data as Transaction } };
}

export async function createTransaction(
  data: Partial<Transaction>
): Promise<{ success: boolean; data: { transaction: Transaction } }> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) throw new Error('Unauthorized');

  const insert = {
    user_id: session.session.user.id,
    name: data.name!,
    amount: data.amount!,
    category: data.category!,
    date: data.date!,
    avatar: data.avatar ?? '/assets/images/avatars/default.jpg',
    recurring: data.recurring ?? false,
  };

  const { data: created, error } = await supabase.from('transactions').insert(insert).select().single();
  if (error) throw error;
  return { success: true, data: { transaction: created as Transaction } };
}

export async function updateTransaction(
  id: string,
  data: Partial<Transaction>
): Promise<{ success: boolean; data: { transaction: Transaction } }> {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.amount !== undefined) update.amount = data.amount;
  if (data.category !== undefined) update.category = data.category;
  if (data.date !== undefined) update.date = data.date;
  if (data.avatar !== undefined) update.avatar = data.avatar;
  if (data.recurring !== undefined) update.recurring = data.recurring;

  const { data: updated, error } = await supabase.from('transactions').update(update).eq('id', id).select().single();
  if (error) throw error;
  if (!updated) throw new Error('Transaction not found');
  return { success: true, data: { transaction: updated as Transaction } };
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
  return { success: true, message: 'Transaction deleted successfully' };
}

// =============================================================================
// BUDGET API
// =============================================================================

export async function getBudgets(): Promise<BudgetsResponse> {
  const { data, error } = await supabase.rpc('get_budgets');
  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  const raw = data?.data?.budgets ?? [];
  const budgets: Budget[] = raw.map((b: Record<string, unknown>) => ({
    id: b.id,
    user_id: b.user_id,
    category: b.category,
    maximum: Number(b.maximum),
    theme: b.theme,
    spent: Number(b.spent ?? 0),
    remaining: Number(b.remaining ?? 0),
    latestTransactions: (b.latest_transactions ?? []) as Transaction[],
    created_at: b.created_at as string,
    updated_at: b.updated_at as string,
  }));

  return { success: true, data: { budgets } };
}

export async function getBudget(id: string): Promise<{ success: boolean; data: { budget: Budget } }> {
  const { data: budgetsRes } = await getBudgets();
  const budget = budgetsRes.budgets.find((b) => b.id === id);
  if (!budget) throw new Error('Budget not found');
  return { success: true, data: { budget } };
}

export async function createBudget(data: CreateBudgetData): Promise<{ success: boolean; data: { budget: Budget } }> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) throw new Error('Unauthorized');

  const { data: created, error } = await supabase
    .from('budgets')
    .insert({
      user_id: session.session.user.id,
      category: data.category,
      maximum: data.maximum,
      theme: data.theme,
    })
    .select()
    .single();

  if (error) throw error;
  const budget = created as Budget;
  return {
    success: true,
    data: {
      budget: {
        ...budget,
        spent: 0,
        remaining: data.maximum,
        latestTransactions: [],
      },
    },
  };
}

export async function updateBudget(
  id: string,
  data: Partial<CreateBudgetData>
): Promise<{ success: boolean; data: { budget: Budget } }> {
  const update: Record<string, unknown> = {};
  if (data.category !== undefined) update.category = data.category;
  if (data.maximum !== undefined) update.maximum = data.maximum;
  if (data.theme !== undefined) update.theme = data.theme;

  const { data: updated, error } = await supabase.from('budgets').update(update).eq('id', id).select().single();
  if (error) throw error;
  if (!updated) throw new Error('Budget not found');
  return { success: true, data: { budget: updated as Budget } };
}

export async function deleteBudget(id: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
  return { success: true, message: 'Budget deleted successfully' };
}

// =============================================================================
// POT API
// =============================================================================

function enrichPot(pot: Record<string, unknown>): Pot {
  const target = Number(pot.target ?? 0);
  const total = Number(pot.total ?? 0);
  return {
    id: pot.id as string,
    user_id: pot.user_id as string,
    name: pot.name as string,
    target,
    total,
    theme: pot.theme as string,
    percentage: target > 0 ? (total / target) * 100 : 0,
    remaining: target - total,
    created_at: pot.created_at as string,
    updated_at: pot.updated_at as string,
  };
}

export async function getPots(): Promise<PotsResponse> {
  const { data, error } = await supabase.from('pots').select('*');
  if (error) throw error;
  const pots = (data ?? []).map(enrichPot);
  return { success: true, data: { pots } };
}

export async function getPot(id: string): Promise<{ success: boolean; data: { pot: Pot } }> {
  const { data, error } = await supabase.from('pots').select('*').eq('id', id).single();
  if (error) throw error;
  if (!data) throw new Error('Pot not found');
  return { success: true, data: { pot: enrichPot(data) } };
}

export async function createPot(data: CreatePotData): Promise<{ success: boolean; data: { pot: Pot } }> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) throw new Error('Unauthorized');

  const { data: created, error } = await supabase
    .from('pots')
    .insert({
      user_id: session.session.user.id,
      name: data.name,
      target: data.target,
      theme: data.theme,
      total: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return { success: true, data: { pot: enrichPot(created as Record<string, unknown>) } };
}

export async function updatePot(id: string, data: Partial<CreatePotData>): Promise<{ success: boolean; data: { pot: Pot } }> {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.target !== undefined) update.target = data.target;
  if (data.theme !== undefined) update.theme = data.theme;

  const { data: updated, error } = await supabase.from('pots').update(update).eq('id', id).select().single();
  if (error) throw error;
  if (!updated) throw new Error('Pot not found');
  return { success: true, data: { pot: enrichPot(updated as Record<string, unknown>) } };
}

export async function deletePot(id: string): Promise<{ success: boolean; message: string }> {
  const result = await invokeEdgeFunction<{ success: boolean }>('pot-delete', { potId: id });
  if (!result.success) throw new Error('Failed to delete pot');
  return { success: true, message: 'Pot deleted and money returned to balance' };
}

export async function depositToPot(
  id: string,
  data: PotTransactionData
): Promise<{ success: boolean; data: { pot: Pot; newBalance: number } }> {
  const result = await invokeEdgeFunction<{ success: boolean; data: { pot: Record<string, unknown>; newBalance: number } }>(
    'pot-deposit',
    { potId: id, amount: data.amount }
  );
  if (!result.success) throw new Error('Deposit failed');
  return {
    success: true,
    data: {
      pot: enrichPot(result.data.pot),
      newBalance: result.data.newBalance,
    },
  };
}

export async function withdrawFromPot(
  id: string,
  data: PotTransactionData
): Promise<{ success: boolean; data: { pot: Pot; newBalance: number } }> {
  const result = await invokeEdgeFunction<{ success: boolean; data: { pot: Record<string, unknown>; newBalance: number } }>(
    'pot-withdraw',
    { potId: id, amount: data.amount }
  );
  if (!result.success) throw new Error('Withdrawal failed');
  return {
    success: true,
    data: {
      pot: enrichPot(result.data.pot),
      newBalance: result.data.newBalance,
    },
  };
}

// =============================================================================
// OVERVIEW API
// =============================================================================

export async function getOverview(): Promise<OverviewResponse> {
  const result = await invokeEdgeFunction<OverviewResponse>('overview');
  return result;
}

export async function getBalance(): Promise<{
  success: boolean;
  data: { currentBalance: number; income: number; expenses: number };
}> {
  const result = await invokeEdgeFunction<{
    success: boolean;
    data: { currentBalance: number; income: number; expenses: number };
  }>('balance');
  return result;
}

// =============================================================================
// RECURRING BILLS
// =============================================================================

export async function getRecurringBills(params?: RecurringBillsParams): Promise<RecurringBillsResponse> {
  const response = await getTransactions({ limit: 500 });
  const allTransactions = response.data.transactions;

  const recurringTransactions = allTransactions.filter((tx) => tx.recurring && tx.amount < 0);

  const billMap = new Map<string, Transaction>();
  recurringTransactions.forEach((tx) => {
    if (!billMap.has(tx.name) || new Date(tx.date) > new Date(billMap.get(tx.name)!.date)) {
      billMap.set(tx.name, tx);
    }
  });

  const uniqueBills = Array.from(billMap.values());
=======
/**
 * Get recurring bills with summary stats
 * 
 * CONCEPT: Fetches all recurring transactions and processes them client-side
 * to calculate paid/upcoming/due-soon status based on current month.
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
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
  const now = new Date();
  const CURRENT_DATE = now.getDate();
  const CURRENT_MONTH = now.getMonth();
  const CURRENT_YEAR = now.getFullYear();
<<<<<<< HEAD
  const CURRENT_MONTH_START = new Date(CURRENT_YEAR, CURRENT_MONTH, 1);
  const CURRENT_MONTH_END = new Date(CURRENT_YEAR, CURRENT_MONTH + 1, 0, 23, 59, 59, 999);

  const bills: RecurringBill[] = uniqueBills.map((tx) => {
    const billDate = new Date(tx.date);
    const dueDay = billDate.getDate();
    const isPaidThisMonth = billDate >= CURRENT_MONTH_START && billDate <= CURRENT_MONTH_END;
    let status: 'paid' | 'upcoming' | 'due-soon';
    if (isPaidThisMonth) status = 'paid';
    else if (dueDay > CURRENT_DATE && dueDay <= CURRENT_DATE + 5) status = 'due-soon';
    else status = 'upcoming';

    return { ...tx, status, dueDay };
  });

  let filteredBills = bills;
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredBills = bills.filter((b) => b.name.toLowerCase().includes(searchLower));
  }

  const sortOption = params?.sort ?? 'Latest';
  filteredBills.sort((a, b) => {
    switch (sortOption) {
      case 'Latest':
        return a.dueDay - b.dueDay;
=======
  
  // Helper function to get year and month from a date string (handles timezone consistently)
  // This extracts the date parts from ISO strings to avoid timezone issues
  const getYearMonthDay = (dateString: string): { year: number; month: number; day: number } => {
    // Parse the ISO date string to extract year, month, day in UTC
    const date = new Date(dateString);
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
      day: date.getUTCDate(),
    };
  };
  
  // Check if a transaction date is in the current month (using UTC comparison)
  const isInCurrentMonth = (dateString: string): boolean => {
    const { year, month } = getYearMonthDay(dateString);
    return year === CURRENT_YEAR && month === CURRENT_MONTH;
  };

  // Group all transactions by vendor name
  const transactionsByVendor = new Map<string, Transaction[]>();
  recurringTransactions.forEach((tx) => {
    const existing = transactionsByVendor.get(tx.name) || [];
    existing.push(tx);
    transactionsByVendor.set(tx.name, existing);
  });

  // For each vendor, find the bill template (oldest) and check for payments (current month)
  const bills: RecurringBill[] = [];
  
  transactionsByVendor.forEach((transactions) => {
    // Sort by date ascending to find the oldest (bill template)
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // The bill template is the OLDEST transaction (first created)
    const billTemplate = sorted[0];
    const dueDay = getYearMonthDay(billTemplate.date).day;
    
    // Check if ANY transaction for this vendor is in the current month (paid)
    const hasPaidThisMonth = transactions.some((tx) => isInCurrentMonth(tx.date));

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
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
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

<<<<<<< HEAD
=======
  // Calculate summary
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
  const paidBills = bills.filter((b) => b.status === 'paid');
  const upcomingBills = bills.filter((b) => b.status === 'upcoming' || b.status === 'due-soon');
  const dueSoonBills = bills.filter((b) => b.status === 'due-soon');

  const summary: RecurringBillsSummary = {
<<<<<<< HEAD
=======
    // Total shows only UNPAID bills (upcoming + due soon)
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
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
