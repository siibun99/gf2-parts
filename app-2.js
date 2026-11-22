'use strict';

    const STORAGE_KEY = 'gf2-personal-farming-v2-supabase';
    const UI_STORAGE_KEY = 'gf2-personal-farming-ui-v2-supabase';
    const THEME_STORAGE_KEY = 'gf2-ui-theme-v1';
    let activeProfile = 1;
    try {
      const savedProfile = Number(localStorage.getItem('gf2-active-profile-v1'));
      if ([1, 2, 3].includes(savedProfile)) activeProfile = savedProfile;
    } catch (_) {}
    const PART_FORBIDDEN_OPTIONS = new Set(['치명타 피해']);
    const SLOT_LABELS = {
      muzzle: '총구',
      p1: '파츠 1',
      p2: '파츠 2',
      p3: '파츠 3'
    };

    const ATTR_COLORS = {
      '물리': 'var(--physical)',
      '연소': 'var(--burn)',
      '빙결': 'var(--freeze)',
      '전도': 'var(--electric)',
      '산성': 'var(--acid)',
      '탁류': 'var(--turbid)',
      '공진': 'var(--resonance)'
    };

    let personalSnapshot = null;
    let savingPersonal = false;
    let storageReadError = false;
    let editorReturnFocus = null;
    const app = {
      data: null,
      personal: loadPersonalData(),
      activeTab: 'farm',
      query: '',
      weaponFilters: new Set(),
      attrFilters: new Set(),
      scope: 'all',
      hideUnowned: loadUiPreferences().hideUnowned,
      referenceHideUnowned: loadUiPreferences().referenceHideUnowned,
      referenceHideCompleted: loadUiPreferences().referenceHideCompleted,
      editorName: null,
      editorDraft: null,
      referenceRendered: false,
      referenceMode: 'cards', referenceSet: '총구 옵션', referenceWeapon: '', referenceSearch: '',
      supabase: null
    };

    function loadUiPreferences() {
      try {
        const raw = localStorage.getItem(UI_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return {
          hideUnowned: Boolean(parsed?.hideUnowned),
          referenceHideUnowned: Boolean(parsed?.referenceHideUnowned),
          referenceHideCompleted: Boolean(parsed?.referenceHideCompleted)
        };
      } catch (error) {
        console.error('화면 설정 불러오기 실패', error);
        return { hideUnowned: false, referenceHideUnowned: false, referenceHideCompleted: false };
      }
    }

    function saveUiPreferences() {
      try {
        localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({
          hideUnowned: app.hideUnowned,
          referenceHideUnowned: app.referenceHideUnowned,
          referenceHideCompleted: app.referenceHideCompleted
        }));
      } catch (error) {
        console.error('화면 설정 저장 실패', error);
      }
    }

    function currentTheme() {
      return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    }

    function applyTheme(theme, persist = true) {
      const next = theme === 'light' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      const icon = document.getElementById('themeToggleIcon');
      const button = document.getElementById('themeToggleButton');
      if (icon) icon.textContent = next === 'dark' ? '☀' : '🌙';
      if (button) {
        button.setAttribute('aria-label', next === 'dark' ? '밝은 화면으로 전환' : '어두운 화면으로 전환');
        button.setAttribute('title', next === 'dark' ? '밝은 화면으로 전환' : '어두운 화면으로 전환');
      }
      if (persist) {
        try { localStorage.setItem(THEME_STORAGE_KEY, next); }
        catch (error) { console.error('테마 저장 실패', error); }
      }
    }

    function personalStorageKey() {
      return activeProfile === 1 ? `${STORAGE_KEY}:guest` : `${STORAGE_KEY}:guest:page-${activeProfile}`;
    }

    function renderProfileButtons() {
      document.querySelectorAll('[data-profile]').forEach(button => {
        const selected = Number(button.dataset.profile) === activeProfile;
        button.textContent = profileLabel(Number(button.dataset.profile));
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    }

    async function switchProfile(profile) {
      if (![1, 2, 3].includes(profile) || profile === activeProfile || !app.data || savingPersonal) return;
      closeEditor();
      activeProfile = profile;
      app.personal = loadPersonalData();
      await migratePersonalNotes();
      app.referenceRendered = false;
      try { localStorage.setItem('gf2-active-profile-v1', String(profile)); } catch (_) {}
      renderProfileButtons();
      updateStorageWarning();
      renderFarm();
      if (app.activeTab === 'reference') renderReference();
    }

    function loadPersonalData() {
      try {
        personalSnapshot = GF2Store.read(localStorage, activeProfile);
        storageReadError = false;
        return personalSnapshot.data;
      } catch (error) {
        personalSnapshot = null;
        storageReadError = true;
        console.error('개인 데이터 불러오기 실패', error);
        return {};
      }
    }

    async function savePersonalData(personal = app.personal, replace = false) {
      if (savingPersonal) { showToast('앞선 저장을 마친 뒤 다시 시도해주세요.', true); return false; }
      savingPersonal = true;
      try {
        personalSnapshot = await GF2Store.commit(localStorage, navigator.locks, activeProfile, personalSnapshot, personal, replace);
        app.personal = personalSnapshot.data;
        return true;
      } catch (error) {
        console.error(error);
        showToast(error.message || '브라우저에 저장하지 못했습니다.', true);
        return false;
      } finally { savingPersonal = false; }
    }

    function sanitizePartOptions(options) {
      return [...new Set(Array.isArray(options) ? options : [])]
        .filter(option => !PART_FORBIDDEN_OPTIONS.has(option))
        .slice(0, 3);
    }

    function defaultConfig(doll) {
      const partOptions = sanitizePartOptions(doll.part);
      return {
        status: 'none',
        personalNote: doll.note || '',
        noteInitialized: true,
        setOptions: [...doll.setOptions],
        muzzle: [...doll.muzzle],
        parts: [
          [...partOptions],
          [...partOptions],
          [...partOptions]
        ],
        done: {
          muzzle: false,
          p1: false,
          p2: false,
          p3: false
        }
      };
    }

    function getConfig(doll) {
      const saved = app.personal[doll.id] ?? app.personal[doll.name];
      const base = defaultConfig(doll);

      if (!saved || typeof saved !== 'object') return base;

      const legacyStatus = saved.completed
        ? 'completed'
        : saved.unowned
          ? 'unowned'
          : saved.tracked
            ? 'tracked'
            : 'none';
      const status = ['none', 'tracked', 'unowned', 'completed'].includes(saved.status)
        ? saved.status
        : legacyStatus;

      const config = {
        status,
        personalNote: typeof saved.personalNote === 'string' ? saved.personalNote : base.personalNote,
        noteInitialized: Boolean(saved.noteInitialized),
        setOptions: Array.isArray(saved.setOptions) ? [...saved.setOptions] : base.setOptions,
        muzzle: Array.isArray(saved.muzzle) ? [...saved.muzzle].slice(0, 4) : base.muzzle,
        parts: [0, 1, 2].map(index => (
          Array.isArray(saved.parts?.[index])
            ? sanitizePartOptions(saved.parts[index])
            : base.parts[index]
        )),
        done: {
          muzzle: Boolean(saved.done?.muzzle),
          p1: Boolean(saved.done?.p1),
          p2: Boolean(saved.done?.p2),
          p3: Boolean(saved.done?.p3)
        }
      };

      if (config.status === 'completed') {
        Object.keys(config.done).forEach(slot => { config.done[slot] = true; });
      }

      return config;
    }

    async function setConfig(doll, config) {
      const personal = { ...app.personal, [doll.id]: config };
      delete personal[doll.name];
      if (!await savePersonalData(personal)) return false;
      app.referenceRendered = false;
      if (app.activeTab === 'reference') renderReference();
      return true;
    }

    async function migratePersonalNotes() {
      if (storageReadError) return false;
      let changed = false;
      const personal = { ...app.personal };

      app.data.dolls.forEach(doll => {
        if (Object.hasOwn(personal, doll.name)) {
          if (!Object.hasOwn(personal, doll.id)) personal[doll.id] = personal[doll.name];
          delete personal[doll.name];
          changed = true;
        }
        if (!doll.note) return;

        const saved = personal[doll.id];
        if (!saved || typeof saved !== 'object') {
          personal[doll.id] = {
            personalNote: doll.note,
            noteInitialized: true
          };
          changed = true;
          return;
        }

        if (saved.noteInitialized === true) return;

        personal[doll.id] = {
          ...saved,
          personalNote: typeof saved.personalNote === 'string' && saved.personalNote.trim()
            ? saved.personalNote : doll.note,
          noteInitialized: true
        };
        changed = true;
      });

      return !changed || await savePersonalData(personal);
    }

    function findDoll(name) {
      return app.data?.dolls.find(doll => doll.name === name) || null;
    }

    async function init() {
      applyTheme(currentTheme(), false);
      bindStaticEvents();
      try {
        const cfg = window.GF2_CONFIG || {};
        if (!cfg.supabaseUrl || !cfg.supabasePublishableKey || cfg.supabaseUrl.includes('YOUR_PROJECT')) {
          throw new Error('config.js에 Supabase URL과 Publishable Key를 입력해주세요.');
        }
        app.supabase = window.supabase.createClient(
          cfg.supabaseUrl,
          cfg.supabasePublishableKey,
          { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        );
        await loadAppData();
      } catch (error) {
        handleDataFailure(error);
      }
    }

    async function loadAppData() {
      const { data: rows, error } = await app.supabase
        .from('dolls')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: false })
        .order('name', { ascending: false });
      if (error) throw error;

      const setOptions = unique([...GF2_OPTIONS.sets, ...rows.flatMap(row => row.recommended_sets || [])]);
      const statOptions = unique([...GF2_OPTIONS.muzzle, ...rows.flatMap(row => [
        ...(row.recommended_muzzle || []), ...(row.recommended_parts || [])
      ])]);
      const partStatOptions = statOptions.filter(option => !PART_FORBIDDEN_OPTIONS.has(option));
      const weaponOrder = ['돌격소총','산탄총','기관단총','기관총','저격소총','권총','도검'];
      const attrOrder = ['물리','연소','빙결','전도','산성','탁류','공진'];
      const data = {
        spreadsheetId: '',
        spreadsheetName: 'Supabase DB',
        sourceUrl: '',
        dolls: rows.map(row => ({
          id: row.id,
          slug: row.slug,
          name: row.name,
          weapon: row.weapon_type,
          attr: row.attribute,
          setOptions: row.recommended_sets || [],
          muzzle: row.recommended_muzzle || [],
          part: sanitizePartOptions(row.recommended_parts),
          note: row.default_note || '',
          keyName: row.common_key || '',
          keyEffect: row.common_key_effect || '',
          imageUrl: row.image_url || '',
          portraitScale: (() => {
            const raw = Number(row.portrait_scale ?? 250);
            return raw >= .6 && raw <= 1.6 ? raw * 350 - 100 : raw;
          })(),
          portraitOffsetX: Number(row.portrait_offset_x ?? 0),
          portraitOffsetY: (() => {
            const rawScale = Number(row.portrait_scale ?? 250);
            const rawY = Number(row.portrait_offset_y ?? (rawScale >= .6 && rawScale <= 1.6 ? 0 : -7));
            return rawScale >= .6 && rawScale <= 1.6 ? rawY - 7 : rawY;
          })()
        })),
        setOptions,
        statOptions,
        partStatOptions,
        weapons: orderedUnique(weaponOrder, rows.map(row => row.weapon_type).filter(x => x && x !== '기타')),
        attrs: orderedUnique(attrOrder, rows.map(row => row.attribute).filter(Boolean))
      };
      await handleDataLoaded(data);
    }

    function orderedUnique(preferred, values) {
      const all = unique(values);
      return [...preferred.filter(v => all.includes(v)), ...all.filter(v => !preferred.includes(v))];
    }

    function unique(values) {
      return [...new Set((values || []).filter(Boolean))];
    }

    async function handleDataLoaded(data) {
      app.data = data;
      await migratePersonalNotes();
      document.getElementById('sourceStatus').textContent =
        `${data.spreadsheetName} · ${data.dolls.length}인형`;
      document.querySelectorAll('[data-footer-source]').forEach(footer => {
        footer.textContent = '페이지 1·2·3의 진행 기록은 각각 분리되어 이 브라우저에만 저장됩니다. 기기 간 동기화는 지원하지 않습니다.';
      });

      updateStorageWarning();
      renderProfileButtons();
      document.getElementById('referenceWeapon').innerHTML = '<option value="">모든 무기</option>' + data.weapons.map(weapon => '<option>' + escapeHtml(weapon) + '</option>').join('');
      renderFilterChips();
      document.getElementById('hideUnownedButton').classList.toggle('active', app.hideUnowned);
      renderFarm();
      if (app.activeTab === 'reference') renderReference();
    }

    function handleDataFailure(error) {
      console.error(error);
      document.getElementById('sourceStatus').textContent = '데이터를 불러오지 못했습니다.';
      document.getElementById('dollGrid').innerHTML = `
        <div class="empty-state">
          데이터 불러오기 실패<br>
          ${escapeHtml(error?.message || String(error))}
        </div>`;
    }

    function bindStaticEvents() {
      bindDataTools();
      document.getElementById('referenceMode').onchange = event => { app.referenceMode = event.target.value; renderReference(); };
      document.getElementById('referenceWeapon').onchange = event => { app.referenceWeapon = event.target.value; renderReference(); };
      document.getElementById('referenceSearch').oninput = event => { app.referenceSearch = event.target.value.trim().toLowerCase(); renderReference(); };
      document.getElementById('referenceSets').onclick = event => {
        const button = event.target.closest('[data-reference-set]');
        if (button) { app.referenceSet = button.dataset.referenceSet; renderReference(); }
      };
      renderProfileButtons();
      document.getElementById('profileButtons').addEventListener('click', event => {
        const button = event.target.closest('[data-profile]');
        if (button) switchProfile(Number(button.dataset.profile));
      });
      document.getElementById('themeToggleButton').addEventListener('click', () => {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      });

      document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
      });


      document.getElementById('searchInput').addEventListener('input', event => {
        app.query = event.target.value.trim().toLowerCase();
        renderFarm();
      });

      document.getElementById('scopeFilters').addEventListener('click', event => {
        const scopeButton = event.target.closest('[data-scope]');
        if (scopeButton) {
          app.scope = scopeButton.dataset.scope;
          document.querySelectorAll('[data-scope]').forEach(item => {
            item.classList.toggle('active', item.dataset.scope === app.scope);
          });
          renderFarm();
          return;
        }

        const toggleButton = event.target.closest('[data-toggle="hide-unowned"]');
        if (!toggleButton) return;
        app.hideUnowned = !app.hideUnowned;
        toggleButton.classList.toggle('active', app.hideUnowned);
        saveUiPreferences();
        renderFarm();
      });

      document.getElementById('dollGrid').addEventListener('click', handleCardClick);
      document.getElementById('dollGrid').addEventListener('change', handleCardChange);

      document.getElementById('closeEditorButton').addEventListener('click', closeEditor);
      document.getElementById('cancelEditorButton').addEventListener('click', closeEditor);
      document.getElementById('saveEditorButton').addEventListener('click', saveEditor);
      document.getElementById('restoreRecommendedButton').addEventListener('click', restoreRecommendedInEditor);

      document.getElementById('editorBackdrop').addEventListener('click', event => {
        if (event.target.id === 'editorBackdrop') closeEditor();
      });

      document.addEventListener('keydown', event => {
        if (!app.editorName) return;
        if (event.key === 'Escape') closeEditor();
        if (event.key === 'Tab') {
          const items = [...document.querySelectorAll('#editorBackdrop button:not(:disabled), #editorBackdrop input:not(:disabled)')].filter(el => el.getClientRects().length);
          const first = items[0], last = items.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      });

      document.getElementById('resetAllButton').addEventListener('click', resetAllPersonalData);
      document.getElementById('toggleReferenceButton').addEventListener('click', toggleAllReferenceSections);
      document.getElementById('referenceFilters').addEventListener('click', event => {
        const button = event.target.closest('[data-reference-filter]');
        if (!button) return;
        const key = button.dataset.referenceFilter;
        if (!['referenceHideUnowned', 'referenceHideCompleted'].includes(key)) return;
        app[key] = !app[key];
        saveUiPreferences();
        renderReference();
      });
    }

    function switchTab(tab) {
      if (!['farm', 'reference'].includes(tab) || tab === app.activeTab) return;

      app.activeTab = tab;

      document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tab);
      });
      document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
      document.getElementById(tab === 'farm' ? 'farmView' : 'referenceView').classList.add('active');

      if (tab === 'reference' && app.data) {
        renderReference();
      }
    }

    function renderFilterChips() {
      renderChipContainer('weaponFilters', app.data.weapons, 'weapon');
      renderChipContainer('attrFilters', app.data.attrs, 'attr');
    }

    function renderChipContainer(containerId, values, type) {
      const container = document.getElementById(containerId);
      container.innerHTML = values.map(value => `
        <button class="filter-chip" type="button" data-filter-type="${type}" data-value="${escapeAttr(value)}">
          ${escapeHtml(value)}
        </button>`).join('');

      container.addEventListener('click', event => {
        const button = event.target.closest('[data-value]');
        if (!button) return;

        const set = button.dataset.filterType === 'weapon'
          ? app.weaponFilters
          : app.attrFilters;
        const value = button.dataset.value;

        if (set.has(value)) set.delete(value);
        else set.add(value);

        button.classList.toggle('active', set.has(value));
        renderFarm();
      });
    }

    function filteredDolls() {
      if (!app.data) return [];

      return app.data.dolls.filter(doll => {
        const config = getConfig(doll);
        const searchable = [
          doll.name,
          doll.weapon,
          doll.attr,
          doll.keyName,
          doll.keyEffect,
          config.personalNote,
          ...config.setOptions
        ].join(' ').toLowerCase();

        if (app.query && !searchable.includes(app.query)) return false;
        if (app.weaponFilters.size && !app.weaponFilters.has(doll.weapon)) return false;
        if (app.attrFilters.size && !app.attrFilters.has(doll.attr)) return false;
        if (app.hideUnowned && config.status === 'unowned') return false;
        if (app.scope === 'tracked' && config.status !== 'tracked') return false;
        if (app.scope === 'incomplete' && (config.status === 'unowned' || isConfigComplete(config))) return false;
        if (app.scope === 'completed' && !isConfigComplete(config)) return false;
        return true;
      });
    }

    function renderFarm() {
      if (!app.data) return;

      renderSummary();
      const dolls = filteredDolls();
      const grid = document.getElementById('dollGrid');

      if (!dolls.length) {
        grid.innerHTML = '<div class="empty-state">조건에 맞는 인형이 없습니다.</div>';
        return;
      }

      grid.innerHTML = dolls.map(renderDollCard).join('');
    }

    function renderSummary() {
      const allConfigs = app.data.dolls.map(doll => getConfig(doll));
      const trackedConfigs = allConfigs.filter(config => config.status === 'tracked');
      const unownedConfigs = allConfigs.filter(config => config.status === 'unowned');
      const completedConfigs = allConfigs.filter(config => isConfigComplete(config));
      const progressConfigs = allConfigs.filter(config => (
        config.status === 'tracked' || isConfigComplete(config)
      ));
      const donePieces = progressConfigs.reduce((sum, config) => (
        sum + Object.values(config.done).filter(Boolean).length
      ), 0);
      const totalPieces = progressConfigs.length * 4;
      const percent = totalPieces ? Math.round(donePieces / totalPieces * 100) : 0;

      document.getElementById('summaryGrid').innerHTML = `
        ${summaryCard('전체 인형', app.data.dolls.length)}
        ${summaryCard('파밍 대상', trackedConfigs.length)}
        ${summaryCard('미보유', unownedConfigs.length)}
        ${summaryCard('파밍 완료', completedConfigs.length)}
        <div class="summary-card">
          <div class="summary-label">파츠 진행률</div>
          <div class="summary-value">${donePieces} / ${totalPieces}</div>
          <div class="progress-line"><span style="width:${percent}%"></span></div>
        </div>`;
    }

    function summaryCard(label, value) {
      return `
        <div class="summary-card">
          <div class="summary-label">${escapeHtml(label)}</div>
          <div class="summary-value">${value}</div>
        </div>`;
    }

    function renderDollCard(doll) {
      const config = getConfig(doll);
      const encodedName = encodeURIComponent(doll.name);
      const color = ATTR_COLORS[doll.attr] || 'var(--faint)';

      return `
        <article class="doll-card status-${config.status}" style="--attr-color:${color}" data-name="${encodedName}">
          <div class="card-title-line">
            <h2 class="doll-name" title="${escapeHtml(doll.name)}">${escapeHtml(doll.name)}</h2>
          </div>

          <div class="card-identity">
            ${renderDollPortrait(doll)}
            <div class="identity-text">
              <div class="meta-row">
                <span class="tag">${escapeHtml(doll.weapon)}</span>
                ${doll.attr ? `<span class="tag attr">${escapeHtml(doll.attr)}</span>` : ''}
              </div>

              <div class="status-controls" aria-label="인형 상태">
                <button class="status-chip ${config.status === 'tracked' ? 'active' : ''}" type="button" data-action="set-status" data-status="tracked">파밍 대상</button>
                <button class="status-chip ${config.status === 'unowned' ? 'active' : ''}" type="button" data-action="set-status" data-status="unowned">미보유</button>
                <button class="status-chip ${config.status === 'completed' ? 'active' : ''}" type="button" data-action="set-status" data-status="completed">파밍 완료</button>
              </div>

              <div class="compact-config">
                <div class="config-title"><span>세트 옵션</span></div>
                <div class="option-row">${renderOptionTags(config.setOptions, 'set')}</div>
              </div>
            </div>
          </div>

          <div class="gear-options-panel" aria-label="총구와 파츠 옵션">
            ${[
              ['muzzle', '총구', config.muzzle],
              ['p1', '파츠 1', config.parts[0]],
              ['p2', '파츠 2', config.parts[1]],
              ['p3', '파츠 3', config.parts[2]]
            ].map(([slot, label, options]) => `
              <div class="gear-option-row">
                <span class="gear-option-label">${label}</span>
                <div class="option-row">${renderOptionTags(options)}</div>
                <button
                  class="gear-done-toggle ${config.done[slot] ? 'done' : ''}"
                  type="button"
                  data-action="toggle-done"
                  data-slot="${slot}"
                  aria-pressed="${config.done[slot] ? 'true' : 'false'}"
                  aria-label="${label} 완료 체크"
                  title="${label} 완료 체크"
                >✓</button>
              </div>`).join('')}
          </div>

          <label class="personal-note-field">
            <span>개인 비고</span>
            <textarea data-action="personal-note" maxlength="500" placeholder="자유롭게 메모할 수 있습니다.">${escapeHtml(config.personalNote)}</textarea>
          </label>
          <div class="key-box${doll.keyName ? '' : ' empty'}">
            <strong>공용키 · ${doll.keyName ? escapeHtml(doll.keyName) : '미등록'}</strong>
            <div class="key-effect">${doll.keyName ? (escapeHtml(doll.keyEffect) || '&nbsp;') : '&nbsp;<br>&nbsp;'}</div>
          </div>

          <div class="card-actions">
            <button class="button small primary" type="button" data-action="edit">구성 편집</button>
            <button class="button small ghost" type="button" data-action="reset-doll">추천값 복원</button>
          </div>
        </article>`;
    }

    function renderDollPortrait(doll) {
      const fullName = String(doll.name || '이름 없음');
      const portraitZoom = Math.min(500, Math.max(-40, Number(doll.portraitScale) || 0));
      const portraitScale = Math.max(.6, 1 + portraitZoom / 100);
      const portraitOffsetX = Math.min(50, Math.max(-50, Number(doll.portraitOffsetX) || 0));
      const portraitOffsetY = Math.min(50, Math.max(-50, Number(doll.portraitOffsetY) || 0));
      const portraitStyle = [
        `--portrait-user-scale:${portraitScale}`,
        `--portrait-user-x:${portraitOffsetX}%`,
        `--portrait-user-y:${portraitOffsetY}%`
      ].join(';');
      const image = doll.imageUrl
        ? `<span class="portrait-position"><span class="portrait-zoom"><img class="portrait-image" src="${escapeAttr(doll.imageUrl)}" alt="${escapeAttr(fullName)} 일러스트" loading="lazy" decoding="async"></span></span>`
        : '';

      return `
        <div class="doll-portrait${doll.imageUrl ? '' : ' empty'}" style="${portraitStyle}" aria-label="${escapeAttr(fullName)} 일러스트">
          <span class="portrait-fallback">${escapeHtml(fullName)}</span>
          ${image}
        </div>`;
    }

    function renderOptionTags(options, className = '') {
      if (!options?.length) return '<span class="tag">미선택</span>';
      return options.map(value => `<span class="option-tag ${className}">${escapeHtml(value)}</span>`).join('');
    }

    function updateFarmCardState(doll, config) {
      const grid = document.getElementById('dollGrid');
      const encodedName = encodeURIComponent(doll.name);
      const card = [...grid.querySelectorAll('.doll-card')]
        .find(item => item.dataset.name === encodedName);

      renderSummary();

      if (!card) return;

      const remainsVisible = filteredDolls().some(item => item.name === doll.name);
      if (!remainsVisible) {
        card.remove();
        if (!grid.querySelector('.doll-card')) {
          grid.innerHTML = '<div class="empty-state">조건에 맞는 인형이 없습니다.</div>';
        }
        return;
      }

      card.classList.remove('status-none', 'status-tracked', 'status-unowned', 'status-completed');
      card.classList.add(`status-${config.status}`);

      card.querySelectorAll('[data-action="set-status"]').forEach(button => {
        button.classList.toggle('active', button.dataset.status === config.status);
      });

      card.querySelectorAll('[data-action="toggle-done"]').forEach(button => {
        const isDone = Boolean(config.done[button.dataset.slot]);
        button.classList.toggle('done', isDone);
        button.setAttribute('aria-pressed', String(isDone));
      });
    }

    function handleCardClick(event) {
      const actionElement = event.target.closest('[data-action]');
      if (!actionElement) return;
      const card = actionElement.closest('[data-name]');
      if (!card) return;

      const name = decodeURIComponent(card.dataset.name);
      const doll = findDoll(name);
      if (!doll) return;

      const action = actionElement.dataset.action;
      if (action === 'set-status') setDollStatus(doll, actionElement.dataset.status);
      if (action === 'toggle-done') toggleDone(doll, actionElement.dataset.slot);
      if (action === 'edit') openEditor(doll);
      if (action === 'reset-doll') resetDoll(doll);
    }

    async function handleCardChange(event) {
      if (event.target.dataset.action !== 'personal-note') return;
      const card = event.target.closest('[data-name]');
      const name = decodeURIComponent(card.dataset.name);
      const doll = findDoll(name);
      if (!doll) return;

      const config = getConfig(doll);
      config.personalNote = event.target.value.trim();
      config.noteInitialized = true;
      if (!await setConfig(doll, config)) return;
      showToast(`${doll.name} 개인 비고를 저장했습니다.`);
    }

    async function setDollStatus(doll, nextStatus) {
      const config = getConfig(doll);
      const previousStatus = config.status;
      config.status = previousStatus === nextStatus ? 'none' : nextStatus;

      if (config.status === 'completed') {
        Object.keys(config.done).forEach(slot => { config.done[slot] = true; });
      } else if (previousStatus === 'completed' || config.status === 'unowned') {
        Object.keys(config.done).forEach(slot => { config.done[slot] = false; });
      }

      if (!await setConfig(doll, config)) return;
      updateFarmCardState(doll, config);
    }

    async function toggleDone(doll, slot) {
      const config = getConfig(doll);
      config.done[slot] = !config.done[slot];
      config.status = Object.values(config.done).every(Boolean) ? 'completed' : 'tracked';
      if (!await setConfig(doll, config)) {
        renderFarm();
        return;
      }
      updateFarmCardState(doll, config);
    }

    async function resetDoll(doll) {
      if (!await askConfirmation(`${doll.name}의 개인 구성과 완료 체크를 추천 기본값으로 되돌릴까요?`)) return;
      const current = getConfig(doll);
      const base = defaultConfig(doll);
      base.status = current.status === 'completed' ? 'tracked' : current.status;
      base.personalNote = current.personalNote;
      base.noteInitialized = true;
      if (!await setConfig(doll, base)) return;
      renderFarm();
      showToast(`${doll.name} 구성을 추천값으로 복원했습니다.`);
    }

    function isConfigComplete(config) {
      return config.status !== 'unowned' && (config.status === 'completed' || Object.values(config.done).every(Boolean));
    }

    function openEditor(doll) {
      editorReturnFocus = document.activeElement;
      app.editorName = doll.name;
      app.editorDraft = structuredCloneSafe(getConfig(doll));
      renderEditor();
      document.getElementById('editorBackdrop').classList.add('open');
      document.body.style.overflow = 'hidden';
      document.querySelector('.app-header').inert = true;
      document.querySelector('main').inert = true;
      document.getElementById('closeEditorButton').focus();
    }

    function closeEditor() {
      document.getElementById('editorBackdrop').classList.remove('open');
      document.body.style.overflow = '';
      document.querySelector('.app-header').inert = false;
      document.querySelector('main').inert = false;
      editorReturnFocus?.focus();
      app.editorName = null;
      app.editorDraft = null;
    }

    function renderEditor() {
      const focusedKey = document.activeElement?.dataset.editorKey;
      const focusedValue = document.activeElement?.dataset.value;
      const doll = findDoll(app.editorName);
      if (!doll || !app.editorDraft) return;

      document.getElementById('editorTitle').textContent = `${doll.name} 장비 구성`;
      const groups = [
        {
          key: 'setOptions',
          label: '세트 옵션',
          help: '여러 개 선택 가능',
          options: app.data.setOptions,
          recommended: doll.setOptions,
          selected: app.editorDraft.setOptions,
          max: null
        },
        {
          key: 'muzzle',
          label: '총구 옵션',
          help: '최대 4개',
          options: app.data.statOptions,
          recommended: doll.muzzle,
          selected: app.editorDraft.muzzle,
          max: 4
        },
        ...[0, 1, 2].map(index => ({
          key: `part-${index}`,
          label: `파츠 ${index + 1} 옵션`,
          help: '최대 3개',
          options: app.data.partStatOptions,
          recommended: doll.part,
          selected: app.editorDraft.parts[index],
          max: 3
        }))
      ];

      const body = document.getElementById('editorBody');
      body.innerHTML = groups.map(group => `
        <section class="editor-group">
          <div class="editor-heading">
            <strong>${escapeHtml(group.label)}</strong>
            <span>${escapeHtml(group.help)} · 현재 ${group.selected.length}개</span>
          </div>
          <div class="choice-grid">
            ${group.options.map(option => `
              <button
                class="choice-chip ${group.selected.includes(option) ? 'selected' : ''} ${group.recommended.includes(option) ? 'recommended' : ''}"
                type="button"
                data-editor-key="${group.key}"
                data-value="${escapeAttr(option)}"
                data-max="${group.max ?? ''}"
              >${escapeHtml(option)}</button>`).join('')}
          </div>
        </section>`).join('');

      body.querySelectorAll('[data-editor-key]').forEach(button => {
        button.addEventListener('click', () => handleEditorChoice(button));
        button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
        if (button.dataset.editorKey === focusedKey && button.dataset.value === focusedValue) button.focus();
      });
    }

    function handleEditorChoice(button) {
      const key = button.dataset.editorKey;
      const value = button.dataset.value;
      const max = button.dataset.max ? Number(button.dataset.max) : null;
      const selected = key === 'setOptions'
        ? app.editorDraft.setOptions
        : key === 'muzzle'
          ? app.editorDraft.muzzle
          : app.editorDraft.parts[Number(key.split('-')[1])];

      const index = selected.indexOf(value);
      if (index >= 0) {
        selected.splice(index, 1);
      } else {
        if (max && selected.length >= max) {
          showToast(`최대 ${max}개까지 선택할 수 있습니다.`, true);
          return;
        }
        selected.push(value);
      }

      renderEditor();
    }

    function restoreRecommendedInEditor() {
      const doll = findDoll(app.editorName);
      if (!doll) return;
      const status = app.editorDraft.status;
      const personalNote = app.editorDraft.personalNote;
      const noteInitialized = app.editorDraft.noteInitialized;
      const done = structuredCloneSafe(app.editorDraft.done);
      app.editorDraft = defaultConfig(doll);
      app.editorDraft.status = status;
      app.editorDraft.personalNote = personalNote;
      app.editorDraft.noteInitialized = noteInitialized;
      app.editorDraft.done = done;
      renderEditor();
      showToast('추천 옵션을 다시 선택했습니다.');
    }

    async function saveEditor() {
      const doll = findDoll(app.editorName);
      if (!doll || !app.editorDraft) return;

      if (app.editorDraft.status === 'none') app.editorDraft.status = 'tracked';
      if (!await setConfig(doll, app.editorDraft)) return;
      closeEditor();
      renderFarm();
      showToast(`${doll.name} 구성을 저장했습니다.`);
    }

    function renderReference() {
      if (!app.data) return;
      document.querySelectorAll('[data-reference-filter]').forEach(button => {
        const enabled = app[button.dataset.referenceFilter];
        button.classList.toggle('active', enabled);
        button.setAttribute('aria-pressed', String(enabled));
      });
      const container = document.getElementById('referenceContent');
      const sections = [];
      const effective = app.data.dolls.map(doll => ({
        doll,
        config: getConfig(doll)
      })).filter(({ doll, config }) =>
        (!app.referenceWeapon || doll.weapon === app.referenceWeapon) &&
        (!app.referenceSearch || doll.name.toLowerCase().includes(app.referenceSearch)) &&
        !(app.referenceHideUnowned && config.status === 'unowned') &&
        !(app.referenceHideCompleted && isConfigComplete(config))
      );

      const muzzleEntries = effective.map(({ doll, config }) => ({
        doll,
        label: doll.name,
        options: config.muzzle
      }));
      const muzzleRows = groupReferenceEntries(muzzleEntries);
      if (muzzleRows.length) sections.push({ title: '총구 옵션', rows: muzzleRows });

      const selectedSetNames = new Set();
      effective.forEach(({ config }) => {
        config.setOptions.forEach(setOption => selectedSetNames.add(setOption));
      });
      const effectiveSetOptions = [
        ...app.data.setOptions.filter(option => selectedSetNames.has(option)),
        ...[...selectedSetNames].filter(option => !app.data.setOptions.includes(option))
      ];

      effectiveSetOptions.forEach(setOption => {
        const entries = [];

        effective
          .filter(({ config }) => config.setOptions.includes(setOption))
          .forEach(({ doll, config }) => {
            const combinations = new Map();

            config.parts.forEach((options, index) => {
              const normalized = sortStatOptions(options);
              if (!normalized.length) return;
              const key = normalized.join(', ');
              if (!combinations.has(key)) {
                combinations.set(key, { options: normalized, slots: [] });
              }
              combinations.get(key).slots.push(index + 1);
            });

            combinations.forEach(value => {
              const label = combinations.size === 1
                ? doll.name
                : `${doll.name} (파츠 ${value.slots.join('·')})`;
              entries.push({ doll, label, options: value.options });
            });
          });

        const rows = groupReferenceEntries(entries);
        if (rows.length) sections.push({ title: setOption, rows });
      });

      if (!sections.some(section => section.title === app.referenceSet)) app.referenceSet = sections[0]?.title || '';
      const cards = app.referenceMode === 'cards';
      const setNav = document.getElementById('referenceSets');
      const focusedSet = document.activeElement?.dataset.referenceSet;
      setNav.hidden = !cards;
      setNav.innerHTML = sections.map(section => '<button type="button" data-reference-set="' + escapeAttr(section.title) + '" aria-pressed="' + (section.title === app.referenceSet) + '"><span>' + escapeHtml(section.title) + '</span><small>' + section.rows.length + '개 조합</small></button>').join('');
      if (focusedSet) [...setNav.querySelectorAll('button')].find(button => button.dataset.referenceSet === focusedSet)?.focus();
      document.getElementById('referenceLayout').classList.toggle('table-mode', !cards);
      document.getElementById('toggleReferenceButton').hidden = cards;
      document.getElementById('referenceCount').textContent = profileLabel(activeProfile) + ' · ' + effective.length + '명 표시';
      container.innerHTML = (cards
        ? sections.filter(section => section.title === app.referenceSet).map(section => referenceCards(section.title, section.rows)).join('')
        : sections.map((section, index) => referenceSection(section.title, section.rows, index === 0)).join('')) || '<div class="empty-state">현재 표시 조건에 맞는 장비 구성이 없습니다. 숨기기 필터를 해제하거나 인형 구성을 확인해주세요.</div>';
      document.getElementById('toggleReferenceButton').textContent = '모두 펼치기';
      app.referenceRendered = true;
    }

    function referenceCards(title, rows) {
      return '<h2 class="reference-title">' + escapeHtml(title) + '</h2><p class="subtitle">아래 옵션 조합을 필요로 하는 인형입니다. 게임 내 자동 잠금과 연동되지 않습니다.</p><div class="plan-grid">' + rows.map((row, index) => {
        const groups = referenceWeapons().map(weapon => [weapon, row.weapons[weapon] || []]).filter(([, names]) => names.length);
        return '<article class="plan-card"><h3>옵션 조합 ' + (index + 1) + '</h3><div class="plan-options">' + row.combination.split(', ').map(option => '<span>' + escapeHtml(option) + '</span>').join('') + '</div>' + groups.map(([weapon, names]) => '<div class="plan-dolls"><strong>' + escapeHtml(weapon) + '</strong><div>' + names.map(name => referenceNameChip(name, row.states?.[name])).join('') + '</div></div>').join('') + '</article>';
      }).join('') + '</div>';
    }

    function referenceNameChip(name, state, table = false) {
      const status = state === 'unowned' ? '미보유' : state === 'completed' ? '파밍 완료' : '';
      return '<span class="' + (table ? 'reference-table-name' : 'doll-name-chip') + (status ? ' is-' + state : '') + '"' + (status ? ' title="' + escapeAttr(name + ' · ' + status) + '"' : '') + '>' + (table && state === 'completed' ? '<span aria-hidden="true">✓ </span>' : '') + escapeHtml(name) + '</span>';
    }

    function referenceWeapons() {
      return app.data.weapons.filter(weapon => weapon && weapon !== '기타');
    }

    function sortStatOptions(options) {
      return [...new Set(options || [])].sort((a, b) => {
        const ai = app.data.statOptions.indexOf(a);
        const bi = app.data.statOptions.indexOf(b);
        const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
        const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
        return aRank - bRank || a.localeCompare(b, 'ko');
      });
    }

    function groupReferenceEntries(entries) {
      const map = new Map();
      const states = new Map();
      const weapons = referenceWeapons();

      entries.forEach(entry => {
        const weapon = entry.doll.weapon;
        if (!weapons.includes(weapon)) return;

        const options = sortStatOptions(entry.options);
        if (!options.length) return;

        const key = options.join(', ');
        if (!map.has(key)) { map.set(key, {}); states.set(key, new Map()); }
        const config = getConfig(entry.doll);
        states.get(key).set(entry.label, config.status === 'unowned' ? 'unowned' : isConfigComplete(config) ? 'completed' : 'none');
        if (!map.get(key)[weapon]) map.get(key)[weapon] = [];
        if (!map.get(key)[weapon].includes(entry.label)) {
          map.get(key)[weapon].push(entry.label);
        }
      });

      return [...map.entries()]
        .map(([combination, groupedWeapons]) => ({ combination, weapons: groupedWeapons, states: Object.fromEntries(states.get(combination)) }))
        .sort((a, b) => a.combination.localeCompare(b.combination, 'ko'));
    }

    function referenceSection(title, rows, open) {
      const weapons = referenceWeapons();
      return `
        <details class="reference-section" ${open ? 'open' : ''}>
          <summary>${escapeHtml(title)} · ${rows.length}개 조합</summary>
          <div class="table-wrap">
            <table class="reference-table">
              <colgroup>
                <col class="option-col">
                ${weapons.map(() => `<col class="weapon-col">`).join('')}
              </colgroup>
              <thead>
                <tr>
                  <th>옵션 조합</th>
                  ${weapons.map(weapon => `<th>${escapeHtml(weapon)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map(row => `
                  <tr>
                    <td>${escapeHtml(row.combination)}</td>
                    ${weapons.map(weapon => `
                      <td class="cell-names">${(row.weapons[weapon] || []).map(name => referenceNameChip(name, row.states?.[name], true)).join(' ')}</td>`).join('')}
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </details>`;
    }

    function toggleAllReferenceSections() {
      const sections = [...document.querySelectorAll('.reference-section')];
      if (!sections.length) return;
      const shouldOpen = sections.some(section => !section.open);
      sections.forEach(section => { section.open = shouldOpen; });
      document.getElementById('toggleReferenceButton').textContent = shouldOpen ? '모두 접기' : '모두 펼치기';
    }


async function resetAllPersonalData() {
  const confirmed = await askConfirmation(
    `페이지 ${activeProfile}의 상태, 옵션 구성, 완료 체크, 개인 비고를 초기화할까요?\n다른 페이지의 기록은 유지됩니다.\n\n초기화 전 기록은 데이터 관리의 복원 전 사본에 보관됩니다.`
  );

  if (!confirmed) return;

  if (!await savePersonalData({}, true)) return;

  const notesSaved = await migratePersonalNotes();
  app.referenceRendered = false;

  renderFarm();

  if (app.activeTab === 'reference') {
    renderReference();
  }

  if (notesSaved) showToast(`페이지 ${activeProfile}의 저장 데이터를 초기화했습니다.`);
}

    let toastTimer = null;
    function showToast(message, isError = false) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.toggle('error', isError);
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function escapeAttr(value) {
      return escapeHtml(value).replaceAll('`', '&#096;');
    }

    function structuredCloneSafe(value) {
      if (typeof structuredClone === 'function') return structuredClone(value);
      return JSON.parse(JSON.stringify(value));
    }

    function profileLabel(profile) {
      try { return JSON.parse(localStorage.getItem('gf2-profile-names-v1') || '{}')[profile] || '페이지 ' + profile; }
      catch (_) { return '페이지 ' + profile; }
    }
    function updateStorageWarning(message) {
      const warning = document.getElementById('storageWarning');
      warning.hidden = !storageReadError && !message;
      warning.textContent = message || '저장 기록을 읽을 수 없어 자동 저장을 중단했습니다. 백업·페이지 관리에서 원본을 내려받고 백업을 복원해주세요.';
      document.getElementById('currentProfileLabel').textContent = '현재 기록: ' + profileLabel(activeProfile);
    }
    function downloadJSON(value, filename, raw = false) {
      const url = URL.createObjectURL(new Blob([raw ? value : JSON.stringify(value, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    function backupPages() {
      const profiles = {};
      for (const profile of [1, 2, 3]) profiles[profile] = { name: profileLabel(profile), personal: GF2Store.read(localStorage, profile).data };
      return { app: '소녀전선2 장비 파밍 도우미', version: 6, personalKey: 'doll-id', exportedAt: new Date().toISOString(), profiles };
    }
    function parseBackup(text) {
      if (text.length > 5 * 1024 * 1024) throw Error('백업 파일은 5MB 이하만 사용할 수 있습니다.');
      const payload = JSON.parse(text);
      if (payload.app !== '소녀전선2 장비 파밍 도우미' || ![4, 5, 6].includes(payload.version)) throw Error('지원하는 GF2 백업 파일이 아닙니다.');
      const profiles = payload.version === 6 ? payload.profiles : { [payload.profile || 1]: { name: '이전 백업', personal: payload.personal } };
      if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) throw Error('페이지 정보가 없습니다.');
      for (const [key, page] of Object.entries(profiles)) {
        if (!['1', '2', '3'].includes(key)) throw Error('알 수 없는 페이지입니다.');
        GF2Store.validate(page.personal);
      }
      if (!Object.keys(profiles).length) throw Error('복원할 페이지가 없습니다.');
      return profiles;
    }
    function bindDataTools() {
      const byId = id => document.getElementById(id);
      const dialog = byId('dataDialog');
      let imported = null, rawAtPreview = null;
      const report = error => { byId('dataMessage').textContent = error.message || String(error); };
      byId('dataToolsButton').onclick = () => {
        imported = null; byId('applyImport').disabled = true;
        byId('importFile').value = ''; byId('importSource').innerHTML = ''; byId('importSource').disabled = true;
        byId('importPreview').textContent = '파일을 선택하면 현재 페이지에 복원될 기록을 미리 보여드립니다.';
        byId('profileNameInput').value = profileLabel(activeProfile);
        byId('dataMessage').textContent = '';
        dialog.showModal();
      };
      byId('closeDataDialog').onclick = () => { dialog.close(); byId('dataToolsButton').focus(); };
      byId('saveProfileName').onclick = () => {
        try {
          const name = byId('profileNameInput').value.trim().slice(0, 20);
          const names = JSON.parse(localStorage.getItem('gf2-profile-names-v1') || '{}');
          names[activeProfile] = name || '페이지 ' + activeProfile;
          localStorage.setItem('gf2-profile-names-v1', JSON.stringify(names));
          renderProfileButtons(); updateStorageWarning(); report('페이지 이름을 저장했습니다.');
        } catch (error) { report(error); }
      };
      byId('exportAllButton').onclick = () => { try { downloadJSON(backupPages(), 'gf2-all-pages-backup.json'); } catch (error) { report(error); } };
      byId('exportRawButton').onclick = () => {
        try { downloadJSON(localStorage.getItem(personalStorageKey()) || '{}', 'gf2-page-' + activeProfile + '-raw.json', true); } catch (error) { report(error); }
      };
      byId('exportPreviousButton').onclick = () => {
        try {
          const raw = localStorage.getItem(personalStorageKey() + ':before-restore');
          if (raw == null) throw Error('이 페이지에는 초기화·복원 전 기록이 없습니다.');
          try {
            downloadJSON({ app: '소녀전선2 장비 파밍 도우미', version: 5, profile: activeProfile, personal: GF2Store.validate(JSON.parse(raw)) }, 'gf2-before-restore.json');
          } catch (_) {
            downloadJSON(raw, 'gf2-before-restore-raw.json', true);
            report('이전 기록의 형식이 손상되어 원본 그대로 내려받았습니다.');
          }
        } catch (error) { report(error); }
      };
      const preview = () => {
        const page = imported?.[byId('importSource').value];
        byId('applyImport').disabled = !page;
        rawAtPreview = localStorage.getItem(personalStorageKey());
        if (page) byId('importPreview').textContent = Object.keys(page.personal).length + '개 인형 기록으로 ' + profileLabel(activeProfile) + '의 기록을 교체합니다. 다른 페이지는 유지됩니다. 현재 기록은 복원 전 사본으로 보관됩니다.';
      };
      byId('importSource').onchange = preview;
      byId('importFile').onchange = async event => {
        imported = null; byId('applyImport').disabled = true; byId('importSource').disabled = true;
        try {
          const file = event.target.files[0]; if (!file) return;
          if (file.size > 5 * 1024 * 1024) throw Error('백업 파일은 5MB 이하만 사용할 수 있습니다.');
          imported = parseBackup(await file.text());
          byId('importSource').innerHTML = Object.entries(imported).map(([id, page]) => '<option value="' + id + '">' + escapeHtml(page.name || '페이지 ' + id) + '</option>').join('');
          byId('importSource').disabled = false; preview(); report('미리보기를 확인한 뒤 복원해주세요.');
        } catch (error) { report(error); }
      };
      byId('applyImport').onclick = async () => {
        if (savingPersonal || !imported) return;
        savingPersonal = true; byId('applyImport').disabled = true;
        try {
          personalSnapshot = await GF2Store.recover(localStorage, navigator.locks, activeProfile, imported[byId('importSource').value].personal, rawAtPreview);
          app.personal = personalSnapshot.data; storageReadError = false;
          savingPersonal = false;
          await migratePersonalNotes();
          renderFarm(); if (app.activeTab === 'reference') renderReference(); updateStorageWarning();
          imported = null; report('현재 페이지의 기록을 복원했습니다.');
        } catch (error) { report(error); byId('applyImport').disabled = false; }
        finally { savingPersonal = false; }
      };
      window.addEventListener('storage', event => {
        if (event.key === personalStorageKey() || event.key === null) updateStorageWarning('다른 탭에서 기록이 변경되었습니다. 편집 중인 내용을 확인하고 새로고침해주세요. 같은 인형의 충돌 저장은 차단됩니다.');
      });
    }

    init();
