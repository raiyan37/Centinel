/**
 * Auth Context
 *
 * CONCEPT: Provides authentication state and methods throughout the app.
 * Uses React Context to make auth available to all components.
 *
 * Features:
 * - User state (current logged-in user)
 * - Login/Register/Logout methods
 * - Google OAuth integration
 * - Auto-check auth status on mount
 * - Loading state during auth operations
 * - Toast notifications for auth events
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
import {
  type User,
  type RegisterData,
  type LoginData,
  registerUser,
  loginUser,
  googleAuth,
  getCurrentUser,
  logoutUser,
} from '@/lib/api';

// =============================================================================
// TYPES
// =============================================================================

interface AuthContextType {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Methods
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true for initial check
  const queryClient = useQueryClient();
  
  // Track the previous user ID to detect user changes
  const previousUserIdRef = useRef<string | null>(null);

  /**
   * Clear all cached data when user changes
   * This prevents data leaking between different user sessions
   */
  const clearUserData = useCallback(() => {
    queryClient.clear(); // Clear ALL cached queries
  }, [queryClient]);

  /**
   * Check if user is authenticated on mount
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      const newUser = response.data.user;
      
      // If user changed, clear old cache
      if (previousUserIdRef.current && previousUserIdRef.current !== newUser._id) {
        clearUserData();
      }
      
      previousUserIdRef.current = newUser._id;
      setUser(newUser);
    } catch {
      // Not authenticated or error - that's fine
      previousUserIdRef.current = null;
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearUserData]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login with email and password
   */
  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    try {
      // Clear any cached data from previous user BEFORE setting new user
      clearUserData();
      
      const response = await loginUser(data);
      const newUser = response.data.user;
      
      previousUserIdRef.current = newUser._id;
      setUser(newUser);
      toast.success(`Welcome back, ${newUser.fullName}!`);
    } catch (error) {
      // Re-throw so the calling component can handle/display the error
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserData]);

  /**
   * Register a new user
   */
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // Clear any cached data from previous user
      clearUserData();
      
      const response = await registerUser(data);
      const newUser = response.data.user;
      
      previousUserIdRef.current = newUser._id;
      setUser(newUser);
      toast.success('Account created successfully!');
    } catch (error) {
      // Re-throw so the calling component can handle/display the error
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserData]);

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async (credential: string) => {
    setIsLoading(true);
    try {
      // Clear any cached data from previous user BEFORE setting new user
      clearUserData();
      
      const response = await googleAuth(credential);
      const newUser = response.data.user;
      
      previousUserIdRef.current = newUser._id;
      setUser(newUser);
      toast.success(`Welcome, ${newUser.fullName}!`);
    } catch (error) {
      // Re-throw so the calling component can handle/display the error
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserData]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      
      // Clear all cached data - IMPORTANT for security!
      clearUserData();
      previousUserIdRef.current = null;
      setUser(null);
      
      toast.success('Logged out successfully');
    } catch (error) {
      // Still clear user and cache on logout error (might be network issue)
      clearUserData();
      previousUserIdRef.current = null;
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserData]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data.user);
    } catch {
      setUser(null);
    }
  }, []);

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

/**
 * Hook to access auth context
 *
 * Usage:
 *   const { user, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
