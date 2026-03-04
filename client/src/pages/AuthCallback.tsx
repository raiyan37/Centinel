import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const completeOAuthLogin = async () => {
      // detectSessionInUrl handles PKCE/implicit callbacks, but give it a beat.
      await new Promise((resolve) => setTimeout(resolve, 250));

      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;

      if (error || !data.session) {
        navigate('/login', { replace: true });
        return;
      }

      await refreshUser();
      if (cancelled) return;

      navigate('/overview', { replace: true });
    };

    void completeOAuthLogin();

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-beige-100)]">
      <div className="flex items-center gap-3 text-[var(--color-grey-500)]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Finishing Google sign-in...</span>
      </div>
    </div>
  );
}
