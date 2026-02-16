-- Database functions for atomic operations
-- Replaces Express controller logic for pots and balance updates

-- =============================================================================
-- POT DEPOSIT: Takes money from balance, adds to pot
-- =============================================================================
CREATE OR REPLACE FUNCTION public.pot_deposit(pot_id uuid, amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_pot record;
  v_profile record;
  v_new_balance numeric;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  -- Validate amount
  IF amount IS NULL OR amount <= 0 THEN
    RETURN jsonb_build_object('error', 'Amount must be a positive number');
  END IF;

  -- Get pot (must belong to user)
  SELECT * INTO v_pot FROM pots WHERE id = pot_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Pot not found');
  END IF;

  -- Get user profile and check balance
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;
  IF v_profile.balance < amount THEN
    RETURN jsonb_build_object('error', 'Insufficient balance');
  END IF;

  -- Atomic update: decrease balance, increase pot total
  UPDATE profiles SET balance = balance - amount, updated_at = now() WHERE id = v_user_id;
  UPDATE pots SET total = total + amount, updated_at = now() WHERE id = pot_id;

  SELECT balance INTO v_new_balance FROM profiles WHERE id = v_user_id;
  SELECT * INTO v_pot FROM pots WHERE id = pot_id;

  RETURN jsonb_build_object(
    'success', true,
    'pot', to_jsonb(v_pot),
    'newBalance', v_new_balance
  );
END;
$$;

-- =============================================================================
-- POT WITHDRAW: Takes money from pot, adds to balance
-- =============================================================================
CREATE OR REPLACE FUNCTION public.pot_withdraw(pot_id uuid, amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_pot record;
  v_new_balance numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  IF amount IS NULL OR amount <= 0 THEN
    RETURN jsonb_build_object('error', 'Amount must be a positive number');
  END IF;

  SELECT * INTO v_pot FROM pots WHERE id = pot_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Pot not found');
  END IF;
  IF v_pot.total < amount THEN
    RETURN jsonb_build_object('error', 'Insufficient pot balance');
  END IF;

  UPDATE pots SET total = total - amount, updated_at = now() WHERE id = pot_id;
  UPDATE profiles SET balance = balance + amount, updated_at = now() WHERE id = v_user_id;

  SELECT balance INTO v_new_balance FROM profiles WHERE id = v_user_id;
  SELECT * INTO v_pot FROM pots WHERE id = pot_id;

  RETURN jsonb_build_object(
    'success', true,
    'pot', to_jsonb(v_pot),
    'newBalance', v_new_balance
  );
END;
$$;

-- =============================================================================
-- DELETE POT: Returns money to balance, deletes pot
-- =============================================================================
CREATE OR REPLACE FUNCTION public.delete_pot(pot_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_pot record;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT * INTO v_pot FROM pots WHERE id = pot_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Pot not found');
  END IF;

  -- Return money to balance
  IF v_pot.total > 0 THEN
    UPDATE profiles SET balance = balance + v_pot.total, updated_at = now() WHERE id = v_user_id;
  END IF;

  DELETE FROM pots WHERE id = pot_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- =============================================================================
-- GET BUDGET SPENT: Sum of expenses in category for current month
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_budget_spent(p_user_id uuid, p_category text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_spent numeric;
  v_month_start timestamptz;
  v_month_end timestamptz;
BEGIN
  v_month_start := date_trunc('month', now())::timestamptz;
  v_month_end := v_month_start + interval '1 month' - interval '1 second';

  SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_spent
  FROM transactions
  WHERE user_id = p_user_id
    AND category = p_category
    AND amount < 0
    AND date >= v_month_start
    AND date <= v_month_end;

  RETURN v_spent;
END;
$$;

-- =============================================================================
-- BALANCE TRIGGER: Update profile balance on transaction changes
-- Only affects balance for transactions in current month
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_balance_on_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month_start timestamptz;
  v_month_end timestamptz;
  v_in_current_month boolean;
BEGIN
  v_month_start := date_trunc('month', now())::timestamptz;
  v_month_end := v_month_start + interval '1 month' - interval '1 second';

  IF TG_OP = 'INSERT' THEN
    v_in_current_month := NEW.date >= v_month_start AND NEW.date <= v_month_end;
    IF v_in_current_month THEN
      UPDATE profiles SET balance = balance + NEW.amount, updated_at = now() WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_in_current_month := (NEW.date >= v_month_start AND NEW.date <= v_month_end);
    IF (OLD.date >= v_month_start AND OLD.date <= v_month_end) OR v_in_current_month THEN
      -- Reverse old amount if it was in current month
      IF OLD.date >= v_month_start AND OLD.date <= v_month_end THEN
        UPDATE profiles SET balance = balance - OLD.amount, updated_at = now() WHERE id = OLD.user_id;
      END IF;
      -- Apply new amount if in current month
      IF v_in_current_month THEN
        UPDATE profiles SET balance = balance + NEW.amount, updated_at = now() WHERE id = NEW.user_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_in_current_month := OLD.date >= v_month_start AND OLD.date <= v_month_end;
    IF v_in_current_month THEN
      UPDATE profiles SET balance = balance - OLD.amount, updated_at = now() WHERE id = OLD.user_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_transaction_balance_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_balance_on_transaction();
