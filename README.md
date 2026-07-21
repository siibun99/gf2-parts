# 소녀전선2 장비 파밍 도우미

Cloudflare Pages에 배포하고 Supabase를 **공용 인형 DB와 이미지 저장소**로 사용하는 정적 웹앱입니다.
Google Apps Script와 Google Sheets는 배포 후 필요하지 않습니다.

일반 이용자는 로그인하지 않습니다. 파밍 상태, 개인 옵션, 완료 체크, 개인 비고는 이용자의 브라우저 `localStorage`에만 저장됩니다. Supabase Auth는 `/admin.html` 관리자 인증에만 사용합니다.

## 저장 구조

| 데이터 | 저장 위치 | 설명 |
|---|---|---|
| 인형 이름·속성·추천 옵션·공용키 | Supabase `dolls` | 누구나 읽을 수 있고 관리자만 수정 |
| 신규 인형 일러스트 | Supabase Storage | 관리자만 업로드·수정·삭제 |
| 초기 인형 일러스트 | 비어 있음 | 관리자 페이지에서 나중에 직접 업로드 |
| 파밍 상태·개인 비고·개인 옵션 | 이용자 브라우저 | 로그인 없이 `localStorage`에 저장 |
| 관리자 계정 | Supabase Auth + `app_admins` | `/admin.html`에서만 사용 |

## 포함된 기능

- 로그인 없이 즉시 이용
- 장비파밍 현황과 무기파츠 표의 분리된 탭·스크롤 영역
- 인형 이미지, 무기·속성 필터, 검색
- 파밍 대상 / 미보유 / 파밍 완료 상태
- 미완료만, 파밍 완료만, 미보유 숨기기
- 세트 다중 선택, 총구 최대 4개, 파츠별 최대 3개
- 총구·파츠 1·2·3 완료 체크
- 개인 비고
- 개인 수정값을 반영한 무기파츠 표
- JSON 백업 내보내기·가져오기
- 관리자 페이지에서 인형·추천 옵션·일러스트 추가 및 수정

> 개인 데이터는 기기나 브라우저 사이에 자동 동기화되지 않습니다. 브라우저 데이터 삭제에 대비해 `백업 내보내기`를 사용하는 것을 권장합니다.

## 폴더 구성

```text
index.html                         로그인 없는 일반 이용자 화면
admin.html                         관리자 화면
admin.js                           관리자 로그인·DB·이미지 관리
config.js                          Supabase 공개 설정
assets/dolls/                      빈 폴더 유지용 `.gitkeep`
supabase/schema.sql                공용 DB, 관리자 RLS, Storage 정책
supabase/seed.sql                  현재 인형 초기 데이터
supabase/promote-admin.sql         관리자 지정 예시
supabase/fix-missing-is-active.sql 구버전 DB의 is_active 누락 오류 보정
supabase/clear-bundled-images.sql  기존 잘못된 정적 이미지 경로 제거
supabase/remove-user-sync.sql      이전 개인 동기화 테이블 제거용(선택)
```

# 1. Supabase 프로젝트 만들기

1. Supabase Dashboard에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다.
3. 이어서 `supabase/seed.sql` 전체를 실행합니다.
4. Project Settings → API Keys에서 다음 값을 확인합니다.
   - Project URL
   - Publishable key (`sb_publishable_...`) 또는 legacy anon key
5. `config.js`에 값을 입력합니다.

```js
window.GF2_CONFIG = {
  supabaseUrl: 'https://프로젝트참조.supabase.co',
  supabasePublishableKey: 'sb_publishable_...'
};
```

`config.js`에는 공개용 Publishable key만 넣습니다. Secret key나 service-role key는 브라우저 코드에 넣지 마세요.

## 이전 로그인 동기화 스키마를 설치한 경우

기존 버전의 `user_doll_settings` 테이블을 이미 만들었다면 새 사용자 화면에서는 더 이상 사용하지 않습니다. 그대로 두어도 사이트 동작에는 문제가 없습니다.

완전히 삭제하려면 데이터가 필요 없는지 확인한 뒤 다음 파일을 실행합니다.

```text
supabase/remove-user-sync.sql
```

이 스크립트를 실행하면 Supabase에 저장되어 있던 이용자 개인 진행 데이터가 삭제됩니다.


## `column "is_active" does not exist` 오류가 나타나는 경우

이 오류는 이전 버전에서 만든 `dolls` 테이블이 이미 존재할 때 발생합니다. `CREATE TABLE IF NOT EXISTS`는 기존 테이블에 새 열을 자동으로 추가하지 않습니다.

1. SQL Editor에서 `supabase/fix-missing-is-active.sql`을 먼저 실행합니다.
2. 성공 메시지를 확인합니다.
3. `supabase/schema.sql` 전체를 다시 실행합니다.
4. 이어서 `supabase/seed.sql`을 실행합니다.

보정 SQL은 기존 인형 데이터를 삭제하지 않고 `is_active` 열만 추가하며, 기존 행은 모두 활성 상태로 설정합니다.

# 2. 로컬에서 확인하기

파일을 직접 더블클릭하지 말고 프로젝트 폴더에서 웹 서버를 실행합니다.

```bash
python -m http.server 8080
```

일반 이용자 화면:

```text
http://localhost:8080/
```

관리자 화면:

```text
http://localhost:8080/admin.html
```

# 3. 관리자 계정 지정하기

일반 이용자는 로그인하지 않지만 관리자는 Supabase Magic Link로 로그인합니다.

