import { createClient } from './client';
import type { User, UserProfile, Subscription } from '@/types';

export interface AuthError {
  message: string;
  status?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
  inviteCode?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  private supabase = createClient();

  async signUp({ email, password, fullName, companyName, inviteCode }: SignUpData) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            beta_invite_code: inviteCode,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zebamail.com'}/auth/callback?type=signup`,
        },
      });

      if (error) throw error;

      // Log for debugging
      console.log('[Auth Service] Sign up response:', {
        user: data.user,
        session: data.session,
      });
      
      console.log('[Auth Service] Sign up successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmedAt: data.user?.email_confirmed_at,
        confirmationSentAt: data.user?.confirmation_sent_at,
        identities: data.user?.identities,
        createdAt: data.user?.created_at,
      });

      // Check if user is in unconfirmed state
      if (data.user && !data.user.email_confirmed_at) {
        console.log('[Auth Service] User created but email not confirmed. Check your email for verification link.');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          data: null,
          error: {
            message: 'Connection error. Please check your internet connection and try again.',
          },
        };
      }
      
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Sign up failed',
        },
      };
    }
  }

  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          data: null,
          error: {
            message: 'Connection error. Please check your internet connection and try again.',
          },
        };
      }
      
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Sign in failed',
        },
      };
    }
  }

  async signInWithProvider(provider: 'google' | 'github') {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zebamail.com'}/auth/callback`,
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'OAuth sign in failed',
        },
      };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Sign out failed',
        },
      };
    }
  }

  async resetPassword(email: string) {
    try {
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zebamail.com'}/auth/callback?next=/reset-password`,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Password reset failed',
        },
      };
    }
  }

  async updatePassword(password: string) {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Password update failed',
        },
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async refreshSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.refreshSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return data as UserProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data: data as UserProfile, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Profile update failed',
        },
      };
    }
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return data as Subscription;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // Usage tracking functions
  async canUserExport(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      const subscription = await this.getUserSubscription(userId);

      if (!profile || !subscription) return false;

      // Free users get 5 exports per month
      if (subscription.plan === 'free') {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const { count } = await this.supabase
          .from('template_exports')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .gte('created_at', `${currentMonth}-01T00:00:00.000Z`)
          .lt('created_at', `${currentMonth}-31T23:59:59.999Z`);

        return (count || 0) < 5;
      }

      // Pro and Agency users have unlimited exports
      return true;
    } catch (error) {
      console.error('Error checking export limit:', error);
      return false;
    }
  }

  async recordExport(userId: string, templateId: string, exportType: string) {
    try {
      const { error } = await this.supabase
        .from('template_exports')
        .insert({
          user_id: userId,
          template_id: templateId,
          export_type: exportType as any,
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to record export',
        },
      };
    }
  }
}

// Create a singleton instance
export const authService = new AuthService();