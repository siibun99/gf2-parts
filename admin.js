'use strict';

const cfg = window.GF2_CONFIG || {};
const THEME_STORAGE_KEY = 'gf2-ui-theme-v1';
const PORTRAIT_DEFAULT = Object.freeze({ x: 0, y: -7, zoom: 250 });
const PORTRAIT_ORIGINAL = Object.freeze({ x: 0, y: 0, zoom: 0 });
let db = null;
let session = null;
let dolls = [];
let dollSearchQuery = '';
let editingImageUrl = '';
let previewObjectUrl = '';
let portraitDrag = null;
let panelHeightFrame = 0;
let editorPanelObserver = null;

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

function applyTheme(theme, persist = true) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  const icon = $('themeToggleIcon');
  const button = $('themeToggleButton');

  if (icon) icon.textContent = next === 'dark' ? '☀' : '🌙';
  if (button) {
    const label = next === 'dark' ? '밝은 화면으로 전환' : '어두운 화면으로 전환';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }

  if (persist) {
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch (_) {}
  }
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
}

function clearPreviewObjectUrl() {
  if (!previewObjectUrl) return;
  URL.revokeObjectURL(previewObjectUrl);
  previewObjectUrl = '';
}

function setImagePreview(url = '', stateText = '') {
  const preview = $('imagePreview');
  const image = $('imagePreviewImage');
  const fallback = $('imagePreviewFallback');
  const resolved = imageSource(url);

  if (!preview || !image || !fallback) return;

  if (!resolved) {
    image.hidden = true;
    image.removeAttribute('src');
    preview.classList.remove('has-image');
    fallback.hidden = false;
    $('imageStateText').textContent = stateText || 'PNG, JPEG, WebP · 최대 5MB';
    return;
  }

  image.hidden = false;
  image.src = resolved;
  image.onload = () => {
    preview.classList.add('has-image');
    fallback.hidden = true;
  };
  image.onerror = () => {
    image.hidden = true;
    preview.classList.remove('has-image');
    fallback.hidden = false;
  };
  $('imageStateText').textContent = stateText || '현재 등록된 일러스트';
}

function handleImageSelection() {
  clearPreviewObjectUrl();
  const file = $('image').files?.[0];
  if (!file) {
    setImagePreview($('removeImage').checked ? '' : editingImageUrl);
    return;
  }

  $('removeImage').checked = false;
  previewObjectUrl = URL.createObjectURL(file);
  setImagePreview(previewObjectUrl, `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)}MB`);
}

function handleRemoveImageToggle() {
  if ($('removeImage').checked) {
    $('image').value = '';
    clearPreviewObjectUrl();
    setImagePreview('', '저장하면 현재 일러스트가 제거됩니다.');
  } else {
    setImagePreview(editingImageUrl);
  }
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function updatePortraitPreviewTransform() {
  const offsetX = clampNumber($('portraitOffsetX').value, 0, -50, 50);
  const offsetY = clampNumber($('portraitOffsetY').value, PORTRAIT_DEFAULT.y, -50, 50);
  const zoomPercent = clampNumber($('portraitScale').value, PORTRAIT_DEFAULT.zoom, -40, 500);
  const preview = $('imagePreview');
  const scale = Math.max(.6, 1 + zoomPercent / 100);

  preview.style.setProperty('--preview-x', `${offsetX}%`);
  preview.style.setProperty('--preview-y', `${offsetY}%`);
  preview.style.setProperty('--preview-scale', String(scale));
  $('portraitOffsetXValue').textContent = `${offsetX}%`;
  $('portraitOffsetYValue').textContent = `${offsetY}%`;
  $('portraitScaleValue').textContent = `${zoomPercent}%`;
}

function normalizePortraitValues(doll = null) {
  const rawScale = Number(doll?.portrait_scale);
  const legacy = Number.isFinite(rawScale) && rawScale >= .6 && rawScale <= 1.6;
  return {
    x: clampNumber(doll?.portrait_offset_x, PORTRAIT_DEFAULT.x, -50, 50),
    y: clampNumber(
      legacy ? Number(doll?.portrait_offset_y || 0) - 7 : doll?.portrait_offset_y,
      PORTRAIT_DEFAULT.y,
      -50,
      50
    ),
    zoom: clampNumber(
      legacy ? rawScale * 350 - 100 : doll?.portrait_scale,
      PORTRAIT_DEFAULT.zoom,
      -40,
      500
    )
  };
}

function setPortraitPreset(values) {
  $('portraitOffsetX').value = String(values.x);
  $('portraitOffsetY').value = String(values.y);
  $('portraitScale').value = String(values.zoom);
  updatePortraitPreviewTransform();
}

function setPortraitControls(doll = null) {
  setPortraitPreset(doll ? normalizePortraitValues(doll) : PORTRAIT_DEFAULT);
}

function handlePortraitPointerDown(event) {
  if (event.button !== 0 || $('imagePreviewImage').hidden) return;
  const preview = $('imagePreview');
  const rect = preview.getBoundingClientRect();
  portraitDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startOffsetX: clampNumber($('portraitOffsetX').value, 0, -50, 50),
    startOffsetY: clampNumber($('portraitOffsetY').value, PORTRAIT_DEFAULT.y, -50, 50),
    width: Math.max(1, rect.width),
    height: Math.max(1, rect.height)
  };
  preview.setPointerCapture?.(event.pointerId);
  preview.classList.add('dragging');
  event.preventDefault();
}

