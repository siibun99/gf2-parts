# v5 변경 사항

1. 사용자·관리자 화면에 밝은/어두운 테마 전환 추가
2. 선택한 테마를 브라우저에 저장
3. 인형 목록을 display_order 내림차순으로 변경
4. 초기 일러스트 파일 및 seed 이미지 경로 제거
5. 기존 잘못된 정적 이미지 경로를 비우는 clear-bundled-images.sql 추가
6. 관리자 화면에 현재 일러스트 제거 옵션 추가

기존 설치에서 필요한 작업:

- index.html, admin.html, admin.js 교체
- Supabase SQL Editor에서 supabase/clear-bundled-images.sql 한 번 실행
- 로컬/GitHub의 assets/dolls/*.jpg 파일 삭제
- config.js는 기존에 입력한 값을 유지
