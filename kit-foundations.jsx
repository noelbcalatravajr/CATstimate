// kit-foundations.jsx
// Brand, colors, type, spacing, pixel treatments.

function BrandSection() {
  return (
    <section className="kit-section" id="brand" data-screen-label="01 Brand">
      <div className="sec-head">
        <div>
          <div className="sec-eyebrow">01 — Brand</div>
          <h2 className="sec-title">Mascot &amp; Identity</h2>
        </div>
        <p className="sec-desc">
          The hard-hat cat is the soul of CATstimate. Tap the big one to play —
          it bobs, jumps, wiggles, and occasionally spins. Use it sparingly but
          confidently.
        </p>
      </div>

      <div className="grid grid-2" style={{ alignItems: "stretch" }}>
        {/* Hero mascot */}
        <div
          className="flat-card"
          style={{
            background: "linear-gradient(180deg, var(--navy) 0%, var(--navy-deep) 100%)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            minHeight: 320,
            border: "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* pixel grid backdrop */}
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
                "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <Cat size={160} />
          </div>
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 24,
                color: "#fff",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              CATstimate
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "#7ecfb3",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginTop: 8,
              }}
            >
              by N.Calatrava · tap the cat
            </div>
          </div>
        </div>

        {/* Sizes + voice */}
        <div className="col">
          <div className="flat-card">
            <div className="kit-sub-title" style={{ marginTop: 0 }}>Mascot Sizes</div>
            <div className="row wrap" style={{ alignItems: "flex-end", gap: 18 }}>
              <CatSwatch size={24}  label="20–24px" note="inline, badges" />
              <CatSwatch size={40}  label="40px"    note="header, list rows" />
              <CatSwatch size={64}  label="64px"    note="app tiles" />
              <CatSwatch size={96}  label="96px"    note="empty states" />
              <CatSwatch size={140} label="140px"   note="splash / hero" />
            </div>
          </div>

          <div className="flat-card">
            <div className="kit-sub-title" style={{ marginTop: 0 }}>Voice &amp; Tone</div>
            <div className="grid grid-2" style={{ gap: 10 }}>
              <VoiceCell good="Let's measure!" bad="Initiate quantity computation." />
              <VoiceCell good="Saved locally." bad="Persistence operation succeeded." />
              <VoiceCell good="Need a hand?" bad="Click for additional guidance." />
              <VoiceCell good="Looking good." bad="Validation passed successfully." />
            </div>
          </div>
        </div>
      </div>

      {/* Emote strip — all 5 poses */}
      <div className="kit-sub">
        <div className="kit-sub-title">Mascot Poses (Emotes)</div>
        <div className="flat-card">
          <CatPoseStrip size={80} />
          <div className="note note-info" style={{ marginTop: 16 }}>
            <span className="glyph">i</span>
            <span>
              Each pose has a job. Use <b>wave</b> on welcome screens, <b>sleep</b>
              when nothing's happening, <b>wrench</b> while the app is saving or
              calculating, and <b>hat-tip</b> after a successful export or save.
            </span>
          </div>
        </div>
      </div>

      {/* Wordmark + lockups */}
      <div className="kit-sub">
        <div className="kit-sub-title">Wordmark &amp; Lockups</div>
        <div className="grid grid-3">
          <LockupTile bg="var(--navy)" textColor="#fff" subColor="#7ecfb3" />
          <LockupTile bg="var(--surface)" textColor="var(--navy-deep)" subColor="var(--muted)" bordered />
          <LockupTile bg="var(--amber-soft)" textColor="var(--navy-deep)" subColor="var(--amber)" hat />
        </div>
      </div>
    </section>
  );
}

function CatSwatch({ size, label, note }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: Math.max(size, 48), height: Math.max(size, 48),
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}
      >
        <Cat size={size} />
      </div>
      <div className="text-mono" style={{ fontSize: 10, color: "var(--ink)", letterSpacing: "0.08em" }}>{label}</div>
      <div className="text-mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.06em" }}>{note}</div>
    </div>
  );
}

function VoiceCell({ good, bad }) {
  return (
    <div style={{ borderLeft: "3px solid var(--green)", paddingLeft: 12 }}>
      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{good}</div>
      <div style={{ fontSize: 11, color: "var(--muted)", textDecoration: "line-through", marginTop: 4 }}>
        {bad}
      </div>
    </div>
  );
}

