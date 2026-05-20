// workspace.js — CATstimate Workspace
// Home + project hub. Projects persist to localStorage.
// Opening a tool passes the active project context via URL params.

(() => {
  const VERSION = '1.0';
  const STORAGE_KEY = 'catstimate_workspace_v1';

  // ════════════════════════════════════════════════════════════
  // APP REGISTRY
  // ════════════════════════════════════════════════════════════
  const APPS = [
    { id:'cutting',  name:'Cutting List',  sub:'Estimator',       color:'blue',   icon:'▤', status:'live',  file:'Cutting List Estimator.html' },
    { id:'arcrise',  name:'ArcRise',       sub:'Handrail / Ramp', color:'amber',  icon:'⌒', status:'live',  file:'ArcRise Estimator.html' },
    { id:'concrete', name:'ConcreteCalc',  sub:'Volume / Pour',   color:'gray',   icon:'▣', status:'soon' },
    { id:'formwork', name:'Formwork',      sub:'Sheets & Studs',  color:'purple', icon:'⌗', status:'soon' },
    { id:'tile',     name:'TileLayout',    sub:'Coverage',        color:'green',  icon:'⊞', status:'soon' },
    { id:'rebar',    name:'Rebar',         sub:'Bend Schedule',   color:'red',    icon:'≡', status:'idea' },
    { id:'paint',    name:'Paint',         sub:'Litres / Coats',  color:'blue',   icon:'◐', status:'idea' },
    { id:'convert',  name:'QuickConvert',  sub:'Units',           color:'gray',   icon:'⇄', status:'idea' }
  ];

  const COLOR_OPTIONS = ['#1d4ed8','#c07a10','#1a8a55','#6040c0','#c03030','#0f2350'];

  // ════════════════════════════════════════════════════════════
  // STATE
  // ════════════════════════════════════════════════════════════
  let state = { projects: [], settings: {} };
  let currentProjectId = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = JSON.parse(raw);
      if (!state.projects) state.projects = [];
      if (!state.settings) state.settings = {};
    } catch (e) { console.warn('Workspace load failed:', e); }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('Workspace save failed:', e); }
  }
  function uid() { return Math.random().toString(36).slice(2, 9); }

  const $ = id => document.getElementById(id);

  // ════════════════════════════════════════════════════════════
  // MASCOT
  // ════════════════════════════════════════════════════════════
  const POSES = ['idle','wave','sleep','wrench','hat-tip'];
  const POSE_HOLD = { wave:1100, wrench:1400, 'hat-tip':1500, sleep:2400, idle:900 };
  const TAP_REACTIONS = [
    { p:'wave',    m:'Welcome!' },
    { p:'wrench',  m:'Pick a tool.' },
    { p:'hat-tip', m:'Cheers!' },
    { p:'wave',    m:'Hi there.' },
    { p:'sleep',   m:'Zzz...' },
    { p:'wrench',  m:'Building...' },
    { p:'hat-tip', m:'Looking good.' },
    { p:'wave',    m:'Meow!' },
    { p:'sleep',   m:'Just a nap.' },
    { p:'hat-tip', m:'by N.Calatrava' }
  ];
  const catWrap = $('catWrap'), catBubble = $('catBubble');
  let catTimer = null, bubbleTimer = null, tapIdx = 0;

  function setCatPose(p) {
    POSES.forEach(name => { const el = $('cat-' + name); if (el) el.classList.toggle('on', name === p); });
  }
  function hopCat() {
    if (!catWrap || typeof catWrap.animate !== 'function') return;
    catWrap.animate(
      [{ transform: 'translateY(0) scale(1)' },
       { transform: 'translateY(-8px) scale(1.05)', offset: 0.4 },
       { transform: 'translateY(0) scale(1)' }],
      { duration: 420, easing: 'ease-out' }
    );
  }
  function sayBubble(text, ms) {
    if (!catBubble) return;
    catBubble.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'cat-bubble';
    div.textContent = text;
    catBubble.appendChild(div);
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { catBubble.innerHTML = ''; }, ms || 1700);
  }
  function poseFor(reason) {
    clearTimeout(catTimer);
    if (reason === 'created') {
      setCatPose('hat-tip'); hopCat(); sayBubble('Project ready.');
      catTimer = setTimeout(() => setCatPose('idle'), POSE_HOLD['hat-tip']);
    } else if (reason === 'launching') {
      setCatPose('wrench'); hopCat();
      catTimer = setTimeout(() => setCatPose('idle'), POSE_HOLD.wrench);
    } else if (reason === 'welcome') {
      setCatPose('wave'); hopCat();
      catTimer = setTimeout(() => setCatPose('idle'), POSE_HOLD.wave);
    }
  }
  if (catWrap) {
    catWrap.addEventListener('click', () => {
      const r = TAP_REACTIONS[tapIdx % TAP_REACTIONS.length];
      tapIdx++;
      setCatPose(r.p); hopCat(); sayBubble(r.m, r.p === 'sleep' ? 2400 : 1700);
      clearTimeout(catTimer);
      catTimer = setTimeout(() => setCatPose('idle'), POSE_HOLD[r.p] || 1200);
    });
  }

  // ════════════════════════════════════════════════════════════
  // VIEW SWITCHING
  // ════════════════════════════════════════════════════════════
  function showHome() {
    currentProjectId = null;
    $('view-home').classList.add('on');
    $('view-project').classList.remove('on');
    history.replaceState(null, '', location.pathname);
    renderHome();
    window.scrollTo({ top: 0 });
  }
  function showProject(id) {
    currentProjectId = id;
    $('view-home').classList.remove('on');
    $('view-project').classList.add('on');
    history.replaceState(null, '', '?p=' + encodeURIComponent(id));
    renderProjectDetail();
    window.scrollTo({ top: 0 });
  }

  // ════════════════════════════════════════════════════════════
  // HOME RENDERING
  // ════════════════════════════════════════════════════════════
  function renderHome() {
    // Stats
    const totalEstimates = state.projects.reduce((s, p) => s + (p.estimates?.length || 0), 0);
    $('stat-tools').textContent = APPS.filter(a => a.status === 'live').length;
    $('stat-projects').textContent = state.projects.length;
    $('stat-estimates').textContent = totalEstimates;

    // App grid
    const grid = $('appGrid');
    grid.innerHTML = '';
    APPS.forEach(app => {
      const tile = document.createElement(app.status === 'live' ? 'a' : 'div');
      tile.className = 'app-tile ' + app.status;
      if (app.status === 'live') {
        tile.href = app.file;
        tile.addEventListener('click', (e) => {
          e.preventDefault();
          poseFor('launching');
          setTimeout(() => location.href = app.file, 200);
        });
      }
      const chip = app.status === 'soon' ? '<span class="chip chip-amber">Soon</span>'
                : app.status === 'idea' ? '<span class="chip chip-purple">Idea</span>'
                : '';
      tile.innerHTML = `
        <div class="app-tile-head">
          <div class="app-icon ${app.color}">${app.icon}</div>
          ${chip}
        </div>
        <div class="app-name">${app.name}</div>
        <div class="app-sub">${app.sub}</div>`;
      grid.appendChild(tile);
    });

    // Projects list
    $('projects-count').textContent = `${state.projects.length} project${state.projects.length!==1?'s':''}`;
    const list = $('projectList'), empty = $('projects-empty');
    list.innerHTML = '';
    if (state.projects.length === 0) {
      empty.innerHTML = `
        <div class="empty-state">
          <img class="pixel-art" src="assets/cat-sleep.png" alt="" style="width:80px;height:80px;object-fit:contain">
          <div class="es-title">No projects yet</div>
          <div class="es-body">Projects bundle estimates from multiple tools together. Create your first one to get started.</div>
        </div>`;
    } else {
      empty.innerHTML = '';
      // Sort by updatedAt desc
      const sorted = [...state.projects].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      sorted.forEach(p => {
        const row = document.createElement('div');
        row.className = 'project-row';
        row.addEventListener('click', () => showProject(p.id));
        const est = p.estimates?.length || 0;
        const updated = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—';
        row.innerHTML = `
          <div class="project-bar" style="background:${p.color || '#1d4ed8'}"></div>
          <div class="project-info">
            <div class="project-name">${escapeHtml(p.name || 'Untitled')}</div>
            <div class="project-meta">${escapeHtml(p.client || 'No client')} · updated ${updated}</div>
          </div>
          <div class="project-stats">
            <span class="chip chip-blue">${est} estimate${est!==1?'s':''}</span>
          </div>`;
        list.appendChild(row);
      });
    }
  }

  // ════════════════════════════════════════════════════════════
  // PROJECT DETAIL RENDERING
  // ════════════════════════════════════════════════════════════
  function getProject(id) { return state.projects.find(p => p.id === id); }

  function renderProjectDetail() {
    const p = getProject(currentProjectId);
    if (!p) { showHome(); return; }
    $('detail-bar').style.background = p.color || '#1d4ed8';
    $('detail-title').value = p.name || '';
    $('detail-client').value = p.client || '';
    $('detail-unit').value = p.unit || 'm';
    $('detail-notes').value = p.notes || '';
    const created = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—';
    const est = p.estimates?.length || 0;
    $('detail-sub').textContent = `Created ${created} · ${est} estimate${est!==1?'s':''}`;

    // App tiles in project context — only live tools
    const grid = $('projectAppGrid');
    grid.innerHTML = '';
    APPS.filter(a => a.status === 'live').forEach(app => {
      const tile = document.createElement('a');
      tile.className = 'app-tile live';
      tile.href = '#';
      tile.addEventListener('click', (e) => {
        e.preventDefault();
        openAppWithProject(app, p);
      });
      tile.innerHTML = `
        <div class="app-tile-head">
          <div class="app-icon ${app.color}">${app.icon}</div>
          <span class="chip chip-green">Open</span>
        </div>
        <div class="app-name">${app.name}</div>
        <div class="app-sub">${app.sub}</div>`;
      grid.appendChild(tile);
    });
    APPS.filter(a => a.status !== 'live').forEach(app => {
      const tile = document.createElement('div');
      tile.className = 'app-tile ' + app.status;
      const chip = app.status === 'soon' ? '<span class="chip chip-amber">Soon</span>' : '<span class="chip chip-purple">Idea</span>';
      tile.innerHTML = `
        <div class="app-tile-head">
          <div class="app-icon ${app.color}">${app.icon}</div>
          ${chip}
        </div>
        <div class="app-name">${app.name}</div>
        <div class="app-sub">${app.sub}</div>`;
      grid.appendChild(tile);
    });

    // Linked estimates
    $('estimates-count').textContent = `${est} linked`;
    const elist = $('estimates-list');
    elist.innerHTML = '';
    if (est === 0) {
      elist.innerHTML = `
        <div class="empty-state">
          <img class="pixel-art" src="assets/cat-sleep.png" alt="" style="width:64px;height:64px;object-fit:contain">
          <div class="es-title">No estimates yet</div>
          <div class="es-body">Open a tool above and save an estimate — it'll link back here automatically.</div>
        </div>`;
    } else {
      // Sort estimates by updatedAt desc
      const sorted = [...p.estimates].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      sorted.forEach(e => {
        const app = APPS.find(a => a.id === e.appId) || { color:'gray', name:e.appId };
        const colorMap = { blue:'#1d4ed8', amber:'#c07a10', green:'#1a8a55', purple:'#6040c0', gray:'#3a4a78', red:'#c03030' };
        const row = document.createElement('div');
        row.className = 'estimate-row';
        const updated = e.updatedAt ? new Date(e.updatedAt).toLocaleDateString() : '—';
        row.innerHTML = `
          <div class="estimate-bar" style="background:${colorMap[app.color] || '#1d4ed8'}"></div>
          <div class="estimate-info">
            <div class="estimate-app">${app.name}</div>
            <div class="estimate-meta">${escapeHtml(e.summary || '—')} · ${updated}</div>
          </div>
          <button class="btn btn-outline btn-sm" data-estimate="${e.id}">Open →</button>`;
        row.querySelector('button').addEventListener('click', () => {
          const a = APPS.find(x => x.id === e.appId);
          if (a && a.file) openAppWithProject(a, p);
        });
        elist.appendChild(row);
      });
    }
  }

  function openAppWithProject(app, p) {
    poseFor('launching');
    const params = new URLSearchParams({
      project: p.id,
      name: p.name || '',
      client: p.client || ''
    });
    setTimeout(() => {
      location.href = app.file + '?' + params.toString();
    }, 200);
  }

  // ════════════════════════════════════════════════════════════
  // PROJECT CRUD
  // ════════════════════════════════════════════════════════════
  function createProject({ name, client, color }) {
    const now = Date.now();
    const p = {
      id: uid(),
      name: name || 'Untitled project',
      client: client || '',
      color: color || COLOR_OPTIONS[0],
      notes: '',
      unit: 'm',
      createdAt: now,
      updatedAt: now,
      estimates: []
    };
    state.projects.unshift(p);
    save();
    return p;
  }
  function updateProject(id, patch) {
    const p = getProject(id); if (!p) return;
    Object.assign(p, patch);
    p.updatedAt = Date.now();
    save();
  }
  function deleteProject(id) {
    state.projects = state.projects.filter(p => p.id !== id);
    save();
  }

  // ════════════════════════════════════════════════════════════
  // NEW PROJECT MODAL
  // ════════════════════════════════════════════════════════════
  let selectedColor = COLOR_OPTIONS[0];
  function renderColorPicker() {
    const wrap = $('np-colors');
    wrap.innerHTML = '';
    COLOR_OPTIONS.forEach(c => {
      const sw = document.createElement('button');
      sw.style.cssText = `width:30px;height:30px;background:${c};border:var(--pixel) solid var(--ink);cursor:pointer;box-shadow:${c===selectedColor?'inset 0 0 0 3px #fff, inset 0 0 0 5px '+c:'2px 2px 0 0 var(--ink)'}`;
      sw.addEventListener('click', () => { selectedColor = c; renderColorPicker(); });
      wrap.appendChild(sw);
    });
  }
  function openNewProjectModal() {
    $('np-name').value = '';
    $('np-client').value = '';
    selectedColor = COLOR_OPTIONS[0];
    renderColorPicker();
    $('newProjectModal').classList.add('on');
    setTimeout(() => $('np-name').focus(), 60);
  }
  function closeNewProjectModal() { $('newProjectModal').classList.remove('on'); }

  $('btn-new-project').addEventListener('click', openNewProjectModal);
  $('np-cancel').addEventListener('click', closeNewProjectModal);
  $('np-create').addEventListener('click', () => {
    const name = $('np-name').value.trim();
    if (!name) { $('np-name').focus(); return; }
    const p = createProject({ name, client: $('np-client').value.trim(), color: selectedColor });
    closeNewProjectModal();
    poseFor('created');
    setTimeout(() => showProject(p.id), 400);
  });
  $('newProjectModal').addEventListener('click', (e) => {
    if (e.target.id === 'newProjectModal') closeNewProjectModal();
  });
  $('np-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('np-create').click(); });

  // ════════════════════════════════════════════════════════════
  // PROJECT DETAIL EVENTS
  // ════════════════════════════════════════════════════════════
  $('btn-back').addEventListener('click', showHome);

  const detailFields = [
    ['detail-title', 'name'],
    ['detail-client', 'client'],
    ['detail-notes', 'notes'],
    ['detail-unit', 'unit']
  ];
  detailFields.forEach(([id, key]) => {
    const ev = id === 'detail-unit' ? 'change' : 'input';
    $(id).addEventListener(ev, (e) => {
      if (!currentProjectId) return;
      updateProject(currentProjectId, { [key]: e.target.value });
      // Update home stats next time we go back
    });
  });

  $('btn-delete-project').addEventListener('click', () => {
    if (!currentProjectId) return;
    if (confirm('Delete this project? Linked estimates will be unlinked but tool data stays in the apps.')) {
      deleteProject(currentProjectId);
      showHome();
    }
  });

  // ════════════════════════════════════════════════════════════
  // SHARE MODAL
  // ════════════════════════════════════════════════════════════
  $('btn-share').addEventListener('click', () => {
    const p = getProject(currentProjectId); if (!p) return;
    // Encode minimal project info into URL hash
    const data = btoa(unescape(encodeURIComponent(JSON.stringify({
      n: p.name, c: p.client, u: p.unit, col: p.color
    }))));
    const url = location.origin + location.pathname + '#share=' + data;
    $('share-url').value = url;
    $('shareModal').classList.add('on');
  });
  $('share-close').addEventListener('click', () => $('shareModal').classList.remove('on'));
  $('share-copy').addEventListener('click', () => {
    const inp = $('share-url');
    inp.select();
    try { navigator.clipboard?.writeText(inp.value); } catch (e) {}
    $('share-copy').textContent = 'Copied!';
    setTimeout(() => $('share-copy').textContent = 'Copy link', 1200);
  });
  $('shareModal').addEventListener('click', (e) => {
    if (e.target.id === 'shareModal') $('shareModal').classList.remove('on');
  });

  // ════════════════════════════════════════════════════════════
  // ROUTING (deep link to project)
  // ════════════════════════════════════════════════════════════
  function maybeOpenFromUrl() {
    const params = new URLSearchParams(location.search);
    const pid = params.get('p');
    if (pid && getProject(pid)) {
      showProject(pid);
      return true;
    }
    // Share link?
    const hash = location.hash;
    if (hash.startsWith('#share=')) {
      try {
        const data = JSON.parse(decodeURIComponent(escape(atob(hash.slice(7)))));
        // Prompt to import
        if (confirm(`Import shared project "${data.n}"?`)) {
          const p = createProject({ name: data.n, client: data.c, color: data.col });
          if (data.u) updateProject(p.id, { unit: data.u });
          history.replaceState(null, '', location.pathname);
          showProject(p.id);
          return true;
        }
        history.replaceState(null, '', location.pathname);
      } catch (e) { console.warn('Bad share link:', e); }
    }
    return false;
  }

  // ════════════════════════════════════════════════════════════
  // UTIL
  // ════════════════════════════════════════════════════════════
  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }

  // ════════════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════════════
  load();
  renderColorPicker();
  if (!maybeOpenFromUrl()) {
    showHome();
    poseFor('welcome');
  }
})();
