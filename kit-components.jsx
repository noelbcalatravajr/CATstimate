// kit-components.jsx
// Live, copyable components: buttons, fields, badges, notes, steppers,
// tabs, segments, metric cards, tables.

const { useState: useStateC } = React;

function ComponentsSection() {
  return (
    <section className="kit-section" id="components" data-screen-label="03 Components">
      <div className="sec-head">
        <div>
          <div className="sec-eyebrow">03 — Components</div>
          <h2 className="sec-title">UI Building Blocks</h2>
        </div>
        <p className="sec-desc">
          Self-contained pieces every CATstimate app reuses. Theme variants on the
          right (Tweaks panel) re-skin all of these at once.
        </p>
      </div>

      <ButtonsBlock />
      <FieldsBlock />
      <BadgesBlock />
      <NotesBlock />
      <StepperTabsBlock />
      <SegmentBlockDemo />
      <ResultsBlock />
    </section>
  );
}

/* ─────────────── BUTTONS ─────────────── */
function ButtonsBlock() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Buttons</div>
      <div className="flat-card">
        <div className="row wrap" style={{ gap: 10, marginBottom: 14 }}>
          <button className="btn btn-primary">＋ Add Segment</button>
          <button className="btn btn-outline">＋ Add Ramp</button>
          <button className="btn btn-amber">＋ Add Landing</button>
          <button className="btn btn-danger">Remove</button>
          <button className="btn btn-ghost">Cancel</button>
        </div>
        <div className="row wrap" style={{ gap: 10 }}>
          <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 11 }}>Small</button>
          <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 11 }}>Small Outlined</button>
          <button className="btn btn-primary" style={{ padding: "12px 22px", fontSize: 14 }}>Large Primary</button>
          <button className="btn btn-primary" disabled style={{ opacity: 0.4, cursor: "not-allowed" }}>Disabled</button>
        </div>
        <div className="text-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          .btn .btn-primary · .btn-outline · .btn-amber · .btn-danger · .btn-ghost
        </div>
      </div>
    </div>
  );
}

/* ─────────────── FIELDS ─────────────── */
function FieldsBlock() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Form Fields</div>
      <div className="flat-card">
        <div className="grid grid-3" style={{ gap: 14 }}>
          <div className="field">
            <label>Project Name</label>
            <input className="ctl-input" type="text" placeholder="e.g. Block A — Ramp 2" />
          </div>
          <div className="field">
            <label>Wastage (%)</label>
            <input className="ctl-input" type="number" defaultValue="5" />
          </div>
          <div className="field">
            <label>Unit</label>
            <select className="ctl-input" defaultValue="m">
              <option value="m">Metres (m)</option>
              <option value="mm">Millimetres (mm)</option>
              <option value="ft">Feet (ft)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>Notes</label>
          <textarea className="ctl-input" rows="2" placeholder="Site notes, photo references, RFI numbers…" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────── BADGES ─────────────── */
function BadgesBlock() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Badges &amp; Chips</div>
      <div className="flat-card">
        <div className="row wrap" style={{ gap: 8, alignItems: "center" }}>
          <span className="chip chip-blue">Ramp / Stair</span>
          <span className="chip chip-amber">Landing</span>
          <span className="chip chip-green">Saved</span>
          <span className="chip chip-red">Error</span>
          <span className="chip chip-purple">Draft</span>
          <span className="chip chip-ink">Pro</span>
          <span className="chip chip-green">● Online</span>
          <span className="chip chip-amber">● Offline</span>
          <span className="chip chip-blue">v1.0 · May 2026</span>
        </div>
        <div className="row wrap" style={{ gap: 8, marginTop: 12, alignItems: "center" }}>
          <span className="pill-count">1 segment</span>
          <span className="pill-count">3 lines</span>
          <span className="pill-count">12 projects</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── NOTES ─────────────── */
function NotesBlock() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Notes &amp; Alerts</div>
      <div className="flat-card">
        <div className="col" style={{ gap: 8 }}>
          <div className="note note-info"><span className="glyph">i</span><span>Info — hints, guidance, secondary info.</span></div>
          <div className="note note-warn"><span className="glyph">!</span><span>Warning — assumed slope, verify against drawings when available.</span></div>
          <div className="note note-error"><span className="glyph">×</span><span>Error — RL Start must be lower than RL End for a ramp going up.</span></div>
          <div className="note note-ok"><span className="glyph">✓</span><span>Saved locally — your estimate persists across reloads.</span></div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── STEPPER + TABS ─────────────── */
