-- Centinel: Initial schema migration
-- Replaces MongoDB models: User, Transaction, Budget, Pot

-- =============================================================================
-- PROFILES (extends auth.users - replaces User model)
-- =============================================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- TRANSACTIONS (replaces Transaction model)
-- =============================================================================
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar text NOT NULL DEFAULT '/assets/images/avatars/default.jpg',
  name text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'Entertainment', 'Bills', 'Groceries', 'Dining Out', 'Transportation',
    'Personal Care', 'Education', 'Lifestyle', 'Shopping', 'General'
  )),
  date timestamptz NOT NULL,
  amount numeric NOT NULL,
  recurring boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_date ON public.transactions (user_id, date DESC);
CREATE INDEX idx_transactions_user_category ON public.transactions (user_id, category);

-- =============================================================================
-- BUDGETS (replaces Budget model)
-- =============================================================================
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN (
    'Entertainment', 'Bills', 'Groceries', 'Dining Out', 'Transportation',
    'Personal Care', 'Education', 'Lifestyle', 'Shopping', 'General'
  )),
  maximum numeric NOT NULL CHECK (maximum >= 0),
  theme text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category),
  UNIQUE (user_id, theme)
);

CREATE INDEX idx_budgets_user ON public.budgets (user_id);

-- =============================================================================
-- POTS (replaces Pot model)
-- =============================================================================
CREATE TABLE public.pots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target numeric NOT NULL CHECK (target >= 0),
  total numeric NOT NULL DEFAULT 0 CHECK (total >= 0),
  theme text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, theme)
);

CREATE INDEX idx_pots_user ON public.pots (user_id);

-- =============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pots ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Transactions: users can CRUD own rows
CREATE POLICY "Users can CRUD own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Budgets: users can CRUD own rows
CREATE POLICY "Users can CRUD own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Pots: users can CRUD own rows
CREATE POLICY "Users can CRUD own pots" ON public.pots
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
