# 소녀전선2 장비 파밍 도우미

소녀전선2 인형별 장비 파밍 상태와 개인 파츠 구성을 정리하는 정적 웹앱입니다.

- 배포: **Cloudflare Pages**
- 공용 인형 DB·관리자 인증·일러스트: **Supabase**
- 일반 이용자의 진행 데이터: 브라우저 **localStorage**
- 운영 사이트: `https://gf2-parts.pages.dev`
- 관리자 화면: `/admin.html`

일반 이용자는 로그인하지 않습니다. 파밍 상태, 개인 옵션, 완료 체크, 개인 비고는 해당 브라우저에만 저장되며 Supabase로 전송되지 않습니다.

## 주요 기능

### 일반 화면

- 밝은 화면·어두운 화면 전환
- 장비파밍 현황 / 무기파츠 표
- 인형 이름·공용키·세트 옵션 검색
- 무기·속성·진행 상태 필터
- 파밍 대상 / 미보유 / 파밍 완료 상태
- 세트, 총구, 파츠 1·2·3 개인 구성
- 총구·파츠별 완료 체크
- 개인 비고
- JSON 백업 내보내기·가져오기
- 인형별 일러스트 위치·확대값 반영
- 반응형 데스크톱·모바일 UI

### 관리자 화면

- Supabase Magic Link 로그인
- 인형 검색 및 카드 클릭 편집
- 신규 인형 번호·표시 순서 자동 생성
- 인형 번호 직접 수정 가능
- 인형 활성·비활성 및 공용 정보 관리
- 일러스트 업로드·교체·삭제
- 일러스트 상하좌우 이동·확대·축소
- 미리보기에서 마우스 드래그로 위치 조절
- 관리자 목록 썸네일에 저장된 일러스트 보정값 적용
- 인형 선택 시 목록 스크롤 위치 유지

## 데이터 저장 구조

| 데이터 | 저장 위치 |
|---|---|
| 인형 이름·무기·속성·추천 옵션·공용키 | Supabase `dolls` |
| 인형 일러스트 | Supabase Storage `doll-images` |
| 파밍 상태·개인 구성·완료 체크·개인 비고 | 이용자 브라우저 `localStorage` |
| 관리자 계정 | Supabase Auth + `app_admins` |
| 테마 설정 | 이용자 브라우저 `localStorage` |

## 프로젝트 구성

```text
index.html                          일반 이용자 화면과 로직
admin.html                          관리자 화면
admin.js                            관리자 인증·DB·일러스트 관리
404.html                            사용자 지정 404 화면
config.js                           Supabase 공개 설정
_headers                            Cloudflare Pages 보안 헤더
assets/gf2-site-logo.png            사이트 아이콘
supabase/schema.sql                 최신 DB 구조·RLS·Storage 정책
supabase/seed.sql                   초기 인형 데이터
supabase/migrate-existing-dolls.sql 구버전 dolls 테이블 마이그레이션
supabase/promote-admin.sql          관리자 등록 예시
.gitignore                          로컬 이미지·임시 파일 제외
README.md                           프로젝트 설명
```

`image/` 원본 이미지 폴더는 사이트에서 사용하지 않습니다. 로컬에 보관할 때는 프로젝트 밖에 두며 `.gitignore`에서도 제외합니다. 실제 표시 일러스트는 Supabase `dolls.image_url`과 Storage를 사용합니다.

## Supabase 설정

### 1. 공개 설정 입력

Supabase Dashboard의 Project URL과 Publishable key를 `config.js`에 입력합니다.

```js
window.GF2_CONFIG = {
  supabaseUrl: 'https://프로젝트참조.supabase.co',
  supabasePublishableKey: 'sb_publishable_...'
};
```

브라우저에는 Publishable key만 사용합니다. Secret key와 service-role key는 넣지 않습니다.

### 2. DB 설치

새 프로젝트:

```text
1. supabase/schema.sql
2. supabase/seed.sql
```

구버전 `dolls` 테이블을 현재 구조로 올릴 때:

```text
1. supabase/migrate-existing-dolls.sql
2. supabase/schema.sql
3. supabase/seed.sql
```

`migrate-existing-dolls.sql`은 기존 인형 데이터를 유지하면서 현재 앱에 필요한 열과 제약조건을 추가합니다.

### 3. 관리자 계정 등록

1. `/admin.html`에서 사용할 이메일로 한 번 로그인합니다.
2. `supabase/promote-admin.sql`의 `your-email@example.com`을 관리자 이메일로 변경합니다.
3. Supabase SQL Editor에서 실행합니다.

