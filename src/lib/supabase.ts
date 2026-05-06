import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ypciahmwkiivenlvcoev.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwY2lhaG13a2lpdmVubHZjb2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTE2MjMsImV4cCI6MjA5MzU4NzYyM30.Rzv-58bmvgyq7I7O99cPgtR0Ewb6rHKybG7J68o5V2Y';

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
  created_at: string;
}
