-- Migration 005: lock down affiliate data exposure.
-- Depends on migration 004 / PR #3 (real Supabase admin auth): before that,
-- the affiliate admin page queried as the anon role, which is why anon was
-- granted access to the summary view. Once the admin is a real authenticated
-- Supabase user, we can close the public hole.
-- Safe to run more than once.

-- ── Part 1+2: affiliate_summary view ────────────────────────────────────────
-- The view (affiliate_profiles ⋈ introductions ⋈ commissions) was created as a
-- SECURITY DEFINER view (reloptions NULL) with ALL privileges granted to anon,
-- so any visitor with the public anon key could read every affiliate's PII,
-- bypassing the RLS on the underlying tables.
--
-- Fix: drop all anon/authenticated grants, grant back only the SELECT the admin
-- page needs, and flip the view to security_invoker so it honours the caller's
-- RLS. The three base tables each have an is_admin() ALL policy, so an admin
-- still reads every row; anon and non-admin users read nothing.
revoke all on public.affiliate_summary from anon, authenticated;
grant select on public.affiliate_summary to authenticated;
alter view public.affiliate_summary set (security_invoker = on);

-- ── Part 3: tighten affiliate_applications read/update ───────────────────────
-- The previous policies allowed ANY logged-in user (auth.uid() IS NOT NULL) to
-- read and edit every affiliate application (name, email, etc.). Applications
-- arrive via a public insert form and are reviewed only by admins, so restrict
-- SELECT/UPDATE to admins. The public insert policy is left untouched.
drop policy if exists affiliate_auth_select on public.affiliate_applications;
create policy affiliate_auth_select on public.affiliate_applications
  for select using (public.is_admin());

drop policy if exists affiliate_auth_update on public.affiliate_applications;
create policy affiliate_auth_update on public.affiliate_applications
  for update using (public.is_admin()) with check (public.is_admin());
