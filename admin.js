'use strict';

const cfg = window.GF2_CONFIG || {};
let db = null;
let session = null;
let dolls = [];
let editingImageUrl = '';
const THEME_STORAGE_KEY = 'gf2-ui-theme-v1';

const $ = id => document.getElementById(id);

function toast(message, isError = false) {
  const el = $('toast');
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2400);
}

function splitOptions(value, max = Infinity) {
  return [...new Set(String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean))]
    .slice(0, max);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function imageSource(url) {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return new URL(url.replace(/^\//, ''), location.href).href;
}

async function init() {
  bindEvents();

  if (!cfg.supabaseUrl || !cfg.supabasePublishableKey || cfg.supabaseUrl.includes('YOUR_PROJECT')) {
    $('authState').textContent = 'config.js 설정이 필요합니다.';
    $('notice').textContent = 'config.js에 Supabase Project URL과 Publishable key를 입력해주세요.';
    return;
  }

  db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
  const { data: { session: currentSession } } = await db.auth.getSession();
  await applySession(currentSession);
  db.auth.onAuthStateChange((_event, nextSession) => {
    setTimeout(() => applySession(nextSession), 0);
  });
}

function bindEvents() {
  $('themeToggleButton').addEventListener('click', toggleTheme);
  updateThemeButton();
  $('loginButton').addEventListener('click', handleLogin);
  $('clearButton').addEventListener('click', clearForm);
  $('dollForm').addEventListener('submit', saveDoll);
  $('dollList').addEventListener('click', handleListClick);
}

function updateThemeButton() {
  const light = document.documentElement.dataset.theme === 'light';
  $('themeToggleButton').textContent = light ? '🌙 어두운 화면' : '☀ 밝은 화면';
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch (_) {}
  updateThemeButton();
}

async function handleLogin() {
  if (!db) return;

  if (session) {
    await db.auth.signOut();
    return;
  }

  const email = prompt('관리자 로그인 링크를 받을 이메일 주소를 입력해주세요.');
  if (!email) return;

  const redirectTo = new URL('admin.html', location.href).href;
  const { error } = await db.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: redirectTo }
  });

  if (error) {
    toast(error.message || '로그인 메일 발송에 실패했습니다.', true);
    return;
  }
  toast('이메일로 관리자 로그인 링크를 보냈습니다.');
}

