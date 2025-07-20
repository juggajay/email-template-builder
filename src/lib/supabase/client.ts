import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './types';

// The createClientComponentClient automatically reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
export const createClient = () => createClientComponentClient<Database>();