import { createClient } from '@/lib/supabase/client';

export interface BetaInvite {
  id: string;
  code: string;
  email?: string;
  created_at: string;
  used_at?: string;
  used_by?: string;
  max_uses: number;
  uses_count: number;
  expires_at?: string;
  created_by?: string;
  notes?: string;
}

export class BetaAccessService {
  private supabase = createClient();

  /**
   * Check if a user has beta access
   */
  async checkBetaAccess(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('is_beta_tester')
        .eq('user_id', userId)
        .single();

      if (error || !data) return false;
      return data.is_beta_tester === true;
    } catch (error) {
      console.error('Error checking beta access:', error);
      return false;
    }
  }

  /**
   * Check if an email is allowed for beta signup
   */
  async isEmailAllowedForBeta(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('is_email_beta_allowed', { email_address: email });

      if (error) {
        console.error('Error checking beta email:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking beta email:', error);
      return false;
    }
  }

  /**
   * Validate a beta invite code
   */
  async validateInviteCode(code: string): Promise<{ valid: boolean; invite?: BetaInvite }> {
    try {
      const { data, error } = await this.supabase
        .from('beta_invites')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) {
        return { valid: false };
      }

      // Check if invite is still valid
      const now = new Date();
      const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
      
      if (expiresAt && expiresAt < now) {
        return { valid: false };
      }

      if (data.uses_count >= data.max_uses) {
        return { valid: false };
      }

      return { valid: true, invite: data as BetaInvite };
    } catch (error) {
      console.error('Error validating invite code:', error);
      return { valid: false };
    }
  }

  /**
   * Use a beta invite code for a user
   */
  async useInviteCode(code: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('use_beta_invite', { 
          invite_code: code, 
          user_id: userId 
        });

      if (error) {
        console.error('Error using invite code:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error using invite code:', error);
      return false;
    }
  }

  /**
   * Generate a new beta invite code
   */
  async createInvite(options: {
    email?: string;
    maxUses?: number;
    expiresInDays?: number;
    notes?: string;
    createdBy: string;
  }): Promise<{ success: boolean; invite?: BetaInvite; error?: string }> {
    try {
      // Generate a unique code
      const code = this.generateInviteCode();
      
      const expiresAt = options.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await this.supabase
        .from('beta_invites')
        .insert({
          code,
          email: options.email,
          max_uses: options.maxUses || 1,
          expires_at: expiresAt,
          notes: options.notes,
          created_by: options.createdBy,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, invite: data as BetaInvite };
    } catch (error) {
      console.error('Error creating invite:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create invite' 
      };
    }
  }

  /**
   * Get all beta invites (admin only)
   */
  async getAllInvites(): Promise<BetaInvite[]> {
    try {
      const { data, error } = await this.supabase
        .from('beta_invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invites:', error);
        return [];
      }

      return data as BetaInvite[];
    } catch (error) {
      console.error('Error fetching invites:', error);
      return [];
    }
  }

  /**
   * Grant beta access to a user directly (admin only)
   */
  async grantBetaAccess(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          is_beta_tester: true,
          beta_access_granted_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error granting beta access:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error granting beta access:', error);
      return false;
    }
  }

  /**
   * Revoke beta access from a user (admin only)
   */
  async revokeBetaAccess(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          is_beta_tester: false,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error revoking beta access:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error revoking beta access:', error);
      return false;
    }
  }

  /**
   * Generate a unique invite code
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'BETA-';
    
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }
}

// Create singleton instance
export const betaAccessService = new BetaAccessService();