# 소녀전선2 장비 파밍 도우미

소녀전선2 인형별 장비 파밍 현황과 추천 파츠 구성을 관리하는 정적 웹앱입니다.

- **Cloudflare Pages**에서 사이트를 배포합니다.
- **Supabase Database**에서 공용 인형 정보를 불러옵니다.
- **Supabase Storage**에 인형 일러스트를 저장합니다.
- 일반 이용자의 파밍 상태와 개인 설정은 로그인 없이 브라우저 `localStorage`에 저장됩니다.
- 관리자는 `/admin.html`에서 Supabase Magic Link로 로그인해 공용 데이터를 관리합니다.

## 사이트

- 사용자 화면: `https://gf2-parts.pages.dev`
- 관리자 화면: `https://gf2-parts.pages.dev/admin.html`
- GitHub 저장소: `https://github.com/siibun99/gf2-parts`

현재 UI는 소녀전선2의 전술 단말기 분위기를 참고한 독자적인 디자인이며, 사용자 화면·관리자 화면·404 화면에서 동일한 밝은 화면 및 어두운 화면 테마를 사용합니다.

---

## 주요 기능

### 사용자 화면

- 로그인 없이 바로 사용
- 페이지 1·2·3 전환: 파밍 상태, 구성, 완료 체크, 비고를 페이지별로 분리 저장
- 기존 이용자의 진행 기록은 페이지 1에 그대로 유지
- 밝은 화면 / 어두운 화면 전환
- 선택한 테마를 브라우저에 저장
- `장비파밍 현황`과 `무기파츠 표` 탭
- 인형 이름·공용키·세트 옵션 검색
- 무기 종류 및 속성 필터
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
- 총구 및 파츠별 완료 체크
- 개인 비고 저장
- 개인 설정을 반영한 무기파츠 표 자동 생성
- 인형별 일러스트 확대 및 위치 보정
- 데스크톱·모바일 반응형 화면
- 선택한 페이지의 개인 진행 데이터만 삭제하는 `현재 페이지 초기화`

### 개인 데이터 저장 안내

파밍 상태, 장비 구성, 완료 체크 및 개인 비고는 현재 사용 중인 브라우저에만 저장됩니다.

별도의 일반 사용자 계정이나 서버에는 저장되지 않으며 다음 환경과 자동으로 공유되지 않습니다.

- 다른 컴퓨터 또는 모바일 기기
- 다른 브라우저
- 다른 브라우저 프로필
- 일반 창과 시크릿 창

브라우저에서 해당 사이트의 쿠키 및 사이트 데이터나 저장 데이터를 삭제하면 개인 진행 데이터가 초기화되며 복구할 수 없습니다.

개인 진행 데이터는 인형의 고정 DB ID로 연결됩니다. 기존 이름 기반 기록은
사이트 방문 시 현재 이름과 일치하는 인형의 ID로 자동 이전됩니다.
이전이 끝난 브라우저에서는 인형 이름을 수정해도 진행 기록이 유지됩니다.
업데이트 후 아직 방문하지 않은 이용자의 기록은 이전되지 않았으므로,
인형 이름 변경은 기존 이용자의 데이터 이전 시간을 충분히 둔 뒤 진행하세요.
이미 이름이 바뀐 과거 기록은 자동으로 연결할 수 없습니다.

브라우저 저장에 실패하면 성공 메시지를 표시하지 않으며, 구성 편집창은
닫지 않아 다시 저장할 수 있습니다.

`현재 페이지 초기화` 버튼은 선택한 페이지의 진행 데이터만 삭제합니다.
다른 페이지의 기록은 유지됩니다. 페이지 1·2·3은 별도 로그인 계정이 아닌
현재 브라우저 안의 저장 공간이며, 기기 간 동기화는 지원하지 않습니다.
검색·필터와 테마는 공통으로 사용하고 무기파츠 표는 선택한 페이지의 구성을 반영합니다.

### 관리자 화면

