import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let _client: SupabaseClient | null = null;

export const supabase: SupabaseClient = (() => {
  if (!_client) {
    if (!isSupabaseConfigured) {
      console.warn('Supabase env vars missing. Auth and supplier portal features disabled.');
    }
    _client = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key',
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
  created_at: string;
}
