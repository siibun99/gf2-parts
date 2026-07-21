# 소녀전선2 장비 파밍 도우미

소녀전선2 인형별 장비 파밍 현황과 추천 파츠 구성을 정리하는 정적 웹앱입니다.

- **Cloudflare Pages**에서 사이트를 배포합니다.
- **Supabase Database**에서 공용 인형 정보를 불러옵니다.
- **Supabase Storage**에 인형 일러스트를 저장합니다.
- 일반 이용자의 파밍 상태와 개인 설정은 로그인 없이 브라우저 `localStorage`에만 저장됩니다.
- 관리자는 `/admin.html`에서 Supabase Magic Link로 로그인해 공용 데이터를 관리합니다.

현재 UI는 소녀전선2의 전술 단말기 분위기를 참고한 독자적인 디자인이며, 일반 화면·관리자 화면·404 화면에서 동일한 밝은/어두운 테마를 사용합니다.

---

## 주요 기능

### 일반 이용자 화면

- 로그인 없이 바로 사용
- 밝은 화면 / 어두운 화면 전환 및 브라우저 저장
- `장비파밍 현황`과 `무기파츠 표` 탭
- 인형 이름·공용키·세트 옵션 검색
- 무기 종류와 속성 필터
- 전체 / 파밍 대상 / 미완료 / 파밍 완료 필터
- 미보유 인형 숨기기
- 인형 상태 관리
  - 기본 상태
  - 파밍 대상
  - 미보유
  - 파밍 완료
- 개인 장비 구성 편집
  - 세트 옵션 다중 선택
  - 총구 옵션 최대 4개
  - 파츠 1·2·3 옵션 각각 최대 3개
- 총구·파츠별 완료 체크
- 개인 비고 저장
- 저장한 개인 구성을 무기 종류별 표로 자동 정리
- 개인 데이터 JSON 백업 내보내기·가져오기
- 인형 일러스트가 있으면 이미지만 표시하고, 이미지가 없거나 불러오기 실패 시 인형 풀네임 표시
- 데스크톱·모바일 반응형 화면

> 개인 데이터는 브라우저별로 저장되며 기기 간 자동 동기화되지 않습니다. 브라우저 데이터를 삭제하기 전에 `백업 내보내기`를 사용하는 것이 안전합니다.

### 관리자 화면

- Supabase Magic Link 이메일 로그인
- `app_admins`에 등록된 관리자만 접근
- 일반 화면과 동일한 밝은/어두운 전술 UI
- 인형 이름·슬러그·무기·속성·공용키 실시간 검색
- 인형 카드를 클릭하거나 `수정` 버튼을 눌러 편집
- 키보드 `Enter` 또는 `Space`로 카드 편집 열기
- 새 인형 추가 및 기존 인형 수정
- 인형 활성·비활성 전환
- 일러스트 현재 이미지 미리보기
- 새 이미지 선택 즉시 미리보기
- 현재 일러스트 제거
- 신규 인형의 고정 슬러그 자동 생성
  - 예: 마지막 슬러그가 `doll-063`이면 `doll-064`
- 신규 인형의 표시 순서 자동 생성
  - 현재 최댓값에 `1`을 더해 입력
- 표시 순서가 큰 인형부터 일반 화면과 관리자 목록 상단에 표시

### 404 화면

- 일반 화면과 동일한 밝은/어두운 테마 연동
- 잘못 입력된 주소 표시
- 홈으로 돌아가기 및 이전 페이지 이동
- 모바일 대응

---

## 데이터 저장 구조

| 데이터 | 저장 위치 | 접근 방식 |
|---|---|---|
| 인형 이름·무기·속성·추천 옵션·공용키 | Supabase `dolls` | 누구나 활성 인형 읽기, 관리자만 변경 |
| 인형 일러스트 | Supabase Storage `doll-images` | 누구나 보기, 관리자만 업로드·변경·삭제 |
| 파밍 상태·개인 옵션·완료 체크·개인 비고 | 이용자 브라우저 `localStorage` | 해당 브라우저에서만 접근 |
| 관리자 계정 | Supabase Auth + `app_admins` | Magic Link 로그인 후 권한 확인 |
| 테마 설정 | 이용자 브라우저 `localStorage` | 일반·관리자·404 화면에서 공유 |

