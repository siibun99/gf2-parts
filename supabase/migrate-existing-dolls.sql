-- 기존 GF2 dolls 테이블을 현재 로그인 없는 버전 구조로 보정합니다.
-- 기존 인형 행을 삭제하지 않습니다.

begin;

create extension if not exists pgcrypto;

-- 구버전 테이블이 없는 경우에도 실행할 수 있도록 기본 테이블을 생성합니다.
create table if not exists public.dolls (
  id uuid primary key default gen_random_uuid()
);

alter table public.dolls
  add column if not exists slug text,
  add column if not exists name text,
  add column if not exists weapon_type text,
  add column if not exists attribute text,
  add column if not exists default_note text,
  add column if not exists common_key text,
  add column if not exists common_key_effect text,
  add column if not exists image_url text,
  add column if not exists portrait_scale numeric(6,2),
  add column if not exists portrait_offset_x numeric(6,2),
  add column if not exists portrait_offset_y numeric(6,2),
  add column if not exists display_order integer,
  add column if not exists is_active boolean,
  add column if not exists recommended_sets text[],
  add column if not exists recommended_muzzle text[],
  add column if not exists recommended_parts text[],
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

alter table public.dolls drop constraint if exists dolls_portrait_scale_range;
alter table public.dolls drop constraint if exists dolls_portrait_offset_x_range;
alter table public.dolls drop constraint if exists dolls_portrait_offset_y_range;

-- v12는 portrait_scale을 0.60~1.60 배율로 저장했습니다.
-- 열 기본값이 아직 250이 아닐 때만 v13 퍼센트 방식으로 변환합니다.
do $$
declare
  current_default text;
begin
  select column_default
    into current_default
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'dolls'
    and column_name = 'portrait_scale';

  if current_default is null or current_default not like '%250%' then
    update public.dolls
    set
      portrait_scale = round((coalesce(portrait_scale, 1.00) * 350 - 100)::numeric, 2),
      portrait_offset_x = coalesce(portrait_offset_x, 0),
      portrait_offset_y = coalesce(portrait_offset_y, 0) - 7;
  end if;
end
$$;

-- 기존 행의 비어 있는 값을 안전한 임시값으로 채웁니다.
-- seed.sql을 실행하면 현재 인형 데이터로 다시 갱신됩니다.
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
  portrait_scale = coalesce(portrait_scale, 250),
  portrait_offset_x = coalesce(portrait_offset_x, 0),
  portrait_offset_y = coalesce(portrait_offset_y, -7),
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
  alter column portrait_scale set default 250,
  alter column portrait_scale set not null,
  alter column portrait_offset_x set default 0,
  alter column portrait_offset_x set not null,
  alter column portrait_offset_y set default -7,
  alter column portrait_offset_y set not null,
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

alter table public.dolls drop constraint if exists dolls_portrait_scale_range;
alter table public.dolls add constraint dolls_portrait_scale_range check (portrait_scale between -40 and 500);
alter table public.dolls drop constraint if exists dolls_portrait_offset_x_range;
alter table public.dolls add constraint dolls_portrait_offset_x_range check (portrait_offset_x between -50 and 50);
alter table public.dolls drop constraint if exists dolls_portrait_offset_y_range;
alter table public.dolls add constraint dolls_portrait_offset_y_range check (portrait_offset_y between -50 and 50);

-- 현재 앱이 요구하는 고유 식별 조건입니다.
create unique index if not exists dolls_slug_unique_idx on public.dolls (slug);
create unique index if not exists dolls_name_unique_idx on public.dolls (name);

commit;
