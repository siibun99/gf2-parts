-- 현재 Google Sheet의 소녀전선2 DB를 변환한 초기 데이터

begin;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('ab96b0e7-93a2-5744-ac98-fe806f2a1ee2'::uuid, 'doll-001', '콜펜', '권총', '탁류', '', '허구의 생명', '액티브 단일 치료 전에 대상의 무작위 디버프를 1개 정화한다.', 'assets/dolls/doll-001.jpg', 1, ARRAY['응급 회복']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('0fba64e1-4ba9-570b-8d42-10401060070a'::uuid, 'doll-002', '나강', '권총', '산성', '', '선배의 잔소리', '대상의 안정 지수가 자신보다 낮을 경우 주는 피해 +7%', 'assets/dolls/doll-002.jpg', 2, ARRAY['위상 타격']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('2fa2d4c6-fccc-5ea7-bb2a-c1b9684c8dea'::uuid, 'doll-003', '크세니아', '권총', '연소', '', '활활 타올라', '연소계 버프를 부여할 때 50% 확률로 대상에게 버프 1개를 1턴 간 부여한다.', 'assets/dolls/doll-003.jpg', 3, ARRAY['응급 회복']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('2591bc17-0787-5eb6-a01d-b44b195fb4e8'::uuid, 'doll-004', '페이', '권총', '물리', '', '사투', '자신 주위 반경 3칸 안의 적 유닛이 받는 물리 피해 +5%.', 'assets/dolls/doll-004.jpg', 4, ARRAY['실탄 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('3ec049e7-221d-5283-8c15-c180b8ff25dd'::uuid, 'doll-005', '플로렌스', '권총', '탁류', '', '주인님의 명령', '자신의 실체 소환물의 공격 +7%.', 'assets/dolls/doll-005.jpg', 5, ARRAY['격류 증폭','정점 소환']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('9e8beaba-1e45-5739-b60b-c8202544c303'::uuid, 'doll-006', '바스티', '권총', '산성', '', '치명적인 독점욕', '산성계 타일에 있는 적에게 주는 위상 피해 +10%.', 'assets/dolls/doll-006.jpg', 6, ARRAY['강산 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('88675bab-9f10-513e-9bf1-b4bf8063d426'::uuid, 'doll-007', '웰로드', '권총', '산성', '', '반 다인 수칙', '공격 시 자신의 체력 비율이 목표 이상이라면 주는 위상 피해 +10%.', 'assets/dolls/doll-007.jpg', 7, ARRAY['강산 증폭','결전 추진']::text[], ARRAY['공격','공격 보너스','체력','체력 보너스']::text[], ARRAY['공격 보너스','체력','체력 보너스']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('89e0b812-7dba-51cc-8b6e-ac57b29e62f5'::uuid, 'doll-008', '치타', '기관단총', '연소', '', '미묘한 발명', '액티브 치료 시, 50% 확률로 대상에게 무작위 버프를 1개 1턴 간 부여', 'assets/dolls/doll-008.jpg', 8, ARRAY['응급 회복']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('882e77af-a7dd-5ed3-97ed-3142b8b7ec8a'::uuid, 'doll-009', '수오미', '기관단총', '빙결', '', '사명의 가호', '체력이 80% 미만일 때 자신의 최대 체력 15%를 회복하고 방어 상승Ⅲ 효과를 2턴 간 얻는다. 전투마다 1회 적용', 'assets/dolls/doll-009.jpg', 9, ARRAY['빙점 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('d74d53c8-09c2-54db-9365-2f62ae3ca245'::uuid, 'doll-010', '파파샤', '기관단총', '물리', '', '화려한 훈장', '자신 이외의 아군 유닛이 지원 공격으로 주는 피해 +10%. 턴당 최대 1회 적용.', 'assets/dolls/doll-010.jpg', 10, ARRAY['실탄 증폭','정점 소환']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('39ba7cb7-f42f-5e54-a222-760d8af4f355'::uuid, 'doll-011', '벡터', '기관단총', '연소', '', '장례의 종', '턴 시작 시 필드에 연소계 디버프를 가진 적 유닛이 존재할 경우 공격 +8%.', 'assets/dolls/doll-011.jpg', 11, ARRAY['작열 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('b59648fb-1e6a-592e-9f42-34a72a3c1140'::uuid, 'doll-012', '조휘', '기관단총', '탁류', '', '소나 음역', '턴 시작 시 다음 액티브 공격의 치명피해 +10%.', 'assets/dolls/doll-012.jpg', 12, ARRAY['격류 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('feaaa0e4-fd63-59b1-a51b-2187a4346186'::uuid, 'doll-013', '페리', '기관단총', '연소', '', '꾸준히 성장 중', '같은 적을 여러 번 공격할 때 주는 위상 피해 +10%.', 'assets/dolls/doll-013.jpg', 13, ARRAY['작열 증폭']::text[], ARRAY['공격 보너스','체력','체력 보너스','치명타 피해']::text[], ARRAY['공격 보너스','체력','체력 보너스']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('2bf12aa4-afa8-577f-8fc5-029b76d9a32f'::uuid, 'doll-014', '리바', '기관단총', '전도', '', '에이스 요원', '전도계 디버프를 가진 적에게 주는 피해 +7%.', 'assets/dolls/doll-014.jpg', 14, ARRAY['자력 증폭','육박 강공']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('edcd121a-47d6-5cee-852c-2b5aa0c41c5b'::uuid, 'doll-015', '레나', '기관단총', '전도', '', '날카로운 발톱', '단일 피해를 준 후, 대상에게 통전 효과를 1턴간 부여한다. 턴당 최대 2회 적용.', 'assets/dolls/doll-015.jpg', 15, ARRAY['자력 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('03eb8c6f-7878-53fc-b030-ac44437c30d2'::uuid, 'doll-016', '로벨라', '기관단총', '빙결', '', '정의의 수호', '자신이 보호막계 효과를 보유 중일 경우 주는 위상 피해 +10%.', 'assets/dolls/doll-016.jpg', 16, ARRAY['빙점 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('1e9a9788-cbdc-5834-975f-7b72c009ddec'::uuid, 'doll-017', '사쿠라', '기관단총', '연소', '', '에이스 택배원', '디버프를 가진 적에게 주는 범위 피해 +10%.', 'assets/dolls/doll-017.jpg', 17, ARRAY['작열 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('d4a800e8-9c17-5b7d-ad8f-f6910ae67d3d'::uuid, 'doll-018', '레이니', '기관단총', '물리', '3돌 이상은 공격, 공격보너스, 체력 보너스', '완전 해방', '방어력이 0 이하인 적에게 주는 피해 +10%.', 'assets/dolls/doll-018.jpg', 18, ARRAY['실탄 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('a74bd75b-55cf-550f-8511-783e6f770ee4'::uuid, 'doll-019', '하프시', '기관단총', '산성', '', '믿음직한 기술력', '디버프 효과를 부여한 후, 1개 전체턴 동안 주는 피해 +10%.', 'assets/dolls/doll-019.jpg', 19, ARRAY['강산 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('84dae365-4c43-5260-879e-3dd19ad13364'::uuid, 'doll-020', '미틸', '기관단총', '탁류', '', '영리한 미틸', '피해를 줄 때 자신이 탁류 타일 위에 있을 경우, 주는 피해 +10%.', 'assets/dolls/doll-020.jpg', 20, ARRAY['정점 소환']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('ae8cac70-75ba-52fd-9109-540a358b973d'::uuid, 'doll-021', '네메시스', '저격소총', '산성', '', '샛별의 축복', '액티브 공격으로 적 처치 시, 자신이 통찰 효과를 가지고 있으면, 추가 이동 3칸을 얻는다.', 'assets/dolls/doll-021.jpg', 21, ARRAY['위상 타격']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('3b371e6d-c8e9-5491-b622-0474714bc35a'::uuid, 'doll-022', '모신나강', '저격소총', '전도', '', '날카로운 간파', '통찰 보유 시 주는 피해 +7%.', 'assets/dolls/doll-022.jpg', 22, ARRAY['자력 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('f11a234d-6309-5f6d-870a-c6f887d91ca6'::uuid, 'doll-023', '마키아토', '저격소총', '빙결', '', '생존본능', '행동 시작 시 자신의 체력이 80%보다 높을 경우, 공격 받을 시 받는 안정 피해 -2점, 턴당 최대 1회 적용.', 'assets/dolls/doll-023.jpg', 23, ARRAY['빙점 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('e29d9c4a-8a9b-53dc-8973-ea4704479f3a'::uuid, 'doll-024', '드셰브니', '저격소총', '빙결', '', '예술적 영감', '이동력이 자신 이하이거나 이동하지 못하는 대상에게 주는 위상 속성 피해 +10%.', 'assets/dolls/doll-024.jpg', 24, ARRAY['빙점 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('fee46b7d-5445-5d54-bba1-48befbc94f16'::uuid, 'doll-025', '스프링필드', '저격소총', '탁류', '', '빈틈없이', '턴 시작 시, 자신의 안정 지수가 가득 차 있지 않을 경우 지속 안정화Ⅱ효과를 1턴간 얻는다.', 'assets/dolls/doll-025.jpg', 25, ARRAY['격류 증폭','정점 소환']::text[], ARRAY['체력','체력 보너스','치명타','치명타 피해']::text[], ARRAY['체력','체력 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('e5a7b973-9014-5347-b597-99a39cf72fd8'::uuid, 'doll-026', '니키타', '저격소총', '탁류', '', '바른 길의 수호자', '자신이 탁류 버프를 가진 경우, 치명률 +10%.', 'assets/dolls/doll-026.jpg', 26, ARRAY['격류 증폭','정점 소환']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('efd5373b-a2c8-52cc-b2e6-6a29dc5ec7ee'::uuid, 'doll-027', '로렐라이', '저격소총', '연소', '', '만족스러운 입김', '자신이 연소계 버프를 가진 경우, 치명률 +10%.', 'assets/dolls/doll-027.jpg', 27, ARRAY['작열 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('83906dc7-e7fe-5266-a8e8-0867dcf928c0'::uuid, 'doll-028', '샤이엔', '저격소총', '물리', '', '사랑은 그리운 재회', '현재 체력이 자신보다 높은 대상에게 주는 피해 +10%.', 'assets/dolls/doll-028.jpg', 28, ARRAY['실탄 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('57c56c2f-05a3-522d-99a5-a09cff5bff0d'::uuid, 'doll-029', '류시', '저격소총', '탁류', '', '남다른 자본력', '자신의 실체 소환물이 주는 피해 +10%.', 'assets/dolls/doll-029.jpg', 29, ARRAY['격류 증폭','정점 소환']::text[], ARRAY['체력','체력 보너스','치명타','치명타 피해']::text[], ARRAY['체력','체력 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('371a9f5c-5a0c-5cab-bc11-f9509f4cbc0e'::uuid, 'doll-030', '네메시스·연광', '저격소총', '산성', '', '복수의 의지', '전투 시작 시, 필드 위에 저격소총을 사용하는 아군 인형이 2기 또는 산성 아군 인형이 2기 존재할 경우, 자신이 주는 피해 +10%.', 'assets/dolls/doll-030.jpg', 30, ARRAY['강산 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('d6de894d-a682-563f-a90e-fcee3373e088'::uuid, 'doll-031', '그로자', '돌격소총', '물리', '', '지속 운행', '엄호 보유 시, 이동 효과를 1회 무시한다. 쿨타임 1턴.', 'assets/dolls/doll-031.jpg', 31, ARRAY['실탄 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('a7630f0b-8b29-5167-98e5-ca86fa599743'::uuid, 'doll-032', '샤크리', '돌격소총', '연소', '', '오프닝 불꽃쇼', '버프를 2개 이상 가졌을 때, 주는 피해 +7%.', 'assets/dolls/doll-032.jpg', 32, ARRAY['작열 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('e9d1d191-a529-5bd9-9879-3b9e82c26bb8'::uuid, 'doll-033', '토로로', '돌격소총', '탁류', '', '여휘', '리몰딩 지수가 최대치가 아닐 때 주는 피해 +7%.', 'assets/dolls/doll-033.jpg', 33, ARRAY['격류 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('26e8d723-1d65-56cf-a0f6-0cc23213616b'::uuid, 'doll-034', '경구', '돌격소총', '연소', '', '완고한 담판', '자신의 행동 턴 외에서 주는 피해 +7%.', 'assets/dolls/doll-034.jpg', 34, ARRAY['작열 증폭','전술 연산']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('85c6965b-08dd-5720-aacf-02a6fbaaaaee'::uuid, 'doll-035', '대연', '돌격소총', '물리', '', '청명하고 날카롭게', '행동 시작 시, 이동 증가Ⅰ 효과를 1턴 간 얻는다. 쿨타임 1턴.', 'assets/dolls/doll-035.jpg', 35, ARRAY['실탄 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('8c9fd0b1-f280-57b3-bc5b-439bc46a16eb'::uuid, 'doll-036', '센타우레이시', '돌격소총', '연소', '', '온음료 준비는 필수', '행동 종료 시, 가장 가까운 온열 회복이 없는 아군 유닛에게 온열 회복을 부여한다. 쿨타임 2턴.', 'assets/dolls/doll-036.jpg', 36, ARRAY['작열 증폭','응급 회복']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('2993e48c-8296-5318-b6a4-61b3e2464f0d'::uuid, 'doll-037', '클루카이', '돌격소총', '산성', '', '반복되는 살의', '턴 시작 시, 자신의 리몰딩 지수가 가득 찬 경우 다음 액티브 공격으로 주는 범위 피해 +10%.', 'assets/dolls/doll-037.jpg', 37, ARRAY['강산 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('7fbbd772-e777-5974-8161-5a594415594a'::uuid, 'doll-038', '미슈티', '돌격소총', '산성', '', '게임할 시간이야', '일반공격이 주는 피해 +20%.', 'assets/dolls/doll-038.jpg', 38, ARRAY['강산 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('b1075ec0-91fe-51b2-84ca-0d66be590c56'::uuid, 'doll-039', '유희', '돌격소총', '물리', '', '메인 댄서의 실력', '탄종 피해를 줄 때, 주는 피해 +10%.', 'assets/dolls/doll-039.jpg', 39, ARRAY['실탄 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('6320cefa-64c8-5aa0-9b77-891e7f9875f2'::uuid, 'doll-040', '비욜카', '돌격소총', '전도', '', '총애 쟁탈전', '이동력을 소모한 직후 공격으로 주는 피해 +10%.', 'assets/dolls/doll-040.jpg', 40, ARRAY['자력 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('04d3744c-8833-5d3a-8dfa-ef87110fa9ab'::uuid, 'doll-041', '안도리스', '돌격소총', '전도', '', '감성 자기장', '턴 시작 시 필드에 존재하는 전도계 디버프 하나마다 자신이 주는 피해 +5%, 최대 +10%. 전체턴 종료 시까지 지속.', 'assets/dolls/doll-041.jpg', 41, ARRAY['정점 소환']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('c5e8c13c-1f11-572c-b462-dc4586025cf1'::uuid, 'doll-042', '강우', '돌격소총', '전도', '', '설득 (물리)', '안정 붕괴된 적에게 주는 피해 +10%.', 'assets/dolls/doll-042.jpg', 42, ARRAY['자력 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('3d2dbf95-d03f-5b33-9427-49a621795247'::uuid, 'doll-043', '앨바', '돌격소총', '빙결', '', '심안', '보호막을 가진 적에게 주는 위상 피해 +10%.', 'assets/dolls/doll-043.jpg', 43, ARRAY['빙점 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('d55aa01f-c063-5598-ad65-885dfa1c7898'::uuid, 'doll-044', '보이마스티나', '돌격소총', '물리', '', '파열의 레가토', '근접 피해를 줄 때, 1개 전체 턴 동안 물리 피해 +10%.', 'assets/dolls/doll-044.jpg', 44, ARRAY['육박 강공']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('6b559969-3c50-52ea-901c-50d812b815ad'::uuid, 'doll-045', 'OTs-14', '돌격소총', '공진', '물리 속성 제외', '오만의 기원', '자신이 주는 고정 피해 +10%.', 'assets/dolls/doll-045.jpg', 45, ARRAY['육박 강공']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('5c4e8df4-d232-51e3-837e-2370f5af1e3b'::uuid, 'doll-046', '소프', '돌격소총', '빙결', '', '야성의 부름', '빙결 또는 연소계 타일 위에 있는 적 유닛을 공격 시, 주는 위상 피해 +10%.', 'assets/dolls/doll-046.jpg', 46, ARRAY['위상 타격']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('2f624fc9-ef76-5d07-a59d-d167ffe30ad3'::uuid, 'doll-047', '페일린', '돌격소총', '산성', '', '맹견의 위엄', '턴 시작 시, 자신이 3레벨 위상 타일에 위치해 있으면, 1개 전체 턴 동안 주는 범위 피해 +10%.', 'assets/dolls/doll-047.jpg', 47, ARRAY['강산 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('80307db9-b808-5062-a4a7-c52e10465aa3'::uuid, 'doll-048', '콜레다', '돌격소총', '탁류', '', '살육의 시야', '자신 또는 자신의 실체 소환물의 이동력이 목표와 같거나 더 높을 경우 주는 피해 +10%.', 'assets/dolls/doll-048.jpg', 48, ARRAY['정점 소환']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('4cf8b6a2-d3f4-5834-be40-f44767192e2d'::uuid, 'doll-049', '아스테리아', '돌격소총', '물리', '', '', '', '', 49, '{}'::text[], '{}'::text[], '{}'::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('2977f035-2096-5782-84e5-294805920ff5'::uuid, 'doll-050', '리타라', '기관총', '물리', '', '약점 격파', '방어 디버프를 가진 적에게 주는 피해 +7%.', 'assets/dolls/doll-050.jpg', 50, ARRAY['실탄 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('ca8dc316-59c8-502d-9baf-9330029ea024'::uuid, 'doll-051', '페리티아', '기관총', '산성', '', '화력 올인', '액티브 스킬로 적을 2기 이상 명중할 경우 주는 피해 +7%.', 'assets/dolls/doll-051.jpg', 51, ARRAY['강산 증폭','전술 연산']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('772c23bb-ee1b-532b-a72f-b58b6819783a'::uuid, 'doll-052', '루이스', '기관총', '연소', '', '미라클 슈퍼파워', '결전기로 주는 피해 +10%.', 'assets/dolls/doll-052.jpg', 52, ARRAY['작열 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('4f20bf0d-d52f-5827-a51c-cf7ce81bf5ce'::uuid, 'doll-053', '바틸다', '기관총', '물리', '', '숙련 장인', '자신의 실체 소환물의 방어력 +7%.', 'assets/dolls/doll-053.jpg', 53, ARRAY['정점 소환']::text[], ARRAY['공격 보너스','방어 보너스','치명타','치명타 피해']::text[], ARRAY['공격 보너스','방어 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('b5d21929-1999-5467-bf41-07c7b9766b74'::uuid, 'doll-054', '롯타', '산탄총', '빙결', '', '사냥 함정', '이동 디버프를 가진 적에게 주는 피해 +7%.', 'assets/dolls/doll-054.jpg', 54, ARRAY['빙점 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('bdc96a67-e56b-5117-84ac-6ca01ebf9ac9'::uuid, 'doll-055', '베프리', '산탄총', '물리', '', '하트에 직격', '이동력이 목표와 같거나 더 높을 경우 주는 피해 +7%.', 'assets/dolls/doll-055.jpg', 55, ARRAY['실탄 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('0ffa35a7-83a8-5619-b25a-efebad2e808b'::uuid, 'doll-056', '사브리나', '산탄총', '탁류', '', '고온유 방호', '단일 피해를 줄 때, 대상에게 이동 감소Ⅱ효과를 1턴 간 부여한다.', 'assets/dolls/doll-056.jpg', 56, ARRAY['격류 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('b1be1a70-345c-522a-aa8a-b500b5a17ab9'::uuid, 'doll-057', '추화', '산탄총', '연소', '', '정성 가득한 미식', '턴 외 공격으로 연소 피해를 줄 때, 주는 피해 +10%.', 'assets/dolls/doll-057.jpg', 57, ARRAY['작열 증폭','전술 연산']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('07a64366-33d1-5180-a5ab-1a1ac1b27a91'::uuid, 'doll-058', '린드', '산탄총', '산성', '', '긴 밤은 끝나지 않고', '디버프를 가진 적 유닛을 공격할 때 주는 위상 피해 +10%.', 'assets/dolls/doll-058.jpg', 58, ARRAY['강산 증폭']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('7dd74883-9e67-5f9a-9669-577b6b5abaf2'::uuid, 'doll-059', '헬렌', '산탄총', '빙결', '', '부동의 방어선', '자신의 방어력이 대상의 방어력 이상일 경우, 주는 피해 +10%.', 'assets/dolls/doll-059.jpg', 59, ARRAY['빙점 증폭']::text[], ARRAY['공격 보너스','방어','방어 보너스','치명타 피해']::text[], ARRAY['공격 보너스','방어','방어 보너스']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('51fa7718-e6ee-52d9-9b02-ff8f15707007'::uuid, 'doll-060', '캐롤릭', '도검', '연소', '', '폭력의 미학', '자신이 연소계 버프를 보유 시, 응고, 결빙 효과를 받지 않고, 주는 피해 +5%.', 'assets/dolls/doll-060.jpg', 60, ARRAY['육박 강공']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('6944315c-edb5-538c-b9c6-5cc2c88a82b6'::uuid, 'doll-061', '울리드', '도검', '물리', '', '상처 찢기', '공격 전 대상의 체력이 최대치가 아닐 경우 주는 피해 +7%.', 'assets/dolls/doll-061.jpg', 61, ARRAY['육박 강공']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('5d2f5819-6502-5ff0-b50d-5fc7fcf09fc1'::uuid, 'doll-062', '파에투사', '도검', '산성', '', '무에서 유를', '현재 전체 턴에서 리몰딩 지수가 0이 된 이후, 주는 피해 +10%.', 'assets/dolls/doll-062.jpg', 62, ARRAY['육박 강공']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

insert into public.dolls
(id, slug, name, weapon_type, attribute, default_note, common_key, common_key_effect, image_url, display_order, recommended_sets, recommended_muzzle, recommended_parts)
values ('d6723d9f-eaef-54f0-95e6-be84b40027ef'::uuid, 'doll-063', '섹스턴스', '도검', '전도', '', '손바닥의 성흔', '주는 근접 피해 +10%.', 'assets/dolls/doll-063.jpg', 63, ARRAY['육박 강공']::text[], ARRAY['공격','공격 보너스','치명타','치명타 피해']::text[], ARRAY['공격','공격 보너스','치명타']::text[])
on conflict (name) do update set
 slug=excluded.slug, name=excluded.name, weapon_type=excluded.weapon_type, attribute=excluded.attribute,
 default_note=excluded.default_note, common_key=excluded.common_key, common_key_effect=excluded.common_key_effect,
 image_url=excluded.image_url, display_order=excluded.display_order,
 recommended_sets=excluded.recommended_sets, recommended_muzzle=excluded.recommended_muzzle,
 recommended_parts=excluded.recommended_parts, is_active=true;

commit;