- Supabase Magic Link 이메일 로그인
- 페이지 내 이메일 입력 폼, 발송 중 중복 요청 방지 및 결과 안내
- `app_admins`에 등록된 관리자만 접근
- 사용자 화면과 동일한 밝은 화면 / 어두운 화면 테마
- 인형 이름·슬러그·무기·속성·공용키 검색
- 인형 카드를 클릭해 편집
- 키보드 `Enter` 또는 `Space`로 카드 편집 열기
- 새 인형 추가
- 기존 인형 정보 수정
- 무기·속성은 드롭다운 선택, 추천 세트·총구·파츠는 버튼으로 다중 선택
- 총구 최대 4개, 파츠 최대 3개 선택 제한 및 선택 개수 표시
- DB에 이미 등록된 옵션도 선택지에 포함하여 기존 데이터 보존
- 인형 활성·비활성 전환
- 일러스트 업로드·변경·삭제
- 현재 이미지 및 새 이미지 미리보기
- 신규 인형 슬러그 자동 생성
  - 예: 마지막 슬러그가 `doll-063`이면 `doll-064`
- 신규 인형 표시 순서 자동 생성
- 표시 순서가 큰 인형부터 목록 상단에 표시
- 일러스트 확대율과 가로·세로 위치 조절
- 미리보기 화면에서 일러스트 드래그 이동

### 404 화면

- 사용자 화면과 동일한 테마 연동
- 잘못 입력된 주소 표시
- 홈으로 돌아가기
- 이전 페이지 이동
- 모바일 대응

---

## 데이터 저장 구조

| 데이터 | 저장 위치 | 접근 방식 |
|---|---|---|
| 인형 이름·무기·속성·추천 옵션·공용키 | Supabase `dolls` | 누구나 활성 인형 읽기, 관리자만 변경 |
| 인형 일러스트 | Supabase Storage `doll-images` | 누구나 보기, 관리자만 변경 |
| 파밍 상태·개인 옵션·완료 체크·개인 비고 | 브라우저 `localStorage` | 현재 브라우저에서만 접근 |
| 관리자 계정 | Supabase Auth + `app_admins` | Magic Link 로그인 후 권한 확인 |
| 테마 설정 | 브라우저 `localStorage` | 사용자·관리자·404 화면에서 공유 |

일반 이용자의 개인 진행 정보는 Supabase로 전송하지 않습니다.

관리자는 공용 인형 데이터와 일러스트만 관리하며 일반 이용자의 개인 진행 데이터에는 접근할 수 없습니다.

---

## 프로젝트 구성

```text
gf2-cloudflare-supabase/
├─ assets/                     사이트 로고 및 정적 리소스
├─ supabase/
│  ├─ schema.sql               DB 구조, RLS 및 Storage 정책
│  ├─ seed.sql                 초기 인형 데이터
│  └─ promote-admin.sql        관리자 계정 등록 예시
├─ 404.html                    사용자 지정 404 화면
├─ _headers                    Cloudflare Pages 응답 헤더
├─ admin.html                  관리자 화면
├─ admin.js                    관리자 인증·검색·DB·이미지 관리
├─ config.js                   Supabase 공개 설정
├─ index.html                  사용자 화면 및 사용자 로직
├─ README.md                   프로젝트 설명
└─ .gitignore                  Git 제외 파일 설정
```

---

# 설치 및 실행

## 1. Supabase 프로젝트 설정

Supabase Dashboard에서 프로젝트를 만든 뒤 다음 값을 확인합니다.

```text
Project URL
Publishable key
```

`config.js`에 입력합니다.

```js
window.GF2_CONFIG = {
  supabaseUrl: 'https://프로젝트참조.supabase.co',
  supabasePublishableKey: 'sb_publishable_...'
};
```

브라우저 코드에는 공개용 **Publishable key**만 사용해야 합니다.

다음 키는 `config.js`나 GitHub 저장소에 넣으면 안 됩니다.

- Secret key
- Service-role key
- 데이터베이스 비밀번호

### 새 Supabase 프로젝트 설치

Supabase SQL Editor에서 다음 순서로 실행합니다.

```text
1. supabase/schema.sql
2. supabase/seed.sql
```

`schema.sql`에는 다음 항목이 포함됩니다.

- `dolls` 테이블
- `app_admins` 테이블
- Row Level Security 정책
- 관리자 권한 정책
- `doll-images` Storage 정책

---

## 2. 로컬 실행

HTML 파일을 직접 더블클릭하지 말고 프로젝트 폴더에서 로컬 웹 서버를 실행합니다.

Windows 명령 프롬프트:

```bat
cd /d D:\SBdev\gf2-cloudflare-supabase
python -m http.server 8080
```

