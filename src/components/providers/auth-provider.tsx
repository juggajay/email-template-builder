'use client';

import { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { AuthState } from '@/types';

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (data: any) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: any) => Promise<any>;
  canExport: () => Promise<boolean>;
  recordExport: (templateId: string, exportType: string) => Promise<any>;
  refreshSession: () => Promise<any>;
  isAuthenticated: boolean;
  isPro: boolean;
  isAgency: boolean;
  isPaid: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // Set up periodic session check
  useEffect(() => {
    // Check session every 30 minutes
    const interval = setInterval(() => {
      auth.refreshSession();
    }, 30 * 60 * 1000);

    // Also check when the window regains focus
    const handleFocus = () => {
      auth.refreshSession();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [auth]);

  // Handle visibility change (when tab becomes active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && auth.isAuthenticated) {
        // Refresh session when tab becomes visible
        auth.refreshSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}