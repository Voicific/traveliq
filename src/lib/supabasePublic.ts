/**
 * Public Supabase connection values.
 *
 * Both are safe to ship: the anon key only grants what row-level security
 * allows an anonymous visitor. They live in their own dependency-free module
 * so the Cloudflare Pages Functions in /functions can import them as defaults
 * without pulling in the browser client.
 */
export const SUPABASE_URL = 'https://ypciahmwkiivenlvcoev.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwY2lhaG13a2lpdmVubHZjb2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTE2MjMsImV4cCI6MjA5MzU4NzYyM30.Rzv-58bmvgyq7I7O99cPgtR0Ewb6rHKybG7J68o5V2Y';
