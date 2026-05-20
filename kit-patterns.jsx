// kit-patterns.jsx
// Higher-level UI patterns for the CATstimate Workspace:
//   - App launcher tiles
//   - Project workspace card
//   - Share / QR
//   - Photo attachment slot
//   - Unit toggle
//   - History timeline
//   - Offline status

const { useState: useStateP } = React;

/* ════════════════════════════════════════════════════════════
   APP REGISTRY — your real (+ planned) tools
   ════════════════════════════════════════════════════════════ */
const APPS = [
  { name: "Cutting List",    sub: "Estimator",       color: "var(--blue)",   bg: "var(--blue-bg)",   border: "var(--blue-border)",  status: "ready",   icon: "▤" },
  { name: "ArcRise",         sub: "Handrail / Ramp", color: "var(--amber)",  bg: "var(--amber-soft)",border: "var(--amber-border)", status: "ready",   icon: "⌒" },
  { name: "ConcreteCalc",    sub: "Volume / Pour",   color: "var(--ink-2)",  bg: "var(--surface-2)", border: "var(--border)",       status: "soon",    icon: "▣" },
  { name: "Formwork",        sub: "Sheets & Studs",  color: "var(--purple)", bg: "var(--purple-soft)", border: "var(--purple-border)", status: "soon", icon: "⌗" },
  { name: "TileLayout",      sub: "Coverage",        color: "var(--green)",  bg: "var(--green-soft)", border: "var(--green-border)", status: "soon",   icon: "⊞" },
  { name: "Rebar",           sub: "Bend Schedule",   color: "var(--red)",    bg: "var(--red-soft)",  border: "var(--red-border)",   status: "idea",    icon: "≡" },
  { name: "Paint",           sub: "Litres / Coats",  color: "var(--blue)",   bg: "var(--blue-bg)",   border: "var(--blue-border)",  status: "idea",    icon: "◐" },
  { name: "QuickConvert",    sub: "Units",           color: "var(--ink-2)",  bg: "var(--surface-2)", border: "var(--border)",       status: "idea",    icon: "⇄" },
];

function PatternsSection() {
  return (
    <section className="kit-section" id="patterns" data-screen-label="04 Patterns">
      <div className="sec-head">
        <div>
          <div className="sec-eyebrow">04 — Patterns</div>
          <h2 className="sec-title">Workspace Patterns</h2>
        </div>
        <p className="sec-desc">
          The bigger units that make CATstimate feel like a connected suite —
          launcher, projects, share, photos, history. Reuse these across every app.
        </p>
      </div>

      <AppLauncherBlock />
      <EmptyStatesBlock />
      <ProjectWorkspaceBlock />
      <ShareQRBlock />
      <PhotoUnitOfflineBlock />
      <HistoryTimelineBlock />
    </section>
  );
}

/* ─────────────── EMPTY / LOADING / SUCCESS STATES ─────────────── */
function EmptyStatesBlock() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Empty · Loading · Success states</div>
      <div className="grid grid-3">
        {/* Welcome / first-run */}
        <StateCard
          pose="wave"
          title="Welcome aboard"
          body="Let's start your first estimate. Pick a tool from the launcher to begin."
          cta="Browse tools"
          accent="var(--blue)"
        />
        {/* No projects */}
        <StateCard
          pose="sleep"
          title="No projects yet"
          body="The cat is napping. Create a project to bundle your estimates together."
          cta="+ New project"
          accent="var(--ink-2)"
        />
        {/* Saving / working */}
        <StateCard
          pose="wrench"
          title="Crunching numbers"
          body="Computing handrail lengths across 4 segments and 8 lines…"
          cta="Cancel"
          accent="var(--amber)"
          ctaStyle="ghost"
          progress
        />
        {/* Success — saved */}
        <StateCard
          pose="hat-tip"
          title="Estimate saved"
          body="Block A — Site 12 · 26.145 m total. Linked to project workspace."
          cta="Share"
          accent="var(--green)"
        />
        {/* Offline notice */}
        <StateCard
          pose="sleep"
          title="You're offline"
          body="No worries — CATstimate works fully offline. Edits sync when you reconnect."
          cta="Dismiss"
          accent="var(--amber)"
          ctaStyle="ghost"
        />
        {/* Error */}
        <StateCard
          pose="wrench"
          title="Something's off"
          body="RL Start must be lower than RL End for an ascending ramp."
          cta="Fix it"
          accent="var(--red)"
        />
      </div>
    </div>
  );
}

