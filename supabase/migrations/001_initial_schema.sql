-- TravelIQ initial schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- It is safe to run more than once: every statement uses IF NOT EXISTS or ON CONFLICT.

-- =============================================================================
-- PROFILES
-- One row per Supabase auth user. Holds role + the supplier they manage.
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  company_name text,
  role text not null default 'supplier' check (role in ('supplier', 'admin')),
  supplier_id uuid,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- SUPPLIERS
-- =============================================================================
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  type text not null check (type in ('airline', 'hotel', 'cruise')),
  logo_url text,
  banner_url text,
  video_url text,
  short_description text,
  long_description text,
  avatar_image_url text,
  website_url text,
  knowledge_base_url text,
  knowledge_base_text text,
  gemini_voice_name text default 'Zephyr',
  use_eleven_labs boolean default false,
  eleven_labs_agent_id text,
  hedra_avatar_id text,
  is_published boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suppliers_owner_idx on public.suppliers(owner_id);
create index if not exists suppliers_published_idx on public.suppliers(is_published);

-- Backfill the foreign key on profiles.supplier_id now that suppliers exists.
do $$ begin
  alter table public.profiles
    add constraint profiles_supplier_id_fkey foreign key (supplier_id)
    references public.suppliers(id) on delete set null;
exception when duplicate_object then null;
end $$;

-- =============================================================================
-- LEADS
-- =============================================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete cascade,
  type text not null,
  first_name text,
  last_name text,
  name text,
  email text not null,
  agency text,
  plan text,
  message text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists leads_supplier_idx on public.leads(supplier_id);
create index if not exists leads_created_idx on public.leads(created_at desc);

-- =============================================================================
-- BLOG POSTS
-- =============================================================================
create table if not exists public.blog_posts (
  id text primary key,
  title text not null,
  date text not null,
  image_url text,
  summary text,
  author text,
  content text,
  published boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- updated_at triggers
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Auto-create a profile when a new auth user signs up
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, company_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.leads enable row level security;
alter table public.blog_posts enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- profiles policies ----------
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);

-- ---------- suppliers policies ----------
-- Public can read published suppliers (directory page)
drop policy if exists suppliers_public_read on public.suppliers;
create policy suppliers_public_read on public.suppliers
  for select using (is_published = true or owner_id = auth.uid() or public.is_admin());

-- Owners can update their own supplier; admins can update any
drop policy if exists suppliers_owner_update on public.suppliers;
create policy suppliers_owner_update on public.suppliers
  for update using (owner_id = auth.uid() or public.is_admin());

-- Owners can insert if they don't already own one; admins always
drop policy if exists suppliers_owner_insert on public.suppliers;
create policy suppliers_owner_insert on public.suppliers
  for insert with check (owner_id = auth.uid() or public.is_admin());

-- Only admins can delete
drop policy if exists suppliers_admin_delete on public.suppliers;
create policy suppliers_admin_delete on public.suppliers
  for delete using (public.is_admin());

-- ---------- leads policies ----------
-- Anyone (including anon) can insert a lead (this is how the public site captures them)
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
  for insert with check (true);

-- Suppliers see only their own leads; admins see all
drop policy if exists leads_supplier_read on public.leads;
create policy leads_supplier_read on public.leads
  for select using (
    public.is_admin()
    or supplier_id in (select id from public.suppliers where owner_id = auth.uid())
  );

-- ---------- blog_posts policies ----------
drop policy if exists blog_posts_public_read on public.blog_posts;
create policy blog_posts_public_read on public.blog_posts
  for select using (published = true or public.is_admin());

drop policy if exists blog_posts_admin_write on public.blog_posts;
create policy blog_posts_admin_write on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());
