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
-- Table: streak_leaderboard
-- Public, anonymized streak ranking. Users only see their own anon_username and
-- can update only their own row. Everyone (including anon users) can read all
-- rows because anon_username never reveals identity.
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.streak_leaderboard (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  anon_username  text not null,
  current_streak int  not null default 0,
  longest_streak int  not null default 0,
  total_xp       int  not null default 0,
  updated_at     timestamptz not null default now()
);

create index if not exists streak_leaderboard_current_streak_idx
  on public.streak_leaderboard (current_streak desc, total_xp desc);

create or replace function public.streak_leaderboard_set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists streak_leaderboard_set_updated_at on public.streak_leaderboard;
create trigger streak_leaderboard_set_updated_at
before update on public.streak_leaderboard
for each row execute function public.streak_leaderboard_set_updated_at();

alter table public.streak_leaderboard enable row level security;

-- Public read — the whole point is showing the top users. The anon_username is
-- generated client-side and never tied to PII, so this is safe to leave open.
drop policy if exists "streak_leaderboard: read all" on public.streak_leaderboard;
create policy "streak_leaderboard: read all"
  on public.streak_leaderboard for select
  using (true);

drop policy if exists "streak_leaderboard: insert own" on public.streak_leaderboard;
create policy "streak_leaderboard: insert own"
  on public.streak_leaderboard for insert
  with check (auth.uid() = user_id);

drop policy if exists "streak_leaderboard: update own" on public.streak_leaderboard;
create policy "streak_leaderboard: update own"
  on public.streak_leaderboard for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "streak_leaderboard: delete own" on public.streak_leaderboard;
create policy "streak_leaderboard: delete own"
  on public.streak_leaderboard for delete
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- Auth settings you still need to check in the Supabase dashboard:
--   Authentication → Providers → Email: enable "Confirm email" if you want
--     e-mail verification. The app handles both confirmed and unconfirmed
--     sign-up flows.
--   Authentication → URL Configuration: set Site URL + Redirect URLs if
--     you plan to use password reset deep-links in production.
-- ──────────────────────────────────────────────────────────────────────────────