function StateCard({ pose, title, body, cta, accent, ctaStyle, progress }) {
  return (
    <div className="flat-card" style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", gap: 10, padding: "20px 16px",
      borderTop: "3px solid " + accent,
    }}>
      <Cat pose={pose} size={72} interactive={false} autoIdle={pose !== "sleep"} />
      <div style={{
        fontFamily: "var(--font-pixel)", fontSize: 15,
        color: "var(--navy-deep)", letterSpacing: "0.02em", marginTop: 4,
      }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, maxWidth: 240 }}>
        {body}
      </div>
      {progress && (
        <div style={{
          width: "70%", height: 8, background: "var(--surface-2)",
          border: "1px solid var(--border)", marginTop: 4,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "62%",
            background: accent,
          }} />
        </div>
      )}
      <button
        className={"btn " + (ctaStyle === "ghost" ? "btn-ghost" : "btn-outline")}
        style={{ marginTop: 6, padding: "6px 12px", fontSize: 12 }}
      >
        {cta}
      </button>
    </div>
  );
}

/* ─────────────── APP LAUNCHER ─────────────── */
function AppLauncherBlock() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">App Launcher (Home)</div>
      <div className="flat-card" style={{ padding: 22 }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <Cat size={56} pose="wave" interactive={false} />
          <div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 18, color: "var(--navy-deep)" }}>
              Welcome back, N.
            </div>
            <div className="text-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              8 tools · 3 projects · saved locally
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span className="chip chip-green">● Online</span>
          </div>
        </div>

        <div className="grid grid-4" style={{ gap: 12 }}>
          {APPS.map((app) => <AppTile key={app.name} app={app} />)}
        </div>

        <div className="text-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Tiles are tap-targets 88×88+ · grid auto-flows on smaller screens
        </div>
      </div>
    </div>
  );
}

function AppTile({ app }) {
  const dimmed = app.status !== "ready";
  return (
    <div
      style={{
        background: app.bg,
        border: "1.5px solid " + app.border,
        borderRadius: "var(--r-md)",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 110,
        position: "relative",
        cursor: app.status === "ready" ? "pointer" : "default",
        opacity: app.status === "idea" ? 0.55 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 32, height: 32, background: app.color, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontFamily: "var(--font-pixel)", borderRadius: 4,
          }}
        >
          {app.icon}
        </div>
        {app.status === "soon" && <span className="chip chip-amber" style={{ padding: "1px 6px", fontSize: 9 }}>Soon</span>}
        {app.status === "idea" && <span className="chip chip-purple" style={{ padding: "1px 6px", fontSize: 9 }}>Idea</span>}
      </div>
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 13, color: "var(--navy-deep)", marginTop: 6, letterSpacing: "0.02em", lineHeight: 1.1 }}>
        {app.name}
      </div>
      <div className="text-mono" style={{ fontSize: 10, color: "var(--ink-2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {app.sub}
      </div>
    </div>
  );
}

/* ─────────────── PROJECT WORKSPACE ─────────────── */
function ProjectWorkspaceBlock() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Project Workspace (linked apps)</div>
      <div className="flat-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <span className="chip chip-blue">Project</span>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 16, color: "var(--navy-deep)" }}>
            Block A — Site 12
          </div>
          <span className="pill-count">3 estimates linked</span>
          <div style={{ marginLeft: "auto" }} className="row" >
            <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}>Rename</button>
            <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 11 }}>Share</button>
          </div>
        </div>

        <div className="col" style={{ gap: 8 }}>
          {[
            { app: "Cutting List", color: "var(--blue)", date: "May 18", val: "182 boards",  status: "Saved" },
            { app: "ArcRise",      color: "var(--amber)", date: "May 19", val: "26.145 m",   status: "Saved" },
            { app: "ConcreteCalc", color: "var(--ink-2)", date: "—",      val: "Not started", status: "Draft" },
          ].map((row, i) => (
            <div key={i}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px",
                background: "var(--surface-2)",
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ width: 6, height: 36, background: row.color, borderRadius: 3, flexShrink: 0 }} />
              <div style={{ minWidth: 130 }}>
                <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>{row.app}</div>
                <div className="text-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{row.date}</div>
              </div>
              <div className="text-mono" style={{ flex: 1, color: "var(--ink-2)", fontSize: 12 }}>{row.val}</div>
              <span className={"chip " + (row.status === "Saved" ? "chip-green" : "chip-purple")}>{row.status}</span>
              <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 10 }}>Open →</button>
            </div>
          ))}
        </div>

        <div className="note note-info" style={{ marginTop: 14 }}>
          <span className="glyph">↔</span>
          <span>
            Estimates inside a project can <b>borrow values</b> from each other —
            e.g. ArcRise can pull total handrail length into Paint's surface estimate.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── SHARE / QR ─────────────── */
