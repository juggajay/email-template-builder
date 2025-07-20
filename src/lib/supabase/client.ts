import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Validate Supabase configuration
const validateSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  } else if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL appears to be invalid. It should be like: https://yourproject.supabase.co');
  }

  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  } else if (supabaseAnonKey === 'your-anon-key-here' || supabaseAnonKey.length < 20) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid. Please use your actual Supabase anon key');
  }

  return { isValid: errors.length === 0, errors };
};

// The createClientComponentClient automatically reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
export const createClient = () => {
  const validation = validateSupabaseConfig();
  
  if (!validation.isValid) {
    console.error('❌ Supabase configuration error:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
    console.error('\n📚 Please visit /setup for configuration instructions');
    
    // Return a mock client that will show helpful errors
    return {
      auth: {
        signInWithPassword: async () => {
          throw new Error('Supabase is not configured. Please check your .env.local file and visit /setup for help.');
        },
        signUp: async () => {
          throw new Error('Supabase is not configured. Please check your .env.local file and visit /setup for help.');
        },
        signInWithOAuth: async () => {
          throw new Error('Supabase is not configured. Please check your .env.local file and visit /setup for help.');
        },
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => {
          throw new Error('Supabase is not configured. Please check your .env.local file and visit /setup for help.');
        },
        updateUser: async () => {
          throw new Error('Supabase is not configured. Please check your .env.local file and visit /setup for help.');
        },
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase is not configured') }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: new Error('Supabase is not configured') }),
            }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: new Error('Supabase is not configured') }),
          }),
        }),
      }),
    } as any;
  }

  return createClientComponentClient<Database>();
};