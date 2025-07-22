import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/supabase/auth';
import type { User, UserProfile, Subscription, AuthState } from '@/types';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    subscription: null,
    loading: true,
    error: null,
  });

  // Load user data function
  const loadUserData = useCallback(async (user: User) => {
    try {
      const [profile, subscription] = await Promise.all([
        authService.getUserProfile(user.id),
        authService.getUserSubscription(user.id),
      ]);

      setState({
        user,
        profile,
        subscription,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load user data',
      }));
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // Get the current session
        const session = await authService.getSession();
        
        if (session?.user && mounted) {
          await loadUserData(session.user);
        } else if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
          }));
        }

        // Set up auth state listener
        authSubscription = authService.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('Auth event:', event);

            switch (event) {
              case 'SIGNED_IN':
              case 'TOKEN_REFRESHED':
                if (session?.user) {
                  await loadUserData(session.user);
                }
                break;

              case 'SIGNED_OUT':
                setState({
                  user: null,
                  profile: null,
                  subscription: null,
                  loading: false,
                  error: null,
                });
                router.push('/login');
                break;

              case 'USER_UPDATED':
                if (session?.user) {
                  // Reload user data when user is updated
                  await loadUserData(session.user);
                }
                break;

              default:
                break;
            }
          }
        );
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Authentication error',
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, [loadUserData, router]);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await authService.signIn({ email, password });
    
    if (result.error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.error?.message || 'Sign in failed',
      }));
    }
    
    return result;
  };

  const signUp = async (data: {
    email: string;
    password: string;
    fullName?: string;
    companyName?: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await authService.signUp(data);
    
    if (result.error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.error?.message || 'Sign up failed',
      }));
    }
    
    return result;
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));
    const result = await authService.signOut();
    
    if (result.error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.error.message,
      }));
    }
    
    return result;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) return { data: null, error: { message: 'No user logged in' } };

    const result = await authService.updateUserProfile(state.user.id, updates);
    
    if (result.data) {
      setState(prev => ({
        ...prev,
        profile: result.data,
      }));
    }
    
    return result;
  };

  const canExport = async () => {
    if (!state.user) return false;
    return authService.canUserExport(state.user.id);
  };

  const recordExport = async (templateId: string, exportType: string) => {
    if (!state.user) return { error: { message: 'No user logged in' } };
    return authService.recordExport(state.user.id, templateId, exportType);
  };

  const refreshSession = async () => {
    const session = await authService.refreshSession();
    if (session?.user) {
      await loadUserData(session.user);
    }
    return session;
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    canExport,
    recordExport,
    refreshSession,
    isAuthenticated: !!state.user,
    isPro: state.subscription?.plan === 'pro',
    isAgency: state.subscription?.plan === 'agency',
    isPaid: state.subscription?.plan !== 'free',
  };
}