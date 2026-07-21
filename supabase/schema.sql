-- GF2 장비 파밍 도우미 / 로그인 없는 사용자 화면용 Supabase 스키마
-- 일반 이용자는 공용 인형 데이터만 읽고, 개인 진행 상황은 브라우저 localStorage에 저장합니다.
-- Supabase Auth는 /admin.html 관리자 인증에만 사용합니다.

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
  display_order integer not null default 0,
  is_active boolean not null default true,
  recommended_sets text[] not null default '{}',
  recommended_muzzle text[] not null default '{}',
  recommended_parts text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 이전 버전에서 dolls 테이블을 이미 만든 경우 누락된 열을 모두 보정합니다.
-- CREATE TABLE IF NOT EXISTS는 기존 테이블에 새 열을 추가하지 않기 때문에 필요합니다.
alter table public.dolls
  add column if not exists slug text,
  add column if not exists name text,
  add column if not exists weapon_type text,
  add column if not exists attribute text,
  add column if not exists default_note text,
  add column if not exists common_key text,
  add column if not exists common_key_effect text,
  add column if not exists image_url text,
  add column if not exists display_order integer,
  add column if not exists is_active boolean,
  add column if not exists recommended_sets text[],
  add column if not exists recommended_muzzle text[],
  add column if not exists recommended_parts text[],
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

update public.dolls
set
  slug = coalesce(nullif(btrim(slug), ''), 'legacy-' || substr(md5(id::text), 1, 12)),
  name = coalesce(nullif(btrim(name), ''), '이름없음-' || substr(id::text, 1, 8)),
  weapon_type = coalesce(weapon_type, ''),
  attribute = coalesce(attribute, ''),
  default_note = coalesce(default_note, ''),
  common_key = coalesce(common_key, ''),
  common_key_effect = coalesce(common_key_effect, ''),
  image_url = coalesce(image_url, ''),
  display_order = coalesce(display_order, 0),
  is_active = coalesce(is_active, true),
  recommended_sets = coalesce(recommended_sets, '{}'::text[]),
  recommended_muzzle = coalesce(recommended_muzzle, '{}'::text[]),
  recommended_parts = coalesce(recommended_parts, '{}'::text[]),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

alter table public.dolls
  alter column id set default gen_random_uuid(),
  alter column slug set not null,
  alter column name set not null,
  alter column weapon_type set default '',
  alter column weapon_type set not null,
  alter column attribute set default '',
  alter column attribute set not null,
  alter column default_note set default '',
  alter column default_note set not null,
  alter column common_key set default '',
  alter column common_key set not null,
  alter column common_key_effect set default '',
  alter column common_key_effect set not null,
  alter column image_url set default '',
  alter column image_url set not null,
  alter column display_order set default 0,
  alter column display_order set not null,
  alter column is_active set default true,
  alter column is_active set not null,
  alter column recommended_sets set default '{}'::text[],
  alter column recommended_sets set not null,
  alter column recommended_muzzle set default '{}'::text[],
  alter column recommended_muzzle set not null,
  alter column recommended_parts set default '{}'::text[],
  alter column recommended_parts set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

create unique index if not exists dolls_slug_unique_idx on public.dolls (slug);
create unique index if not exists dolls_name_unique_idx on public.dolls (name);

-- 관리자 계정 목록. 일반 이용자 계정은 만들지 않습니다.
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists dolls_set_updated_at on public.dolls;
create trigger dolls_set_updated_at
before update on public.dolls
for each row execute function public.set_updated_at();

alter table public.dolls enable row level security;
alter table public.app_admins enable row level security;

-- 정책은 스크립트를 다시 실행해도 안전하도록 먼저 제거합니다.
drop policy if exists "dolls public read" on public.dolls;
drop policy if exists "admins insert dolls" on public.dolls;
drop policy if exists "admins update dolls" on public.dolls;
drop policy if exists "admins delete dolls" on public.dolls;
drop policy if exists "admins read own membership" on public.app_admins;

-- 일반 이용자는 활성화된 인형만 읽을 수 있습니다.
-- 관리자는 비활성 인형까지 관리자 페이지에서 확인할 수 있습니다.
create policy "dolls public read"
on public.dolls
for select
to anon, authenticated
using (
  is_active = true
  or exists (
    select 1
    from public.app_admins a
    where a.user_id = (select auth.uid())
  )
);

-- 공용 인형 데이터는 관리자만 추가·수정·삭제할 수 있습니다.
create policy "admins insert dolls"
on public.dolls
for insert
to authenticated
with check (
  exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))
);

create policy "admins update dolls"
on public.dolls
for update
to authenticated
using (
  exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))
);

create policy "admins delete dolls"
on public.dolls
for delete
to authenticated
using (
  exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))
);

-- 로그인한 사용자는 자신이 관리자 목록에 있는지만 조회할 수 있습니다.
create policy "admins read own membership"
on public.app_admins
for select
to authenticated
using ((select auth.uid()) = user_id);

grant select on public.dolls to anon, authenticated;
grant insert, update, delete on public.dolls to authenticated;
grant select on public.app_admins to authenticated;

-- 인형 일러스트 저장소
insert into storage.buckets (id, name, public)
values ('doll-images', 'doll-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read doll images" on storage.objects;
drop policy if exists "admins upload doll images" on storage.objects;
drop policy if exists "admins update doll images" on storage.objects;
drop policy if exists "admins delete doll images" on storage.objects;

create policy "public read doll images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'doll-images');

create policy "admins upload doll images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'doll-images'
  and exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))
);

create policy "admins update doll images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'doll-images'
  and exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))
)
with check (
  bucket_id = 'doll-images'
  and exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))
);

create policy "admins delete doll images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'doll-images'
  and exists (select 1 from public.app_admins a where a.user_id = (select auth.uid()))
);