function handlePortraitPointerMove(event) {
  if (!portraitDrag || portraitDrag.pointerId !== event.pointerId) return;
  const nextX = clampNumber(
    portraitDrag.startOffsetX + ((event.clientX - portraitDrag.startX) / portraitDrag.width) * 100,
    portraitDrag.startOffsetX,
    -50,
    50
  );
  const nextY = clampNumber(
    portraitDrag.startOffsetY + ((event.clientY - portraitDrag.startY) / portraitDrag.height) * 100,
    portraitDrag.startOffsetY,
    -50,
    50
  );
  $('portraitOffsetX').value = String(Math.round(nextX));
  $('portraitOffsetY').value = String(Math.round(nextY));
  updatePortraitPreviewTransform();
  event.preventDefault();
}

function endPortraitDrag(event) {
  if (!portraitDrag || (event.pointerId != null && portraitDrag.pointerId !== event.pointerId)) return;
  const preview = $('imagePreview');
  try { preview.releasePointerCapture?.(portraitDrag.pointerId); } catch (_) {}
  preview.classList.remove('dragging');
  portraitDrag = null;
}

function syncAdminPanelHeight() {
  cancelAnimationFrame(panelHeightFrame);
  panelHeightFrame = requestAnimationFrame(() => {
    const app = $('adminApp');
    const editorPanel = document.querySelector('.editor-panel');
    const listPanel = document.querySelector('.list-panel');
    if (!app || !editorPanel || !listPanel || app.hidden) return;

    if (window.matchMedia('(max-width: 900px)').matches) {
      listPanel.style.height = '';
      return;
    }

    const editorHeight = Math.ceil(editorPanel.getBoundingClientRect().height);
    if (editorHeight > 0) listPanel.style.height = `${editorHeight}px`;
  });
}

function observeAdminPanelHeight() {
  const editorPanel = document.querySelector('.editor-panel');
  if (!editorPanel || editorPanelObserver) return;
  editorPanelObserver = new ResizeObserver(syncAdminPanelHeight);
  editorPanelObserver.observe(editorPanel);
  window.addEventListener('resize', syncAdminPanelHeight, { passive: true });
}

async function init() {
  applyTheme(document.documentElement.dataset.theme, false);
  bindEvents();
  setImagePreview('');
  setPortraitControls();
  observeAdminPanelHeight();

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
  $('loginButton').addEventListener('click', handleLogin);
  $('clearButton').addEventListener('click', clearForm);
  $('dollForm').addEventListener('submit', saveDoll);
  $('dollList').addEventListener('click', handleListClick);
  $('dollList').addEventListener('keydown', handleListKeydown);
  $('dollSearch').addEventListener('input', handleDollSearch);
  $('clearSearchButton').addEventListener('click', clearDollSearch);
  $('image').addEventListener('change', handleImageSelection);
  $('removeImage').addEventListener('change', handleRemoveImageToggle);
  ['portraitOffsetX', 'portraitOffsetY', 'portraitScale'].forEach(id => {
    $(id).addEventListener('input', updatePortraitPreviewTransform);
  });
  $('originalPortraitButton').addEventListener('click', () => setPortraitPreset(PORTRAIT_ORIGINAL));
  $('resetPortraitButton').addEventListener('click', () => setPortraitPreset(PORTRAIT_DEFAULT));
  $('imagePreview').addEventListener('pointerdown', handlePortraitPointerDown);
  $('imagePreview').addEventListener('pointermove', handlePortraitPointerMove);
  $('imagePreview').addEventListener('pointerup', endPortraitDrag);
  $('imagePreview').addEventListener('pointercancel', endPortraitDrag);
  $('imagePreview').addEventListener('lostpointercapture', endPortraitDrag);
  $('imagePreviewImage').addEventListener('dragstart', event => event.preventDefault());
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
  syncAdminPanelHeight();
}