`python` 명령이 인식되지 않으면 다음 명령을 사용합니다.

```bat
py -m http.server 8080
```

접속 주소:

```text
사용자 화면
http://localhost:8080/

관리자 화면
http://localhost:8080/admin.html
```

서버 종료:

```text
Ctrl + C
```

---

## 3. 관리자 계정 설정

일반 이용자는 로그인하지 않으며 관리자만 Supabase Magic Link를 사용합니다.

### 인증 주소 설정

Supabase Dashboard에서 다음 메뉴를 엽니다.

```text
Authentication
→ URL Configuration
```

Site URL:

```text
https://gf2-parts.pages.dev
```

Redirect URLs:

```text
https://gf2-parts.pages.dev/
https://gf2-parts.pages.dev/admin.html
http://localhost:8080/
http://localhost:8080/admin.html
```

필요한 경우 와일드카드 주소도 추가할 수 있습니다.

```text
https://gf2-parts.pages.dev/**
http://localhost:8080/**
```

### 관리자 등록

1. `/admin.html`에서 이메일 로그인 링크를 요청합니다.
2. 이메일로 받은 로그인 링크를 엽니다.
3. `supabase/promote-admin.sql`을 엽니다.
4. 예시 이메일을 관리자 이메일로 변경합니다.
5. Supabase SQL Editor에서 실행합니다.
6. 관리자 페이지를 새로고침합니다.

예시:

```sql
insert into public.app_admins (user_id)
select id
from auth.users
where email = '본인이메일@example.com'
on conflict (user_id) do nothing;
```

관리자 로그인은 Supabase 사용자 계정 생성만으로는 사용할 수 없습니다.

해당 사용자의 UUID가 `app_admins` 테이블에 등록되어 있어야 공용 인형 DB를 수정할 수 있습니다.

---

## 4. 인형 및 일러스트 관리

관리자 로그인 후 인형 목록에서 카드를 클릭하면 해당 인형의 수정 폼이 열립니다.

### 새 인형 추가

저장 중에는 입력과 인형 선택을 잠그고 중복 저장을 막습니다.
이미지 업로드가 시작되기 전에 모든 입력값을 확정하므로 다른 인형의 정보가
섞이지 않습니다. 저장 실패 시 입력을 유지하고 다시 편집할 수 있습니다.

새 인형 폼을 열면 다음 값이 자동으로 입력됩니다.

- 고정 슬러그: 기존 마지막 번호 + 1
- 표시 순서: 현재 최댓값 + 1
- 일러스트 확대율: 기본값
- 가로·세로 위치: 기본값

고정 슬러그는 생성 후 운영 안정성을 위해 함부로 변경하지 않는 것이 좋습니다.

### 일러스트 등록

1. 관리자 목록에서 인형 카드 선택
2. `인형 일러스트`에서 파일 선택
3. 미리보기 확인
4. 확대율과 위치 조절
5. `저장`

권장 파일 형식:

```text
PNG
JPEG
WebP
```

선택한 이미지는 저장 직전에 투명 배경을 유지한 768×768 WebP로 자동
최적화됩니다. Supabase Storage에는 최적화본이 1년 캐시 설정으로
업로드되며 원본 파일은 변경되지 않습니다.

잘못 등록한 이미지는 `현재 일러스트 제거`를 선택한 뒤 저장합니다.

### 일러스트 위치 값

일러스트 배치는 다음 값으로 저장됩니다.

```text
portrait_scale
portrait_offset_x
portrait_offset_y
```

기본값:

```text
확대율: 250
가로 위치: 0
세로 위치: -7
```

`0 / 0 / 0`으로 설정하면 원본 전체 이미지에 가까운 형태로 표시됩니다.

---

## 5. Cloudflare Pages 배포

GitHub 저장소를 Cloudflare Pages에 연결합니다.

Cloudflare Pages 설정:

```text
Framework preset: None
Production branch: main
Build command: exit 0
Build output directory: .
```

현재 프로젝트는 빌드 과정이 없는 정적 사이트이므로 저장소 루트가 그대로 배포됩니다.

### 일반 업데이트

변경한 파일만 선택해서 커밋하는 방식을 권장합니다.

```bat
cd /d D:\SBdev\gf2-cloudflare-supabase

git status
git add index.html
git commit -m "Update user page"
git push
```

README도 함께 수정한 경우:

