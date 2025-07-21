import { useState, useEffect } from 'react';
import { authService } from '@/lib/supabase/auth';
import type { User, UserProfile, Subscription, AuthState } from '@/types';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    subscription: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    // Get initial session with retry logic
    const getInitialSession = async () => {
      try {
        const user = await authService.getCurrentUser();
        
        if (user && mounted) {
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
        } else if (mounted) {
          // If no user but we're on a verified redirect, retry
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('verified') === 'true' && retryCount < maxRetries) {
            retryCount++;
            console.log(`[Auth Hook] No user found on verified redirect, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(() => {
              if (mounted) getInitialSession();
            }, 500 * retryCount); // Exponential backoff
            return;
          }
          
          setState(prev => ({
            ...prev,
            loading: false,
          }));
        }
      } catch (error) {
        if (mounted) {
          // Retry on error if we're on a verified redirect
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('verified') === 'true' && retryCount < maxRetries) {
            retryCount++;
            console.log(`[Auth Hook] Error getting session on verified redirect, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(() => {
              if (mounted) getInitialSession();
            }, 500 * retryCount);
            return;
          }
          
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Authentication error',
          }));
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const [profile, userSubscription] = await Promise.all([
            authService.getUserProfile(session.user.id),
            authService.getUserSubscription(session.user.id),
          ]);

          setState({
            user: session.user,
            profile,
            subscription: userSubscription,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            subscription: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

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

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    canExport,
    recordExport,
    isAuthenticated: !!state.user,
    isPro: state.subscription?.plan === 'pro',
    isAgency: state.subscription?.plan === 'agency',
    isPaid: state.subscription?.plan !== 'free',
  };
}