async function loadDolls() {
  const { data, error } = await db
    .from('dolls')
    .select('*')
    .order('display_order', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    toast(error.message || '인형 목록을 불러오지 못했습니다.', true);
    return;
  }

  dolls = data || [];
  renderDolls();
  syncAdminPanelHeight();
  if (!$('id').value.trim()) setNewDollDefaults();
}

function normalizeSearch(value) {
  return String(value || '').trim().toLocaleLowerCase('ko-KR');
}

function getFilteredDolls() {
  const query = normalizeSearch(dollSearchQuery);
  if (!query) return dolls;

  return dolls.filter(doll => normalizeSearch([
    doll.name,
    doll.slug,
    doll.weapon_type,
    doll.attribute,
    doll.common_key
  ].filter(Boolean).join(' ')).includes(query));
}

function handleDollSearch(event) {
  dollSearchQuery = event.target.value;
  renderDolls();
}

function clearDollSearch() {
  dollSearchQuery = '';
  $('dollSearch').value = '';
  renderDolls();
  $('dollSearch').focus();
}

function getNextDollDefaults() {
  const slugCandidates = dolls
    .map(doll => String(doll.slug || '').trim().match(/^(.*?)(\d+)$/))
    .filter(Boolean)
    .map(match => ({
      prefix: match[1] || 'doll-',
      digits: match[2],
      number: Number(match[2])
    }))
    .filter(item => Number.isFinite(item.number));

  const latestSlug = slugCandidates.reduce((latest, item) => (
    !latest || item.number > latest.number ? item : latest
  ), null);

  const nextSlugNumber = (latestSlug?.number || 0) + 1;
  const slugPrefix = latestSlug?.prefix || 'doll-';
  const slugWidth = Math.max(latestSlug?.digits.length || 3, 3);

  const maxOrder = dolls.reduce((max, doll) => {
    const order = Number(doll.display_order);
    return Number.isFinite(order) ? Math.max(max, order) : max;
  }, 0);

  return {
    slug: `${slugPrefix}${String(nextSlugNumber).padStart(slugWidth, '0')}`,
    order: maxOrder + 1
  };
}

function setNewDollDefaults() {
  if ($('id').value.trim()) return;
  const next = getNextDollDefaults();
  $('slug').value = next.slug;
  $('order').value = next.order;
}

function renderDolls() {
  const visibleDolls = getFilteredDolls();
  const hasQuery = Boolean(normalizeSearch(dollSearchQuery));
  $('count').textContent = hasQuery
    ? `${visibleDolls.length}/${dolls.length}명`
    : `${dolls.length}명`;
  $('clearSearchButton').disabled = !hasQuery;

  const list = $('dollList');

  if (!dolls.length) {
    list.innerHTML = '<div class="empty">등록된 인형이 없습니다.</div>';
    return;
  }

  if (!visibleDolls.length) {
    list.innerHTML = '<div class="empty">검색 조건에 맞는 인형이 없습니다.</div>';
    return;
  }

  list.innerHTML = visibleDolls.map(doll => {
    const src = imageSource(doll.image_url);
    const portrait = normalizePortraitValues(doll);
    const portraitScale = Math.max(.6, 1 + portrait.zoom / 100);
    const portraitStyle = [
      `--thumb-x:${portrait.x}%`,
      `--thumb-y:${portrait.y}%`,
      `--thumb-scale:${portraitScale}`
    ].join(';');
    const visual = `
      <div class="thumb" style="${portraitStyle}">
        <span>${escapeHtml(doll.name)}</span>
        ${src ? `<span class="thumb-position"><span class="thumb-zoom"><img src="${escapeHtml(src)}" alt="${escapeHtml(doll.name)} 일러스트" onload="this.closest('.thumb')?.classList.add('has-image')" onerror="this.closest('.thumb-position')?.remove()"></span></span>` : ''}
      </div>`;
    const statusClass = doll.is_active ? 'status-active' : 'status-inactive';
    return `
      <article class="row" data-id="${escapeHtml(doll.id)}" tabindex="0" aria-label="${escapeHtml(doll.name)} 수정 정보 열기" title="카드를 클릭하여 수정">
        ${visual}
        <div>
          <div class="name">${escapeHtml(doll.name)}</div>
          <div class="meta">${escapeHtml(doll.slug || '')} · ${escapeHtml(doll.weapon_type)} · ${escapeHtml(doll.attribute || '속성 없음')} · 순서 ${Number(doll.display_order || 0)}</div>
          <div class="meta ${statusClass}">${doll.is_active ? '사이트 표시 중' : '비활성'}</div>
        </div>
        <div class="row-actions">
          <button type="button" data-action="edit">수정</button>
          <button type="button" class="danger" data-action="delete">삭제</button>
        </div>
      </article>`;
  }).join('');
}

