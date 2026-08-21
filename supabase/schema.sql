-- BizGrow AI — core schema, RLS policies, and signup trigger.
-- Run this in the Supabase SQL editor on a fresh project.

-- 1. PROFILES ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'user'); -- users can never self-promote to admin

-- Admin role is only ever granted manually by a service-role/dashboard update,
-- never through a client-writable path.

-- 2. BUSINESSES --------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  industry text,
  subscription_status text not null default 'trial'
    check (subscription_status in ('trial', 'active', 'past_due', 'canceled')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "Owners can view their business"
  on public.businesses for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their business"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their business"
  on public.businesses for update
  using (auth.uid() = owner_id);

-- 3. AUTO-CREATE PROFILE ON SIGNUP -------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. CORE WORKSPACE TABLES ---------------------------------------------
-- All scoped to a business via business_id, and RLS-checked through
-- business ownership so one user can never see another's data.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  contact text,
  source text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  contact text,
  lifetime_value numeric default 0,
  last_purchase_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  customer_id uuid references public.customers (id) on delete set null,
  note text not null,
  due_at timestamptz not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook', 'google_business', 'other')),
  caption text,
  media_url text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'posted', 'failed')),
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  platform text not null check (platform in ('google', 'meta', 'other')),
  name text not null,
  budget numeric,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'ended')),
  created_at timestamptz not null default now()
);

create table if not exists public.retention_notes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.customers enable row level security;
alter table public.follow_ups enable row level security;
alter table public.social_posts enable row level security;
alter table public.ads enable row level security;
alter table public.retention_notes enable row level security;

-- One shared policy pattern per table: the row's business must be owned
-- by the current user. Repeated per table since Postgres RLS policies
-- can't be parameterized across tables.
create policy "Owner can manage leads" on public.leads for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owner can manage customers" on public.customers for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owner can manage follow_ups" on public.follow_ups for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owner can manage social_posts" on public.social_posts for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owner can manage ads" on public.ads for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owner can manage retention_notes" on public.retention_notes for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- 5. CONFIG-DRIVEN ADMIN SETTINGS ---------------------------------------
-- Generic key/value store so admins can change pricing, prompts, feature
-- flags, limits, and FAQs without a code deploy. `key` is namespaced,
-- e.g. 'pricing.starter_plan', 'prompt.daily_growth_advisor', 'faq.1'.
create table if not exists public.app_config (
  key text primary key,
  category text not null check (category in ('pricing', 'prompt', 'feature', 'limit', 'faq')),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

alter table public.app_config enable row level security;

-- Everyone signed in can read config (e.g. pricing shown on landing page).
create policy "Authenticated users can read config"
  on public.app_config for select
  using (auth.role() = 'authenticated');

-- Only admins can write config.
create policy "Admins can manage config"
  on public.app_config for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Optional starter rows so the admin screens aren't empty on first login.
-- Safe to delete or edit from the Admin UI afterwards.
insert into public.app_config (key, category, value) values
  ('pricing.starter_plan', 'pricing', '{"name": "Starter", "price_inr": 999, "billing": "monthly"}'),
  ('pricing.growth_plan', 'pricing', '{"name": "Growth", "price_inr": 2499, "billing": "monthly"}'),
  ('prompt.daily_growth_advisor', 'prompt', '"You are a growth advisor for a small business. Given today''s leads, follow-ups, and sales data, suggest the single most impactful action to take today."'),
  ('feature.ai_video', 'feature', 'false'),
  ('feature.ads_module', 'feature', 'true'),
  ('limit.trial.leads_per_month', 'limit', '50'),
  ('faq.what_is_bizgrow', 'faq', '{"question": "What is BizGrow AI?", "answer": "An AI assistant that turns your daily business data into the next best growth action."}')
on conflict (key) do nothing;

-- Making yourself an admin (run once, after you've signed up):
-- update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';
