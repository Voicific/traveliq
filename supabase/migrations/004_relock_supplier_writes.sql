-- Migration 004: re-lock supplier write policies to owner/admin only.
-- Reverts the wide-open anon writes that migration 003 introduced for the
-- legacy hardcoded /admin page. The admin area now uses real Supabase auth
-- (profiles.role = 'admin'), so auth.uid() is populated and is_admin() works.
-- Safe to run more than once.

-- Insert: owners can create their own supplier row; admins can create any.
drop policy if exists suppliers_owner_insert on public.suppliers;
create policy suppliers_owner_insert on public.suppliers
  for insert with check (owner_id = auth.uid() or public.is_admin());

-- Update: owners can edit their own supplier; admins can edit any.
drop policy if exists suppliers_owner_update on public.suppliers;
create policy suppliers_owner_update on public.suppliers
  for update using (owner_id = auth.uid() or public.is_admin());

-- Delete: admins only.
drop policy if exists suppliers_admin_delete on public.suppliers;
create policy suppliers_admin_delete on public.suppliers
  for delete using (public.is_admin());