일반 이용자의 개인 진행 정보는 Supabase로 전송하지 않습니다.

---

## 프로젝트 구성

```text
index.html                         일반 이용자 화면과 사용자 로직
admin.html                         관리자 화면
admin.js                           관리자 인증·검색·DB·이미지 관리
404.html                           사용자 지정 404 화면
config.js                          Supabase 공개 설정
_headers                           Cloudflare Pages 응답 헤더
assets/                            정적 리소스
image/                             운영자가 보관하는 원본 이미지 폴더(선택)
supabase/schema.sql                DB 구조, RLS, Storage 정책
supabase/seed.sql                  초기 인형 데이터
supabase/migrate-existing-dolls.sql 기존 dolls 테이블 마이그레이션
supabase/promote-admin.sql         관리자 계정 등록 예시
supabase/clear-bundled-images.sql  예전 로컬 이미지 경로만 제거
supabase/fix-missing-is-active.sql 구버전 is_active 열 보정
supabase/remove-user-sync.sql      이전 사용자 동기화 테이블 제거(선택)
README.md                          프로젝트 설명
```

`image/` 폴더의 파일은 운영·정리용으로 둘 수 있습니다. 현재 사이트에서 표시되는 일러스트의 기준값은 Supabase `dolls.image_url`입니다.

---

# 설치 및 실행

## 1. Supabase 프로젝트 만들기

Supabase Dashboard에서 프로젝트를 만든 뒤 Project Settings의 API Keys에서 다음 값을 확인합니다.

- Project URL
- Publishable key (`sb_publishable_...`) 또는 legacy anon key

`config.js`에 입력합니다.

```js
window.GF2_CONFIG = {
  supabaseUrl: 'https://프로젝트참조.supabase.co',
  supabasePublishableKey: 'sb_publishable_...'
};
```

브라우저 코드에는 **Publishable key만** 사용합니다. Secret key나 service-role key를 넣으면 안 됩니다.

### 새 프로젝트에 설치할 때

Supabase SQL Editor에서 다음 순서로 실행합니다.

```text
1. supabase/schema.sql
2. supabase/seed.sql
```

### 기존 `dolls` 테이블이 있을 때

구버전 테이블에 `slug`, `display_order`, `image_url`, 추천 옵션 배열 등의 열이 없을 수 있습니다. 다음 순서로 실행합니다.

```text
1. supabase/migrate-existing-dolls.sql
2. supabase/schema.sql
3. supabase/seed.sql
```

마이그레이션 스크립트는 기존 인형 행을 유지하면서 필요한 열을 추가합니다.

### 예전 로컬 이미지 경로를 비울 때

과거 `assets/dolls/...` 경로가 DB에 저장되어 잘못된 이미지가 표시되면 다음 SQL을 한 번 실행합니다.

```text
supabase/clear-bundled-images.sql
```

이 스크립트는 예전 번들 이미지 경로만 비우고, 관리자 화면에서 올린 Supabase Storage URL은 유지합니다.

---

## 2. 로컬에서 실행하기

HTML 파일을 직접 더블클릭하지 말고 프로젝트 폴더에서 웹 서버를 실행합니다.

Windows 명령 프롬프트:

```bat
cd /d D:\SBdev\gf2-cloudflare-supabase
python -m http.server 8080
```

`python` 명령이 인식되지 않으면 다음을 사용합니다.

```bat
py -m http.server 8080
```

접속 주소:

```text
일반 화면: http://localhost:8080/
관리자 화면: http://localhost:8080/admin.html
404 확인: http://localhost:8080/없는주소
```

