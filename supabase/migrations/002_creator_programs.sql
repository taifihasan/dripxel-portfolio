-- DRIPXEL Studio upgrade: creator program management.
-- Additive migration. Safe to run after 001_initial_schema.sql.
-- Does not modify existing projects, homepage content, owner identity or messages.

create table if not exists public.creator_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 180),
  organization text not null default '',
  role text not null default 'Creator',
  description text not null default '',
  image_url text,
  program_url text not null default '',
  status text not null default 'Active',
  start_date text not null default '',
  end_date text not null default '',
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 99,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_programs_public_order_idx
  on public.creator_programs (published, sort_order);

alter table public.creator_programs enable row level security;

drop policy if exists "Public reads published creator programs"
  on public.creator_programs;
create policy "Public reads published creator programs"
  on public.creator_programs
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Owner manages creator programs"
  on public.creator_programs;
create policy "Owner manages creator programs"
  on public.creator_programs
  for all
  to authenticated
  using (public.is_studio_owner())
  with check (public.is_studio_owner());

grant select on public.creator_programs to anon, authenticated;
grant insert, update, delete on public.creator_programs to authenticated;
