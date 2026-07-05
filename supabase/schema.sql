-- 「今天玩什么」MVP schema
-- 在 Supabase 控制台 -> SQL Editor 中粘贴执行。
-- 前置条件：Authentication -> Providers -> Anonymous Sign-Ins 需要开启。

create extension if not exists pgcrypto;

-- ========== ideas 念头 / 种草 ==========
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text text not null,
  tag text check (tag in ('learn', 'go', 'do', 'eat')),
  status text not null default 'want' check (status in ('want', 'tried')),
  plays_count integer not null default 0,
  growth_stage text not null default 'seed' check (growth_stage in ('seed', 'sprout', 'tree')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ideas_user_id_idx on public.ideas (user_id);

-- ========== activities 一次「试试看」的体验会话 ==========
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  action_text text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists activities_user_id_idx on public.activities (user_id);
create index if not exists activities_idea_id_idx on public.activities (idea_id);

-- ========== reflections 做完留一句 + 留给今天 ==========
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete set null,
  idea_id uuid references public.ideas(id) on delete set null,
  type text not null default 'activity' check (type in ('activity', 'evening')),
  text text,
  mood text,
  answers jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reflections_user_id_idx on public.reflections (user_id);

-- ========== updated_at 自动更新 ==========
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ideas_set_updated_at on public.ideas;
create trigger ideas_set_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();

-- ========== RLS：每个人只能看到/修改自己的数据 ==========
alter table public.ideas enable row level security;
alter table public.activities enable row level security;
alter table public.reflections enable row level security;

drop policy if exists "ideas: owner all" on public.ideas;
create policy "ideas: owner all" on public.ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "activities: owner all" on public.activities;
create policy "activities: owner all" on public.activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reflections: owner all" on public.reflections;
create policy "reflections: owner all" on public.reflections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
