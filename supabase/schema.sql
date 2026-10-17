-- ҰБТ math-literacy store.
-- Run this in the Supabase SQL editor for a new project.
-- Points (also implemented in src/services/points.ts):
--   each correct answer = 10 + floor(seconds_left / 30), max 20.
--   a wrong answer or a timeout = 0.
-- Time spent on a question = 300 - seconds_left.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 24),
  avatar_color text not null default '#8d6a2e',
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  section_id text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0),
  percent integer not null check (percent between 0 and 100),
  points integer not null check (points >= 0),
  time_spent_seconds integer not null check (time_spent_seconds >= 0),
  created_at timestamptz not null default now()
);

create index if not exists attempts_profile_finished_idx
  on public.attempts (profile_id, finished_at desc);

create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  question_id text not null,
  selected_index integer check (selected_index between 0 and 3),
  timed_out boolean not null default false,
  seconds_left integer not null check (seconds_left between 0 and 300),
  points integer not null check (points >= 0),
  position integer not null check (position >= 0),
  unique (attempt_id, position)
);

create table if not exists public.favorites (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, question_id)
);

create or replace view public.section_progress
with (security_invoker = true) as
select
  profile_id,
  section_id,
  count(*)::integer as attempts,
  max(percent)::integer as best_percent,
  max(points)::integer as best_points,
  (array_agg(percent order by finished_at desc))[1]::integer as last_percent,
  sum(correct)::integer as total_correct,
  sum(total)::integer as total_questions,
  sum(points)::integer as total_points,
  sum(time_spent_seconds)::integer as total_time_seconds
from public.attempts
group by profile_id, section_id;

create or replace function public.leaderboard_rows()
returns table (
  profile_id uuid,
  nickname text,
  avatar_color text,
  points integer,
  time_spent_seconds integer,
  solved integer
)
language sql
stable
security invoker
as $$
  select
    p.id,
    p.nickname,
    p.avatar_color,
    coalesce(sum(a.points), 0)::integer,
    coalesce(sum(a.time_spent_seconds), 0)::integer,
    coalesce(sum(a.correct), 0)::integer
  from public.profiles p
  left join public.attempts a on a.profile_id = p.id
  group by p.id, p.nickname, p.avatar_color;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen text;
begin
  chosen := coalesce(
    nullif(trim(new.raw_user_meta_data->>'nickname'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Student'
  );
  if char_length(chosen) < 2 then
    chosen := 'Student';
  end if;
  insert into public.profiles (id, nickname, avatar_color)
  values (
    new.id,
    left(chosen, 24),
    coalesce(nullif(new.raw_user_meta_data->>'avatar_color', ''), '#8d6a2e')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.favorites enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select to anon, authenticated
  using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists attempts_read on public.attempts;
create policy attempts_read on public.attempts
  for select to anon, authenticated
  using (true);

drop policy if exists attempts_insert_own on public.attempts;
create policy attempts_insert_own on public.attempts
  for insert to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists answers_read_own on public.attempt_answers;
create policy answers_read_own on public.attempt_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.attempts
      where attempts.id = attempt_answers.attempt_id
        and attempts.profile_id = auth.uid()
    )
  );

drop policy if exists answers_insert_own on public.attempt_answers;
create policy answers_insert_own on public.attempt_answers
  for insert to authenticated
  with check (
    exists (
      select 1 from public.attempts
      where attempts.id = attempt_answers.attempt_id
        and attempts.profile_id = auth.uid()
    )
  );

drop policy if exists favorites_own_read on public.favorites;
create policy favorites_own_read on public.favorites
  for select to authenticated
  using (auth.uid() = profile_id);

drop policy if exists favorites_own_insert on public.favorites;
create policy favorites_own_insert on public.favorites
  for insert to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists favorites_own_delete on public.favorites;
create policy favorites_own_delete on public.favorites
  for delete to authenticated
  using (auth.uid() = profile_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select on public.attempts to anon, authenticated;
grant insert on public.attempts to authenticated;
grant select, insert on public.attempt_answers to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select on public.section_progress to anon, authenticated;
grant execute on function public.leaderboard_rows() to anon, authenticated;
