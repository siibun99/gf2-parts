-- GF2 장비 파밍 도우미 / Supabase 초기 스키마
create extension if not exists pgcrypto;

create table if not exists public.dolls (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  weapon_type text not null,
  attribute text not null default '',
  default_note text not null default '',
  common_key text not null default '',
  common_key_effect text not null default '',
  image_url text not null default '',
  portrait_scale numeric(6,2) not null default 250 check (portrait_scale between -40 and 500),
  portrait_offset_x numeric(6,2) not null default 0 check (portrait_offset_x between -50 and 50),
  portrait_offset_y numeric(6,2) not null default -7 check (portrait_offset_y between -50 and 50),
  display_order integer not null default 0,
  is_active boolean not null default true,
  recommended_sets text[] not null default '{}',
  recommended_muzzle text[] not null default '{}',
  recommended_parts text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_doll_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  doll_id uuid not null references public.dolls(id) on delete cascade,
  status text not null default 'normal' check (status in ('normal','farming','unowned','complete')),
  personal_note text not null default '',
  note_initialized boolean not null default false,
  set_options text[] not null default '{}',
  muzzle_options text[] not null default '{}',
  part1_options text[] not null default '{}',
  part2_options text[] not null default '{}',
  part3_options text[] not null default '{}',
  muzzle_complete boolean not null default false,
  part1_complete boolean not null default false,
  part2_complete boolean not null default false,
  part3_complete boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, doll_id)
);

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists dolls_set_updated_at on public.dolls;
create trigger dolls_set_updated_at before update on public.dolls
for each row execute function public.set_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_doll_settings;
create trigger user_settings_set_updated_at before update on public.user_doll_settings
for each row execute function public.set_updated_at();

alter table public.dolls enable row level security;
alter table public.user_doll_settings enable row level security;
alter table public.app_admins enable row level security;

-- 정책은 스크립트를 다시 실행해도 안전하도록 먼저 제거합니다.
drop policy if exists "dolls public read" on public.dolls;
drop policy if exists "admins insert dolls" on public.dolls;
drop policy if exists "admins update dolls" on public.dolls;
drop policy if exists "admins delete dolls" on public.dolls;
drop policy if exists "users read own settings" on public.user_doll_settings;
drop policy if exists "users insert own settings" on public.user_doll_settings;
drop policy if exists "users update own settings" on public.user_doll_settings;
drop policy if exists "users delete own settings" on public.user_doll_settings;
drop policy if exists "admins read own membership" on public.app_admins;

-- 공용 인형 데이터는 누구나 조회 가능
create policy "dolls public read" on public.dolls for select to anon, authenticated using (is_active = true or exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())));

-- 관리자만 공용 데이터를 수정
create policy "admins insert dolls" on public.dolls for insert to authenticated with check (exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())));
create policy "admins update dolls" on public.dolls for update to authenticated using (exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())));
create policy "admins delete dolls" on public.dolls for delete to authenticated using (exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())));

-- 이용자는 자기 진행 상황만 읽고/쓰기
create policy "users read own settings" on public.user_doll_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own settings" on public.user_doll_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own settings" on public.user_doll_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users delete own settings" on public.user_doll_settings for delete to authenticated using ((select auth.uid()) = user_id);

-- 로그인한 사용자는 자신이 관리자인지만 조회 가능
create policy "admins read own membership" on public.app_admins for select to authenticated using ((select auth.uid()) = user_id);

grant select on public.dolls to anon, authenticated;
grant insert, update, delete on public.dolls to authenticated;
grant select, insert, update, delete on public.user_doll_settings to authenticated;
grant select on public.app_admins to authenticated;

-- 일러스트 저장소. 이미 존재하면 Dashboard에서 public bucket으로 만들어도 됨.
insert into storage.buckets (id, name, public)
values ('doll-images', 'doll-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read doll images" on storage.objects;
drop policy if exists "admins upload doll images" on storage.objects;
drop policy if exists "admins update doll images" on storage.objects;
drop policy if exists "admins delete doll images" on storage.objects;

create policy "public read doll images" on storage.objects for select to anon, authenticated using (bucket_id = 'doll-images');
create policy "admins upload doll images" on storage.objects for insert to authenticated with check (bucket_id = 'doll-images' and exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())));
create policy "admins update doll images" on storage.objects for update to authenticated using (bucket_id = 'doll-images' and exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))) with check (bucket_id = 'doll-images' and exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())));
create policy "admins delete doll images" on storage.objects for delete to authenticated using (bucket_id = 'doll-images' and exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())));
