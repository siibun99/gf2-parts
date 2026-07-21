-- /admin.html에서 본인 이메일로 한 번 로그인한 뒤 이메일을 수정하여 실행하세요.
insert into public.app_admins (user_id)
select id
from auth.users
where email = 'your-email@example.com'
on conflict (user_id) do nothing;
