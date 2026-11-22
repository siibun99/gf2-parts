'use strict';
(function (root) {
  const PREFIX = 'gf2-personal-farming-v2-supabase:guest';
  const key = profile => profile === 1 ? PREFIX : `${PREFIX}:page-${profile}`;
  const forbidden = new Set(['__proto__', 'constructor', 'prototype']);
  function validate(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('저장 데이터 형식이 올바르지 않습니다.');
    for (const [id, record] of Object.entries(data)) {
      if (forbidden.has(id) || !record || typeof record !== 'object' || Array.isArray(record)) throw Error('인형 기록 형식이 올바르지 않습니다.');
      if (record.status != null && !['none', 'tracked', 'unowned', 'completed'].includes(record.status)) throw Error('알 수 없는 인형 상태입니다.');
      if (record.personalNote != null && (typeof record.personalNote !== 'string' || record.personalNote.length > 10000)) throw Error('개인 비고 형식이 올바르지 않습니다.');
      for (const field of ['setOptions', 'muzzle']) {
        if (record[field] != null && (!Array.isArray(record[field]) || record[field].length > (field === 'muzzle' ? 4 : 100) || record[field].some(x => typeof x !== 'string' || x.length > 100))) throw Error('옵션 형식이 올바르지 않습니다.');
      }
      if (record.parts != null && (!Array.isArray(record.parts) || record.parts.length !== 3 || record.parts.some(row => !Array.isArray(row) || row.length > 3 || row.some(x => typeof x !== 'string' || x.length > 100)))) throw Error('파츠 형식이 올바르지 않습니다.');
      if (record.done != null && (!record.done || typeof record.done !== 'object' || Array.isArray(record.done) || Object.values(record.done).some(x => typeof x !== 'boolean'))) throw Error('완료 체크 형식이 올바르지 않습니다.');
    }
    return data;
  }
  function read(storage, profile) {
    const raw = storage.getItem(key(profile));
    return { raw, data: validate(raw == null ? {} : JSON.parse(raw)) };
  }
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function merge(base, proposed, latest) {
    validate(proposed);
    const result = { ...latest };
    for (const id of new Set([...Object.keys(base), ...Object.keys(proposed)])) {
      if (same(base[id], proposed[id])) continue;
      if (!same(base[id], latest[id]) && !same(proposed[id], latest[id])) throw Error('다른 탭에서 같은 인형을 수정했습니다. 최신 기록을 다시 불러온 뒤 수정해주세요.');
      if (Object.hasOwn(proposed, id)) result[id] = proposed[id];
      else delete result[id];
    }
    return result;
  }
  async function commit(storage, locks, profile, baseline, proposed, replace = false) {
    if (!baseline) throw Error('기록을 읽지 못해 저장을 중단했습니다. 원본을 내려받고 백업을 복원해주세요.');
    if (!locks?.request) throw Error('이 브라우저에서는 안전한 다중 탭 저장을 지원하지 않습니다. 최신 브라우저에서 열어주세요.');
    return locks.request(key(profile), () => {
      const latest = read(storage, profile);
      let data;
      if (replace) {
        if (latest.raw !== baseline.raw) throw Error('다른 탭에서 기록이 변경되었습니다. 다시 불러온 후 시도해주세요.');
        data = validate(proposed);
        storage.setItem(`${key(profile)}:before-restore`, latest.raw ?? '{}');
      } else data = merge(baseline.data, proposed, latest.data);
      const raw = JSON.stringify(data);
      storage.setItem(key(profile), raw);
      return { raw, data };
    });
  }
  async function recover(storage, locks, profile, proposed, expectedRaw) {
    validate(proposed);
    if (!locks?.request) throw Error('안전한 복원을 지원하지 않는 브라우저입니다.');
    return locks.request(key(profile), () => {
      const raw = storage.getItem(key(profile));
      if (raw !== expectedRaw) throw Error('미리보기 이후 다른 탭에서 기록을 변경했습니다. 파일을 다시 선택해주세요.');
      storage.setItem(`${key(profile)}:before-restore`, raw ?? '{}');
      const next = JSON.stringify(proposed);
      storage.setItem(key(profile), next);
      return { raw: next, data: proposed };
    });
  }
  root.GF2Store = { key, validate, read, merge, commit, recover };
})(typeof window === 'undefined' ? globalThis : window);
