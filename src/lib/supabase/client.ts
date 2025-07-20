import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './types';

// The createClientComponentClient automatically reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env.local file.');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  }

  return createClientComponentClient<Database>();
};