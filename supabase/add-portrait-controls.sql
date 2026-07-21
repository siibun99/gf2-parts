-- 인형별 일러스트 위치/크기 프리셋 열을 추가하거나 v12 값을 v13 방식으로 변환합니다.
-- v13 기준: 좌우 0, 상하 0, 크기 0 = 원본 전체 보기
-- 기본 확대 프리셋: 좌우 0, 상하 -7, 크기 250 (= 3.5배)
-- 기존 인형 데이터와 이미지 주소는 유지됩니다.

begin;

alter table public.dolls
  add column if not exists portrait_scale numeric(6,2),
  add column if not exists portrait_offset_x numeric(6,2),
  add column if not exists portrait_offset_y numeric(6,2);

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

update public.dolls
set
  portrait_scale = coalesce(portrait_scale, 250),
  portrait_offset_x = coalesce(portrait_offset_x, 0),
  portrait_offset_y = coalesce(portrait_offset_y, -7);

alter table public.dolls
  alter column portrait_scale set default 250,
  alter column portrait_scale set not null,
  alter column portrait_offset_x set default 0,
  alter column portrait_offset_x set not null,
  alter column portrait_offset_y set default -7,
  alter column portrait_offset_y set not null;

alter table public.dolls drop constraint if exists dolls_portrait_scale_range;
alter table public.dolls add constraint dolls_portrait_scale_range
  check (portrait_scale between -40 and 500);

alter table public.dolls drop constraint if exists dolls_portrait_offset_x_range;
alter table public.dolls add constraint dolls_portrait_offset_x_range
  check (portrait_offset_x between -50 and 50);

alter table public.dolls drop constraint if exists dolls_portrait_offset_y_range;
alter table public.dolls add constraint dolls_portrait_offset_y_range
  check (portrait_offset_y between -50 and 50);

commit;