async function applySession(nextSession) {
  session = nextSession;
  $('loginButton').textContent = session ? '로그아웃' : '이메일 로그인';
  $('adminApp').hidden = true;

  if (!session) {
    $('authState').textContent = '로그인하지 않음';
    $('notice').textContent = '관리자 계정으로 로그인해야 인형 DB와 일러스트를 수정할 수 있습니다.';
    return;
  }

  $('authState').textContent = `${session.user.email || '관리자 계정'} · 권한 확인 중`;
  const { data, error } = await db
    .from('app_admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .limit(1);

  if (error) {
    $('authState').textContent = '관리자 권한 확인 실패';
    $('notice').textContent = error.message;
    return;
  }

  if (!data?.length) {
    $('authState').textContent = `${session.user.email || '로그인됨'} · 일반 계정`;
    $('notice').textContent = '로그인은 되었지만 관리자 목록에 등록되지 않았습니다. promote-admin.sql을 실행한 뒤 새로고침하세요.';
    return;
  }

  $('authState').textContent = `${session.user.email || '관리자'} · 관리자`;
  $('notice').textContent = '인형 공용 DB와 일러스트를 관리합니다. 일반 이용자 개인 진행 데이터에는 접근하지 않습니다.';
  $('adminApp').hidden = false;
  await loadDolls();
}

async function loadDolls() {
  const { data, error } = await db
    .from('dolls')
    .select('*')
    .order('display_order', { ascending: false })
    .order('name', { ascending: false });

  if (error) {
    toast(error.message || '인형 목록을 불러오지 못했습니다.', true);
    return;
  }

  dolls = data || [];
  renderDolls();
}

function renderDolls() {
  $('count').textContent = `${dolls.length}명`;
  const list = $('dollList');

  if (!dolls.length) {
    list.innerHTML = '<div class="empty">등록된 인형이 없습니다.</div>';
    return;
  }

  list.innerHTML = dolls.map(doll => {
    const src = imageSource(doll.image_url);
    const image = src
      ? `<img class="thumb" src="${escapeHtml(src)}" alt="" onerror="this.style.visibility='hidden'">`
      : '<div class="thumb"></div>';
    return `
      <article class="row" data-id="${escapeHtml(doll.id)}">
        ${image}
        <div>
          <div class="name">${escapeHtml(doll.name)}</div>
          <div class="meta">${escapeHtml(doll.weapon_type)} · ${escapeHtml(doll.attribute || '속성 없음')} · 순서 ${Number(doll.display_order || 0)}</div>
          <div class="meta">${doll.is_active ? '사이트 표시 중' : '비활성'}</div>
        </div>
        <div class="row-actions">
          <button type="button" data-action="edit">수정</button>
          <button type="button" class="danger" data-action="delete">삭제</button>
        </div>
      </article>`;
  }).join('');
}

function handleListClick(event) {
  const button = event.target.closest('[data-action]');
  const row = event.target.closest('[data-id]');
  if (!button || !row) return;

  const doll = dolls.find(item => item.id === row.dataset.id);
  if (!doll) return;

  if (button.dataset.action === 'edit') fillForm(doll);
  if (button.dataset.action === 'delete') deleteDoll(doll);
}

function fillForm(doll) {
  $('formTitle').textContent = `${doll.name} 수정`;
  $('id').value = doll.id;
  $('name').value = doll.name || '';
  $('slug').value = doll.slug || '';
  $('weapon').value = doll.weapon_type || '';
  $('attribute').value = doll.attribute || '';
  $('sets').value = (doll.recommended_sets || []).join(', ');
  $('muzzle').value = (doll.recommended_muzzle || []).join(', ');
  $('parts').value = (doll.recommended_parts || []).join(', ');
  $('note').value = doll.default_note || '';
  $('commonKey').value = doll.common_key || '';
  $('commonEffect').value = doll.common_key_effect || '';
  $('order').value = Number(doll.display_order || 0);
  $('active').checked = Boolean(doll.is_active);
  $('image').value = '';
  $('removeImage').checked = false;
  editingImageUrl = doll.image_url || '';
  $('name').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearForm() {
  $('dollForm').reset();
  $('id').value = '';
  $('order').value = 999;
  $('active').checked = true;
  $('removeImage').checked = false;
  $('formTitle').textContent = '새 인형 추가';
  editingImageUrl = '';
}

async function uploadImage(file, slug) {
  if (!file) return editingImageUrl;
  if (file.size > 5 * 1024 * 1024) throw new Error('이미지는 5MB 이하로 올려주세요.');

  const extension = (file.name.split('.').pop() || 'webp').toLowerCase().replace(/[^a-z0-9]/g, '') || 'webp';
  const safeSlug = slug.replace(/[^a-z0-9-]/g, '-');
  const path = `${safeSlug}/${Date.now()}.${extension}`;
  const { error } = await db.storage.from('doll-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined
  });
  if (error) throw error;

  const { data } = db.storage.from('doll-images').getPublicUrl(path);
  return data.publicUrl;
}

async function saveDoll(event) {
  event.preventDefault();
  if (!session) return;

  const id = $('id').value.trim();
  const name = $('name').value.trim();
  const slug = $('slug').value.trim().toLowerCase();
  if (!name || !slug) {
    toast('인형 이름과 슬러그를 입력해주세요.', true);
    return;
  }

  try {
    let imageUrl = $('removeImage').checked ? '' : editingImageUrl;
    if ($('image').files?.[0]) imageUrl = await uploadImage($('image').files[0], slug);
    const payload = {
      slug,
      name,
      weapon_type: $('weapon').value.trim(),
      attribute: $('attribute').value.trim(),
      recommended_sets: splitOptions($('sets').value),
      recommended_muzzle: splitOptions($('muzzle').value, 4),
      recommended_parts: splitOptions($('parts').value, 3),
      default_note: $('note').value.trim(),
      common_key: $('commonKey').value.trim(),
      common_key_effect: $('commonEffect').value.trim(),
      display_order: Number($('order').value || 0),
      image_url: imageUrl || '',
      is_active: $('active').checked
    };

    const query = id
      ? db.from('dolls').update(payload).eq('id', id)
      : db.from('dolls').insert(payload);
    const { error } = await query;
    if (error) throw error;

    toast(id ? '인형 정보를 수정했습니다.' : '새 인형을 추가했습니다.');
    clearForm();
    await loadDolls();
  } catch (error) {
    console.error(error);
    toast(error.message || '저장하지 못했습니다.', true);
  }
}

async function deleteDoll(doll) {
  if (!confirm(`${doll.name}을(를) DB에서 삭제할까요?\n일반적으로는 수정 화면에서 “사이트에 표시”를 끄는 편이 안전합니다.`)) return;
  const { error } = await db.from('dolls').delete().eq('id', doll.id);
  if (error) {
    toast(error.message || '삭제하지 못했습니다.', true);
    return;
  }
  toast('인형을 삭제했습니다.');
  if ($('id').value === doll.id) clearForm();
  await loadDolls();
}

init();