function StepperTabsBlock() {
  const [v, setV] = useStateC(2);
  const [tab, setTab] = useStateC(0);
  const tabs = ["RL Values", "Slope Ratio", "Slope Angle", "Fall (1:n)", "Count Steps", "Direct Length"];
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Stepper &amp; Tabs</div>
      <div className="flat-card">
        <div className="row" style={{ alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
          <div className="text-mono" style={{ fontSize: 10, color: "var(--ink-2)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Handrail Lines</div>
          <div className="stepper">
            <button className="stepper-btn" onClick={() => setV(Math.max(1, v - 1))}>−</button>
            <span className="stepper-val">{v}</span>
            <button className="stepper-btn" onClick={() => setV(v + 1)}>+</button>
          </div>
          <span className="text-mono" style={{ fontSize: 11, color: "var(--muted)" }}>lines</span>
        </div>
        <div className="text-mono" style={{ fontSize: 10, color: "var(--ink-2)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Elevation Method</div>
        <div className="tab-group">
          {tabs.map((t, i) => (
            <button key={t} className={"tab-btn" + (tab === i ? " active" : "")} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── SEGMENT BLOCK ─────────────── */
function SegmentBlockDemo() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Segment Block</div>
      <div className="flat-card">
        <div style={{
          background: "var(--surface-2)", borderRadius: "var(--r-md)",
          border: "1px solid var(--border)", padding: 14
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="chip chip-blue">Ramp / Stair</span>
            <div style={{ flex: 1 }}>
              <input
                className="ctl-input"
                style={{ fontWeight: 600, padding: "5px 10px", background: "var(--surface)" }}
                defaultValue="Ramp 1"
              />
            </div>
            <button className="btn btn-danger" style={{ width: 28, height: 28, padding: 0, justifyContent: "center", fontSize: 15 }}>×</button>
          </div>

          <div className="row" style={{ alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span className="text-mono" style={{ fontSize: 10, color: "var(--ink-2)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Handrail Lines</span>
            <div className="stepper">
              <button className="stepper-btn">−</button>
              <span className="stepper-val">2</span>
              <button className="stepper-btn">+</button>
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 12 }}>
            <div className="text-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Horizontal Arc Length (m) — per line
            </div>
            {[1, 2].map((n) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: n === 2 ? 0 : 8 }}>
                <span style={{ minWidth: 50, fontSize: 11, color: "var(--ink-2)", fontWeight: 600 }}>Line {n}</span>
                <input className="ctl-input" type="number" placeholder="0.000" style={{ padding: "6px 10px", flex: 1 }} />
                <span className="text-mono" style={{ minWidth: 72, textAlign: "right", color: "var(--blue)", fontWeight: 700, fontSize: 11 }}>
                  {n === 1 ? "5.923 m" : "6.217 m"}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--ink-2)" }}>
            Segment subtotal (2 lines + ends): <span style={{ color: "var(--blue)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>12.450 m</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── METRIC CARDS + TABLE ─────────────── */
function ResultsBlock() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Results &amp; Tables</div>
      <div className="flat-card">
        <div className="grid grid-3" style={{ marginBottom: 14 }}>
          <div className="metric-card">
            <div className="metric-label">Net Total</div>
            <div className="metric-value">24.900<span className="metric-unit">m</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-label">+ Wastage</div>
            <div className="metric-value">26.145<span className="metric-unit">m</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Segments</div>
            <div className="metric-value">2<span className="metric-unit">segs</span></div>
          </div>
        </div>
        <div style={{ borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", background: "var(--surface)" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                <th style={th}>Segment / Line</th>
                <th style={th}>Horiz (m)</th>
                <th style={th}>Rise (m)</th>
                <th style={th}>Inclined</th>
                <th style={th}>+Ends</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={td}><b>Ramp 1</b></td><td style={td} colSpan="3" className="text-muted">2 lines</td><td style={{ ...td, fontWeight: 700, color: "var(--blue)" }}>12.450</td></tr>
              <tr style={{ background: "var(--bg-canvas)" }}><td style={subTd}>Line 1</td><td style={subTd}>5.800</td><td style={subTd}>1.200</td><td style={subTd}>5.923</td><td style={subTd}>6.123</td></tr>
              <tr style={{ background: "var(--bg-canvas)" }}><td style={subTd}>Line 2</td><td style={subTd}>6.100</td><td style={subTd}>1.200</td><td style={subTd}>6.217</td><td style={subTd}>6.417</td></tr>
              <tr><td style={td}><b>Mid Landing</b></td><td style={td} colSpan="3" className="text-muted">2 lines</td><td style={{ ...td, fontWeight: 700, color: "var(--blue)" }}>12.450</td></tr>
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--blue-bg)" }}><td colSpan="4" style={{ ...td, fontWeight: 700, color: "var(--blue)" }}>Total + ends</td><td style={{ ...td, fontWeight: 700, color: "var(--blue)" }}>24.900 m</td></tr>
              <tr style={{ background: "var(--blue-bg)" }}><td colSpan="4" style={{ ...td, fontWeight: 700, color: "var(--blue)" }}>+ 5% wastage</td><td style={{ ...td, fontWeight: 700, color: "var(--blue)" }}>26.145 m</td></tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
const th = { textAlign: "left", padding: "8px 10px", color: "var(--muted)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)" };
const td = { padding: "7px 10px", borderBottom: "1px solid var(--border)", color: "var(--ink)", fontSize: 12, fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-mono)" };
const subTd = { ...td, color: "var(--ink-2)", fontSize: 11, padding: "5px 10px 5px 22px" };

Object.assign(window, { ComponentsSection });
