-- DRIPXEL portfolio database and storage baseline.
-- Apply only to a new Supabase project owned by Dripxel.
create extension if not exists pgcrypto;

create table if not exists public.studio_owners(
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table if not exists public.site_content(
 key text primary key,
 value jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
create table if not exists public.projects(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 slug text not null unique,
 category text not null default 'Other',
 summary text not null default '',
 description text not null default '',
 year text not null default '',
 cover_url text,
 video_url text,
 gallery_urls jsonb not null default '[]'::jsonb,
 published boolean not null default false,
 featured boolean not null default false,
 sort_order integer not null default 99,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.contact_messages(
 id uuid primary key default gen_random_uuid(),
 name text not null check(char_length(name) between 1 and 120),
 email text not null check(char_length(email) between 3 and 254),
 project_type text not null default 'General enquiry',
 message text not null check(char_length(message) between 1 and 5000),
 read boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists projects_public_order_idx on public.projects(published,sort_order);
create index if not exists contact_messages_created_idx on public.contact_messages(created_at desc);

alter table public.studio_owners enable row level security;
alter table public.site_content enable row level security;
alter table public.projects enable row level security;
alter table public.contact_messages enable row level security;

create or replace function public.is_studio_owner()
returns boolean language sql stable security definer set search_path=''
as $$
 select exists(select 1 from public.studio_owners where user_id=(select auth.uid()));
$$;
revoke all on function public.is_studio_owner() from public;
grant execute on function public.is_studio_owner() to anon,authenticated;

create policy "Owner reads own studio identity" on public.studio_owners
 for select to authenticated using(user_id=(select auth.uid()));

create policy "Public reads homepage" on public.site_content
 for select to anon,authenticated using(key='homepage');
create policy "Owner manages homepage" on public.site_content
 for all to authenticated using(public.is_studio_owner()) with check(public.is_studio_owner());

create policy "Public reads published projects" on public.projects
 for select to anon,authenticated using(published=true);
create policy "Owner reads all projects" on public.projects
 for select to authenticated using(public.is_studio_owner());
create policy "Owner creates projects" on public.projects
 for insert to authenticated with check(public.is_studio_owner());
create policy "Owner updates projects" on public.projects
 for update to authenticated using(public.is_studio_owner()) with check(public.is_studio_owner());
create policy "Owner deletes projects" on public.projects
 for delete to authenticated using(public.is_studio_owner());

create policy "Public can submit contact messages" on public.contact_messages
 for insert to anon,authenticated with check(
  char_length(name) between 1 and 120 and char_length(email) between 3 and 254
  and char_length(message) between 1 and 5000
);
create policy "Owner reads messages" on public.contact_messages
 for select to authenticated using(public.is_studio_owner());
create policy "Owner updates messages" on public.contact_messages
 for update to authenticated using(public.is_studio_owner()) with check(public.is_studio_owner());
create policy "Owner deletes messages" on public.contact_messages
 for delete to authenticated using(public.is_studio_owner());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('media','media',true,524288000,array['image/jpeg','image/png','image/webp','image/svg+xml','video/mp4','video/webm'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "Public can view portfolio media" on storage.objects
 for select to anon,authenticated using(bucket_id='media');
create policy "Owner uploads portfolio media" on storage.objects
 for insert to authenticated with check(bucket_id='media' and public.is_studio_owner());
create policy "Owner updates portfolio media" on storage.objects
 for update to authenticated using(bucket_id='media' and public.is_studio_owner())
 with check(bucket_id='media' and public.is_studio_owner());
create policy "Owner deletes portfolio media" on storage.objects
 for delete to authenticated using(bucket_id='media' and public.is_studio_owner());

insert into public.site_content(key,value) values('homepage',
'{"heroEyebrow":"INDEPENDENT AI CREATOR / VISUAL STORYTELLER","heroTitle":"IMAGINATION,\\nWITHOUT LIMITS.","heroDescription":"I turn unconventional ideas into visual experiences through AI, motion and creative experimentation.","aboutTitle":"NOT JUST CREATING IMAGES. CREATING EXPERIENCES.","aboutBody":"I am Dripxel, an independent AI creator exploring the boundaries between imagination, artificial intelligence and visual storytelling.","contactTitle":"HAVE AN IDEA?\\nLET''S MAKE IT REAL.","contactDescription":"Have a creative project, an unusual concept or an idea worth exploring? Let''s create something distinctive.","contactEmail":"","xUrl":"","instagramUrl":"","youtubeUrl":""}'::jsonb)
on conflict(key) do nothing;