1. `/admin.html`을 엽니다.
2. `이메일 로그인`을 눌러 본인 이메일로 한 번 로그인합니다.
3. `supabase/promote-admin.sql`의 이메일을 본인 이메일로 변경합니다.
4. Supabase SQL Editor에서 실행합니다.
5. `/admin.html`을 새로고침합니다.

```sql
insert into public.app_admins (user_id)
select id
from auth.users
where email = '본인이메일@example.com'
on conflict (user_id) do nothing;
```

Supabase → Authentication → URL Configuration에 관리자 로그인 복귀 주소를 추가합니다.

```text
http://localhost:8080/**
https://프로젝트명.pages.dev/**
```

커스텀 도메인을 연결하면 해당 도메인도 Redirect URLs에 추가합니다.

# 4. 일러스트 저장 방식

초기 인형 데이터의 일러스트는 모두 빈 상태입니다. 잘못 연결된 기존 정적 이미지는 프로젝트에 포함하지 않습니다.

이미 `seed.sql`을 실행하여 예전 이미지 경로가 DB에 들어간 경우 SQL Editor에서 다음 파일을 한 번 실행합니다.

```text
supabase/clear-bundled-images.sql
```

이 SQL은 `assets/dolls/...` 형식의 기존 경로만 비우므로, 관리자 페이지에서 나중에 직접 올린 Supabase Storage 이미지는 유지합니다.

새 일러스트 등록 방법:

1. `/admin.html`에서 관리자 로그인
2. 인형 목록에서 `수정`
3. `인형 일러스트` 파일 선택
4. `저장`

- 권장 형식: WebP 또는 JPEG
- 업로드 제한: 5MB
- 잘못 올린 이미지는 `현재 일러스트 제거`를 선택하고 저장

## 화면 표시 설정

- 상단 `밝은 화면` / `어두운 화면` 버튼으로 테마를 전환합니다.
- 선택한 테마는 브라우저에 저장되며 사용자 화면과 관리자 화면에 함께 적용됩니다.
- 인형 목록은 `표시 순서`가 큰 값부터 표시됩니다. 신규 인형은 기존 최댓값보다 큰 순서를 입력하면 맨 위에 나타납니다.

# 5. Cloudflare Pages 배포

## GitHub 연동 방식

프로젝트 폴더에서:

```bash
git init
git add .
git commit -m "Initial GF2 site"
git branch -M main
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

Cloudflare Dashboard에서:

1. Workers & Pages → Create application
2. Pages → Import an existing Git repository
3. 저장소 선택
4. Framework preset: `None`
5. Production branch: `main`
6. Build command: `exit 0`
7. Build output directory: `.`
8. Save and Deploy

배포 후 다음과 같은 주소가 생성됩니다.

```text
https://프로젝트명.pages.dev
```

# 6. 기존 Apps Script 개인 데이터 이전

도메인이 달라지므로 기존 Apps Script의 `localStorage`는 새 사이트로 자동 이동하지 않습니다.

1. 기존 Apps Script 사이트에서 `백업 내보내기`
2. 새 Cloudflare 사이트에서 `백업 가져오기`
3. 새 사이트 브라우저의 로컬 저장소에 저장

새 사이트에서 백업을 가져온 뒤 다시 `백업 내보내기`를 해두면 안전합니다.

# 7. 새 인형 업데이트

앞으로 Google Sheets를 수정하거나 사용자 화면을 다시 배포하지 않아도 됩니다.

1. `/admin.html`에서 관리자 로그인
2. 새 인형 이름, 무기, 속성, 추천 옵션 입력
3. 일러스트 선택
4. 저장

일반 이용자는 사이트를 새로고침하면 새 인형을 확인할 수 있습니다. 새 인형의 개인 설정은 해당 브라우저에서 처음 사용할 때 생성됩니다.

## 기존 인형 이름 변경 주의

현재 개인 진행 데이터는 브라우저에서 인형 이름을 키로 저장합니다. 관리자 화면에서 기존 인형 이름을 바꾸면 이용자의 기존 개인 설정과 연결되지 않을 수 있습니다.

운영 중 이름 변경이 필요하다면 이름은 유지하고 표시용 별도 필드를 추가하는 방식이 안전합니다.

# 보안 구조

- `dolls`: 비로그인 이용자도 활성 인형을 읽을 수 있음
- `dolls` 추가·수정·삭제: `app_admins`에 등록된 관리자만 가능
- `app_admins`: 로그인한 사용자가 자신의 관리자 등록 여부만 읽을 수 있음
- `doll-images`: 누구나 읽을 수 있고 관리자만 업로드·수정·삭제
- 일반 이용자 개인 데이터: Supabase로 전송하지 않고 브라우저에만 저장
- 브라우저에는 공개용 Publishable key만 사용

## `slug` 또는 기타 열이 없다는 오류가 날 때

구버전의 `dolls` 테이블이 이미 존재하면 `CREATE TABLE IF NOT EXISTS`만으로 새 열이 추가되지 않습니다. 다음 순서로 실행하세요.

1. `supabase/migrate-existing-dolls.sql` 전체 실행
2. `supabase/schema.sql` 전체 재실행
3. `supabase/seed.sql` 전체 실행

마이그레이션 SQL은 기존 인형 행을 삭제하지 않고 `slug`, 추천 옵션 배열, 이미지 주소, 표시 순서 등 현재 앱에 필요한 열을 추가합니다.
