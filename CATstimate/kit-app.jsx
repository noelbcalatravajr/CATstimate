// kit-app.jsx
// Top-level App: sidebar nav + main content + Tweaks panel (3 themes).

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "blueprint",
  "showGrid": true,
  "headingsPixel": true,
  "catSize": 96
}/*EDITMODE-END*/;

const NAV = [
  { group: "Kit" },
  { id: "brand",        label: "Brand",        icon: "★" },
  { id: "foundations",  label: "Foundations",  icon: "◧" },
  { id: "components",   label: "Components",   icon: "▦" },
  { id: "patterns",     label: "Patterns",     icon: "⌬" },
  { group: "Apps" },
  { id: "roadmap",      label: "Roadmap",      icon: "→" },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useStateA("brand");
  const mainRef = useRefA(null);

  // Apply theme + bg-grid to body so themed CSS variables cascade
  useEffectA(() => {
    document.body.setAttribute("data-theme", t.theme);
    document.body.setAttribute("data-bg", (t.showGrid || t.theme === "blueprint") ? "grid" : "none");
  }, [t.theme, t.showGrid]);

  // Section scroll-spy
  useEffectA(() => {
    const ids = NAV.filter(n => n.id).map(n => n.id);
    const opts = { rootMargin: "-30% 0px -55% 0px", threshold: 0 };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, opts);
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const goto = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 12, behavior: "smooth" });
    setActive(id);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">
            <img className="pixel-art" src="assets/catstimate-logo.png" alt="" />
          </div>
          <div>
            <div className="brand-name">CATstimate</div>
            <div className="brand-sub">Design Kit · v1</div>
          </div>
        </div>
        <nav>
          {NAV.map((n, i) => n.group ? (
            <div key={i} className="nav-group-label">{n.group}</div>
          ) : (
            <a key={n.id} className={"nav-item" + (active === n.id ? " active" : "")} onClick={() => goto(n.id)}>
              <span className="dot" />
              <span className="text-mono" style={{ fontSize: 11, color: "inherit", opacity: 0.6, width: 14 }}>{n.icon}</span>
              <span>{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="foot">
          by N.Calatrava<br/>
          <span style={{ opacity: 0.7 }}>Free · No internet required</span>
        </div>
      </aside>

      <main ref={mainRef}>
        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <div className="row" style={{ alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Cat size={64} />
            <div>
              <h1 className="display" style={{ fontSize: 28, color: "var(--navy-deep)", lineHeight: 1, letterSpacing: "0.01em" }}>
                CATstimate Design Kit
              </h1>
              <div className="text-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 8 }}>
                Tokens · Components · Patterns · by N.Calatrava
              </div>
            </div>
            <div style={{ marginLeft: "auto" }} className="row wrap gap-6">
              <span className="chip chip-blue">v1 · May 2026</span>
              <span className="chip chip-green">● Offline ready</span>
              <span className="chip chip-purple">Theme · {t.theme}</span>
            </div>
          </div>

          <div className="note note-info" style={{ marginTop: 18 }}>
            <span className="glyph">↑</span>
            <span>
              Toggle <b>Tweaks</b> (top-right) to switch between Workshop / Pixel Pop / Blueprint themes and compare side-by-side.
              Tap the cat anywhere to play.
            </span>
          </div>
        </div>

        <BrandSection />
        <FoundationsSection />
        <ComponentsSection />
        <PatternsSection />
        <RoadmapSection />

        {/* Footer */}
        <footer style={{ marginTop: 60, paddingTop: 24, borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          CATstimate · by N.Calatrava · Free to use · No internet required<br/>
          <span style={{ opacity: 0.6 }}>Tap the cat. The cat appreciates it.</span>
        </footer>
      </main>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio
          label="Style"
          value={t.theme}
          options={["workshop", "pixel", "blueprint"]}
          onChange={(v) => setTweak("theme", v)}
        />
        <TweakToggle
          label="Show grid background"
          value={t.showGrid}
          onChange={(v) => setTweak("showGrid", v)}
        />
        <TweakSection label="Mascot" />
        <TweakSlider
          label="Hero cat size"
          value={t.catSize}
          min={48}
          max={160}
          step={4}
          unit="px"
          onChange={(v) => setTweak("catSize", v)}
        />
        <TweakSection label="Quick actions" />
        <TweakButton onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top
        </TweakButton>
        <TweakButton onClick={() => {
          // Trigger a "wave" of cat reactions
          document.querySelectorAll('img[src*="catstimate-logo"]').forEach((el, i) => {
            setTimeout(() => el.click?.(), i * 80);
          });
        }}>
          Wake up all cats
        </TweakButton>
      </TweaksPanel>
    </div>
  );
}

/* ─────────────── ROADMAP ─────────────── */
function RoadmapSection() {
  const cols = [
    {
      title: "Now",
      sub: "Live",
      color: "var(--green)",
      bg: "var(--green-soft)",
      items: [
        { name: "Cutting List Estimator", chip: "Ready" },
        { name: "ArcRise (Handrail/Ramp)", chip: "Ready" },
        { name: "Design Kit · v1",        chip: "This file" },
      ],
    },
    {
      title: "Next",
      sub: "Soon",
      color: "var(--amber)",
      bg: "var(--amber-soft)",
      items: [
        { name: "ConcreteCalc",           chip: "Wireframe" },
        { name: "Formwork",               chip: "Wireframe" },
        { name: "Workspace shell · v1",   chip: "Spec" },
        { name: "PDF export template",    chip: "Spec" },
      ],
    },
    {
      title: "Later",
      sub: "Ideas",
      color: "var(--purple)",
      bg: "var(--purple-soft)",
      items: [
        { name: "TileLayout",             chip: "Idea" },
        { name: "Rebar bend schedule",    chip: "Idea" },
        { name: "Paint coverage",         chip: "Idea" },
        { name: "QuickConvert",           chip: "Idea" },
        { name: "Cross-app value linking", chip: "Idea" },
      ],
    },
  ];
  return (
    <section className="kit-section" id="roadmap" data-screen-label="05 Roadmap">
      <div className="sec-head">
        <div>
          <div className="sec-eyebrow">05 — Roadmap</div>
          <h2 className="sec-title">CATstimate Workspace</h2>
        </div>
        <p className="sec-desc">
          The vision: a Google-Workspace-style toolbox of small, focused estimators
          that share projects, units, and exports.
        </p>
      </div>

      <div className="grid grid-3">
        {cols.map((c) => (
          <div key={c.title} className="flat-card" style={{ background: c.bg }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
              <div className="display" style={{ fontSize: 18, color: "var(--navy-deep)" }}>{c.title}</div>
              <span className="chip chip-ink" style={{ background: c.color, borderColor: c.color }}>{c.sub}</span>
            </div>
            <div className="col" style={{ gap: 6 }}>
              {c.items.map((it) => (
                <div key={it.name} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  gap: 8,
                }}>
                  <span style={{ fontSize: 13, color: "var(--ink)" }}>{it.name}</span>
                  <span className="text-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{it.chip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="note note-ok" style={{ marginTop: 18 }}>
        <span className="glyph">✓</span>
        <span>
          Suggested next step: ship the <b>Cutting List Estimator</b> against this kit, then
          design the Workspace shell that hosts both Cutting List and ArcRise as linked apps.
        </span>
      </div>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