function handleListClick(event) {
  const row = event.target.closest('[data-id]');
  if (!row) return;

  const doll = dolls.find(item => item.id === row.dataset.id);
  if (!doll) return;

  const actionButton = event.target.closest('[data-action]');
  if (actionButton?.dataset.action === 'delete') {
    deleteDoll(doll);
    return;
  }

  // 수정 버튼뿐 아니라 카드의 썸네일, 이름, 빈 공간을 눌러도 폼을 연다.
  fillForm(doll);
}

function handleListKeydown(event) {
  if (event.target.closest('button')) return;
  if (event.key !== 'Enter' && event.key !== ' ') return;

  const row = event.target.closest('[data-id]');
  if (!row) return;

  const doll = dolls.find(item => item.id === row.dataset.id);
  if (!doll) return;

  event.preventDefault();
  fillForm(doll);
}

function fillForm(doll) {
  const pageScrollX = window.scrollX;
  const pageScrollY = window.scrollY;
  const list = $('dollList');
  const listScrollTop = list?.scrollTop || 0;

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
  $('removeImage').checked = false;
  $('image').value = '';
  clearPreviewObjectUrl();
  editingImageUrl = doll.image_url || '';
  setImagePreview(editingImageUrl);
  setPortraitControls(doll);

  // 목록에서 선택한 위치를 그대로 유지한다. 폼 입력칸 포커스로 인한 자동 스크롤도 막는다.
  try { $('name').focus({ preventScroll: true }); } catch (_) {}
  requestAnimationFrame(() => {
    if (list) list.scrollTop = listScrollTop;
    window.scrollTo(pageScrollX, pageScrollY);
  });
}

function clearForm() {
  $('dollForm').reset();
  $('id').value = '';
  $('active').checked = true;
  $('removeImage').checked = false;
  $('formTitle').textContent = '새 인형 추가';
  editingImageUrl = '';
  clearPreviewObjectUrl();
  setImagePreview('');
  setPortraitControls();
  observeAdminPanelHeight();
  setNewDollDefaults();
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
    toast('인형 이름과 인형 번호를 입력해주세요.', true);
    return;
  }

  try {
    const file = $('image').files?.[0];
    let imageUrl = $('removeImage').checked ? '' : editingImageUrl;
    if (file) imageUrl = await uploadImage(file, slug);

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
      image_url: imageUrl,
      portrait_scale: clampNumber($('portraitScale').value, PORTRAIT_DEFAULT.zoom, -40, 500),
      portrait_offset_x: clampNumber($('portraitOffsetX').value, PORTRAIT_DEFAULT.x, -50, 50),
      portrait_offset_y: clampNumber($('portraitOffsetY').value, PORTRAIT_DEFAULT.y, -50, 50),
      is_active: $('active').checked
    };

    const query = id
      ? db.from('dolls').update(payload).eq('id', id)
      : db.from('dolls').insert(payload);
    const { error } = await query;
    if (error) throw error;

    toast(id ? '인형 정보를 수정했습니다.' : '새 인형을 추가했습니다.');
    await loadDolls();
    clearForm();
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
