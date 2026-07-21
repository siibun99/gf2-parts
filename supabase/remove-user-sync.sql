-- 이전 로그인 동기화 버전을 이미 설치한 경우에만 선택적으로 실행하세요.
-- 실행하면 Supabase에 저장되어 있던 이용자 개인 진행 데이터가 삭제됩니다.

do $$
begin
  if to_regclass('public.user_doll_settings') is not null then
    execute 'drop trigger if exists user_settings_set_updated_at on public.user_doll_settings';
  end if;
end
$$;

drop table if exists public.user_doll_settings;
