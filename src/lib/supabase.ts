import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabasePublic.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const isSupabaseConfigured = true;

let _client: SupabaseClient | null = null;

export const supabase: SupabaseClient = (() => {
  if (!_client) {
    _client = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return _client;
})();

export type SupplierRole = 'supplier' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  role: SupplierRole;
  supplier_id: string | null;
  is_approved: boolean | null;
  created_at: string;
}
