/**
 * API Client
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
  avatar: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  recurring: boolean;
  created_at: string;
  updated_at: string;
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
  category?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  maximum: number;
  theme: string;
  spent: number;
  remaining: number;
  latestTransactions: Transaction[];
  created_at: string;
  updated_at: string;
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

export interface Pot {
  id: string;
  user_id: string;
  name: string;
  target: number;
  total: number;
  theme: string;
  percentage: number;
  remaining: number;
  created_at: string;
  updated_at: string;
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

export interface RecurringBill extends Transaction {
  status: 'paid' | 'upcoming' | 'due-soon';
  dueDay: number;
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
  const { data, error } = await supabase.rpc('get_overview');
  if (error) throw error;
  if (!data) throw new Error('No overview data returned');
  if (data?.error) throw new Error(data.error);
  return data as OverviewResponse;
}

export async function getBalance(): Promise<{
  success: boolean;
  data: { currentBalance: number; income: number; expenses: number };
}> {
  const { data, error } = await supabase.rpc('get_balance');
  if (error) throw error;
  if (!data) throw new Error('No balance data returned');
  if (data?.error) throw new Error(data.error);
  return data as {
    success: boolean;
    data: { currentBalance: number; income: number; expenses: number };
  };
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
  const now = new Date();
  const CURRENT_DATE = now.getDate();
  const CURRENT_MONTH = now.getMonth();
  const CURRENT_YEAR = now.getFullYear();
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

  const paidBills = bills.filter((b) => b.status === 'paid');
  const upcomingBills = bills.filter((b) => b.status === 'upcoming' || b.status === 'due-soon');
  const dueSoonBills = bills.filter((b) => b.status === 'due-soon');

  const summary: RecurringBillsSummary = {
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
