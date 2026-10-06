
create extension if not exists pgcrypto;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null,
 name text not null,
 sisi_id text not null unique,
 age int not null check(age>=18),
 gender text not null check(gender in ('Эрэгтэй','Эмэгтэй')),
 major text not null,
 course int not null check(course between 1 and 6),
 bio text default '',
 interests text[] default '{}',
 photo_paths text[] default '{}',
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 rank text not null default 'F' check(rank in ('F','D','C','B','A','S')),
 created_at timestamptz not null default now(),
 approved_at timestamptz
);
create table if not exists public.admins(user_id uuid primary key references auth.users(id) on delete cascade);

alter table public.profiles enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.admins where user_id=auth.uid());
$$;

drop policy if exists "insert own pending profile" on public.profiles;
create policy "insert own pending profile" on public.profiles for insert to authenticated with check(id=auth.uid() and status='pending');
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using(id=auth.uid());
drop policy if exists "approved users read approved profiles" on public.profiles;
create policy "approved users read approved profiles" on public.profiles for select to authenticated using(
 status='approved' and exists(select 1 from public.profiles me where me.id=auth.uid() and me.status='approved')
);
drop policy if exists "admins read profiles" on public.profiles;
create policy "admins read profiles" on public.profiles for select to authenticated using(public.is_admin());
drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles for update to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists "admin reads own admin row" on public.admins;
create policy "admin reads own admin row" on public.admins for select to authenticated using(user_id=auth.uid());

insert into storage.buckets(id,name,public) values('profile-photos','profile-photos',false) on conflict(id) do nothing;
drop policy if exists "upload own profile photos" on storage.objects;
create policy "upload own profile photos" on storage.objects for insert to authenticated with check(bucket_id='profile-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "read own profile photos" on storage.objects;
create policy "read own profile photos" on storage.objects for select to authenticated using(bucket_id='profile-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "approved users read photos" on storage.objects;
create policy "approved users read photos" on storage.objects for select to authenticated using(
 bucket_id='profile-photos' and exists(select 1 from public.profiles me where me.id=auth.uid() and me.status='approved')
);
drop policy if exists "admins read photos" on storage.objects;
create policy "admins read photos" on storage.objects for select to authenticated using(bucket_id='profile-photos' and public.is_admin());

-- Admin account-аа эхлээд app-аар Supabase Auth-д үүсгээд, UUID-г энд тавьж НЭГ УДАА ажиллуул:
-- insert into public.admins(user_id) values ('YOUR-ADMIN-AUTH-USER-UUID');