function ShareQRBlock() {
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Share &amp; Export</div>
      <div className="grid grid-2">
        <div className="flat-card">
          <div className="section-title" style={{ marginBottom: 14 }}>Share via link</div>
          <div className="field">
            <label>Read-only URL</label>
            <div className="row" style={{ gap: 6 }}>
              <input className="ctl-input" readOnly value="https://catstim.app/p/block-a-12#est" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
              <button className="btn btn-primary" style={{ padding: "8px 12px", fontSize: 11 }}>Copy</button>
            </div>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 14 }}>
            <button className="btn btn-outline">⤓ Export PDF</button>
            <button className="btn btn-outline">⤓ CSV</button>
            <button className="btn btn-ghost">Print</button>
          </div>
          <div className="note note-info" style={{ marginTop: 12 }}>
            <span className="glyph">i</span>
            <span>Estimates are encoded into the URL — no server, no account.</span>
          </div>
        </div>

        <div className="flat-card" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <PixelQR />
          <div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 14, color: "var(--navy-deep)", marginBottom: 6 }}>
              Scan to open on phone
            </div>
            <div className="text-mono" style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.5 }}>
              Hand off from a desktop estimate to your phone in seconds.
              Works offline — once loaded, the data lives on-device.
            </div>
            <div className="row" style={{ gap: 6, marginTop: 12 }}>
              <span className="chip chip-green">● Offline ready</span>
              <span className="chip chip-blue">v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Decorative pixel QR — drawn as a grid (not a real code, deliberately)
