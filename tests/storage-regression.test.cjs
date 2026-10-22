const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]);
const admin = fs.readFileSync(path.join(root, 'admin.js'), 'utf8');

function userContext() {
  const storage = new Map();
  const context = vm.createContext({
    console: { error() {} },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
  });
  vm.runInContext(scripts.at(-1).replace(/\binit\(\);\s*$/, ''), context);
  vm.runInContext(`
    const messages = [];
    showToast = (...args) => messages.push(args);
    renderFarm = () => {};
    const doll = { id: 'id-1', name: 'Old', part: [], muzzle: [], setOptions: [], note: '' };
    app.data = { dolls: [doll] };
  `, context);
  return context;
}

test('browser scripts parse', () => {
  scripts.forEach(script => new vm.Script(script));
  new vm.Script(admin);
});

test('inline login opens without prompt and handles validation, duplicate submits, failure and retry', async () => {
  const fields = {};
  for (const id of ['loginPanel', 'loginEmail', 'loginForm', 'loginStatus', 'sendLoginButton']) {
    fields[id] = { hidden: true, value: ' admin@example.com ', disabled: false,
      focus() {}, classList: { add() {}, remove() {} }, reportValidity: () => true };
  }
  let calls = 0;
  let finish;
  let request;
  const c = vm.createContext({ window: {}, URL, location: { href: 'https://gf2-parts.pages.dev/admin' },
    document: { getElementById: id => fields[id] } });
  vm.runInContext(admin.replace(/\binit\(\);\s*$/, ''), c);
  c.auth = { signInWithOtp: args => {
    calls++; request = args;
    return new Promise(resolve => { finish = resolve; });
  } };
  vm.runInContext('db = { auth };', c);
  await vm.runInContext('handleLogin()', c);
  assert.equal(fields.loginPanel.hidden, false);
  fields.loginForm.reportValidity = () => false;
  await vm.runInContext('sendLoginLink({preventDefault(){}})', c);
  assert.equal(calls, 0);
  fields.loginForm.reportValidity = () => true;
  const pending = vm.runInContext('sendLoginLink({preventDefault(){}})', c);
  await vm.runInContext('sendLoginLink({preventDefault(){}})', c);
  assert.equal(calls, 1);
  assert.equal(fields.sendLoginButton.disabled, true);
  assert.equal(request.email, 'admin@example.com');
  assert.equal(request.options.emailRedirectTo, 'https://gf2-parts.pages.dev/admin.html');
  finish({ error: new Error('email rate limit exceeded') });
  await pending;
  assert.equal(fields.loginStatus.textContent, 'email rate limit exceeded');
  assert.equal(fields.sendLoginButton.disabled, false);
  const retry = vm.runInContext('sendLoginLink({preventDefault(){}})', c);
  finish({ error: null });
  await retry;
  assert.equal(calls, 2);
  assert.match(fields.loginStatus.textContent, /로그인 링크를 보냈습니다/);
  assert.equal(fields.loginEmail.disabled, false);
});

test('legacy progress migrates without notes and survives a rename and reload', () => {
  const c = userContext();
  vm.runInContext(`
    app.personal = { Old: { status: 'tracked', done: { p1: true }, personalNote: 'keep' } };
    migratePersonalNotes();
    doll.name = 'New';
    app.personal = loadPersonalData();
  `, c);
  assert.equal(vm.runInContext('getConfig(doll).status', c), 'tracked');
  assert.equal(vm.runInContext('getConfig(doll).done.p1', c), true);
  assert.equal(vm.runInContext('getConfig(doll).personalNote', c), 'keep');
  assert.equal(vm.runInContext('Object.hasOwn(app.personal, "Old")', c), false);
});

test('ID data wins over legacy data; failed migration preserves original data', () => {
  const c = userContext();
  vm.runInContext(`
    app.personal = { Old: { status: 'tracked' }, 'id-1': { status: 'unowned' } };
    migratePersonalNotes();
  `, c);
  assert.equal(vm.runInContext('getConfig(doll).status', c), 'unowned');
  vm.runInContext(`
    app.personal = { Old: { status: 'tracked' } };
    const before = JSON.stringify(app.personal);
    localStorage.setItem = () => { throw Error('quota'); };
    doll.note = 'default';
    migratePersonalNotes();
  `, c);
  assert.equal(vm.runInContext('JSON.stringify(app.personal) === before', c), true);
});

test('failed note/editor saves do not report success or close the editor; retry works', () => {
  const c = userContext();
  vm.runInContext(`
    const workingSave = localStorage.setItem;
    localStorage.setItem = () => { throw Error('quota'); };
    handleCardChange({ target: { dataset: { action: 'personal-note' }, value: 'new note',
      closest: () => ({ dataset: { name: 'Old' } }) } });
    let closed = false;
    closeEditor = () => { closed = true; };
    app.editorName = 'Old';
    app.editorDraft = defaultConfig(doll);
    saveEditor();
  `, c);
  assert.equal(vm.runInContext('messages.length === 2 && messages.every(m => m[1] === true)', c), true);
  assert.equal(vm.runInContext('Object.keys(app.personal).length', c), 0);
  assert.equal(vm.runInContext('closed', c), false);
  vm.runInContext('localStorage.setItem = workingSave; saveEditor();', c);
  assert.equal(vm.runInContext('closed && getConfig(doll).status === "tracked"', c), true);
});

test('admin save snapshots inputs, rejects duplicate submits, and unlocks after success or failure', async () => {
  for (const fail of [false, true]) {
    const fields = {};
    for (const key of ['id', 'name', 'slug', 'parts', 'weapon', 'attribute', 'sets', 'muzzle',
      'note', 'commonKey', 'commonEffect', 'order', 'portraitScale', 'portraitOffsetX', 'portraitOffsetY']) {
      fields[key] = { value: 'A' };
    }
    fields.image = { files: [{}] };
    fields.removeImage = { checked: false };
    fields.active = { checked: true };
    fields.adminApp = { inert: false, setAttribute() {}, removeAttribute() {} };
    fields.loginButton = { disabled: false };
    let release;
    let uploads = 0;
    let record;
    const c = vm.createContext({ window: {}, document: { getElementById: id => fields[id] }, console: { error() {} } });
    vm.runInContext(admin.replace(/\binit\(\);\s*$/, ''), c);
    c.upload = () => { uploads++; return new Promise(resolve => { release = resolve; }); };
    c.database = { from: () => ({ update: payload => ({ eq: async (_, id) => {
      record = { id, ...payload };
      return { error: fail ? new Error('database failure') : null };
    } }) }) };
    vm.runInContext('session = {}; db = database; uploadImage = upload; toast = () => {}; loadDolls = async () => {}; clearForm = () => {};', c);
    const saving = vm.runInContext('saveDoll({ preventDefault() {} })', c);
    assert.equal(fields.adminApp.inert, true);
    assert.equal(fields.loginButton.disabled, true);
    await vm.runInContext('saveDoll({ preventDefault() {} })', c);
    assert.equal(uploads, 1);
    vm.runInContext('fillForm({});', c);
    fields.weapon.value = 'B';
    fields.note.value = 'B';
    release('image-A');
    await saving;
    assert.equal(record.weapon_type, 'A');
    assert.equal(record.default_note, 'A');
    assert.equal(record.id, 'A');
    assert.equal(fields.adminApp.inert, false);
    assert.equal(fields.loginButton.disabled, false);
    assert.equal(vm.runInContext('savingDoll', c), false);
  }
});
