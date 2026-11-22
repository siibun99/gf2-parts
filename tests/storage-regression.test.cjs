const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [fs.readFileSync(path.join(root, 'app-2.js'), 'utf8')];
const admin = fs.readFileSync(path.join(root, 'admin.js'), 'utf8').replace(/init\(\)\.catch[\s\S]*$/, '');
const options = fs.readFileSync(path.join(root, 'options.js'), 'utf8');
const store = fs.readFileSync(path.join(root, 'personal-store.js'), 'utf8');
const run = (c, code) => vm.runInContext('(async () => {' + code + '})()', c);
function setup(c) { c.window = c; c.navigator = { locks: { request: async (_, fn) => fn() } }; c.setTimeout = () => {}; c.sessionStorage = {removeItem(){},setItem(){}}; vm.runInContext(options, c); vm.runInContext(store, c); }

function userContext() {
  const storage = new Map();
  const context = vm.createContext({
    console: { error() {} },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  });
  setup(context);
  context.document = {getElementById: () => ({hidden:false, textContent:''})};
  context.askConfirmation = async () => true;
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

test('reference filters apply to muzzle and sets, persist independently, and follow profiles', async () => {
  const c = userContext();
  const elements = Object.fromEntries(['referenceContent','toggleReferenceButton','referenceSets','referenceLayout','referenceCount','storageWarning','currentProfileLabel'].map(id => [id, {querySelectorAll:()=>[], classList:{toggle(){}}, dataset:{}}]));
  c.document = { querySelectorAll: () => [], getElementById: id => elements[id] };
  await run(c, `
    app.referenceMode = 'table';
    app.data = {
      dolls: ['Owned', 'Unowned', 'Complete', 'AllSlots'].map((name, index) => ({
        id: 'd' + index, name, weapon: '돌격소총', setOptions: ['세트'], muzzle: ['공격'], part: ['공격']
      })),
      weapons: ['돌격소총'], setOptions: ['세트'], statOptions: ['공격']
    };
    await setConfig(app.data.dolls[1], { status: 'unowned' });
    await setConfig(app.data.dolls[2], { status: 'completed' });
    await setConfig(app.data.dolls[3], { status: 'tracked', done: { muzzle: true, p1: true, p2: true, p3: true } });
    renderReference();
  `);
  for (const name of ['Owned', 'Unowned', 'Complete', 'AllSlots']) assert.ok(elements.referenceContent.innerHTML.includes(name));
  await run(c, 'app.referenceHideUnowned = true; renderReference();');
  assert.ok(!elements.referenceContent.innerHTML.includes('Unowned'));
  assert.ok(elements.referenceContent.innerHTML.includes('Complete'));
  await run(c, 'app.referenceHideCompleted = true; saveUiPreferences(); renderReference();');
  assert.ok(!elements.referenceContent.innerHTML.includes('Complete'));
  assert.ok(!elements.referenceContent.innerHTML.includes('AllSlots'));
  assert.equal((elements.referenceContent.innerHTML.match(/Owned/g) || []).length, 2);
  assert.equal(vm.runInContext('loadUiPreferences().referenceHideCompleted && loadUiPreferences().referenceHideUnowned && !loadUiPreferences().hideUnowned', c), true);
  await run(c, `
    closeEditor = () => {};
    renderProfileButtons = () => {};
    app.activeTab = 'reference';
    await switchProfile(2);
  `);
  assert.ok(elements.referenceContent.innerHTML.includes('Unowned'));
  assert.ok(elements.referenceContent.innerHTML.includes('Complete'));
  await run(c, `
    for (const d of app.data.dolls) await setConfig(d, { status: 'completed' }); renderReference();
  `);
  assert.match(elements.referenceContent.innerHTML, /현재 표시 조건에 맞는/);
  assert.ok(!elements.referenceContent.innerHTML.includes('<table'));
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
  setup(c); vm.runInContext(admin, c);
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
  assert.match(fields.loginStatus.textContent, /잠시/);
  assert.equal(fields.sendLoginButton.disabled, true);
  assert.equal(request.options.shouldCreateUser, false);
  vm.runInContext('loginRetryAt = 0;', c);
  const retry = vm.runInContext('sendLoginLink({preventDefault(){}})', c);
  finish({ error: null });
  await retry;
  assert.equal(calls, 2);
  assert.match(fields.loginStatus.textContent, /로그인 링크를 보냈습니다/);
  assert.equal(fields.loginEmail.disabled, false);
});

test('legacy progress migrates without notes and survives a rename and reload', async () => {
  const c = userContext();
  await run(c, `
    app.personal = { Old: { status: 'tracked', done: { p1: true }, personalNote: 'keep' } };
    await migratePersonalNotes();
    doll.name = 'New';
    app.personal = loadPersonalData();
  `);
  assert.equal(vm.runInContext('getConfig(doll).status', c), 'tracked');
  assert.equal(vm.runInContext('getConfig(doll).done.p1', c), true);
  assert.equal(vm.runInContext('getConfig(doll).personalNote', c), 'keep');
  assert.equal(vm.runInContext('Object.hasOwn(app.personal, "Old")', c), false);
});

test('ID data wins over legacy data; failed migration preserves original data', async () => {
  const c = userContext();
  await run(c, `
    app.personal = { Old: { status: 'tracked' }, 'id-1': { status: 'unowned' } };
    await migratePersonalNotes();
  `);
  assert.equal(vm.runInContext('getConfig(doll).status', c), 'unowned');
  await run(c, `
    app.personal = { Old: { status: 'tracked' } };
    globalThis.before = JSON.stringify(app.personal);
    localStorage.setItem = () => { throw Error('quota'); };
    doll.note = 'default';
    await migratePersonalNotes();
  `);
  assert.equal(vm.runInContext('JSON.stringify(app.personal) === before', c), true);
});

test('failed note/editor saves do not report success or close the editor; retry works', async () => {
  const c = userContext();
  await run(c, `
    globalThis.workingSave = localStorage.setItem;
    localStorage.setItem = () => { throw Error('quota'); };
    await handleCardChange({ target: { dataset: { action: 'personal-note' }, value: 'new note',
      closest: () => ({ dataset: { name: 'Old' } }) } });
    globalThis.closed = false;
    closeEditor = () => { closed = true; };
    app.editorName = 'Old';
    app.editorDraft = defaultConfig(doll);
    await saveEditor();
  `);
  assert.equal(vm.runInContext('messages.length === 2 && messages.every(m => m[1] === true)', c), true);
  assert.equal(vm.runInContext('Object.keys(app.personal).length', c), 0);
  assert.equal(vm.runInContext('closed', c), false);
  await run(c, 'localStorage.setItem = workingSave; await saveEditor();');
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
    fields.saveDollButton = {}; fields.saveStatus = {};
    let release;
    let uploads = 0;
    let record;
    const c = vm.createContext({ window: {}, document: { getElementById: id => fields[id] }, console: { error() {} } });
    setup(c); vm.runInContext(admin, c);
    c.upload = () => { uploads++; return new Promise(resolve => { release = resolve; }); };
    c.database = { from: () => ({ update: payload => { const q = { eq(key,value) { if(key === 'id') record = {id:value, ...payload}; return q; }, select() { return q; }, async maybeSingle() { return {data: fail ? null : {id:'A'}, error:null}; } }; return q; } }) };
    vm.runInContext('session = {}; editingVersion = "version-1"; db = database; uploadImage = upload; toast = () => {}; loadDolls = async () => {}; clearForm = () => {};', c);
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


test('three profiles preserve legacy page one and isolate reset and reference refresh', async () => {
  const c = userContext();
  await run(c, `
    closeEditor = () => {};
    renderProfileButtons = () => {};
    globalThis.referenceRenders = 0;
    renderReference = () => { referenceRenders++; };
    app.activeTab = 'reference';
    await setConfig(doll, { status: 'tracked', personalNote: 'one' });
    globalThis.originalKey = personalStorageKey();
    await switchProfile(2);
  `);
  assert.equal(vm.runInContext('getConfig(doll).status', c), 'none');
  await run(c, 'await setConfig(doll, { status: "unowned", personalNote: "two" }); await switchProfile(3);');
  assert.equal(vm.runInContext('getConfig(doll).status', c), 'none');
  await run(c, 'await setConfig(doll, { status: "completed" }); await switchProfile(2);');
  assert.equal(vm.runInContext('getConfig(doll).personalNote', c), 'two');
  c.confirm = () => true;
  await run(c, 'await resetAllPersonalData(); await switchProfile(1);');
  assert.equal(vm.runInContext('getConfig(doll).personalNote', c), 'one');
  assert.equal(vm.runInContext('personalStorageKey() === originalKey', c), true);
  await run(c, 'await switchProfile(3); app.personal = loadPersonalData();');
  assert.equal(vm.runInContext('getConfig(doll).status', c), 'completed');
  assert.equal(vm.runInContext('localStorage.getItem("gf2-active-profile-v1")', c), '3');
  await run(c, 'await switchProfile(2);');
  assert.equal(vm.runInContext('getConfig(doll).status', c), 'none');
  assert.ok(vm.runInContext('referenceRenders', c) >= 6);
});

test('admin choices enforce slot limits and preserve existing database options', () => {
  const fields = { muzzle: { value: '' }, parts: { value: '' }, sets: { value: '' }, ...Object.fromEntries(['muzzleChoices','partsChoices','setsChoices'].map(k=>[k,{querySelectorAll:()=>[]}])) };
  const c = vm.createContext({ window: {}, document: { getElementById: id => fields[id] } });
  setup(c); vm.runInContext(admin, c);
  vm.runInContext('renderOptionChoices = () => {}; preserveDraft = () => {}; dolls = [{recommended_sets: ["기존 세트"]}];', c);
  vm.runInContext(`
    for (const v of ['공격', '공격 보너스', '치명타', '치명타 피해', '체력']) toggleAdminOption('muzzle', v);
    for (const v of ['공격', '공격 보너스', '치명타', '체력', '치명타 피해']) toggleAdminOption('parts', v);
    toggleAdminOption('sets', '기존 세트');
  `, c);
  assert.equal(fields.muzzle.value.split(', ').length, 4);
  assert.equal(fields.parts.value.split(', ').length, 3);
  assert.ok(!fields.parts.value.includes('치명타 피해'));
  assert.equal(fields.sets.value, '기존 세트');
  vm.runInContext('toggleAdminOption("parts", "공격"); toggleAdminOption("parts", "체력");', c);
  assert.ok(fields.parts.value.includes('체력'));
});

function storageHarness() {
  const values = new Map(); const storage = {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  const c=vm.createContext({});vm.runInContext(store,c);
  let queue=Promise.resolve();const locks={request:(_,fn)=>{const pending=queue.then(fn);queue=pending.catch(()=>{});return pending;}};
  return {store:c.GF2Store,storage,locks,values};
}
test('simultaneous independent edits merge, same-doll edits conflict without overwriting',async()=>{
  const {store:s,storage,locks}=storageHarness(); const first=s.read(storage,1),second=s.read(storage,1);
  await Promise.all([s.commit(storage,locks,1,first,{a:{status:'tracked'}}),s.commit(storage,locks,1,second,{b:{status:'unowned'}})]);
  assert.equal(s.read(storage,1).data.a.status,'tracked');assert.equal(s.read(storage,1).data.b.status,'unowned');
  const base=s.read(storage,1);
  await s.commit(storage,locks,1,base,{...base.data,a:{status:'completed'}});
  await assert.rejects(s.commit(storage,locks,1,base,{...base.data,a:{status:'unowned'}}),/다른 탭/);
  assert.equal(s.read(storage,1).data.a.status,'completed');
});
test('corrupt or empty records are preserved; recovery requires unchanged preview and saves raw original',async()=>{
  const {store:s,storage,locks}=storageHarness();
  for(const raw of ['{broken','', '[]']) {
    storage.setItem(s.key(1),raw);assert.throws(()=>s.read(storage,1));
    await assert.rejects(s.commit(storage,locks,1,null,{}));assert.equal(storage.getItem(s.key(1)),raw);
    await assert.rejects(s.recover(storage,locks,1,{},'other'),/미리보기/);
    await s.recover(storage,locks,1,{a:{status:'tracked'}},raw);
    assert.equal(storage.getItem(s.key(1)+':before-restore'),raw);
  }
});
test('replacement is guarded and preserves the previous page; unavailable locks fail closed',async()=>{
 const {store:s,storage,locks}=storageHarness();let base=s.read(storage,1);
 const saved=await s.commit(storage,locks,1,base,{a:{status:'tracked'}});
 await assert.rejects(s.commit(storage,locks,1,base,{},true),/다른 탭/);
 await assert.rejects(s.commit(storage,null,1,saved,{}),/브라우저/);
 await s.commit(storage,locks,1,saved,{},true);
 assert.equal(JSON.parse(storage.getItem(s.key(1)+':before-restore')).a.status,'tracked');
});
test('completed-doll reset clears completion while retaining note',async()=>{
 const c=userContext();await run(c,`await setConfig(doll,{...defaultConfig(doll),status:'completed',personalNote:'keep'});await resetDoll(doll);`);
 assert.equal(vm.runInContext('getConfig(doll).status',c),'tracked');
 assert.equal(vm.runInContext('Object.values(getConfig(doll).done).some(Boolean)',c),false);
 assert.equal(vm.runInContext('getConfig(doll).personalNote',c),'keep');
});
test('backup rejects malformed payloads and unsafe object keys',()=>{
 const c=userContext();
 for(const payload of [{version:6,app:'other',profiles:{}},{version:6,app:'소녀전선2 장비 파밍 도우미',profiles:{1:{personal:[]}}}]) {
   c.input=JSON.stringify(payload);assert.throws(()=>vm.runInContext('parseBackup(input)',c));
 }
 c.input='{"__proto__":{"status":"tracked"}}'; assert.throws(()=>vm.runInContext('GF2Store.validate(JSON.parse(input))',c));
 const pages=vm.runInContext('backupPages()',c);assert.equal(pages.version,6);assert.equal(Object.keys(pages.profiles).length,3);
});
test('all shipped script files parse and HTML has no inline executable handlers',()=>{
 for(const name of fs.readdirSync(root).filter(n=>n.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
 for(const name of ['index.html','admin.html','404.html']) {
  const source=fs.readFileSync(path.join(root,name),'utf8');assert.doesNotMatch(source,/\son\w+\s*=/i);
  for(const tag of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){assert.match(tag[1],/\bsrc=/);assert.equal(tag[2].trim(),'');}
 }
});