function PixelQR() {
  // Deterministic pseudo-random pattern based on cell index
  const N = 19;
  const cells = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const isFinder =
        (x < 7 && y < 7) ||
        (x >= N - 7 && y < 7) ||
        (x < 7 && y >= N - 7);
      const isFinderBorder =
        isFinder && (
          (x === 0 || x === 6 || y === 0 || y === 6) ||
          (x >= N - 7 && (x === N - 1 || x === N - 7)) ||
          (y >= N - 7 && (y === N - 1 || y === N - 7))
        );
      const isFinderCore =
        ((x >= 2 && x <= 4 && y >= 2 && y <= 4)) ||
        (x >= N - 5 && x <= N - 3 && y >= 2 && y <= 4) ||
        (x >= 2 && x <= 4 && y >= N - 5 && y <= N - 3);
      const seed = (x * 17 + y * 31 + x * y) % 7;
      const random = seed >= 3 && !isFinder;
      const on = isFinderBorder || isFinderCore || random;
      cells.push({ x, y, on });
    }
  }
  return (
    <div
      style={{
        width: 140, height: 140, flexShrink: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${N}, 1fr)`,
        background: "#fff",
        padding: 6,
        border: "var(--pixel) solid var(--ink)",
        boxShadow: "3px 3px 0 0 var(--ink)",
      }}
    >
      {cells.map((c, i) => (
        <div key={i} style={{ background: c.on ? "var(--ink)" : "transparent" }} />
      ))}
    </div>
  );
}

/* ─────────────── PHOTO / UNIT / OFFLINE ─────────────── */
function PhotoUnitOfflineBlock() {
  const [unit, setUnit] = useStateP("metric");
  const [online, setOnline] = useStateP(true);
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">Photos · Unit Toggle · Offline</div>
      <div className="grid grid-3">
        {/* Photo */}
        <div className="flat-card">
          <div className="section-title" style={{ marginBottom: 12 }}>Photo attachments</div>
          <div className="row" style={{ gap: 8 }}>
            <PhotoSlot caption="Drawing A-12" />
            <PhotoSlot caption="Site photo" />
            <PhotoSlot dashed caption="+ Add" />
          </div>
          <div className="text-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Tap to attach · stored locally
          </div>
        </div>

        {/* Unit toggle */}
        <div className="flat-card">
          <div className="section-title" style={{ marginBottom: 12 }}>Unit toggle</div>
          <div style={{ display: "inline-flex", border: "var(--pixel) solid var(--ink)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
            {["metric", "imperial"].map(u => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                style={{
                  padding: "8px 16px", fontSize: 12, fontWeight: 700,
                  background: unit === u ? "var(--ink)" : "var(--surface)",
                  color: unit === u ? "#fff" : "var(--ink)",
                  border: "none", cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {u}
              </button>
            ))}
          </div>
          <div className="text-mono" style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 12 }}>
            Current: <span style={{ color: "var(--blue)", fontWeight: 700 }}>
              {unit === "metric" ? "24.900 m · 5 % wastage" : "81 ft 8 in · 5 % wastage"}
            </span>
          </div>
        </div>

        {/* Offline */}
        <div className="flat-card">
          <div className="section-title" style={{ marginBottom: 12 }}>Connection status</div>
          <div className="col" style={{ gap: 8 }}>
            <button className="row" onClick={() => setOnline(!online)}
              style={{ alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
              <span className={"chip " + (online ? "chip-green" : "chip-amber")}>● {online ? "Online" : "Offline"}</span>
              <span className="text-mono" style={{ fontSize: 11, color: "var(--muted)" }}>tap to toggle</span>
            </button>
            <div className="note note-info" style={{ marginTop: 4 }}>
              <span className="glyph">↻</span>
              <span>{online
                ? "Auto-sync when shared links are opened by collaborators."
                : "Working offline — changes saved on-device and reconcile on reconnect."}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoSlot({ caption, dashed }) {
  return (
    <div
      style={{
        width: 84, height: 84,
        border: dashed ? "2px dashed var(--border-2)" : "var(--pixel) solid var(--ink)",
        borderRadius: "var(--r-sm)",
        background: dashed ? "var(--surface)" : "var(--blue-bg)",
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: dashed ? "var(--muted)" : "var(--blue)",
        fontSize: dashed ? 22 : 11,
        fontFamily: dashed ? "var(--font-pixel)" : "var(--font-mono)",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {!dashed && (
        <div style={{ position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(135deg, var(--blue-soft) 25%, transparent 25%, transparent 50%, var(--blue-soft) 50%, var(--blue-soft) 75%, transparent 75%)",
          backgroundSize: "10px 10px",
          opacity: 0.5,
        }} />
      )}
      <span style={{ position: "relative", padding: 4, background: dashed ? "transparent" : "rgba(255,255,255,0.85)", borderRadius: 2 }}>
        {dashed ? "+" : caption}
      </span>
    </div>
  );
}

/* ─────────────── HISTORY TIMELINE ─────────────── */
function HistoryTimelineBlock() {
  const events = [
    { t: "Today · 14:32",  who: "you", what: "Added Mid Landing",       delta: "+ 6.225 m" },
    { t: "Today · 13:10",  who: "you", what: "Edited wastage 5 → 7 %",  delta: "+ 0.498 m" },
    { t: "Yesterday",      who: "you", what: "Photo attached · A-12.pdf", delta: "—" },
    { t: "2 days ago",     who: "import", what: "Pulled total from ArcRise", delta: "26.145 m" },
    { t: "2 days ago",     who: "you", what: "Created estimate",         delta: "—" },
  ];
  return (
    <div className="kit-sub">
      <div className="kit-sub-title">History &amp; Revisions</div>
      <div className="flat-card">
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: 2, background: "var(--border)" }} />
          {events.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "8px 0", position: "relative" }}>
              <div style={{
                width: 14, height: 14, borderRadius: "var(--r-sm)",
                background: e.who === "import" ? "var(--purple)" : "var(--blue)",
                border: "var(--pixel) solid var(--ink)",
                flexShrink: 0, marginTop: 2, zIndex: 1,
              }} />
              <div style={{ minWidth: 130 }}>
                <div className="text-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{e.t}</div>
                <div style={{ fontSize: 13, color: "var(--ink)", marginTop: 2 }}>{e.what}</div>
              </div>
              <div className="text-mono" style={{ marginLeft: "auto", color: e.delta === "—" ? "var(--muted)" : "var(--blue)", fontWeight: 700, fontSize: 12 }}>{e.delta}</div>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 8, marginTop: 14 }}>
          <button className="btn btn-ghost">Restore previous</button>
          <button className="btn btn-ghost">Export history (CSV)</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PatternsSection });
