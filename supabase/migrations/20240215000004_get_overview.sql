-- Overview aggregation function
-- Returns dashboard data in the same shape as the Express overview controller

CREATE OR REPLACE FUNCTION public.get_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_profile record;
  v_income numeric;
  v_expenses numeric;
  v_pots jsonb;
  v_budgets jsonb;
  v_recent_transactions jsonb;
  v_recurring_bills jsonb;
  v_month_start timestamptz;
  v_month_end timestamptz;
  v_current_date int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  v_month_start := date_trunc('month', now())::timestamptz;
  v_month_end := v_month_start + interval '1 month' - interval '1 second';
  v_current_date := EXTRACT(DAY FROM now())::int;

  -- Get profile
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  -- Income and expenses (all time - matching original behavior)
  SELECT COALESCE(SUM(amount), 0) INTO v_income FROM transactions WHERE user_id = v_user_id AND amount > 0;
  SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_expenses FROM transactions WHERE user_id = v_user_id AND amount < 0;

  -- Pots (first 4, with percentage and remaining)
  SELECT jsonb_build_object(
    'totalSaved', (SELECT COALESCE(SUM(total), 0) FROM pots WHERE user_id = v_user_id),
    'items', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(p) || jsonb_build_object(
          'percentage', CASE WHEN p.target > 0 THEN (p.total / p.target) * 100 ELSE 0 END,
          'remaining', p.target - p.total
        )
      )
      FROM (SELECT * FROM pots WHERE user_id = v_user_id ORDER BY created_at LIMIT 4) p
    ), '[]'::jsonb)
  ) INTO v_pots;

  -- Budgets with spent amounts
  SELECT COALESCE(jsonb_agg(
    to_jsonb(b) - 'user_id' || jsonb_build_object(
      'user_id', v_user_id::text,
      'spent', get_budget_spent(v_user_id, b.category),
      'remaining', b.maximum - get_budget_spent(v_user_id, b.category)
    )
  ), '[]'::jsonb) INTO v_budgets
  FROM budgets b WHERE user_id = v_user_id;

  -- Recent transactions (latest 5)
  SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) INTO v_recent_transactions
  FROM (SELECT * FROM transactions WHERE user_id = v_user_id ORDER BY date DESC LIMIT 5) t;

  -- Recurring bills summary
  WITH recurring AS (
    SELECT DISTINCT ON (name) *
    FROM transactions
    WHERE user_id = v_user_id AND recurring = true AND amount < 0
    ORDER BY name, date DESC
  ),
  paid AS (
    SELECT * FROM recurring WHERE date >= v_month_start AND date <= v_month_end
  ),
  unpaid AS (
    SELECT * FROM recurring WHERE NOT (date >= v_month_start AND date <= v_month_end)
  ),
  due_soon AS (
    SELECT * FROM unpaid
    WHERE EXTRACT(DAY FROM date)::int > v_current_date
      AND EXTRACT(DAY FROM date)::int <= v_current_date + 5
  )
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*)::int FROM unpaid),
    'totalAmount', (SELECT COALESCE(SUM(ABS(amount)), 0) FROM unpaid),
    'paid', jsonb_build_object(
      'count', (SELECT COUNT(*)::int FROM paid),
      'amount', (SELECT COALESCE(SUM(ABS(amount)), 0) FROM paid)
    ),
    'upcoming', jsonb_build_object(
      'count', (SELECT COUNT(*)::int FROM unpaid),
      'amount', (SELECT COALESCE(SUM(ABS(amount)), 0) FROM unpaid)
    ),
    'dueSoon', jsonb_build_object(
      'count', (SELECT COUNT(*)::int FROM due_soon),
      'amount', (SELECT COALESCE(SUM(ABS(amount)), 0) FROM due_soon)
    )
  ) INTO v_recurring_bills;

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'balance', jsonb_build_object(
        'current', v_profile.balance,
        'income', v_income,
        'expenses', v_expenses
      ),
      'pots', v_pots,
      'budgets', jsonb_build_object('items', COALESCE(v_budgets, '[]'::jsonb)),
      'transactions', jsonb_build_object('recent', COALESCE(v_recent_transactions, '[]'::jsonb)),
      'recurringBills', v_recurring_bills
    )
  );
END;
$$;

-- Get budgets with spent amounts and latest transactions
CREATE OR REPLACE FUNCTION public.get_budgets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_budgets jsonb;
  v_budget record;
  v_spent numeric;
  v_latest jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT COALESCE(jsonb_agg(budget_row), '[]'::jsonb) INTO v_budgets
  FROM (
    SELECT
      b.id,
      b.user_id,
      b.category,
      b.maximum,
      b.theme,
      b.created_at,
      b.updated_at,
      get_budget_spent(v_user_id, b.category) as spent,
      (b.maximum - get_budget_spent(v_user_id, b.category)) as remaining,
      (
        SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.date DESC), '[]'::jsonb)
        FROM (
          SELECT * FROM transactions
          WHERE user_id = v_user_id AND category = b.category AND amount < 0
          ORDER BY date DESC LIMIT 3
        ) t
      ) as latest_transactions
    FROM budgets b
    WHERE b.user_id = v_user_id
  ) budget_row;

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object('budgets', COALESCE(v_budgets, '[]'::jsonb))
  );
END;
$$;

-- Simple balance summary (for getBalance API)
CREATE OR REPLACE FUNCTION public.get_balance()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_balance numeric;
  v_income numeric;
  v_expenses numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT balance INTO v_balance FROM profiles WHERE id = v_user_id;
  SELECT COALESCE(SUM(amount), 0) INTO v_income FROM transactions WHERE user_id = v_user_id AND amount > 0;
  SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_expenses FROM transactions WHERE user_id = v_user_id AND amount < 0;

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'currentBalance', COALESCE(v_balance, 0),
      'income', v_income,
      'expenses', v_expenses
    )
  );
END;
$$;
