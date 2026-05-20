// cutting-list.js
// CATstimate Cutting List — math and UI logic.
// Math is verbatim from v1.1; chrome is upgraded to the Blueprint design kit
// with interactive mascot states (sleep/wrench/hat-tip).

document.addEventListener('DOMContentLoaded', function () {
  const VERSION = '1.2', VD = 'May 2026';
  const SC = ['#1d4ed8','#c07a10','#1a8a55','#6040c0','#c03030','#16a085','#d4ac0d','#2980b9'];
  const linPresets = {
    mm:[3000,6000,7500,9000,12000],
    m :[3,6,7.5,9,12],
    ft:[10,20,24,30,40],
    in:[120,240,288,360,480]
  };
  const shtPresets = {
    mm:[{w:1200,h:2400,l:'1200×2400'},{w:1220,h:2440,l:'4×8 ft'},{w:1500,h:3000,l:'1500×3000'},{w:2000,h:1000,l:'2000×1000'}],
    m :[{w:1.2,h:2.4,l:'1.2×2.4'},{w:1.5,h:3.0,l:'1.5×3.0'}],
    ft:[{w:4,h:8,l:'4×8'},{w:4,h:10,l:'4×10'}],
    in:[{w:48,h:96,l:'48×96'},{w:48,h:120,l:'48×120'}]
  };

  let linRows = [], sheetRows = [], balSections = [], gapMode = 'clear';

  function $(id) { return document.getElementById(id); }
  function gLU() { return $('unit-linear').value; }
  function gBU() { return $('unit-baluster').value; }
  function gSU() { return $('unit-sheet').value; }

  // ════════════════════════════════════════════════════════════
  // MASCOT — sprite swap + speech bubble + hop
  // ════════════════════════════════════════════════════════════
  const POSES = ['idle','wave','sleep','wrench','hat-tip'];
  const POSE_HOLD = { wave:1100, wrench:1400, 'hat-tip':1300, sleep:2400, idle:900 };
  const TAP_REACTIONS = [
    { p:'wave',    m:'Hello!' },
    { p:'wrench',  m:"Let's measure!" },
    { p:'hat-tip', m:'Cheers!' },
    { p:'wave',    m:'Need a hand?' },
    { p:'sleep',   m:'Zzz...' },
    { p:'wrench',  m:'Building...' },
    { p:'hat-tip', m:'Purr-fect.' },
    { p:'wave',    m:'Meow!' },
    { p:'sleep',   m:'Just a nap.' },
    { p:'hat-tip', m:'by N.Calatrava' }
  ];
  const catWrap = $('catWrap'), catBubble = $('catBubble');
  let catPose = 'idle', catTimer = null, bubbleTimer = null, tapIdx = 0;

  function setCatPose(p) {
    catPose = p;
    POSES.forEach(name => {
      const el = $('cat-' + name);
      if (el) el.classList.toggle('on', name === p);
    });
    // bob only when idle
    catWrap.classList.toggle('cat-bob', p === 'idle');
  }
  function hopCat() {
    if (!catWrap || typeof catWrap.animate !== 'function') return;
    catWrap.animate(
      [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-8px) scale(1.05)', offset: 0.4 },
        { transform: 'translateY(0) scale(1)' }
      ],
      { duration: 420, easing: 'ease-out' }
    );
  }
  function sayBubble(text, ms) {
    if (!catBubble) return;
    catBubble.textContent = '';
    const div = document.createElement('div');
    div.className = 'cat-bubble';
    div.textContent = text;
    catBubble.appendChild(div);
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { if (catBubble.firstChild) catBubble.innerHTML = ''; }, ms || 1700);
  }
  function poseFor(reason) {
    // reason: 'calculating' | 'success' | 'error' | 'empty' | null
    clearTimeout(catTimer);
    if (reason === 'calculating') {
      setCatPose('wrench'); hopCat();
      catTimer = setTimeout(() => setCatPose('idle'), POSE_HOLD.wrench);
    } else if (reason === 'success') {
      setCatPose('hat-tip'); hopCat(); sayBubble('Looking good.');
      catTimer = setTimeout(() => setCatPose('idle'), POSE_HOLD['hat-tip']);
    } else if (reason === 'error') {
      setCatPose('wrench'); hopCat(); sayBubble('Hmm...');
      catTimer = setTimeout(() => setCatPose('idle'), POSE_HOLD.wrench);
    } else {
      setCatPose('idle');
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
  // EMPTY-STATE RENDERER (pixel cat in empty cards)
  // ════════════════════════════════════════════════════════════
  function renderEmpty(containerId, src, title, body) {
    const el = $(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="empty-state">
        <img class="pixel-art" src="${src}" alt="" style="width:72px;height:72px;object-fit:contain">
        <div class="es-title">${title}</div>
        <div class="es-body">${body}</div>
      </div>`;
  }
  function clearEmpty(containerId) { const el = $(containerId); if (el) el.innerHTML = ''; }

  // ════════════════════════════════════════════════════════════
  // MODE SWITCH
  // ════════════════════════════════════════════════════════════
  ['linear','baluster','sheet'].forEach(t => {
    $('tab-'+t).addEventListener('click', () => {
      ['linear','baluster','sheet'].forEach(m => {
        $('tab-'+m).className = 'tab' + (m===t ? ' active' : '');
        $('mode-'+m).style.display = m===t ? 'block' : 'none';
      });
    });
  });

  // ════════════════════════════════════════════════════════════
  // HELP TOGGLES
  // ════════════════════════════════════════════════════════════
  ['linear','baluster','sheet'].forEach(id => {
    const tog = $('htog-'+id), panel = $('help-'+id), icon = $('icon-'+id);
    if (tog && panel) tog.addEventListener('click', () => {
      const open = panel.style.display !== 'none';
      panel.style.display = open ? 'none' : 'flex';
      if (icon) icon.className = 'help-icon' + (open ? '' : ' open');
    });
  });

  // ════════════════════════════════════════════════════════════
  // GAP TYPE TOGGLE
  // ════════════════════════════════════════════════════════════
  $('gtog-clear').addEventListener('click', () => applyGapMode('clear'));
  $('gtog-ctc').addEventListener('click',   () => applyGapMode('ctc'));
  function applyGapMode(mode) {
    gapMode = mode;
    $('gtog-clear').className = 'gap-type-card' + (mode==='clear' ? ' active' : '');
    $('gtog-ctc').className   = 'gap-type-card' + (mode==='ctc'   ? ' active' : '');
    $('gap-toggle-hint').innerHTML = '<span class="glyph">i</span><span>' +
      (mode==='clear'
        ? 'Recommended and max gap values are measured face to face (clear opening)'
        : 'Recommended and max gap values are measured centre to centre (includes one baluster width)')
      + '</span>';
    document.querySelectorAll('.gap-label-rec').forEach(e => e.textContent = mode==='clear' ? 'Recommended clear gap' : 'Recommended C-to-C gap');
    document.querySelectorAll('.gap-label-max').forEach(e => e.textContent = mode==='clear' ? 'Max clear gap'         : 'Max C-to-C gap');
    calcBaluster();
  }

  // ════════════════════════════════════════════════════════════
  // UNIT LABELS
  // ════════════════════════════════════════════════════════════
  function setUnitEls(ids, u) { ids.forEach(id => { const e = $(id); if (e) e.textContent = u; }); }
  function updateLinUnits() { const u = gLU(); setUnitEls(['lbl-su','lbl-tu','lbl-ku'], u); rebuildLinPresets(); }
  function updateBalUnits() { const u = gBU(); setUnitEls(['lbl-bsu','lbl-btu','lbl-bku'], u); document.querySelectorAll('.b-unit-tag').forEach(e => e.textContent = u); rebuildBalPresets(); }
  function updateShtUnits() { const u = gSU(); setUnitEls(['lbl-swu','lbl-shu','lbl-sku'], u); document.querySelectorAll('.s-unit-tag').forEach(e => e.textContent = u); rebuildShtPresets(); }
  $('unit-linear').addEventListener('change', updateLinUnits);
  $('unit-baluster').addEventListener('change', updateBalUnits);
  $('unit-sheet').addEventListener('change', updateShtUnits);

  function uid() { return Math.random().toString(36).slice(2,7); }

  function rebuildLinPresets() {
    const u = gLU(), c = $('presets-linear'); c.innerHTML = '';
    (linPresets[u] || []).forEach(v => {
      const b = document.createElement('button'); b.className = 'preset-btn';
      b.textContent = v + ' ' + u;
      b.addEventListener('click', () => { $('stock-len').value = v; calcLinear(); });
      c.appendChild(b);
    });
  }
  function rebuildBalPresets() {
    const u = gBU(), c = $('presets-baluster'); c.innerHTML = '';
    (linPresets[u] || []).forEach(v => {
      const b = document.createElement('button'); b.className = 'preset-btn';
      b.textContent = v + ' ' + u;
      b.addEventListener('click', () => { $('b-stock-len').value = v; calcBaluster(); });
      c.appendChild(b);
    });
  }
  function rebuildShtPresets() {
    const u = gSU(), c = $('presets-sheet'); c.innerHTML = '';
    (shtPresets[u] || []).forEach(p => {
      const b = document.createElement('button'); b.className = 'preset-btn';
      b.textContent = p.l;
      b.addEventListener('click', () => { $('sheet-w').value = p.w; $('sheet-h').value = p.h; calcSheet(); });
      c.appendChild(b);
    });
  }

  function buildGroupLabel(idxs) {
    const n = idxs.map(i => i + 1);
    if (n.length === 2) return `Bar ${n[0]} & ${n[1]} `;
    if (n[n.length-1] - n[0] === n.length - 1) return `Bar ${n[0]}–${n[n.length-1]} `;
    return 'Bar ' + n.join(', ') + ' ';
  }

  // ════════════════════════════════════════════════════════════
  // LINEAR
  // ════════════════════════════════════════════════════════════
  $('btn-add-linear').addEventListener('click', addLinRow);
  $('btn-calc-linear').addEventListener('click', () => { poseFor('calculating'); setTimeout(() => calcLinear(true), 200); });
  $('btn-clear-linear').addEventListener('click', () => {
    if (confirm('Clear all cuts?')) {
      linRows = []; $('linear-tbody').innerHTML = '';
      $('linear-results').style.display = 'none';
      $('linear-actions').style.display = 'none';
      $('linear-warn').innerHTML = '';
      $('lin-count').textContent = '0 cuts';
      refreshLinEmpty();
    }
  });
  $('btn-print-linear').addEventListener('click', () => window.print());
  $('btn-dl-linear').addEventListener('click', () => dlReport('linear'));
  $('collate-toggle').addEventListener('change', calcLinear);
  ['stock-len','lead-trim','kerf'].forEach(id => $(id).addEventListener('input', calcLinear));

  function refreshLinEmpty() {
    if (linRows.length === 0) {
      $('linear-table').style.display = 'none';
      renderEmpty('linear-empty', 'assets/cat-sleep.png',
        'No cuts yet',
        'Add a cut piece below to get started. The cat will wake up.');
    } else {
      $('linear-table').style.display = '';
      clearEmpty('linear-empty');
    }
  }
  function addLinRow() {
    linRows.push({ id: uid(), desc: '', len: 100, qty: 1 });
    buildLinRow(linRows.length - 1);
    updateLinCount();
    refreshLinEmpty();
  }
  function removeLinRow(id) {
    linRows = linRows.filter(r => r.id !== id);
    $('linear-tbody').innerHTML = '';
    linRows.forEach((_, i) => buildLinRow(i));
    updateLinCount();
    refreshLinEmpty();
    calcLinear();
  }
  function updateLinCount() { $('lin-count').textContent = linRows.reduce((s, r) => s + r.qty, 0) + ' cuts'; }
  function buildLinRow(i) {
    const r = linRows[i], u = gLU(), tr = document.createElement('tr'); tr.id = 'lrow-' + r.id;
    tr.innerHTML = `
      <td><input type="text" id="ldesc-${r.id}" value="${r.desc}" placeholder="Description" style="padding:5px 8px;font-size:12px"></td>
      <td><div style="display:flex;align-items:center;gap:4px"><input type="number" id="llen-${r.id}" value="${r.len}" min="1" style="padding:5px 8px;font-size:12px"><span class="b-unit-tag" style="font-size:10px;color:var(--blue);font-weight:700">${u}</span></div></td>
      <td><input type="number" id="lqty-${r.id}" value="${r.qty}" min="1" style="padding:5px 8px;font-size:12px"></td>
      <td><button class="btn btn-danger btn-sm" id="lrm-${r.id}">✕</button></td>`;
    $('linear-tbody').appendChild(tr);
    $('ldesc-'+r.id).addEventListener('input', e => r.desc = e.target.value);
    $('llen-'+r.id).addEventListener('input', e => { r.len = parseFloat(e.target.value) || 0; calcLinear(); });
    $('lqty-'+r.id).addEventListener('input', e => { r.qty = parseInt(e.target.value) || 1; updateLinCount(); calcLinear(); });
    $('lrm-'+r.id).addEventListener('click', () => removeLinRow(r.id));
  }

  function calcLinear(showSuccess) {
    if (!linRows.length) {
      $('linear-results').style.display = 'none';
      $('linear-actions').style.display = 'none';
      $('linear-warn').innerHTML = '';
      return;
    }
    const sl = parseFloat($('stock-len').value) || 0;
    const kerf = parseFloat($('kerf').value) || 0;
    const lt = parseFloat($('lead-trim').value) || 0;
    const unit = gLU();
    const collate = $('collate-toggle').checked;
    const eff = sl - lt;
    if (sl <= 0) return;

    let pieces = [], warnings = [];
    linRows.forEach(r => {
      if (r.len > eff) {
        warnings.push(`"${r.desc || 'Cut'}" (${r.len} ${unit}) exceeds usable stock (${eff} ${unit}).`);
        return;
      }
      for (let i = 0; i < r.qty; i++) pieces.push({ len: r.len, desc: r.desc || 'Cut' });
    });
    pieces.sort((a, b) => b.len - a.len);

    let bars = [];
    pieces.forEach(p => {
      let placed = false;
      for (const b of bars) {
        const u = b.cuts.reduce((s, c) => s + c.len + kerf, 0);
        if (u + p.len + (b.cuts.length ? kerf : 0) <= eff) { b.cuts.push(p); placed = true; break; }
      }
      if (!placed) bars.push({ cuts: [p] });
    });

    $('linear-warn').innerHTML = warnings.length
      ? `<div class="note error-note"><span class="glyph">⚠</span><span>${warnings.join('<br>')}</span></div>`
      : '';
    if (warnings.length && showSuccess) poseFor('error');

    if (!bars.length) {
      $('linear-results').style.display = 'none';
      $('linear-actions').style.display = 'none';
      return;
    }

    let tw = 0;
    bars.forEach(b => {
      const u = b.cuts.reduce((s, c) => s + c.len, 0) + kerf * (b.cuts.length - 1);
      tw += eff - u;
    });
    const wp = (tw / (bars.length * eff) * 100).toFixed(1);
    const tp = linRows.reduce((s, r) => s + r.qty, 0);

    $('linear-results').style.display = 'block';
    $('linear-actions').style.display = 'flex';
    $('linear-metrics').innerHTML = `
      <div class="metric-card"><div class="metric-label">Bars needed</div><div class="metric-value">${bars.length}</div></div>
      <div class="metric-card"><div class="metric-label">Total pieces</div><div class="metric-value">${tp}</div></div>
      <div class="metric-card"><div class="metric-label">Waste</div><div class="metric-value ${parseFloat(wp)>20?'warn':''}">${wp}<span class="metric-unit">%</span></div></div>
      <div class="metric-card"><div class="metric-label">Total waste</div><div class="metric-value">${tw.toFixed(0)}<span class="metric-unit">${unit}</span></div></div>
      ${lt>0?`<div class="metric-card"><div class="metric-label">Trim loss</div><div class="metric-value">${(lt*bars.length).toFixed(0)}<span class="metric-unit">${unit}</span></div></div>`:''}`;

    let groups = [];
    if (collate) {
      const sm = {};
      bars.forEach((b, i) => {
        const sig = b.cuts.map(c => c.len).sort((a, z) => a - z).join(',');
        if (!sm[sig]) sm[sig] = { bar: b, indices: [i] };
        else sm[sig].indices.push(i);
      });
      Object.values(sm).forEach(g => groups.push(g));
    } else {
      bars.forEach((b, i) => groups.push({ bar: b, indices: [i] }));
    }

    const bd = $('linear-bars'); bd.innerHTML = '';
    const COLS = ['#1d4ed8','#1e40af','#0f2350','#2874a6','#1f618d','#2e86c1'];
    groups.forEach(g => {
      const b = g.bar, idxs = g.indices, cnt = idxs.length;
      const used = b.cuts.reduce((s, c) => s + c.len, 0) + kerf * (b.cuts.length - 1);
      const waste = eff - used;
      const lbl = (cnt > 1 && collate)
        ? buildGroupLabel(idxs) + `<span class="group-badge">×${cnt} identical</span> — ${b.cuts.length} pcs each, waste: ${waste.toFixed(0)} ${unit}`
        : `Bar ${idxs[0]+1} — ${b.cuts.length} pcs, waste: ${waste.toFixed(0)} ${unit}`;
      let segs = '';
      if (lt > 0) segs += `<div class="bar-seg trim" style="width:${(lt/sl*100).toFixed(2)}%"></div>`;
      b.cuts.forEach((c, j) => {
        segs += `<div class="bar-seg" style="width:${(c.len/sl*100).toFixed(2)}%;background:${COLS[j%COLS.length]}">${c.len}</div>`;
        if (j < b.cuts.length - 1 && kerf > 0)
          segs += `<div class="bar-seg kerf" style="width:${(kerf/sl*100).toFixed(2)}%"></div>`;
      });
      if (waste > 0) segs += `<div class="bar-seg waste" style="width:${(waste/sl*100).toFixed(2)}%">${waste.toFixed(0)}</div>`;
      const d = document.createElement('div');
      d.className = 'bar-vis';
      d.innerHTML = `<div class="bar-label">${lbl}</div><div class="bar-track">${segs}</div>`;
      bd.appendChild(d);
    });

    if (showSuccess && !warnings.length) poseFor('success');
  }

  // ════════════════════════════════════════════════════════════
  // BALUSTER
  // ════════════════════════════════════════════════════════════
  $('btn-add-section').addEventListener('click', addBalSection);
  $('btn-calc-baluster').addEventListener('click', () => { poseFor('calculating'); setTimeout(() => calcBaluster(true), 200); });
  $('btn-clear-baluster').addEventListener('click', () => {
    if (confirm('Clear all sections?')) {
      balSections = [];
      $('baluster-sections').innerHTML = '';
      $('baluster-results').style.display = 'none';
      $('baluster-actions').style.display = 'none';
      $('baluster-warn').innerHTML = '';
      refreshBalEmpty();
    }
  });
  $('btn-print-baluster').addEventListener('click', () => window.print());
  $('btn-dl-baluster').addEventListener('click', () => dlReport('baluster'));
  $('b-collate-toggle').addEventListener('change', calcBaluster);
  ['b-stock-len','b-lead-trim','b-kerf'].forEach(id => $(id).addEventListener('input', calcBaluster));

  function refreshBalEmpty() {
    if (balSections.length === 0) {
      renderEmpty('baluster-empty', 'assets/cat-sleep.png',
        'No sections yet',
        'Add one section per continuous balustrade run. The cat will start measuring.');
    } else {
      clearEmpty('baluster-empty');
    }
  }
  function addBalSection() {
    const last = balSections.length ? balSections[balSections.length - 1] : null;
    balSections.push({
      id: uid(),
      name: 'Section ' + (balSections.length + 1),
      runLen:    last ? last.runLen    : 3600,
      baluWidth: last ? last.baluWidth : 40,
      recGap:    last ? last.recGap    : 80,
      maxGap:    last ? last.maxGap    : 100,
      spacing:   last ? last.spacing   : 'centred',
      cutLen:    last ? last.cutLen    : 900,
      result: null
    });
    buildBalSection(balSections.length - 1);
    refreshBalEmpty();
  }
  function removeBalSection(id) {
    balSections = balSections.filter(s => s.id !== id);
    $('baluster-sections').innerHTML = '';
    balSections.forEach((_, i) => buildBalSection(i));
    refreshBalEmpty();
  }
  function buildBalSection(si) {
    const s = balSections[si], u = gBU(), clr = SC[si % SC.length];
    const div = document.createElement('div');
    div.className = 'section-card'; div.id = 'scard-' + s.id;
    div.style.borderLeftColor = clr;
    div.innerHTML = `
      <div class="section-header-row">
        <span class="section-num-badge" style="background:${clr}">Section ${si+1}</span>
        <div class="section-name-field"><input type="text" id="sname-${s.id}" value="${s.name}" placeholder="Section name"></div>
        <button class="btn btn-danger btn-sm no-print" id="srm-${s.id}">✕</button>
      </div>
      <div class="field-row">
        <div class="field"><label>Run length <span class="b-unit-tag" style="color:var(--blue);font-weight:700">${u}</span></label><input type="number" id="brl-${s.id}" value="${s.runLen}" min="1"></div>
        <div class="field"><label>Baluster width <span class="b-unit-tag" style="color:var(--blue);font-weight:700">${u}</span></label><input type="number" id="bbw-${s.id}" value="${s.baluWidth}" min="1"></div>
      </div>
      <div class="field-row-3">
        <div class="field"><label class="gap-label-rec">${gapMode==='clear'?'Recommended clear gap':'Recommended C-to-C gap'} <span class="b-unit-tag" style="color:var(--blue);font-weight:700">${u}</span></label><input type="number" id="brg-${s.id}" value="${s.recGap}" min="1"></div>
        <div class="field"><label class="gap-label-max">${gapMode==='clear'?'Max clear gap':'Max C-to-C gap'} <span class="b-unit-tag" style="color:var(--blue);font-weight:700">${u}</span></label><input type="number" id="bmg-${s.id}" value="${s.maxGap}" min="1"></div>
        <div class="field"><label>Cut length <span class="b-unit-tag" style="color:var(--blue);font-weight:700">${u}</span></label><input type="number" id="bcl-${s.id}" value="${s.cutLen}" min="1"></div>
      </div>
      <div class="field">
        <label>Spacing style <span style="font-size:10px;color:var(--muted);font-weight:400;text-transform:none;letter-spacing:0">(centre-to-centre)</span></label>
        <div class="spacing-toggle no-print" style="margin-top:5px">
          <button class="spacing-opt ${s.spacing==='centred'?'active':''}" id="sopt-c-${s.id}">Centred layout</button>
          <button class="spacing-opt ${s.spacing==='even'?'active':''}" id="sopt-e-${s.id}">Even spacing</button>
        </div>
      </div>
      <div id="sres-${s.id}"></div>`;
    $('baluster-sections').appendChild(div);
    $('sname-'+s.id).addEventListener('input', e => s.name      = e.target.value);
    $('brl-'+s.id).addEventListener('input',   e => s.runLen    = parseFloat(e.target.value) || 0);
    $('bbw-'+s.id).addEventListener('input',   e => s.baluWidth = parseFloat(e.target.value) || 0);
    $('brg-'+s.id).addEventListener('input',   e => s.recGap    = parseFloat(e.target.value) || 0);
    $('bmg-'+s.id).addEventListener('input',   e => s.maxGap    = parseFloat(e.target.value) || 0);
    $('bcl-'+s.id).addEventListener('input',   e => s.cutLen    = parseFloat(e.target.value) || 0);
    $('srm-'+s.id).addEventListener('click', () => removeBalSection(s.id));
    $('sopt-c-'+s.id).addEventListener('click', () => { s.spacing='centred'; $('sopt-c-'+s.id).className='spacing-opt active'; $('sopt-e-'+s.id).className='spacing-opt'; });
    $('sopt-e-'+s.id).addEventListener('click', () => { s.spacing='even';    $('sopt-e-'+s.id).className='spacing-opt active'; $('sopt-c-'+s.id).className='spacing-opt'; });
  }

  function calcSpacing(s) {
    const recC = gapMode==='ctc' ? s.recGap - s.baluWidth : s.recGap;
    const maxC = gapMode==='ctc' ? s.maxGap - s.baluWidth : s.maxGap;
    if (recC <= 0 || maxC <= 0) return null;
    const pr = s.baluWidth + recC, nb = Math.round(s.runLen / pr);
    let bestN = null, bestC = null;
    for (const n of [nb, nb+1, nb-1]) {
      if (n < 1) continue;
      const pitch = s.runLen / n, cg = pitch - s.baluWidth;
      if (cg > 0 && cg <= maxC && (bestN === null || Math.abs(cg - recC) < Math.abs(bestC - recC))) {
        bestN = n; bestC = cg;
      }
    }
    if (bestN === null) {
      const nf = Math.ceil(s.runLen / (s.baluWidth + maxC));
      if (nf < 1) return null;
      bestN = nf; bestC = s.runLen / nf - s.baluWidth;
    }
    const pitch = s.runLen / bestN;
    return {
      n: bestN,
      pitch:       parseFloat(pitch.toFixed(2)),
      clearGap:    parseFloat(bestC.toFixed(2)),
      ctcGap:      parseFloat((bestC + s.baluWidth).toFixed(2)),
      clearMargin: parseFloat((pitch/2 - s.baluWidth/2).toFixed(2)),
      ctcMargin:   parseFloat((pitch/2).toFixed(2)),
      recC, maxC
    };
  }

  function renderSecResult(s) {
    const r = s.result; if (!r) return;
    const u = gBU(), el = $('sres-'+s.id); if (!el) return;
    const ok = r.clearGap <= r.maxC;
    const diff = r.clearGap - r.recC;
    const ds = (diff >= 0 ? '+' : '') + diff.toFixed(1);
    el.innerHTML = `<div class="section-result">
      <div class="sr-row"><span class="sr-label">Balusters required</span><span class="sr-val ok">${r.n} pcs</span></div>
      <div class="sr-row"><span class="sr-label">C-to-C pitch</span><span class="sr-val">${r.pitch.toFixed(1)} ${u}</span></div>
      <div class="sr-row"><span class="sr-label">Actual clear gap (face to face)</span><span class="sr-val ${ok?'ok':'warn'}">${r.clearGap.toFixed(1)} ${u} <span style="font-size:10px;color:var(--muted)">(${ds} from recommended${!ok?' · ⚠ exceeds max':''})</span></span></div>
      <div class="sr-row"><span class="sr-label">C-to-C gap</span><span class="sr-val">${r.ctcGap.toFixed(1)} ${u}</span></div>
      <div class="sr-row"><span class="sr-label">Clear margin each end</span><span class="sr-val">${r.clearMargin.toFixed(1)} ${u}</span></div>
      <div class="sr-row"><span class="sr-label">C-to-C margin each end</span><span class="sr-val">${r.ctcMargin.toFixed(1)} ${u}</span></div>
      <div class="sr-row"><span class="sr-label">Feeds into optimiser</span><span class="sr-val">${r.n} pcs × ${s.cutLen} ${u}<span class="feed-badge">✓ included</span></span></div>
    </div>`;
  }

  function calcBaluster(showSuccess) {
    if (!balSections.length) {
      $('baluster-results').style.display = 'none';
      $('baluster-actions').style.display = 'none';
      $('baluster-warn').innerHTML = '';
      return;
    }
    const sl = parseFloat($('b-stock-len').value) || 0;
    const kerf = parseFloat($('b-kerf').value) || 0;
    const lt = parseFloat($('b-lead-trim').value) || 0;
    const unit = gBU();
    const collate = $('b-collate-toggle').checked;
    const eff = sl - lt;

    let pieces = [], warnings = [];
    balSections.forEach((s, si) => {
      const r = calcSpacing(s); s.result = r; renderSecResult(s);
      if (!r) { warnings.push(`Section "${s.name}": unable to calculate — check values.`); return; }
      if (r.clearGap > r.maxC) warnings.push(`Section "${s.name}": actual clear gap (${r.clearGap.toFixed(1)} ${unit}) exceeds max (${r.maxC.toFixed(1)} ${unit}).`);
      if (s.cutLen > eff) warnings.push(`Section "${s.name}": cut length (${s.cutLen} ${unit}) exceeds usable stock (${eff} ${unit}).`);
      else for (let i = 0; i < r.n; i++) pieces.push({ len: s.cutLen, desc: s.name, si });
    });

    $('baluster-warn').innerHTML = warnings.length
      ? `<div class="note error-note"><span class="glyph">⚠</span><span>${warnings.join('<br>')}</span></div>`
      : '';
    if (warnings.length && showSuccess) poseFor('error');

    if (!pieces.length) {
      $('baluster-results').style.display = 'none';
      $('baluster-actions').style.display = 'none';
      return;
    }
    pieces.sort((a, b) => b.len - a.len);

    let bars = [];
    pieces.forEach(p => {
      let placed = false;
      for (const b of bars) {
        const u = b.cuts.reduce((s, c) => s + c.len + kerf, 0);
        if (u + p.len + (b.cuts.length ? kerf : 0) <= eff) { b.cuts.push(p); placed = true; break; }
      }
      if (!placed) bars.push({ cuts: [p] });
    });
    let tw = 0;
    bars.forEach(b => { const u = b.cuts.reduce((s, c) => s + c.len, 0) + kerf * (b.cuts.length - 1); tw += eff - u; });
    const wp = (tw / (bars.length * eff) * 100).toFixed(1);

    $('baluster-results').style.display = 'block';
    $('baluster-actions').style.display = 'flex';
    $('baluster-metrics').innerHTML = `
      <div class="metric-card"><div class="metric-label">Bars needed</div><div class="metric-value">${bars.length}</div></div>
      <div class="metric-card"><div class="metric-label">Total balusters</div><div class="metric-value">${pieces.length}</div></div>
      <div class="metric-card"><div class="metric-label">Waste</div><div class="metric-value ${parseFloat(wp)>20?'warn':''}">${wp}<span class="metric-unit">%</span></div></div>
      <div class="metric-card"><div class="metric-label">Total waste</div><div class="metric-value">${tw.toFixed(0)}<span class="metric-unit">${unit}</span></div></div>
      ${lt>0?`<div class="metric-card"><div class="metric-label">Trim loss</div><div class="metric-value">${(lt*bars.length).toFixed(0)}<span class="metric-unit">${unit}</span></div></div>`:''}`;

    let groups = [];
    if (collate) {
      const sm = {};
      bars.forEach((b, i) => {
        const sig = b.cuts.map(c => c.len).sort((a, z) => a - z).join(',');
        if (!sm[sig]) sm[sig] = { bar: b, indices: [i] }; else sm[sig].indices.push(i);
      });
      Object.values(sm).forEach(g => groups.push(g));
    } else {
      bars.forEach((b, i) => groups.push({ bar: b, indices: [i] }));
    }

    const bd = $('baluster-bars'); bd.innerHTML = '';
    groups.forEach(g => {
      const b = g.bar, idxs = g.indices, cnt = idxs.length;
      const used = b.cuts.reduce((s, c) => s + c.len, 0) + kerf * (b.cuts.length - 1);
      const waste = eff - used;
      const lbl = (cnt > 1 && collate)
        ? buildGroupLabel(idxs) + `<span class="group-badge">×${cnt} identical</span> — ${b.cuts.length} pcs each, waste: ${waste.toFixed(0)} ${unit}`
        : `Bar ${idxs[0]+1} — ${b.cuts.length} pcs, waste: ${waste.toFixed(0)} ${unit}`;
      let segs = '';
      if (lt > 0) segs += `<div class="bar-seg trim" style="width:${(lt/sl*100).toFixed(2)}%"></div>`;
      b.cuts.forEach((c, j) => {
        const clr = SC[c.si % SC.length];
        segs += `<div class="bar-seg" style="width:${(c.len/sl*100).toFixed(2)}%;background:${clr}">${c.len}</div>`;
        if (j < b.cuts.length - 1 && kerf > 0)
          segs += `<div class="bar-seg kerf" style="width:${(kerf/sl*100).toFixed(2)}%"></div>`;
      });
      if (waste > 0) segs += `<div class="bar-seg waste" style="width:${(waste/sl*100).toFixed(2)}%">${waste.toFixed(0)}</div>`;
      const d = document.createElement('div');
      d.className = 'bar-vis';
      d.innerHTML = `<div class="bar-label">${lbl}</div><div class="bar-track">${segs}</div>`;
      bd.appendChild(d);
    });

    const leg = $('baluster-legend'); leg.innerHTML = '';
    balSections.forEach((s, si) => {
      if (s.result && s.result.n > 0) {
        const li = document.createElement('div'); li.className = 'legend-item';
        li.innerHTML = `<div class="legend-dot" style="background:${SC[si%SC.length]}"></div>${s.name || 'Section '+(si+1)}`;
        leg.appendChild(li);
      }
    });

    if (showSuccess && !warnings.length) poseFor('success');
  }

  // ════════════════════════════════════════════════════════════
  // SHEET
  // ════════════════════════════════════════════════════════════
  $('btn-add-sheet').addEventListener('click', addSheetRow);
  $('btn-calc-sheet').addEventListener('click', () => { poseFor('calculating'); setTimeout(() => calcSheet(true), 200); });
  $('btn-clear-sheet').addEventListener('click', () => {
    if (confirm('Clear all panels?')) {
      sheetRows = [];
      $('sheet-tbody').innerHTML = '';
      $('sheet-results').style.display = 'none';
      $('sheet-actions').style.display = 'none';
      $('sheet-warn').innerHTML = '';
      $('sht-count').textContent = '0 panels';
      refreshShtEmpty();
    }
  });
  $('btn-print-sheet').addEventListener('click', () => window.print());
  $('btn-dl-sheet').addEventListener('click', () => dlReport('sheet'));
  ['sheet-w','sheet-h','sheet-kerf'].forEach(id => $(id).addEventListener('input', calcSheet));

  function refreshShtEmpty() {
    if (sheetRows.length === 0) {
      $('sheet-table').style.display = 'none';
      renderEmpty('sheet-empty', 'assets/cat-sleep.png',
        'No panels yet',
        'Add a panel below to start nesting cuts onto your sheets.');
    } else {
      $('sheet-table').style.display = '';
      clearEmpty('sheet-empty');
    }
  }
  function addSheetRow() {
    sheetRows.push({ id: uid(), desc: '', w: 600, h: 400, qty: 1, canRotate: true });
    buildSheetRow(sheetRows.length - 1);
    updateShtCount();
    refreshShtEmpty();
  }
  function removeSheetRow(id) {
    sheetRows = sheetRows.filter(r => r.id !== id);
    $('sheet-tbody').innerHTML = '';
    sheetRows.forEach((_, i) => buildSheetRow(i));
    updateShtCount();
    refreshShtEmpty();
    calcSheet();
  }
  function updateShtCount() { $('sht-count').textContent = sheetRows.reduce((s, r) => s + r.qty, 0) + ' panels'; }
  function buildSheetRow(i) {
    const r = sheetRows[i], u = gSU(), tr = document.createElement('tr'); tr.id = 'srow-' + r.id;
    tr.innerHTML = `
      <td><input type="text" id="sdesc-${r.id}" value="${r.desc}" placeholder="Panel" style="padding:5px 6px;font-size:11px"></td>
      <td><div style="display:flex;align-items:center;gap:3px"><input type="number" id="sw-${r.id}" value="${r.w}" min="1" style="padding:5px 6px;font-size:11px"><span class="s-unit-tag" style="font-size:9px;color:var(--blue);font-weight:700">${u}</span></div></td>
      <td><div style="display:flex;align-items:center;gap:3px"><input type="number" id="sh-${r.id}" value="${r.h}" min="1" style="padding:5px 6px;font-size:11px"><span class="s-unit-tag" style="font-size:9px;color:var(--blue);font-weight:700">${u}</span></div></td>
      <td><input type="number" id="sq-${r.id}" value="${r.qty}" min="1" style="padding:5px 6px;font-size:11px"></td>
      <td style="text-align:center"><button class="rot-btn ${r.canRotate?'free':'locked'}" id="rbtn-${r.id}">${r.canRotate?'↻':'🔒'}</button> <span id="rlbl-${r.id}" style="font-size:10px;color:var(--muted);font-family:var(--font-mono)">${r.canRotate?'Free':'Locked'}</span></td>
      <td><button class="btn btn-danger btn-sm" id="srm2-${r.id}">✕</button></td>`;
    $('sheet-tbody').appendChild(tr);
    $('sdesc-'+r.id).addEventListener('input', e => r.desc = e.target.value);
    $('sw-'+r.id).addEventListener('input',    e => { r.w = parseFloat(e.target.value) || 0; calcSheet(); });
    $('sh-'+r.id).addEventListener('input',    e => { r.h = parseFloat(e.target.value) || 0; calcSheet(); });
    $('sq-'+r.id).addEventListener('input',    e => { r.qty = parseInt(e.target.value) || 1; updateShtCount(); calcSheet(); });
    $('rbtn-'+r.id).addEventListener('click', () => {
      r.canRotate = !r.canRotate;
      $('rbtn-'+r.id).className = 'rot-btn ' + (r.canRotate?'free':'locked');
      $('rbtn-'+r.id).innerHTML = r.canRotate?'↻':'🔒';
      $('rlbl-'+r.id).textContent = r.canRotate?'Free':'Locked';
      calcSheet();
    });
    $('srm2-'+r.id).addEventListener('click', () => removeSheetRow(r.id));
  }
  function tryPlace(sheet, panel, kerf) {
    for (let i = 0; i < sheet.freeRects.length; i++) {
      const fr = sheet.freeRects[i];
      if (panel.pw <= fr.w && panel.ph <= fr.h) {
        sheet.placements.push({ x: fr.x, y: fr.y, pw: panel.pw, ph: panel.ph, desc: panel.desc, rotated: panel.rotated, origW: panel.origW, origH: panel.origH });
        const nr = [
          { x: fr.x + panel.pw + kerf, y: fr.y, w: fr.w - panel.pw - kerf, h: panel.ph },
          { x: fr.x, y: fr.y + panel.ph + kerf, w: fr.w, h: fr.h - panel.ph - kerf }
        ];
        sheet.freeRects.splice(i, 1);
        nr.forEach(r => { if (r.w > 0 && r.h > 0) sheet.freeRects.push(r); });
        return true;
      }
    }
    return false;
  }
  function tryPlaceRot(sheet, panel, kerf) {
    const n = { pw: panel.w, ph: panel.h, desc: panel.desc, rotated: false, origW: panel.w, origH: panel.h };
    if (tryPlace(sheet, n, kerf)) return true;
    if (panel.canRotate && panel.w !== panel.h) {
      const r = { pw: panel.h, ph: panel.w, desc: panel.desc, rotated: true, origW: panel.w, origH: panel.h };
      if (tryPlace(sheet, r, kerf)) return true;
    }
    return false;
  }
  function calcSheet(showSuccess) {
    if (!sheetRows.length) {
      $('sheet-results').style.display = 'none';
      $('sheet-actions').style.display = 'none';
      $('sheet-warn').innerHTML = '';
      return;
    }
    const sw = parseFloat($('sheet-w').value) || 0;
    const sh = parseFloat($('sheet-h').value) || 0;
    const kerf = parseFloat($('sheet-kerf').value) || 0;
    const unit = gSU();
    if (sw <= 0 || sh <= 0) return;

    let panels = [], warnings = [];
    sheetRows.forEach(r => {
      const fits = (r.w <= sw && r.h <= sh) || (r.canRotate && r.h <= sw && r.w <= sh);
      if (!fits) { warnings.push(`"${r.desc || 'Panel'}" (${r.w}×${r.h} ${unit}) cannot fit on sheet (${sw}×${sh} ${unit}).`); return; }
      for (let i = 0; i < r.qty; i++) panels.push({ w: r.w, h: r.h, desc: r.desc || 'Panel', canRotate: r.canRotate });
    });
    panels.sort((a, b) => (b.w*b.h) - (a.w*a.h));
    $('sheet-warn').innerHTML = warnings.length
      ? `<div class="note error-note"><span class="glyph">⚠</span><span>${warnings.join('<br>')}</span></div>`
      : '';
    if (warnings.length && showSuccess) poseFor('error');

    let sheets = [];
    panels.forEach(p => {
      let placed = false;
      for (const s of sheets) { if (tryPlaceRot(s, p, kerf)) { placed = true; break; } }
      if (!placed) {
        const ns = { placements: [], freeRects: [{ x:0, y:0, w:sw, h:sh }] };
        if (tryPlaceRot(ns, p, kerf)) sheets.push(ns);
      }
    });
    const ua = panels.reduce((s, p) => s + p.w * p.h, 0);
    const ta = sheets.length * sw * sh;
    const wa = ta - ua;
    const wp = (wa / ta * 100).toFixed(1);
    const rc = sheets.reduce((s, sh2) => s + sh2.placements.filter(p => p.rotated).length, 0);

    $('sheet-results').style.display = 'block';
    $('sheet-actions').style.display = 'flex';
    $('sheet-metrics').innerHTML = `
      <div class="metric-card"><div class="metric-label">Sheets needed</div><div class="metric-value">${sheets.length}</div></div>
      <div class="metric-card"><div class="metric-label">Total panels</div><div class="metric-value">${panels.length}</div></div>
      <div class="metric-card"><div class="metric-label">Waste</div><div class="metric-value ${parseFloat(wp)>20?'warn':''}">${wp}<span class="metric-unit">%</span></div></div>
      <div class="metric-card"><div class="metric-label">Waste area</div><div class="metric-value">${wa.toFixed(0)}<span class="metric-unit">${unit}²</span></div></div>
      <div class="metric-card"><div class="metric-label">Panels rotated</div><div class="metric-value">${rc}</div></div>`;

    const vis = $('sheet-vis'); vis.innerHTML = '';
    const COLS_N = ['#1d4ed8','#1e40af','#0f2350','#2874a6','#1f618d','#2e86c1'];
    const COLS_R = ['#1a8a55','#16a085','#2e7d32','#1a6a40'];
    const scale = Math.min(580/sw, 260/sh);

    sheets.forEach((s, si) => {
      const svgW = Math.round(sw * scale), svgH = Math.round(sh * scale);
      let rects = '';
      s.placements.forEach((pl, pi) => {
        const x = Math.round(pl.x * scale), y = Math.round(pl.y * scale);
        const w = Math.round(pl.pw * scale), h = Math.round(pl.ph * scale);
        const clr = pl.rotated ? COLS_R[pi % COLS_R.length] : COLS_N[pi % COLS_N.length];
        const sc = '#0b1a3a';
        const dash = pl.rotated ? 'stroke-dasharray="4,2"' : '';
        const fs = Math.min(11, Math.min(w, h) / 3.5);
        rects += `<rect x="${x+1}" y="${y+1}" width="${w-2}" height="${h-2}" fill="${clr}" stroke="${sc}" stroke-width="1.5" ${dash}/>`;
        if (w > 30 && h > 20) rects += `<text x="${x+w/2}" y="${y+h/2-5}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" fill="#fff" font-family="IBM Plex Mono,monospace" font-weight="700">${pl.desc}</text>`;
        if (w > 40 && h > 30) rects += `<text x="${x+w/2}" y="${y+h/2+9}" text-anchor="middle" dominant-baseline="middle" font-size="${Math.min(9, fs*.85)}" fill="rgba(255,255,255,.85)" font-family="IBM Plex Mono,monospace">${pl.rotated ? `${pl.origH}×${pl.origW} ↻` : `${pl.origW}×${pl.origH}`}</text>`;
      });
      const rn = s.placements.filter(p => p.rotated).length;
      const wrap = document.createElement('div'); wrap.style.marginBottom = '14px';
      wrap.innerHTML = `<div class="bar-label" style="margin-bottom:5px;font-weight:700;color:var(--ink)">Sheet ${si+1} — ${s.placements.length} panel${s.placements.length!==1?'s':''}${rn>0?` · ${rn} rotated`:''}</div><svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="border:var(--pixel) solid var(--ink);background:var(--bg-page);display:block" shape-rendering="crispEdges"><rect width="${svgW}" height="${svgH}" fill="#eef3fa"/>${rects}</svg>`;
      vis.appendChild(wrap);
    });

    if (showSuccess && !warnings.length) poseFor('success');
  }

  // ════════════════════════════════════════════════════════════
  // PROJECT
  // ════════════════════════════════════════════════════════════
  function getProj() {
    return {
      name:   $('proj-name').value   || '—',
      client: $('proj-client').value || '—',
      by:     $('proj-by').value     || 'N.Calatrava',
      notes:  $('proj-notes').value  || ''
    };
  }

  // ════════════════════════════════════════════════════════════
  // REPORT (HTML download)
  // ════════════════════════════════════════════════════════════
  function dlReport(type) {
    const proj = getProj();
    const now = new Date().toLocaleString();
    const unit = type==='linear' ? gLU() : type==='baluster' ? gBU() : gSU();
    const css = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:"IBM Plex Sans",Arial,sans-serif;background:#eef3fa;color:#0b1a3a;background-image:linear-gradient(to right,rgba(29,78,216,.06) 1px,transparent 1px),linear-gradient(to bottom,rgba(29,78,216,.06) 1px,transparent 1px);background-size:24px 24px}
      .page{max-width:900px;margin:0 auto;padding:28px}
      .hdr{display:flex;align-items:center;justify-content:space-between;background:#1e2e6e;border:2px solid #0b1a3a;box-shadow:4px 4px 0 0 #0b1a3a;padding:14px 20px;margin-bottom:18px}
      .hl{display:flex;align-items:center;gap:12px}
      .hb{font-family:"Silkscreen",monospace;font-size:18px;color:#fff;letter-spacing:.02em}
      .hs{font-size:10px;font-weight:700;color:#7ecfb3;letter-spacing:.16em;text-transform:uppercase;font-family:"IBM Plex Mono",monospace}
      .ha{font-size:10px;color:#a4b0d8;font-family:"IBM Plex Mono",monospace}
      .hv{font-size:10px;color:#a4b0d8;background:rgba(255,255,255,.1);padding:3px 10px;border:1px solid rgba(255,255,255,.18);font-family:"IBM Plex Mono",monospace}
      .pb,.sec{background:#fff;border:2px solid #0b1a3a;box-shadow:4px 4px 0 0 #0b1a3a;padding:14px 18px;margin-bottom:14px}
      .pg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px 16px;font-size:12px}
      .pf label{font-size:9px;color:#8896c8;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;margin-bottom:2px;font-family:"IBM Plex Mono",monospace}
      .pf span{color:#0b1a3a;font-weight:600}
      .sec h2{font-family:"IBM Plex Mono",monospace;font-size:10px;font-weight:700;color:#8896c8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;border-bottom:2px solid #eef0f8;padding-bottom:6px}
      .sc{padding-left:10px;margin-bottom:12px;border-left-width:6px;border-left-style:solid}
      table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:4px;font-family:"IBM Plex Mono",monospace}
      th{text-align:left;color:#fff;background:#1e2e6e;padding:6px 10px;font-size:9px;text-transform:uppercase;letter-spacing:.5px}
      td{padding:5px 10px;border-bottom:1px solid #eef0f8}
      tr:nth-child(even) td{background:#f8f9fc}
      .mr{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
      .mt{background:#e6eef8;padding:10px 14px;min-width:90px;border:2px solid #0b1a3a;box-shadow:2px 2px 0 0 #0b1a3a}
      .ml{font-size:9px;color:#8896c8;text-transform:uppercase;letter-spacing:.5px;font-weight:700;font-family:"IBM Plex Mono",monospace}
      .mv{font-family:"Silkscreen",monospace;font-size:18px;color:#1d4ed8;letter-spacing:.02em}
      .mv.w{color:#c07a10}
      .tag{background:#e8eeff;color:#1d4ed8;padding:1px 8px;font-size:10px;font-weight:700;border:1px solid #0b1a3a;font-family:"IBM Plex Mono",monospace}
      .ok{color:#1a8a55;font-weight:700}.wn{color:#c07a10;font-weight:700}.ry{color:#1a8a55;font-weight:700}.lk{color:#c07a10;font-weight:700}
      .ft{text-align:center;font-size:11px;color:#8896c8;padding-top:12px;margin-top:8px;font-family:"IBM Plex Mono",monospace;letter-spacing:.08em}
      @media print{body{background:#fff;background-image:none}.hdr{box-shadow:none}.pb,.sec,.mt{box-shadow:none}}
    `;
    // Inline pixel-cat header (small SVG approximation — keeps report self-contained)
    const catsvg = `<svg width="40" height="40" viewBox="0 0 18 18" shape-rendering="crispEdges">
      <rect x="3" y="0" width="12" height="3" fill="#f4c91a"/>
      <rect x="3" y="2" width="12" height="2" fill="#c07a10"/>
      <rect x="2" y="4" width="14" height="11" fill="#fff" stroke="#0b1a3a" stroke-width=".5"/>
      <rect x="6" y="7" width="2" height="2" fill="#0b1a3a"/><rect x="10" y="7" width="2" height="2" fill="#0b1a3a"/>
      <rect x="8" y="10" width="2" height="1" fill="#0b1a3a"/>
    </svg>`;

    let body = `<div class="hdr"><div class="hl">${catsvg}<div><div class="hb">CATstimate</div><div class="hs">Cutting list report</div><div class="ha">by N.Calatrava</div></div></div><div class="hv">v${VERSION} · ${VD}</div></div>`;
    body += `<div class="pb"><div class="pg">
      <div class="pf"><label>Project</label><span>${proj.name}</span></div>
      <div class="pf"><label>Client</label><span>${proj.client}</span></div>
      <div class="pf"><label>Prepared by</label><span>${proj.by}</span></div>
      <div class="pf" style="grid-column:1/-1"><label>Generated</label><span>${now}</span></div>
      ${proj.notes?`<div class="pf" style="grid-column:1/-1"><label>Notes</label><span>${proj.notes}</span></div>`:''}
    </div></div>`;

    if (type === 'linear') {
      const sl = parseFloat($('stock-len').value) || 0;
      const kerf = parseFloat($('kerf').value) || 0;
      const lt = parseFloat($('lead-trim').value) || 0;
      const eff = sl - lt;
      const collate = $('collate-toggle').checked;
      body += `<div class="sec"><h2>Stock settings</h2><table><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody><tr><td>Stock length</td><td><strong>${sl} ${unit}</strong></td></tr><tr><td>Lead trim</td><td>${lt} ${unit}</td></tr><tr><td>Usable per bar</td><td><strong>${eff} ${unit}</strong></td></tr><tr><td>Kerf</td><td>${kerf} ${unit}</td></tr></tbody></table></div>`;
      body += `<div class="sec"><h2>Cut list</h2><table><thead><tr><th>#</th><th>Description</th><th>Length (${unit})</th><th>Qty</th><th>Total (${unit})</th></tr></thead><tbody>`;
      let tp = 0, tl = 0;
      linRows.forEach((r, i) => { tp += r.qty; tl += r.len * r.qty; body += `<tr><td>${i+1}</td><td>${r.desc||'—'}</td><td>${r.len}</td><td>${r.qty}</td><td>${(r.len*r.qty).toFixed(0)}</td></tr>`; });
      body += `<tr style="font-weight:700;background:#e6eef8"><td colspan="3">Total</td><td>${tp}</td><td>${tl.toFixed(0)}</td></tr></tbody></table></div>`;
      let pieces = [];
      linRows.forEach(r => { if (r.len <= eff) for (let i = 0; i < r.qty; i++) pieces.push({ len: r.len, desc: r.desc || 'Cut' }); });
      pieces.sort((a, b) => b.len - a.len);
      let bars = [];
      pieces.forEach(p => {
        let placed = false;
        for (const b of bars) { const u = b.cuts.reduce((s, c) => s + c.len + kerf, 0); if (u + p.len + (b.cuts.length?kerf:0) <= eff) { b.cuts.push(p); placed = true; break; } }
        if (!placed) bars.push({ cuts: [p] });
      });
      if (!bars.length) body += `<div class="sec"><h2>Summary</h2><p>No valid cuts to optimise.</p></div>`;
      else {
        const tw = bars.reduce((s, b) => { const u = b.cuts.reduce((x, c) => x + c.len, 0) + kerf*(b.cuts.length-1); return s + (eff - u); }, 0);
        const wp = (tw / (bars.length*eff) * 100).toFixed(1);
        body += `<div class="sec"><h2>Summary</h2><div class="mr"><div class="mt"><div class="ml">Bars needed</div><div class="mv">${bars.length}</div></div><div class="mt"><div class="ml">Pieces</div><div class="mv">${tp}</div></div><div class="mt"><div class="ml">Waste</div><div class="mv ${parseFloat(wp)>20?'w':''}">${wp}%</div></div><div class="mt"><div class="ml">Total waste</div><div class="mv">${tw.toFixed(0)} ${unit}</div></div></div>`;
        body += `<table><thead><tr><th>Bar(s)</th><th>Pieces placed</th><th>Used (${unit})</th><th>Waste (${unit})</th></tr></thead><tbody>`;
        if (collate) {
          const sm = {};
          bars.forEach((b, i) => { const sig = b.cuts.map(c => c.len).sort((a, z) => a - z).join(','); if (!sm[sig]) sm[sig] = { bar: b, indices: [i] }; else sm[sig].indices.push(i); });
          Object.values(sm).forEach(g => {
            const b = g.bar, nums = g.indices.map(i => i + 1);
            const u = b.cuts.reduce((s, c) => s + c.len, 0) + kerf*(b.cuts.length-1);
            let lbl = '';
            if (nums.length === 1) lbl = 'Bar ' + nums[0];
            else if (nums[nums.length-1] - nums[0] === nums.length-1) lbl = `Bar ${nums[0]}–${nums[nums.length-1]} <span class="tag">×${nums.length}</span>`;
            else lbl = 'Bar ' + nums.join(', ') + ` <span class="tag">×${nums.length}</span>`;
            body += `<tr><td>${lbl}</td><td>${b.cuts.map(c=>`${c.desc} (${c.len})`).join(', ')}</td><td>${u.toFixed(0)}</td><td>${(eff-u).toFixed(0)}</td></tr>`;
          });
        } else {
          bars.forEach((b, i) => { const u = b.cuts.reduce((s, c) => s + c.len, 0) + kerf*(b.cuts.length-1); body += `<tr><td>Bar ${i+1}</td><td>${b.cuts.map(c=>`${c.desc} (${c.len})`).join(', ')}</td><td>${u.toFixed(0)}</td><td>${(eff-u).toFixed(0)}</td></tr>`; });
        }
        body += `</tbody></table></div>`;
      }
    } else if (type === 'baluster') {
      const sl = parseFloat($('b-stock-len').value) || 0;
      const kerf = parseFloat($('b-kerf').value) || 0;
      const lt = parseFloat($('b-lead-trim').value) || 0;
      const eff = sl - lt;
      const collate = $('b-collate-toggle').checked;
      body += `<div class="sec"><h2>Stock settings</h2><table><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody><tr><td>Stock length</td><td><strong>${sl} ${unit}</strong></td></tr><tr><td>Lead trim</td><td>${lt} ${unit}</td></tr><tr><td>Usable per bar</td><td><strong>${eff} ${unit}</strong></td></tr><tr><td>Kerf</td><td>${kerf} ${unit}</td></tr><tr><td>Gap input type</td><td>${gapMode==='ctc'?'Centre to centre':'Clear gap (face to face)'}</td></tr></tbody></table></div>`;
      body += `<div class="sec"><h2>Section spacing results</h2>`;
      balSections.forEach((s, si) => {
        if (!s.result) return;
        const r = s.result, clr = SC[si%SC.length];
        const ok = r.clearGap <= r.maxC, diff = r.clearGap - r.recC, ds = (diff>=0?'+':'') + diff.toFixed(1);
        body += `<div class="sc" style="border-left-color:${clr}"><strong style="color:${clr};font-size:13px;font-family:'IBM Plex Mono',monospace">${s.name}</strong><table style="margin-top:6px"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>
          <tr><td>Run length</td><td>${s.runLen} ${unit}</td></tr>
          <tr><td>Baluster width</td><td>${s.baluWidth} ${unit}</td></tr>
          <tr><td>Recommended gap input</td><td>${s.recGap} ${unit}</td></tr>
          <tr><td>Max gap input</td><td>${s.maxGap} ${unit}</td></tr>
          <tr><td>Spacing style</td><td>${s.spacing==='centred'?'Centred layout':'Even spacing'}</td></tr>
          <tr><td>Balusters required</td><td><span class="ok">${r.n} pcs</span></td></tr>
          <tr><td>C-to-C pitch</td><td>${r.pitch.toFixed(1)} ${unit}</td></tr>
          <tr><td>Actual clear gap</td><td><span class="${ok?'ok':'wn'}">${r.clearGap.toFixed(1)} ${unit} (${ds} from recommended${!ok?' · ⚠ exceeds max':''})</span></td></tr>
          <tr><td>C-to-C gap</td><td>${r.ctcGap.toFixed(1)} ${unit}</td></tr>
          <tr><td>Clear margin each end</td><td>${r.clearMargin.toFixed(1)} ${unit}</td></tr>
          <tr><td>C-to-C margin each end</td><td>${r.ctcMargin.toFixed(1)} ${unit}</td></tr>
          <tr><td>Cut length</td><td>${s.cutLen} ${unit}</td></tr></tbody></table></div>`;
      });
      body += `</div>`;
      let allP = [];
      balSections.forEach((s, si) => { if (s.result && s.cutLen <= eff) for (let i = 0; i < s.result.n; i++) allP.push({ len: s.cutLen, desc: s.name, si }); });
      allP.sort((a, b) => b.len - a.len);
      let bars = [];
      allP.forEach(p => {
        let placed = false;
        for (const b of bars) { const u = b.cuts.reduce((s, c) => s + c.len + kerf, 0); if (u + p.len + (b.cuts.length?kerf:0) <= eff) { b.cuts.push(p); placed = true; break; } }
        if (!placed) bars.push({ cuts: [p] });
      });
      if (bars.length) {
        const tw = bars.reduce((s, b) => { const u = b.cuts.reduce((x, c) => x + c.len, 0) + kerf*(b.cuts.length-1); return s + (eff - u); }, 0);
        const wp = (tw / (bars.length*eff) * 100).toFixed(1);
        body += `<div class="sec"><h2>Cut optimiser summary</h2><div class="mr"><div class="mt"><div class="ml">Bars needed</div><div class="mv">${bars.length}</div></div><div class="mt"><div class="ml">Total balusters</div><div class="mv">${allP.length}</div></div><div class="mt"><div class="ml">Waste</div><div class="mv ${parseFloat(wp)>20?'w':''}">${wp}%</div></div><div class="mt"><div class="ml">Total waste</div><div class="mv">${tw.toFixed(0)} ${unit}</div></div></div>`;
        body += `<table><thead><tr><th>Bar(s)</th><th>Pieces placed</th><th>Used (${unit})</th><th>Waste (${unit})</th></tr></thead><tbody>`;
        if (collate) {
          const sm = {};
          bars.forEach((b, i) => { const sig = b.cuts.map(c => c.len).sort((a, z) => a - z).join(','); if (!sm[sig]) sm[sig] = { bar: b, indices: [i] }; else sm[sig].indices.push(i); });
          Object.values(sm).forEach(g => {
            const b = g.bar, nums = g.indices.map(i => i + 1);
            const u = b.cuts.reduce((s, c) => s + c.len, 0) + kerf*(b.cuts.length-1);
            let lbl = '';
            if (nums.length === 1) lbl = 'Bar ' + nums[0];
            else if (nums[nums.length-1] - nums[0] === nums.length-1) lbl = `Bar ${nums[0]}–${nums[nums.length-1]} <span class="tag">×${nums.length}</span>`;
            else lbl = 'Bar ' + nums.join(', ') + ` <span class="tag">×${nums.length}</span>`;
            body += `<tr><td>${lbl}</td><td>${b.cuts.map(c=>`${c.desc} (${c.len})`).join(', ')}</td><td>${u.toFixed(0)}</td><td>${(eff-u).toFixed(0)}</td></tr>`;
          });
        } else {
          bars.forEach((b, i) => { const u = b.cuts.reduce((s, c) => s + c.len, 0) + kerf*(b.cuts.length-1); body += `<tr><td>Bar ${i+1}</td><td>${b.cuts.map(c=>`${c.desc} (${c.len})`).join(', ')}</td><td>${u.toFixed(0)}</td><td>${(eff-u).toFixed(0)}</td></tr>`; });
        }
        body += `</tbody></table></div>`;
      }
    } else {
      const sw = parseFloat($('sheet-w').value) || 0;
      const sh2 = parseFloat($('sheet-h').value) || 0;
      const kerf = parseFloat($('sheet-kerf').value) || 0;
      body += `<div class="sec"><h2>Sheet settings</h2><table><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody><tr><td>Sheet size</td><td><strong>${sw}×${sh2} ${unit}</strong></td></tr><tr><td>Sheet area</td><td>${(sw*sh2).toFixed(0)} ${unit}²</td></tr><tr><td>Kerf</td><td>${kerf} ${unit}</td></tr></tbody></table></div>`;
      body += `<div class="sec"><h2>Panel cut list</h2><table><thead><tr><th>#</th><th>Description</th><th>W (${unit})</th><th>H (${unit})</th><th>Qty</th><th>Rotation</th></tr></thead><tbody>`;
      sheetRows.forEach((r, i) => { body += `<tr><td>${i+1}</td><td>${r.desc||'—'}</td><td>${r.w}</td><td>${r.h}</td><td>${r.qty}</td><td>${r.canRotate?'<span class="ry">Allowed</span>':'<span class="lk">Locked</span>'}</td></tr>`; });
      body += `</tbody></table></div>`;
      let panels = [];
      sheetRows.forEach(r => { const fits = (r.w<=sw && r.h<=sh2) || (r.canRotate && r.h<=sw && r.w<=sh2); if (fits) for (let i = 0; i < r.qty; i++) panels.push({ w: r.w, h: r.h, desc: r.desc||'Panel', canRotate: r.canRotate }); });
      panels.sort((a, b) => (b.w*b.h) - (a.w*a.h));
      let sheets = [];
      panels.forEach(p => { let placed = false; for (const s of sheets) { if (tryPlaceRot(s, p, kerf)) { placed = true; break; } } if (!placed) { const ns = { placements: [], freeRects: [{x:0,y:0,w:sw,h:sh2}] }; if (tryPlaceRot(ns, p, kerf)) sheets.push(ns); } });
      const ua = panels.reduce((s, p) => s + p.w*p.h, 0);
      const ta = sheets.length * sw * sh2;
      const wa = ta - ua;
      const wp = (wa / ta * 100).toFixed(1);
      const rc = sheets.reduce((s, sh3) => s + sh3.placements.filter(p => p.rotated).length, 0);
      body += `<div class="sec"><h2>Summary</h2><div class="mr"><div class="mt"><div class="ml">Sheets</div><div class="mv">${sheets.length}</div></div><div class="mt"><div class="ml">Panels</div><div class="mv">${panels.length}</div></div><div class="mt"><div class="ml">Waste</div><div class="mv ${parseFloat(wp)>20?'w':''}">${wp}%</div></div><div class="mt"><div class="ml">Waste area</div><div class="mv">${wa.toFixed(0)} ${unit}²</div></div><div class="mt"><div class="ml">Rotated</div><div class="mv">${rc}</div></div></div>`;
      body += `<table><thead><tr><th>Sheet</th><th>Panel</th><th>Placed as</th><th>Rotated</th><th>Position</th></tr></thead><tbody>`;
      sheets.forEach((s, i) => { s.placements.forEach(p => { body += `<tr><td>Sheet ${i+1}</td><td>${p.desc}</td><td>${p.pw}×${p.ph} ${unit}</td><td>${p.rotated?'<span class="ry">Yes ↻</span>':'No'}</td><td>${p.x.toFixed(0)}, ${p.y.toFixed(0)}</td></tr>`; }); });
      body += `</tbody></table></div>`;
    }
    body += `<div class="ft">CATstimate v${VERSION} · by N.Calatrava · Free to use · No internet required · ${now}</div>`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CATstimate Report — ${proj.name}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;700&family=Silkscreen&display=swap" rel="stylesheet"><style>${css}</style></head><body><div class="page">${body}</div></body></html>`;
    const fname = `CATstimate-${type}-${(proj.name||'Report').replace(/[^a-z0-9]/gi,'_').slice(0,25)}-${Date.now()}.html`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = fname;
    a.click();
  }

  // ════════════════════════════════════════════════════════════
  // WORKSPACE INTEGRATION — read ?project=... &name=... &client=...
  // ════════════════════════════════════════════════════════════
  (function applyProjectFromUrl() {
    try {
      const p = new URLSearchParams(location.search);
      const name = p.get('name'), client = p.get('client');
      if (name) $('proj-name').value = name;
      if (client) $('proj-client').value = client;
      if (p.get('project')) {
        // Banner: came from Workspace
        const hdr = document.querySelector('.app-header');
        if (hdr && !document.getElementById('ws-back')) {
          const back = document.createElement('a');
          back.id = 'ws-back';
          back.href = 'index.html?p=' + encodeURIComponent(p.get('project'));
          back.style.cssText = 'position:absolute;top:-12px;left:18px;font-family:var(--font-mono);font-size:10px;color:#fff;background:var(--ink);padding:3px 10px;border:var(--pixel) solid var(--ink);text-decoration:none;letter-spacing:.08em;z-index:2;text-transform:uppercase;font-weight:700';
          back.textContent = '← Workspace';
          hdr.appendChild(back);
        }
      }
    } catch (e) {}
  })();

  // ════════════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════════════
  rebuildLinPresets();
  rebuildBalPresets();
  rebuildShtPresets();
  addLinRow(); addLinRow();
  addSheetRow();
  addBalSection();
  refreshLinEmpty();
  refreshBalEmpty();
  refreshShtEmpty();
});
