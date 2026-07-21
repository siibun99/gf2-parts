-- 기존 패키지에서 잘못 연결된 정적 일러스트 경로만 비웁니다.
-- 관리자 페이지에서 나중에 업로드한 Supabase Storage URL은 삭제하지 않습니다.

begin;

update public.dolls
set image_url = ''
where image_url like 'assets/dolls/%'
   or image_url like '/assets/dolls/%';

commit;