```sql
insert into public.app_admins (user_id)
select id
from auth.users
where email = 'your-email@example.com'
on conflict (user_id) do nothing;
```

### 4. 인증 복귀 주소

Supabase Dashboard:

```text
Authentication → URL Configuration
```

Site URL:

```text
https://gf2-parts.pages.dev
```

Redirect URLs:

```text
http://localhost:8080/admin.html
https://gf2-parts.pages.dev/admin.html
```

로컬·운영 경로 전체를 허용해야 할 때는 다음 형식도 사용할 수 있습니다.

```text
http://localhost:8080/**
https://gf2-parts.pages.dev/**
```

설정을 바꾼 뒤에는 기존 인증 메일이 아니라 새 Magic Link를 요청합니다.

## 로컬 실행

프로젝트 폴더에서 웹 서버를 실행합니다.

```bat
cd /d D:\SBdev\gf2-cloudflare-supabase
python -m http.server 8080
```

`python` 명령이 없으면:

```bat
py -m http.server 8080
```

접속 주소:

```text
일반 화면: http://localhost:8080/
관리자 화면: http://localhost:8080/admin.html
404 확인: http://localhost:8080/없는주소
```

HTML 파일을 직접 더블클릭하지 말고 로컬 서버를 통해 엽니다.

## Cloudflare Pages 배포

GitHub 저장소를 Cloudflare Pages에 연결합니다.

```text
Framework preset: None
Production branch: main
Build command: exit 0
Build output directory: .
```

파일 수정 후:

```bat
git status
git add index.html admin.html admin.js 404.html README.md
git commit -m "Update GF2 site"
git pull --rebase origin main
git push
```

대량의 로컬 이미지나 임시 파일이 있을 때는 `git add -A`보다 반영할 파일명을 직접 지정하는 편이 안전합니다.

## 운영 방법

### 인형 및 일러스트 수정

1. `/admin.html`에서 관리자 로그인
2. 오른쪽 목록에서 인형 카드 선택
3. 정보 또는 일러스트 수정
4. 저장

인형 삭제보다 `사이트에 표시`를 꺼서 비활성화하는 편이 안전합니다.

### 신규 인형 추가

`새로 작성`을 누르면 다음 값이 자동 입력됩니다.

- 인형 번호: 현재 마지막 번호 + 1
- 표시 순서: 현재 최댓값 + 1

필요한 경우 인형 번호와 표시 순서를 직접 수정할 수 있습니다.

### 이름 변경 주의

일반 이용자 개인 데이터는 현재 인형 이름을 키로 저장합니다. 운영 중 기존 인형 이름을 바꾸면 이전 개인 설정과 연결되지 않을 수 있습니다.

### 개인 데이터 백업

개인 데이터는 브라우저별로 저장됩니다. 브라우저 데이터 삭제나 기기 변경 전에 일반 화면의 `백업 내보내기`를 사용합니다.

## 문제 해결

### `email rate limit exceeded`

Magic Link를 짧은 시간에 여러 번 요청한 상태입니다. 가장 최근에 받은 이메일을 사용하거나 잠시 기다린 뒤 한 번만 다시 요청합니다.

### `otp_expired`

인증 링크가 만료되었거나 이미 사용되었습니다. 관리자 페이지에서 새 Magic Link를 요청합니다.

### 인증 후 일반 화면으로 이동함

Supabase Redirect URLs에 `/admin.html`이 등록되어 있는지 확인합니다.

### `localhost에서 연결을 거부했습니다`

인증 복귀 주소가 localhost인데 로컬 서버가 꺼져 있습니다. `python -m http.server 8080`을 실행한 뒤 최신 인증 링크를 사용합니다.

### `git push`가 `fetch first`로 거절됨

```bat
git pull --rebase origin main
git push
```

커밋되지 않은 작업 때문에 rebase가 막히면:

```bat
git stash push -u -m "Temporary changes before rebase"
git pull --rebase origin main
git push
git stash pop
```

`git push --force`는 원격 변경을 덮어쓸 수 있으므로 사용하지 않습니다.

## 보안

- 활성 인형 데이터는 비로그인 이용자가 읽을 수 있습니다.
- 인형과 일러스트의 추가·수정·삭제는 관리자만 가능합니다.
- 권한은 Supabase Row Level Security 정책으로 통제합니다.
- 일반 이용자 개인 진행 데이터는 Supabase에 저장되지 않습니다.
- `config.js`에는 공개용 Publishable key만 둡니다.