function LockupTile({ bg, textColor, subColor, bordered, hat }) {
  // Vary the pose by lockup variant for visual variety
  const pose = hat ? "hat-tip" : bordered ? "wave" : "idle";
  return (
    <div
      style={{
        background: bg,
        borderRadius: "var(--r-md)",
        padding: "22px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        border: bordered ? "1px solid var(--border)" : "none",
        minHeight: 96,
      }}
    >
      <Cat size={48} pose={pose} interactive={false} autoIdle={false} />
      <div>
        <div
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 18,
            color: textColor,
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
        >
          CATstimate
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: subColor,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          {hat ? "Hard-hat lockup" : bordered ? "Light lockup" : "Dark lockup"}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COLOR TOKENS
   ════════════════════════════════════════════════════════════ */
const COLOR_GROUPS = [
  {
    name: "Primary / Blue",
    tokens: [
      { name: "blue",        var: "--blue",        hex: "#3a5bd9", on: "#fff" },
      { name: "blue-2",      var: "--blue-2",      hex: "#2a4ac0", on: "#fff" },
      { name: "blue-soft",   var: "--blue-soft",   hex: "#e8eeff", on: "#3a5bd9" },
      { name: "blue-bg",     var: "--blue-bg",     hex: "#f0f3ff", on: "#3a5bd9" },
      { name: "blue-border", var: "--blue-border", hex: "#c8d4f8", on: "#3a5bd9" },
    ],
  },
  {
    name: "Navy / Ink",
    tokens: [
      { name: "navy",        var: "--navy",        hex: "#1e2e6e", on: "#fff" },
      { name: "navy-deep",   var: "--navy-deep",   hex: "#1a2340", on: "#fff" },
      { name: "ink",         var: "--ink",         hex: "#1a2340", on: "#fff" },
      { name: "ink-2",       var: "--ink-2",       hex: "#5a6a9a", on: "#fff" },
      { name: "muted",       var: "--muted",       hex: "#8896c8", on: "#fff" },
    ],
  },
  {
    name: "Accent / Amber (Hat)",
    tokens: [
      { name: "amber",       var: "--amber",       hex: "#c07a10", on: "#fff" },
      { name: "amber-soft",  var: "--amber-soft",  hex: "#fff5e0", on: "#c07a10" },
      { name: "amber-border",var: "--amber-border",hex: "#f0d8a0", on: "#c07a10" },
      { name: "hat-yellow",  var: "--hat-yellow",  hex: "#f4c91a", on: "#1a2340" },
    ],
  },
  {
    name: "States",
    tokens: [
      { name: "green",       var: "--green",       hex: "#1a8a55", on: "#fff" },
      { name: "green-soft",  var: "--green-soft",  hex: "#e6f9f0", on: "#1a8a55" },
      { name: "red",         var: "--red",         hex: "#c03030", on: "#fff" },
      { name: "red-soft",    var: "--red-soft",    hex: "#fff0f0", on: "#c03030" },
      { name: "purple",      var: "--purple",      hex: "#6040c0", on: "#fff" },
      { name: "purple-soft", var: "--purple-soft", hex: "#f0eeff", on: "#6040c0" },
    ],
  },
  {
    name: "Neutrals",
    tokens: [
      { name: "bg-page",     var: "--bg-page",     hex: "#f0f2f8", on: "#1a2340" },
      { name: "bg-canvas",   var: "--bg-canvas",   hex: "#f7f8fc", on: "#1a2340" },
      { name: "surface",     var: "--surface",     hex: "#ffffff", on: "#1a2340" },
      { name: "surface-2",   var: "--surface-2",   hex: "#f8f9fd", on: "#1a2340" },
      { name: "border",      var: "--border",      hex: "#e2e6f0", on: "#1a2340" },
    ],
  },
];

function FoundationsSection() {
  return (
    <section className="kit-section" id="foundations" data-screen-label="02 Foundations">
      <div className="sec-head">
        <div>
          <div className="sec-eyebrow">02 — Foundations</div>
          <h2 className="sec-title">Color, Type, Space</h2>
        </div>
        <p className="sec-desc">
          The tokens below power every CATstimate app. Keep the palette tight —
          one primary blue, one amber accent, a small set of state colors.
        </p>
      </div>

      {/* Color groups */}
      {COLOR_GROUPS.map((g) => (
        <div className="kit-sub" key={g.name}>
          <div className="kit-sub-title">{g.name}</div>
          <div className="grid grid-4" style={{ gap: 10 }}>
            {g.tokens.map((t) => (
              <Swatch key={t.name} token={t} />
            ))}
          </div>
        </div>
      ))}

      {/* Typography */}
      <div className="kit-sub">
        <div className="kit-sub-title">Typography</div>
        <div className="grid grid-3">
          <TypeCard
            name="Silkscreen"
            role="Display / Pixel"
            stack="var(--font-pixel)"
            sample="CATSTIMATE"
            note="Headings, brand, big metric digits. Use sparingly — high impact."
          />
          <TypeCard
            name="IBM Plex Sans"
            role="Body"
            stack="var(--font-body)"
            sample="The site engineer estimated 24.9 m of handrail."
            note="UI text, body, descriptions. Tested for readability on jobsite tablets."
          />
          <TypeCard
            name="IBM Plex Mono"
            role="Labels / Numbers"
            stack="var(--font-mono)"
            sample="0123.456 m · v1.0"
            note="Tabular numbers, technical labels, version strings, code."
          />
        </div>
      </div>

      {/* Type scale */}
      <div className="kit-sub">
        <div className="kit-sub-title">Scale</div>
        <div className="flat-card">
          <ScaleRow size={28} label="display-xl"  family="var(--font-pixel)"   text="CATSTIMATE" />
          <ScaleRow size={22} label="display-lg"  family="var(--font-pixel)"   text="Handrail Estimator" />
          <ScaleRow size={18} label="display-md"  family="var(--font-pixel-2)" text="Add a segment" />
          <ScaleRow size={14} label="body-md"     family="var(--font-body)"    text="Used everywhere the user reads sentences." />
          <ScaleRow size={13} label="body-sm"     family="var(--font-body)"    text="Smaller body, secondary copy and helper text." />
          <ScaleRow size={11} label="mono-sm"     family="var(--font-mono)"    text="DENSITY · v1.0 · 24.900 m" upper />
          <ScaleRow size={10} label="mono-xs"     family="var(--font-mono)"    text="SECTION TITLE / EYEBROW" upper />
        </div>
      </div>

      {/* Spacing + radius + pixel treatments */}
      <div className="kit-sub">
        <div className="kit-sub-title">Space, Radius, Pixel</div>
        <div className="grid grid-3">
          <div className="flat-card">
            <div className="section-title" style={{ marginBottom: 12 }}>Spacing scale</div>
            <div className="col" style={{ gap: 8 }}>
              {[4,8,12,16,20,28,36].map(n => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="text-mono" style={{ width: 36, fontSize: 11, color: "var(--muted)" }}>{n}px</div>
                  <div style={{ width: n*3, height: 10, background: "var(--blue-soft)", borderLeft: "3px solid var(--blue)" }} />
                </div>
              ))}
            </div>
          </div>
          <div className="flat-card">
            <div className="section-title" style={{ marginBottom: 12 }}>Radius</div>
            <div className="row wrap" style={{ gap: 14 }}>
              {[
                { v: 0, l: "0 · pixel" },
                { v: 4, l: "sm · 4" },
                { v: 8, l: "md · 8" },
                { v: 12, l: "lg · 12" },
                { v: 20, l: "pill · 20" },
              ].map(r => (
                <div key={r.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 48, height: 48, background: "var(--blue-soft)", border: "1.5px solid var(--blue)", borderRadius: r.v }} />
                  <div className="text-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{r.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flat-card">
            <div className="section-title" style={{ marginBottom: 12 }}>Pixel treatments</div>
            <div className="col" style={{ gap: 14 }}>
              <PixelBlockDemo label="2px border + 4px hard shadow"
                style={{ border: "2px solid var(--ink)", boxShadow: "4px 4px 0 0 var(--ink)", borderRadius: 0 }} />
              <PixelBlockDemo label="checker fill (16px)"
                style={{
                  borderRadius: 0,
                  backgroundImage: "linear-gradient(45deg, var(--blue-soft) 25%, transparent 25%, transparent 75%, var(--blue-soft) 75%), linear-gradient(45deg, var(--blue-soft) 25%, transparent 25%, transparent 75%, var(--blue-soft) 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 8px 8px",
                  border: "1px solid var(--blue-border)",
                }} />
              <PixelBlockDemo label="dashed pixel border"
                style={{ border: "2px dashed var(--ink)", borderRadius: 0 }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Swatch({ token }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(token.var);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div
      onClick={copy}
      className="flat-card"
      style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
      title="Click to copy variable"
    >
      <div
        style={{
          height: 64,
          background: token.hex,
          color: token.on,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          padding: "8px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {copied ? "copied!" : ""}
      </div>
      <div style={{ padding: "8px 10px" }}>
        <div className="text-mono" style={{ fontSize: 11, color: "var(--ink)", fontWeight: 600 }}>{token.name}</div>
        <div className="text-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{token.hex}</div>
      </div>
    </div>
  );
}

function TypeCard({ name, role, stack, sample, note }) {
  return (
    <div className="flat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div style={{ fontFamily: stack, fontSize: 16, color: "var(--ink)", letterSpacing: stack === "var(--font-pixel)" ? "0.02em" : 0 }}>{name}</div>
        <span className="chip chip-blue">{role}</span>
      </div>
      <div style={{ fontFamily: stack, fontSize: 22, color: "var(--navy-deep)", lineHeight: 1.2, minHeight: 60, letterSpacing: stack === "var(--font-pixel)" ? "0.01em" : 0 }}>
        {sample}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 10, lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}

function ScaleRow({ size, label, family, text, upper }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "10px 0", borderBottom: "1px dashed var(--border)" }}>
      <div className="text-mono" style={{ width: 90, fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
      <div className="text-mono" style={{ width: 40, fontSize: 10, color: "var(--muted)" }}>{size}px</div>
      <div style={{ fontFamily: family, fontSize: size, color: "var(--ink)", letterSpacing: family === "var(--font-pixel)" ? "0.02em" : 0, textTransform: upper ? "uppercase" : "none" }}>
        {text}
      </div>
    </div>
  );
}

function PixelBlockDemo({ label, style }) {
  return (
    <div>
      <div style={{ height: 44, background: "var(--surface)", ...style, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
        sample
      </div>
      <div className="text-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { BrandSection, FoundationsSection });
