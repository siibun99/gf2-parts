# 기존 GitHub 프로젝트에 v5 적용

이 업데이트 묶음에는 `config.js`가 없습니다. 기존에 입력한 Supabase URL과 Publishable key가 그대로 유지됩니다.

1. 기존 프로젝트의 `index.html`, `admin.html`, `admin.js`를 이 묶음의 파일로 교체합니다.
2. `supabase/seed.sql`을 교체합니다. 이미 설치한 DB에 seed를 다시 실행할 필요는 없습니다.
3. Supabase SQL Editor에서 `supabase/clear-bundled-images.sql`을 한 번 실행합니다.
4. 기존 프로젝트의 `assets/dolls/*.jpg` 파일을 모두 삭제하고 `.gitkeep`만 남깁니다.
5. 로컬에서 `python -m http.server 8080`으로 확인합니다.
6. 아래 명령으로 배포합니다.

```bash
git add -A
git commit -m "Add light theme and reverse doll order"
git push
```

기존 이용자의 파밍 상태와 개인 비고(localStorage)는 변경되지 않습니다.
