// arcrise.js
// CATstimate ArcRise — handrail length estimator.
// Math is verbatim from v3 (8 elevation methods, ramp/stair assumption tables,
// per-line arc + rise → inclined → +end allowance × 2). Chrome uses the
// Blueprint design kit with interactive mascot states.

(() => {
  const VERSION = '1.1', VD = 'May 2026';

  const RAMP_ASSUMPTIONS = [
    { label: 'Accessible ramp — 1:14 (~4°)', ratio: 14, desc: '1:14' },
    { label: 'Standard ramp — 1:8 (~7°)',    ratio: 8,  desc: '1:8'  },
    { label: 'Steep ramp — 1:5 (~11°)',      ratio: 5,  desc: '1:5'  },
    { label: 'Max grade — 1:3 (~18°)',       ratio: 3,  desc: '1:3'  }
  ];
  const STAIR_ASSUMPTIONS = [
    { label: 'Shallow stair — 1:2.5 (~22°)',  ratio: 2.5,  desc: '1:2.5'  },
    { label: 'Typical stair — 1:2 (~27°)',    ratio: 2,    desc: '1:2'    },
    { label: 'Standard stair — 1:1.75 (~30°)',ratio: 1.75, desc: '1:1.75' },
    { label: 'Steep stair — 1:1.5 (~34°)',    ratio: 1.5,  desc: '1:1.5'  }
  ];
  const METHOD_ORDER = ['rl','slope_ratio','slope_angle','fall','steps','assume_ramp','assume_stair','direct'];

  let segments = [], segIdCounter = 0;

  const $ = id => document.getElementById(id);

  // ════════════════════════════════════════════════════════════
  // MASCOT
  // ════════════════════════════════════════════════════════════
  const POSES = ['idle','wave','sleep','wrench','hat-tip'];
  const POSE_HOLD = { wave:1100, wrench:1400, 'hat-tip':1300, sleep:2400, idle:900 };
  const TAP_REACTIONS = [
    { p:'wave',    m:'Hello!' },
    { p:'wrench',  m:"Let's measure!" },
    { p:'hat-tip', m:'Cheers!' },
    { p:'wave',    m:'Need a hand?' },
    { p:'sleep',   m:'Zzz...' },
    { p:'wrench',  m:'On it.' },
    { p:'hat-tip', m:'Purr-fect.' },
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
    if (reason === 'calculating') {
      setCatPose('wrench'); hopCat();
      catTimer = setTimeout(() => setCatPose('idle'), POSE_HOLD.wrench);
    } else if (reason === 'success') {
      setCatPose('hat-tip'); hopCat(); sayBubble('Looking good.');
      catTimer = setTimeout(() => setCatPose('idle'), POSE_HOLD['hat-tip']);
    } else if (reason === 'empty') {
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

  function renderEmpty() {
    const el = $('seg-empty');
    if (!el) return;
    if (segments.length === 0) {
      el.innerHTML = `
        <div class="empty-state">
          <img class="pixel-art" src="assets/cat-sleep.png" alt="" style="width:72px;height:72px;object-fit:contain">
          <div class="es-title">No segments yet</div>
          <div class="es-body">Add a ramp, stair, or landing below. The cat will wake up to measure.</div>
        </div>`;
    } else {
      el.innerHTML = '';
    }
  }

  // ════════════════════════════════════════════════════════════
  // MATH (verbatim from v3)
  // ════════════════════════════════════════════════════════════
  function getUF() { return $('unit').value === 'mm' ? 0.001 : 1; }

  function computeRise(seg, horizM) {
    const uf = getUF();
    const m = seg.type === 'landing' ? 'none' : seg.elevMethod;
    if (m === 'rl') {
      const a = parseFloat(seg.rl1), b = parseFloat(seg.rl2);
      if (!isNaN(a) && !isNaN(b)) return Math.abs(b - a);
    } else if (m === 'slope_ratio') {
      const n = parseFloat(seg.slopeRatio);
      if (!isNaN(n) && n > 0) return horizM / n;
    } else if (m === 'slope_angle') {
      const d = parseFloat(seg.slopeAngle);
      if (!isNaN(d) && d > 0 && d < 90) return horizM * Math.tan(d * Math.PI / 180);
    } else if (m === 'fall') {
      const fv = parseFloat(seg.fall), fr = parseFloat(seg.fallRatio);
      if (!isNaN(fv) && seg.fall !== '') return fv * uf;
      if (!isNaN(fr) && fr > 0) return horizM / fr;
    } else if (m === 'steps') {
      const ns = parseFloat(seg.steps), r = parseFloat(seg.risePerStep);
      if (!isNaN(ns) && ns > 0) return (!isNaN(r) && r > 0) ? ns * r * uf : ns * 0.175;
    } else if (m === 'assume_ramp') {
      return horizM / (RAMP_ASSUMPTIONS[parseInt(seg.assumeRampIdx) || 0].ratio);
    } else if (m === 'assume_stair') {
      return horizM / (STAIR_ASSUMPTIONS[parseInt(seg.assumeStairIdx) || 1].ratio);
    }
    return 0;
  }

  function computeLine(seg, i) {
    const uf = getUF();
    const m = seg.type === 'landing' ? 'none' : seg.elevMethod;
    if (m === 'direct') {
      const v = (parseFloat(seg.directValues[i]) || 0) * uf;
      return { horizM: 0, riseM: 0, inclinedM: v };
    }
    let horizM = (parseFloat(seg.arcValues[i]) || 0) * uf;
    if (m === 'steps') {
      const ns = parseFloat(seg.steps), run = parseFloat(seg.runPerStep);
      if (horizM === 0 && !isNaN(ns) && ns > 0 && !isNaN(run) && run > 0) horizM = ns * run * uf;
    }
    const riseM = computeRise(seg, horizM);
    return { horizM, riseM, inclinedM: m === 'none' ? horizM : Math.sqrt(horizM * horizM + riseM * riseM) };
  }

  // ════════════════════════════════════════════════════════════
  // SEGMENT CRUD
  // ════════════════════════════════════════════════════════════
  function addSegment(type) {
    const id = ++segIdCounter;
    const idx = segments.filter(s => s.type === type).length + 1;
    segments.push({
      id, type,
      name: type === 'ramp' ? `Ramp ${idx}` : `Landing ${idx}`,
      lines: 2,
      arcValues: ['', ''],
      directValues: ['', ''],
      elevMethod: type === 'landing' ? 'none' : 'rl',
      rl1: '', rl2: '',
      slopeRatio: '', slopeAngle: '',
      fall: '', fallRatio: '',
      steps: '', risePerStep: '', runPerStep: '',
      assumeRampIdx: '0', assumeStairIdx: '1'
    });
    renderSegments();
    renderEmpty();
  }
  function removeSegment(id) {
    segments = segments.filter(s => s.id !== id);
    renderSegments();
    renderEmpty();
  }
  function updateSeg(id, key, val) {
    const s = segments.find(s => s.id === id);
    if (s) { s[key] = val; renderResults(); renderSegCalc(id); }
  }
  function updateArc(id, i, val) {
    const s = segments.find(s => s.id === id);
    if (s) { s.arcValues[i] = val; renderResults(); renderSegCalc(id); updateLineResult(id, i); }
  }
  function updateDirect(id, i, val) {
    const s = segments.find(s => s.id === id);
    if (s) { s.directValues[i] = val; renderResults(); renderSegCalc(id); updateLineResult(id, i); }
  }
  function changeLinesCount(id, delta) {
    const seg = segments.find(s => s.id === id); if (!seg) return;
    const n = Math.max(1, Math.min(8, seg.lines + delta));
    if (n === seg.lines) return;
    seg.lines = n;
    while (seg.arcValues.length < n) seg.arcValues.push('');
    seg.arcValues = seg.arcValues.slice(0, n);
    while (seg.directValues.length < n) seg.directValues.push('');
    seg.directValues = seg.directValues.slice(0, n);
    const b = $(`seg-block-${id}`);
    if (b) { b.innerHTML = buildSegHTML(seg); setElevTab(id, seg.elevMethod, false); renderSegCalc(id); }
    renderResults();
  }

  function updateLineResult(id, i) {
    const seg = segments.find(s => s.id === id); if (!seg) return;
    const ea = parseFloat($('endAllowance').value) || 0;
    const { inclinedM } = computeLine(seg, i);
    const el = $(`arc-result-${id}-${i}`);
    if (el) el.textContent = (inclinedM + ea * 2) > 0 ? `${(inclinedM + ea * 2).toFixed(3)} m` : '';
  }

  function renderSegCalc(id) {
    const seg = segments.find(s => s.id === id); if (!seg) return;
    const cd = $(`seg-calc-${id}`); if (!cd) return;
    const ea = parseFloat($('endAllowance').value) || 0;
    let tot = 0;
    for (let i = 0; i < seg.lines; i++) {
      const { inclinedM } = computeLine(seg, i);
      tot += inclinedM + ea * 2;
      updateLineResult(id, i);
    }
    cd.innerHTML = tot > 0 ? `Segment subtotal (${seg.lines} line${seg.lines!==1?'s':''} + ends): <span>${tot.toFixed(3)} m</span>` : '';
    updateAssumeNote(id);
  }

  function updateAssumeNote(id) {
    const seg = segments.find(s => s.id === id); if (!seg) return;
    const h = (parseFloat(seg.arcValues[0]) || 0) * getUF();
    const rn = $(`assume-ramp-note-${id}`), sn = $(`assume-stair-note-${id}`);
    if (rn) {
      const a = RAMP_ASSUMPTIONS[parseInt(seg.assumeRampIdx) || 0];
      const r = h / a.ratio, inc = Math.sqrt(h*h + r*r);
      rn.textContent = `Safe assumption: slope ${a.desc}. Adds ~${h>0?((inc/h-1)*100).toFixed(1):'—'}% over horizontal arc.`;
    }
    if (sn) {
      const a = STAIR_ASSUMPTIONS[parseInt(seg.assumeStairIdx) || 1];
      const r = h / a.ratio, inc = Math.sqrt(h*h + r*r);
      sn.textContent = `Safe assumption: slope ${a.desc}. Adds ~${h>0?((inc/h-1)*100).toFixed(1):'—'}% over horizontal arc.`;
    }
  }

  // ════════════════════════════════════════════════════════════
  // SEGMENT RENDER
  // ════════════════════════════════════════════════════════════
  function buildSegHTML(seg) {
    const isL = seg.type === 'landing';
    const unitLabel = $('unit')?.value || 'm';
    const rOpts = RAMP_ASSUMPTIONS.map((a, i) =>
      `<option value="${i}"${seg.assumeRampIdx == i ? ' selected' : ''}>${a.label}</option>`).join('');
    const sOpts = STAIR_ASSUMPTIONS.map((a, i) =>
      `<option value="${i}"${seg.assumeStairIdx == i ? ' selected' : ''}>${a.label}</option>`).join('');
    const isDirect = seg.elevMethod === 'direct';
    const arcTitle = isDirect
      ? `Direct Inclined Length (${unitLabel}) — per line`
      : `Horizontal Arc Length (${unitLabel}) — per line`;
    const lineInputs = Array.from({ length: seg.lines }, (_, i) => `
      <div class="arc-line-row">
        <span class="arc-line-label">Line ${i+1}</span>
        <div class="arc-line-input-wrap">
          ${isDirect
            ? `<input type="number" placeholder="0.000" min="0" step="0.001" value="${seg.directValues[i]||''}" oninput="ArcRise.updateDirect(${seg.id},${i},this.value)">`
            : `<input type="number" placeholder="0.000" min="0" step="0.001" value="${seg.arcValues[i]||''}" oninput="ArcRise.updateArc(${seg.id},${i},this.value)">`}
        </div>
        <span class="arc-line-result" id="arc-result-${seg.id}-${i}"></span>
      </div>`).join('');
    return `
      <div class="seg-header">
        <span class="seg-badge ${isL ? 'badge-landing' : 'badge-ramp'}">${isL ? 'Landing' : 'Ramp / Stair'}</span>
        <div class="seg-name-wrap"><input type="text" value="${seg.name}" placeholder="Segment name…" oninput="ArcRise.updateSeg(${seg.id},'name',this.value)"></div>
        <button class="btn-remove" onclick="ArcRise.removeSegment(${seg.id})" title="Remove">✕</button>
      </div>
      <div class="lines-row">
        <span class="lines-label">Handrail Lines</span>
        <div class="lines-stepper">
          <button class="step-btn" onclick="ArcRise.changeLinesCount(${seg.id},-1)">−</button>
          <span class="lines-val">${seg.lines}</span>
          <button class="step-btn" onclick="ArcRise.changeLinesCount(${seg.id},1)">+</button>
        </div>
        <span class="lines-unit">line${seg.lines!==1?'s':''}</span>
      </div>
      <div class="arc-block">
        <div class="arc-block-title">${arcTitle} <span>· incl. end allowance shown right</span></div>
        ${lineInputs}
      </div>
      ${isL ? `<div class="info-note">Landing — no elevation change. Inclined ≈ horizontal arc + end allowances.</div>` : buildElevSection(seg, rOpts, sOpts)}
      <div class="seg-calc" id="seg-calc-${seg.id}"></div>`;
  }

  function buildElevSection(seg, rOpts, sOpts) {
    return `<div>
      <div class="elev-label">Elevation Method</div>
      <div class="elevation-tabs" id="etabs-${seg.id}">
        <button class="etab" onclick="ArcRise.setElevTab(${seg.id},'rl')">RL</button>
        <button class="etab" onclick="ArcRise.setElevTab(${seg.id},'slope_ratio')">Slope 1:n</button>
        <button class="etab" onclick="ArcRise.setElevTab(${seg.id},'slope_angle')">Angle °</button>
        <button class="etab" onclick="ArcRise.setElevTab(${seg.id},'fall')">Fall</button>
        <button class="etab" onclick="ArcRise.setElevTab(${seg.id},'steps')">Steps</button>
        <button class="etab" onclick="ArcRise.setElevTab(${seg.id},'assume_ramp')">~Ramp</button>
        <button class="etab" onclick="ArcRise.setElevTab(${seg.id},'assume_stair')">~Stair</button>
        <button class="etab" onclick="ArcRise.setElevTab(${seg.id},'direct')">Direct</button>
      </div>
      <div class="elevation-panel" id="epanel-rl-${seg.id}">
        <div class="field-row">
          <div class="field"><label>RL Start</label><input type="number" value="${seg.rl1}" placeholder="e.g. 220.30" step="0.001" oninput="ArcRise.updateSeg(${seg.id},'rl1',this.value)"></div>
          <div class="field"><label>RL End</label><input type="number" value="${seg.rl2}" placeholder="e.g. 222.26" step="0.001" oninput="ArcRise.updateSeg(${seg.id},'rl2',this.value)"></div>
        </div>
        <div class="info-note">Same elevation applies to all lines — only arc differs per line.</div>
      </div>
      <div class="elevation-panel" id="epanel-slope_ratio-${seg.id}">
        <div class="field-row">
          <div class="field"><label>Rise : Run (1 : n)</label><input type="number" value="${seg.slopeRatio}" placeholder="e.g. 3 for 1:3" step="0.01" oninput="ArcRise.updateSeg(${seg.id},'slopeRatio',this.value)"></div>
          <div class="field"><label style="visibility:hidden">x</label><div class="info-note">Rise computed per line from its arc</div></div>
        </div>
      </div>
      <div class="elevation-panel" id="epanel-slope_angle-${seg.id}">
        <div class="field-row">
          <div class="field"><label>Slope Angle (°)</label><input type="number" value="${seg.slopeAngle}" placeholder="e.g. 18.5" step="0.01" min="0" max="89" oninput="ArcRise.updateSeg(${seg.id},'slopeAngle',this.value)"></div>
          <div class="field"><label style="visibility:hidden">x</label><div class="info-note">Inclined = arc / cos(θ) per line</div></div>
        </div>
      </div>
      <div class="elevation-panel" id="epanel-fall-${seg.id}">
        <div class="field-row">
          <div class="field"><label>Fall (total, same unit)</label><input type="number" value="${seg.fall}" placeholder="e.g. 2.000" step="0.001" oninput="ArcRise.updateSeg(${seg.id},'fall',this.value)"></div>
          <div class="field"><label>— OR — Fall Ratio (1:n)</label><input type="number" value="${seg.fallRatio}" placeholder="e.g. 100 for 1:100" step="0.01" oninput="ArcRise.updateSeg(${seg.id},'fallRatio',this.value)"></div>
        </div>
      </div>
      <div class="elevation-panel" id="epanel-steps-${seg.id}">
        <div class="field-row-3">
          <div class="field"><label>No. of Steps</label><input type="number" value="${seg.steps}" placeholder="e.g. 12" min="1" step="1" oninput="ArcRise.updateSeg(${seg.id},'steps',this.value)"></div>
          <div class="field"><label>Rise / Step (m)</label><input type="number" value="${seg.risePerStep}" placeholder="0.175" step="0.001" oninput="ArcRise.updateSeg(${seg.id},'risePerStep',this.value)"></div>
          <div class="field"><label>Run / Step (m)</label><input type="number" value="${seg.runPerStep}" placeholder="optional" step="0.001" oninput="ArcRise.updateSeg(${seg.id},'runPerStep',this.value)"></div>
        </div>
        <div class="info-note">Rise shared across all lines. Run/step used as arc fallback.</div>
      </div>
      <div class="elevation-panel" id="epanel-assume_ramp-${seg.id}">
        <div class="field"><label>Assumed Ramp Slope</label><select onchange="ArcRise.updateSeg(${seg.id},'assumeRampIdx',this.value)">${rOpts}</select></div>
        <div class="assumption-note" id="assume-ramp-note-${seg.id}">Select a slope above.</div>
      </div>
      <div class="elevation-panel" id="epanel-assume_stair-${seg.id}">
        <div class="field"><label>Assumed Stair Slope</label><select onchange="ArcRise.updateSeg(${seg.id},'assumeStairIdx',this.value)">${sOpts}</select></div>
        <div class="assumption-note" id="assume-stair-note-${seg.id}">Select a slope above.</div>
      </div>
      <div class="elevation-panel" id="epanel-direct-${seg.id}">
        <div class="info-note">Enter the known inclined length per line directly. End allowance still applies.</div>
      </div>
    </div>`;
  }

  function setElevTab(id, method, doUpdate = true) {
    const seg = segments.find(s => s.id === id); if (!seg) return;
    const prev = seg.elevMethod;
    if (doUpdate) seg.elevMethod = method;
    const tabs = document.querySelectorAll(`#etabs-${id} .etab`);
    tabs.forEach((t, i) => t.classList.toggle('active', i === METHOD_ORDER.indexOf(method)));
    METHOD_ORDER.forEach(m => {
      const p = $(`epanel-${m}-${id}`);
      if (p) p.classList.toggle('active', m === method);
    });
    if (doUpdate && (prev === 'direct') !== (method === 'direct')) {
      const b = $(`seg-block-${id}`);
      if (b) { b.innerHTML = buildSegHTML(seg); setElevTab(id, method, false); renderSegCalc(id); return; }
    }
    updateAssumeNote(id);
    if (doUpdate) { renderResults(); renderSegCalc(id); }
  }

  function renderSegments() {
    const list = $('segmentList'); list.innerHTML = '';
    segments.forEach(seg => {
      const div = document.createElement('div');
      div.className = 'segment-block';
      div.id = `seg-block-${seg.id}`;
      div.innerHTML = buildSegHTML(seg);
      list.appendChild(div);
      setElevTab(seg.id, seg.elevMethod, false);
      renderSegCalc(seg.id);
    });
    $('segCountLabel').textContent = `${segments.length} segment${segments.length!==1?'s':''}`;
    renderResults();
  }

  // ════════════════════════════════════════════════════════════
  // RESULTS
  // ════════════════════════════════════════════════════════════
  function renderResults() {
    const wastage = parseFloat($('wastage').value) || 0;
    const ea = parseFloat($('endAllowance').value) || 0;
    let grand = 0;
    const rows = [];
    let hasAssume = false;
    segments.forEach(seg => {
      const isA = seg.elevMethod === 'assume_ramp' || seg.elevMethod === 'assume_stair';
      if (isA) hasAssume = true;
      let tot = 0;
      const lr = [];
      for (let i = 0; i < seg.lines; i++) {
        const { horizM, riseM, inclinedM } = computeLine(seg, i);
        const w = inclinedM + ea * 2;
        tot += w;
        lr.push({ horizM, riseM, inclinedM, w });
      }
      grand += tot;
      rows.push({ name: seg.name || `Seg ${seg.id}`, isA, tot, lr, lines: seg.lines, isDirect: seg.elevMethod === 'direct' });
      renderSegCalc(seg.id);
    });
    const tw = grand * (1 + wastage / 100);
    $('res-net').innerHTML = `${grand.toFixed(3)}<span class="metric-unit">m</span>`;
    $('res-wastage').innerHTML = `${tw.toFixed(3)}<span class="metric-unit">m</span>`;
    $('res-segs').innerHTML = `${segments.length}<span class="metric-unit">segs</span>`;
    const tbody = $('breakdownBody'), tfoot = $('breakdownFoot');
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="color:var(--muted);font-style:italic;padding:14px 10px;">No segments added yet</td></tr>`;
      tfoot.innerHTML = '';
      return;
    }
    let html = '';
    rows.forEach(r => {
      html += `<tr><td style="font-weight:700;color:var(--ink);">${r.name}${r.isA?' *':''}</td><td colspan="3" style="color:var(--muted);font-size:10px;">${r.lines} line${r.lines!==1?'s':''}</td><td style="font-weight:700;color:var(--blue);">${r.tot.toFixed(3)}</td></tr>`;
      r.lr.forEach((l, i) => {
        html += `<tr class="sub-row"><td>Line ${i+1}</td><td>${r.isDirect?'—':l.horizM.toFixed(3)}</td><td>${r.isDirect||l.riseM===0?'—':l.riseM.toFixed(3)}</td><td>${l.inclinedM.toFixed(3)}</td><td>${l.w.toFixed(3)}</td></tr>`;
      });
    });
    tbody.innerHTML = html;
    tfoot.innerHTML = `<tr class="total-row"><td colspan="4">Total (all lines + ends)</td><td>${grand.toFixed(3)} m</td></tr><tr class="total-row"><td colspan="4">+ ${wastage}% wastage</td><td>${tw.toFixed(3)} m</td></tr>${hasAssume?`<tr class="warn-row"><td colspan="5">* Assumed slope — verify against drawings when available.</td></tr>`:''}`;
  }

  // ════════════════════════════════════════════════════════════
  // PROJECT + REPORT
  // ════════════════════════════════════════════════════════════
  function getProj() {
    return {
      name: $('proj-name').value || '—',
      client: $('proj-client').value || '—'
    };
  }
  function dlReport() {
    const proj = getProj();
    const now = new Date().toLocaleString();
    const wastage = parseFloat($('wastage').value) || 0;
    const ea = parseFloat($('endAllowance').value) || 0;
    let grand = 0;
    const segRows = [];
    let hasAssume = false;
    segments.forEach(seg => {
      const isA = seg.elevMethod === 'assume_ramp' || seg.elevMethod === 'assume_stair';
      if (isA) hasAssume = true;
      let tot = 0;
      const lr = [];
      for (let i = 0; i < seg.lines; i++) {
        const { horizM, riseM, inclinedM } = computeLine(seg, i);
        const w = inclinedM + ea * 2;
        tot += w;
        lr.push({ horizM, riseM, inclinedM, w });
      }
      grand += tot;
      segRows.push({ seg, isA, tot, lr });
    });
    const tw = grand * (1 + wastage / 100);
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
      table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:4px;font-family:"IBM Plex Mono",monospace}
      th{text-align:left;color:#fff;background:#1e2e6e;padding:6px 10px;font-size:9px;text-transform:uppercase;letter-spacing:.5px}
      td{padding:5px 10px;border-bottom:1px solid #eef0f8}
      tr:nth-child(even) td{background:#f8f9fc}
      .sub td{padding-left:22px;color:#3a4a78;font-size:10px;background:#fafbfe}
      .mr{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
      .mt{background:#e6eef8;padding:10px 14px;min-width:90px;border:2px solid #0b1a3a;box-shadow:2px 2px 0 0 #0b1a3a}
      .ml{font-size:9px;color:#8896c8;text-transform:uppercase;letter-spacing:.5px;font-weight:700;font-family:"IBM Plex Mono",monospace}
      .mv{font-family:"Silkscreen",monospace;font-size:18px;color:#1d4ed8;letter-spacing:.02em}
      .ft{text-align:center;font-size:11px;color:#8896c8;padding-top:12px;margin-top:8px;font-family:"IBM Plex Mono",monospace;letter-spacing:.08em}
      @media print{body{background:#fff;background-image:none}.hdr,.pb,.sec,.mt{box-shadow:none}}
    `;
    const catsvg = `<svg width="40" height="40" viewBox="0 0 18 18" shape-rendering="crispEdges">
      <rect x="3" y="0" width="12" height="3" fill="#f4c91a"/>
      <rect x="3" y="2" width="12" height="2" fill="#c07a10"/>
      <rect x="2" y="4" width="14" height="11" fill="#fff" stroke="#0b1a3a" stroke-width=".5"/>
      <rect x="6" y="7" width="2" height="2" fill="#0b1a3a"/><rect x="10" y="7" width="2" height="2" fill="#0b1a3a"/>
      <rect x="8" y="10" width="2" height="1" fill="#0b1a3a"/></svg>`;
    let body = `<div class="hdr"><div class="hl">${catsvg}<div><div class="hb">CATstimate</div><div class="hs">ArcRise report</div><div class="ha">by N.Calatrava</div></div></div><div class="hv">v${VERSION} · ${VD}</div></div>`;
    body += `<div class="pb"><div class="pg">
      <div class="pf"><label>Project</label><span>${proj.name}</span></div>
      <div class="pf"><label>Client</label><span>${proj.client}</span></div>
      <div class="pf"><label>Prepared by</label><span>N.Calatrava</span></div>
      <div class="pf" style="grid-column:1/-1"><label>Generated</label><span>${now}</span></div>
    </div></div>`;
    body += `<div class="sec"><h2>Settings</h2><table><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>
      <tr><td>Wastage</td><td>${wastage}%</td></tr>
      <tr><td>End allowance per segment</td><td>${ea} m</td></tr>
      <tr><td>Unit</td><td>${$('unit').value === 'mm' ? 'Millimetres' : 'Metres'}</td></tr>
    </tbody></table></div>`;
    body += `<div class="sec"><h2>Summary</h2><div class="mr"><div class="mt"><div class="ml">Net total</div><div class="mv">${grand.toFixed(3)} m</div></div><div class="mt"><div class="ml">+ ${wastage}% wastage</div><div class="mv">${tw.toFixed(3)} m</div></div><div class="mt"><div class="ml">Segments</div><div class="mv">${segments.length}</div></div></div></div>`;
    body += `<div class="sec"><h2>Breakdown</h2><table><thead><tr><th>Segment / Line</th><th>Horiz (m)</th><th>Rise (m)</th><th>Inclined (m)</th><th>+Ends (m)</th></tr></thead><tbody>`;
    segRows.forEach(r => {
      const seg = r.seg, isDirect = seg.elevMethod === 'direct';
      body += `<tr><td style="font-weight:700">${seg.name}${r.isA?' *':''}</td><td colspan="3" style="color:#8896c8">${seg.lines} line${seg.lines!==1?'s':''} · ${methodLabel(seg)}</td><td style="font-weight:700;color:#1d4ed8">${r.tot.toFixed(3)}</td></tr>`;
      r.lr.forEach((l, i) => {
        body += `<tr class="sub"><td>Line ${i+1}</td><td>${isDirect?'—':l.horizM.toFixed(3)}</td><td>${isDirect||l.riseM===0?'—':l.riseM.toFixed(3)}</td><td>${l.inclinedM.toFixed(3)}</td><td>${l.w.toFixed(3)}</td></tr>`;
      });
    });
    body += `<tr style="font-weight:700;background:#e6eef8"><td colspan="4">Total + ends</td><td>${grand.toFixed(3)} m</td></tr>`;
    body += `<tr style="font-weight:700;background:#e6eef8"><td colspan="4">+ ${wastage}% wastage</td><td>${tw.toFixed(3)} m</td></tr>`;
    if (hasAssume) body += `<tr><td colspan="5" style="font-size:10px;color:#9a6a00;background:#fffbec;padding:6px 10px">* Assumed slope — verify against drawings when available.</td></tr>`;
    body += `</tbody></table></div>`;
    body += `<div class="ft">CATstimate ArcRise v${VERSION} · by N.Calatrava · ${now}</div>`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>ArcRise Report — ${proj.name}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;700&family=Silkscreen&display=swap" rel="stylesheet"><style>${css}</style></head><body><div class="page">${body}</div></body></html>`;
    const fname = `CATstimate-arcrise-${(proj.name||'Report').replace(/[^a-z0-9]/gi,'_').slice(0,25)}-${Date.now()}.html`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = fname;
    a.click();
  }

  function methodLabel(seg) {
    if (seg.type === 'landing') return 'landing';
    const map = { rl:'RL', slope_ratio:'slope 1:n', slope_angle:'angle', fall:'fall', steps:'steps', assume_ramp:'~ramp', assume_stair:'~stair', direct:'direct' };
    return map[seg.elevMethod] || seg.elevMethod;
  }

  // ════════════════════════════════════════════════════════════
  // EVENTS
  // ════════════════════════════════════════════════════════════
  $('wastage').addEventListener('input', renderResults);
  $('endAllowance').addEventListener('input', () => { renderResults(); segments.forEach(s => renderSegCalc(s.id)); });
  $('unit').addEventListener('change', renderResults);

  const htog = $('htog'), hbody = $('help-body'), hicon = $('hicon');
  if (htog && hbody) htog.addEventListener('click', () => {
    const open = hbody.style.display !== 'none';
    hbody.style.display = open ? 'none' : 'block';
    if (hicon) hicon.className = 'help-icon' + (open ? '' : ' open');
  });

  $('btn-clear').addEventListener('click', () => {
    if (segments.length === 0) return;
    if (confirm('Clear all segments?')) { segments = []; renderSegments(); renderEmpty(); poseFor('empty'); }
  });
  $('btn-dl').addEventListener('click', () => {
    if (segments.length === 0) { alert('Add at least one segment first.'); return; }
    poseFor('calculating');
    setTimeout(() => { dlReport(); poseFor('success'); }, 300);
  });

  // Auto-trigger hat-tip when results meaningfully change (debounced)
  let resultTimer = null;
  const origRenderResults = renderResults;
  renderResults = function() {
    origRenderResults();
    // Don't fire cat reactions on every keystroke — only when total > 0 and changed
    // The trigger lives in btn-dl + clear, so renderResults stays silent.
  };

  // Expose for inline handlers
  window.ArcRise = {
    addSegment, removeSegment, updateSeg, updateArc, updateDirect,
    changeLinesCount, setElevTab
  };
  window.addSegment = addSegment; // for the +Add buttons in the HTML

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

  // INIT
  addSegment('ramp');
  renderEmpty();
})();
