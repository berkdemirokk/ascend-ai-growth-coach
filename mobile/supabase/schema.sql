-- Ascend: Monk Mode — Supabase schema
-- Run this SQL in your Supabase project (SQL editor → New query → Paste → Run).
-- It creates a single-row-per-user table that stores the full progress snapshot,
-- and sets up RLS so each user can only read/write their own row.

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: user_state
-- One row per auth user; `payload` holds the JSON snapshot from AppContext.
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  payload    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Ensure updated_at moves forward on every upsert.
create or replace function public.user_state_set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_state_set_updated_at on public.user_state;
create trigger user_state_set_updated_at
before update on public.user_state
for each row execute function public.user_state_set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.user_state enable row level security;

drop policy if exists "user_state: select own" on public.user_state;
create policy "user_state: select own"
  on public.user_state for select
  using (auth.uid() = user_id);

drop policy if exists "user_state: insert own" on public.user_state;
create policy "user_state: insert own"
  on public.user_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_state: update own" on public.user_state;
create policy "user_state: update own"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_state: delete own" on public.user_state;
create policy "user_state: delete own"
  on public.user_state for delete
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- Auth settings you still need to check in the Supabase dashboard:
--   Authentication → Providers → Email: enable "Confirm email" if you want
--     e-mail verification. The app handles both confirmed and unconfirmed
--     sign-up flows.
--   Authentication → URL Configuration: set Site URL + Redirect URLs if
--     you plan to use password reset deep-links in production.
-- ──────────────────────────────────────────────────────────────────────────────
