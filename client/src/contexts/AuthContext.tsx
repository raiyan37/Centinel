/**
 * Auth Context
 *
 * CONCEPT: Provides authentication state and methods using Supabase Auth.
 * Uses React Context to make auth available to all components.
 *
 * Features:
 * - User state (current logged-in user + profile)
 * - Login/Register/Logout methods
 * - Google OAuth (redirect-based)
 * - Auto-check auth status via onAuthStateChange
 * - Loading state during auth operations
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  balance: number;
  avatarUrl?: string;
  verified: boolean;
  authProvider: 'local' | 'google';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

async function fetchUserWithProfile(userId: string): Promise<User | null> {
  const { data: authUserRes } = await supabase.auth.getUser();
  if (!authUserRes.user) return null;

  let { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Self-heal missing profile rows for users created before trigger was configured
  if (error || !profile) {
    const fullName =
      (authUserRes.user.user_metadata?.full_name as string | undefined) ??
      (authUserRes.user.email?.split('@')[0] ?? 'User');
    const avatarUrl = authUserRes.user.user_metadata?.avatar_url as string | undefined;

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: fullName,
          avatar_url: avatarUrl ?? null,
          balance: 0,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (insertError || !inserted) {
      return null;
    }
    profile = inserted;
  }

  const provider = authUserRes.user.app_metadata?.provider as string | undefined;
  const authProvider = provider === 'google' ? 'google' : 'local';

  return {
    id: profile.id,
    email: authUserRes.user.email ?? '',
    fullName: profile.full_name ?? 'User',
    balance: Number(profile.balance ?? 0),
    avatarUrl: profile.avatar_url ?? undefined,
    verified: !!authUserRes.user.email_confirmed_at,
    authProvider,
    createdAt: profile.created_at ?? new Date().toISOString(),
    updatedAt: profile.updated_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const previousUserIdRef = useRef<string | null>(null);

  const clearUserData = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  const loadUser = useCallback(async (authUserId: string) => {
    const profileUser = await fetchUserWithProfile(authUserId);
    if (profileUser) {
      if (previousUserIdRef.current && previousUserIdRef.current !== profileUser.id) {
        clearUserData();
      }
      previousUserIdRef.current = profileUser.id;
      setUser(profileUser);
    } else {
      previousUserIdRef.current = null;
      setUser(null);
    }
  }, [clearUserData]);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUser(session.user.id);
      } else {
        previousUserIdRef.current = null;
        setUser(null);
      }
    } catch {
      previousUserIdRef.current = null;
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadUser]);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUser(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          clearUserData();
          previousUserIdRef.current = null;
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAuth, loadUser, clearUserData]);

  const login = useCallback(async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      clearUserData();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      if (authData.user) {
        await loadUser(authData.user.id);
        toast.success(`Welcome back, ${authData.user.user_metadata?.full_name ?? 'User'}!`);
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserData, loadUser]);

  const register = useCallback(async (data: { email: string; password: string; fullName: string }) => {
    setIsLoading(true);
    try {
      clearUserData();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName },
        },
      });
      if (error) throw error;
      if (authData.user) {
        await loadUser(authData.user.id);
        toast.success('Account created successfully!');
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserData, loadUser]);

  const loginWithGoogle = useCallback(async () => {
    clearUserData();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/overview`,
      },
    });
  }, [clearUserData]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      clearUserData();
      previousUserIdRef.current = null;
      setUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      clearUserData();
      previousUserIdRef.current = null;
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserData]);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUser(session.user.id);
    } else {
      setUser(null);
    }
  }, [loadUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
