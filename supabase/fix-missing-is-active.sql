-- ERROR 42703: column "is_active" does not exist 보정용
-- 기존 dolls 데이터는 삭제하지 않고 누락된 열만 추가합니다.

begin;

alter table public.dolls
  add column if not exists is_active boolean;

update public.dolls
set is_active = true
where is_active is null;

alter table public.dolls
  alter column is_active set default true,
  alter column is_active set not null;

commit;
