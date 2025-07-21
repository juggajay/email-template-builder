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

// Get bypass emails from environment variable
const getBypassEmails = (): string[] => {
  const emails = process.env.BETA_BYPASS_EMAILS || process.env.NEXT_PUBLIC_BETA_BYPASS_EMAILS || '';
  return emails.split(',').map(email => email.trim()).filter(Boolean);
};

// Check if beta access is enabled
const isBetaEnabled = (): boolean => {
  const enabled = process.env.BETA_ACCESS_ENABLED || process.env.NEXT_PUBLIC_BETA_ACCESS_ENABLED;
  return enabled !== 'false';
};

export class BetaAccessService {
  private supabase = createClient();

  /**
   * Check if a user has beta access
   */
  async checkBetaAccess(userId: string): Promise<boolean> {
    // If beta access is disabled, allow everyone
    if (!isBetaEnabled()) {
      return true;
    }

    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('is_beta_tester, email')
        .eq('user_id', userId)
        .single();

      if (error || !data) return false;
      
      // Always allow bypass emails
      const bypassEmails = getBypassEmails();
      if (bypassEmails.includes(data.email)) {
        return true;
      }
      
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
    // If beta access is disabled, allow everyone
    if (!isBetaEnabled()) {
      return true;
    }

    try {
      // Always allow bypass emails
      const bypassEmails = getBypassEmails();
      if (bypassEmails.includes(email)) {
        return true;
      }

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
  async validateInviteCode(code: string): Promise<{ valid: boolean; invite?: BetaInvite; reason?: string }> {
    try {
      // Clean the code (remove spaces, make uppercase)
      const cleanCode = code.trim().toUpperCase();
      
      const { data, error } = await this.supabase
        .from('beta_invites')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (error || !data) {
        console.log('Invite code not found:', cleanCode);
        return { valid: false, reason: 'Invite code not found' };
      }

      // Check if invite is still valid
      const now = new Date();
      const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
      
      if (expiresAt && expiresAt < now) {
        console.log('Invite code expired:', cleanCode, 'expires at:', expiresAt);
        return { valid: false, reason: 'Invite code has expired' };
      }

      if (data.uses_count >= data.max_uses) {
        console.log('Invite code used up:', cleanCode, 'uses:', data.uses_count, 'max:', data.max_uses);
        return { valid: false, reason: 'Invite code has reached maximum uses' };
      }

      return { valid: true, invite: data as BetaInvite };
    } catch (error) {
      console.error('Error validating invite code:', error);
      return { valid: false, reason: 'Error validating invite code' };
    }
  }

  /**
   * Use a beta invite code for a user
   */
  async useInviteCode(code: string, userId: string): Promise<boolean> {
    try {
      // Clean the code (remove spaces, make uppercase)
      const cleanCode = code.trim().toUpperCase();
      
      const { data, error } = await this.supabase
        .rpc('use_beta_invite', { 
          invite_code: cleanCode, 
          user_id: userId 
        });

      if (error) {
        console.error('Error using invite code:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return false;
      }

      console.log('Beta invite RPC result:', data);
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