관리자 인증 이메일이 `localhost`로 돌아오도록 설정되어 있는데 로컬 서버가 꺼져 있으면 `localhost에서 연결을 거부했습니다`가 표시됩니다. 인증 링크를 열기 전에 로컬 서버를 켜두세요.

---

## 3. 관리자 계정 설정

일반 이용자는 로그인하지 않으며 관리자만 Supabase Magic Link를 사용합니다.

### Redirect URL 등록

Supabase Dashboard에서 다음 메뉴를 엽니다.

```text
Authentication → URL Configuration
```

개발 중에는 다음 주소를 Redirect URLs에 추가합니다.

```text
http://localhost:8080/**
```

Cloudflare Pages 배포 후에는 실제 주소도 추가합니다.

```text
https://프로젝트명.pages.dev/**
```

커스텀 도메인이 있다면 해당 도메인도 추가합니다.

### 관리자 승격

1. `/admin.html`에서 이메일 로그인 링크를 요청합니다.
2. 이메일 링크를 열어 Supabase 사용자 계정을 생성합니다.
3. `supabase/promote-admin.sql`의 이메일을 본인 주소로 변경합니다.
4. Supabase SQL Editor에서 실행합니다.
5. 관리자 페이지를 새로고침합니다.

```sql
insert into public.app_admins (user_id)
select id
from auth.users
where email = '본인이메일@example.com'
on conflict (user_id) do nothing;
```

Supabase 기본 이메일 서비스는 테스트용 발송 제한이 낮을 수 있습니다. `email rate limit exceeded`가 나타나면 연속으로 버튼을 누르지 말고 잠시 기다린 뒤 최신 이메일 링크를 사용하세요.

---

## 4. 인형 및 일러스트 관리

관리자 로그인 후 인형 목록의 아무 카드나 클릭하면 해당 인형의 수정 폼이 열립니다. `삭제` 버튼은 카드 편집과 분리되어 삭제만 실행합니다.

### 일러스트 등록

1. 관리자 목록에서 인형 카드 클릭
2. `인형 일러스트` 파일 선택
3. 미리보기 확인
4. `저장`

- 지원 권장 형식: PNG, JPEG, WebP
- 최대 파일 크기: 5MB
- 잘못 올린 이미지는 `현재 일러스트 제거`를 선택한 뒤 저장

### 새 인형 추가

새 인형 폼을 열면 다음 값이 자동으로 입력됩니다.

- 고정 슬러그: 기존 슬러그 마지막 번호 + 1
- 표시 순서: 현재 표시 순서 최댓값 + 1

고정 슬러그는 생성 후 개인 데이터 연결과 운영 안정성을 위해 함부로 변경하지 않는 편이 좋습니다.

### 이름 변경 주의

현재 일반 이용자 개인 데이터는 인형 이름을 키로 저장합니다. 운영 중 기존 인형 이름을 변경하면 이용자의 기존 파밍 설정과 연결되지 않을 수 있습니다.

오탈자 수정처럼 이름 변경이 꼭 필요하다면 개인 데이터 마이그레이션도 함께 고려해야 합니다.

---

## 5. 화면 디자인 조절

테마는 `gf2-ui-theme-v1` 키로 브라우저에 저장되어 일반 화면·관리자 화면·404 화면에서 공유됩니다.

인형 일러스트 확대와 세로 위치는 `index.html`의 CSS 변수로 조절할 수 있습니다.

```css
.doll-portrait {
  --portrait-scale: 3.5;
  --portrait-offset-y: -7%;
}
```

- 더 크게: `--portrait-scale` 값을 높임
- 더 작게: `--portrait-scale` 값을 낮춤
- 더 위로: `--portrait-offset-y`를 더 작은 음수로 설정
- 더 아래로: `--portrait-offset-y`를 `0%`에 가깝게 설정

모바일 화면에는 별도의 확대율과 위치값이 적용됩니다.

---

## 6. Cloudflare Pages 배포

GitHub 저장소를 Cloudflare Pages에 연결합니다.

Cloudflare Dashboard 설정 예시:

```text
Framework preset: None
Production branch: main
Build command: exit 0
Build output directory: .
```

현재 프로젝트는 빌드 과정이 없는 정적 사이트이므로 저장소 루트가 그대로 배포됩니다.

### 일반적인 업데이트

변경한 파일만 선택해서 커밋하는 방식이 안전합니다.

```bat
git status
git add index.html admin.html admin.js 404.html README.md
git commit -m "Update GF2 site"
git pull --rebase origin main
git push
```

원격 저장소에 로컬에 없는 커밋이 있으면 `git push`가 `fetch first`로 거절될 수 있습니다. 이때는 먼저 다음을 실행합니다.

```bat
git pull --rebase origin main
git push
```

커밋하지 않은 작업이 남아 있어 rebase가 막히면 임시 보관합니다.

```bat
git stash push -u -m "Temporary changes before rebase"
git pull --rebase origin main
git push
git stash pop
```

작업 폴더에 대량 이미지 변경이 남아 있다면 의도치 않은 파일까지 올라가지 않도록 `git add -A` 대신 파일명을 지정하는 편이 안전합니다.

---

## 7. 기존 Apps Script 데이터 이전

기존 Google Apps Script 사이트와 Cloudflare Pages 사이트는 도메인이 달라 `localStorage` 데이터가 자동으로 이동하지 않습니다.

1. 기존 사이트에서 `백업 내보내기`
2. 새 사이트에서 `백업 가져오기`
3. 새 사이트에서 다시 `백업 내보내기`하여 보관

Google Sheets와 Apps Script는 현재 배포 구조에서 공용 데이터 원본으로 사용하지 않습니다.

---

## 보안 구조

- 비로그인 이용자는 활성화된 `dolls` 행만 읽습니다.
- 인형 추가·수정·삭제는 `app_admins`에 등록된 관리자만 가능합니다.
- Storage의 `doll-images`는 공개 읽기, 관리자 쓰기 정책을 사용합니다.
- 일반 이용자의 개인 진행 데이터는 Supabase로 전송되지 않습니다.
- 브라우저에는 공개용 Supabase Publishable key만 사용합니다.
- 실제 권한 통제는 Supabase Row Level Security 정책이 담당합니다.

---

## 문제 해결

### `localhost에서 연결을 거부했습니다`

로컬 웹 서버가 꺼진 상태입니다.

```bat
python -m http.server 8080
```

서버를 켠 뒤 인증 링크를 새로고침하거나 최신 로그인 이메일 링크를 다시 엽니다.

### `email rate limit exceeded`

Magic Link 이메일을 짧은 시간에 여러 번 요청해 Supabase 이메일 발송 제한에 걸린 상태입니다. 기존에 도착한 최신 이메일을 사용하거나 일정 시간 뒤 한 번만 다시 요청합니다.

### `column "slug" does not exist` 또는 열 누락 오류

기존 테이블을 마이그레이션합니다.

```text
1. supabase/migrate-existing-dolls.sql
2. supabase/schema.sql
3. supabase/seed.sql
```

### `column "is_active" does not exist`

```text
1. supabase/fix-missing-is-active.sql
2. supabase/schema.sql
3. supabase/seed.sql
```

### `git push`가 `fetch first`로 거절됨

```bat
git pull --rebase origin main
git push
```

`git push --force`는 원격 변경을 덮어쓸 수 있으므로 사용하지 않는 것이 좋습니다.

---

## 운영 메모

- 표시 순서가 큰 인형이 목록 위에 나타납니다.
- 삭제보다 `사이트에 표시`를 끄는 비활성 처리가 안전합니다.
- 관리자 화면에서 일러스트를 등록하면 Supabase Storage의 공개 URL이 `dolls.image_url`에 저장됩니다.
- 일러스트가 정상 로드되면 이미지 뒤의 이름은 숨겨집니다.
- 이미지가 없거나 로드에 실패하면 일러스트 영역에 인형 풀네임이 표시됩니다.