```bat
git add index.html README.md
git commit -m "Update user page and documentation"
git push
```

작업 폴더에 의도하지 않은 이미지나 파일 변경이 남아 있을 수 있으므로 `git add .` 또는 `git add -A`보다 파일명을 직접 지정하는 편이 안전합니다.

### 원격 저장소 변경이 먼저 올라간 경우

다음 오류가 발생할 수 있습니다.

```text
fetch first
non-fast-forward
```

이 경우:

```bat
git pull --rebase origin main
git push
```

커밋하지 않은 변경 때문에 rebase가 막히면 다음과 같이 임시 보관합니다.

```bat
git stash push -u -m "Temporary changes before rebase"
git pull --rebase origin main
git push
git stash pop
```

---

## 보안 구조

- 비로그인 이용자는 활성화된 `dolls` 데이터만 읽을 수 있습니다.
- 인형 추가·수정·삭제는 `app_admins`에 등록된 관리자만 가능합니다.
- Storage의 `doll-images`는 공개 읽기와 관리자 쓰기 정책을 사용합니다.
- 일반 이용자의 개인 진행 데이터는 Supabase로 전송되지 않습니다.
- 브라우저에는 공개용 Supabase Publishable key만 사용합니다.
- 실제 데이터 접근 권한은 Supabase Row Level Security 정책으로 제한합니다.
- 관리자 인증과 일반 이용자의 로컬 데이터는 서로 분리되어 있습니다.

---

## 문제 해결

### `localhost에서 연결을 거부했습니다`

로컬 웹 서버가 꺼진 상태일 수 있습니다.

```bat
python -m http.server 8080
```

서버를 실행한 뒤 페이지를 새로고침합니다.

관리자 인증 이메일이 `localhost` 주소로 연결된다면 링크를 열기 전에 로컬 서버를 실행해야 합니다.

### `email rate limit exceeded`

짧은 시간 동안 Magic Link 이메일을 여러 번 요청해 Supabase 발송 제한에 걸린 상태입니다.

- 이미 도착한 이메일 중 가장 최신 링크 사용
- 로그인 버튼을 반복해서 누르지 않기
- 일정 시간 뒤 한 번만 다시 요청

### 관리자 로그인을 했지만 수정 화면이 보이지 않음

로그인 계정이 `app_admins`에 등록되어 있는지 확인합니다.

```sql
select *
from public.app_admins;
```

필요하면 `supabase/promote-admin.sql`을 다시 실행합니다.

### 인형 이미지가 보이지 않음

다음 항목을 확인합니다.

- `dolls.image_url`에 공개 URL이 저장되어 있는지
- Storage의 `doll-images` 버킷이 존재하는지
- 공개 읽기 정책이 적용되어 있는지
- 이미지가 삭제되거나 이동되지 않았는지
- 브라우저 개발자 도구에 네트워크 오류가 있는지

### Git 줄바꿈 경고

Windows에서 다음 경고가 나타날 수 있습니다.

```text
LF will be replaced by CRLF
```

Git이 Unix 방식의 `LF` 줄바꿈을 Windows 방식의 `CRLF`로 바꿀 수 있다는 안내입니다.

HTML 동작이나 Cloudflare Pages 배포에는 일반적으로 영향을 주지 않으며 `git add`도 정상적으로 처리된 상태입니다.

---

## 운영 메모

저장 로직 회귀 테스트는 Node.js가 설치된 환경에서 실행합니다.

```bat
node --test tests/storage-regression.test.cjs
```

- 표시 순서가 큰 인형이 사용자 화면과 관리자 목록 위에 나타납니다.
- 인형을 완전히 삭제하는 것보다 `사이트에 표시`를 끄는 비활성 처리가 안전합니다.
- 관리자 화면에서 일러스트를 등록하면 Storage 공개 URL이 `dolls.image_url`에 저장됩니다.
- 일러스트가 정상적으로 로드되면 이미지 뒤의 인형 이름은 숨겨집니다.
- 이미지가 없거나 로드에 실패하면 일러스트 영역에 인형 이름이 표시됩니다.
- 일반 이용자 개인 데이터는 현재 브라우저에만 있으므로 사이트 저장 데이터 삭제 시 복구할 수 없습니다.
- 관리자 화면 주소와 관리자 이메일은 커뮤니티에 공개하지 않는 것이 좋습니다.
