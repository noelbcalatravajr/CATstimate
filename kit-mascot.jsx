// kit-mascot.jsx
// Interactive CATstimate cat with smooth pose transitions.
//
// All five sprites are rendered stacked; the active one is opacity:1 and the
// others fade out. A tiny hop animation fires on every pose change so the
// transition has motion, not just a crossfade.
//
// API:
//   <Cat />                  → tap-cycle through emotes, return to idle
//   <Cat pose="wave" />      → lock to a specific pose
//   <Cat pose="wave" loop /> → cycle idle ↔ wave on a timer (auto-emote loop)

const { useState, useEffect, useRef } = React;

const POSES = ["idle", "wave", "sleep", "wrench", "hat-tip"];
const POSE_SRC = {
  idle:      "assets/catstimate-logo.png",
  wave:      "assets/cat-wave.png",
  sleep:     "assets/cat-sleep.png",
  wrench:    "assets/cat-wrench.png",
  "hat-tip": "assets/cat-hat-tip.png",
};

// Hold duration per pose (ms) before returning to idle
const POSE_HOLD = {
  wave:      1200,
  wrench:    1400,
  "hat-tip": 1200,
  sleep:     2200,
  idle:      900,
};

// Speech bubble script for tap-cycle
const TAP_REACTIONS = [
  { pose: "wave",    msg: "Hello!" },
  { pose: "wrench",  msg: "Building..." },
  { pose: "hat-tip", msg: "Cheers!" },
  { pose: "wave",    msg: "Need a hand?" },
  { pose: "sleep",   msg: "Zzz..." },
  { pose: "wrench",  msg: "On it!" },
  { pose: "hat-tip", msg: "Purr-fect." },
  { pose: "wave",    msg: "Pixel power!" },
  { pose: "sleep",   msg: "Just a nap..." },
  { pose: "hat-tip", msg: "by N.Calatrava" },
];

function Cat({
  size = 96,
  pose = null,         // null = tap-interactive; string = locked pose
  interactive = true,
  withBubble = true,
  autoIdle = true,     // gentle bob in idle pose
  loop = false,        // when `pose` is set: cycle idle ↔ pose forever
  loopInterval = 3500, // ms between loop steps
}) {
  const isLocked = pose !== null && !loop;
  const initialPose = pose || "idle";

  const [currentPose, setCurrentPose] = useState(initialPose);
  const [bubble, setBubble] = useState(null);
  const [tapIdx, setTapIdx] = useState(0);

  const hopRef = useRef(null);
  const holdTimer = useRef(null);
  const bubbleTimer = useRef(null);
  const loopTimer = useRef(null);

  // Trigger a one-shot hop via Web Animations API.
  // Runs alongside the CSS bob (no conflict), and restarts cleanly on every call.
  const playHop = () => {
    const el = hopRef.current;
    if (!el || typeof el.animate !== "function") return;
    el.animate(
      [
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(-10px) scale(1.05)", offset: 0.4 },
        { transform: "translateY(0) scale(1)" },
      ],
      { duration: 420, easing: "ease-out" }
    );
  };

  // Trigger a pose change with hop + optional bubble
  const goTo = (next, msg) => {
    setCurrentPose(next);
    playHop();
    if (withBubble && msg) {
      setBubble({ text: msg, key: Date.now() });
      clearTimeout(bubbleTimer.current);
      const bubbleHold = next === "sleep" ? 2400 : 1700;
      bubbleTimer.current = setTimeout(() => setBubble(null), bubbleHold);
    }
  };

  // Tap interaction
  const tap = () => {
    if (!interactive || isLocked) return;
    const r = TAP_REACTIONS[tapIdx % TAP_REACTIONS.length];
    setTapIdx(tapIdx + 1);
    goTo(r.pose, r.msg);
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      goTo("idle", null);
    }, POSE_HOLD[r.pose] || 1200);
  };

  // Auto-emote loop (used by some kit demos)
  useEffect(() => {
    if (!loop || !pose) return;
    let alive = true;
    let showingPose = false;
    const tick = () => {
      if (!alive) return;
      showingPose = !showingPose;
      goTo(showingPose ? pose : "idle", null);
      const hold = showingPose ? (POSE_HOLD[pose] || 1400) : loopInterval;
      loopTimer.current = setTimeout(tick, hold);
    };
    loopTimer.current = setTimeout(tick, loopInterval);
    return () => { alive = false; clearTimeout(loopTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, pose, loopInterval]);

  // Sync when locked pose changes externally
  useEffect(() => {
    if (isLocked) {
      setCurrentPose(pose || "idle");
      playHop();
    }
  }, [pose, isLocked]);

  // Cleanup
  useEffect(() => () => {
    clearTimeout(holdTimer.current);
    clearTimeout(bubbleTimer.current);
    clearTimeout(loopTimer.current);
  }, []);

  return (
    <div style={{
      position: "relative",
      width: size, height: size,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {bubble && (
        <div
          key={bubble.key}
          style={{
            position: "absolute",
            top: -30,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ink)",
            color: "#fff",
            padding: "5px 10px",
            fontSize: 11,
            fontFamily: "var(--font-pixel)",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            borderRadius: 4,
            animation: "bubble-in 0.25s ease-out both",
            zIndex: 3,
            pointerEvents: "none",
            boxShadow: "2px 2px 0 0 rgba(0,0,0,0.25)",
          }}
        >
          {bubble.text}
          <span
            style={{
              position: "absolute",
              bottom: -5, left: "50%", marginLeft: -5,
              width: 0, height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid var(--ink)",
            }}
          />
        </div>
      )}

      {/* Hop container — stable DOM node, animation restarted via classList */}
      <div
        ref={hopRef}
        onClick={tap}
        data-bob={autoIdle && currentPose === "idle" ? "1" : "0"}
        style={{
          position: "relative",
          width: size,
          height: size,
          cursor: (interactive && !isLocked) ? "pointer" : "default",
          transformOrigin: "center 80%",
          WebkitTapHighlightColor: "transparent",
          /* Idle bob runs continuously when data-bob=1 (CSS picks it up) */
          animation: (autoIdle && currentPose === "idle")
            ? "cat-bob 2.4s ease-in-out infinite"
            : "none",
        }}
      >
        {POSES.map(p => (
          <img
            key={p}
            className="pixel-art"
            src={POSE_SRC[p]}
            alt={p === currentPose ? `CATstimate · ${p}` : ""}
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: p === currentPose ? 1 : 0,
              transition: "opacity 260ms ease",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Tiny inline cat (no animation, single sprite)
function CatInline({ size = 20, pose = "idle" }) {
  return (
    <img
      className="pixel-art"
      src={POSE_SRC[pose] || POSE_SRC.idle}
      alt=""
      style={{ width: size, height: size, verticalAlign: "middle", objectFit: "contain" }}
      draggable={false}
    />
  );
}

// All-poses display strip (Brand section)
function CatPoseStrip({ size = 80 }) {
  const items = [
    { id: "idle",     label: "idle",     use: "default / list rows" },
    { id: "wave",     label: "wave",     use: "welcome / empty states" },
    { id: "sleep",    label: "sleep",    use: "no projects / inactive" },
    { id: "wrench",   label: "wrench",   use: "saving / working" },
    { id: "hat-tip",  label: "hat-tip",  use: "success / thanks" },
  ];
  return (
    <div className="row wrap" style={{ gap: 18, alignItems: "flex-end" }}>
      {items.map(p => (
        <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ height: size, display: "flex", alignItems: "flex-end" }}>
            {/* loop: cycle idle ↔ pose so the kit demos the transition itself */}
            <Cat pose={p.id === "idle" ? null : p.id} loop={p.id !== "idle"} size={size} interactive={p.id === "idle"} withBubble={false} />
          </div>
          <div className="text-mono" style={{ fontSize: 10, color: "var(--ink)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.label}</div>
          <div className="text-mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.04em" }}>{p.use}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Cat, CatInline, CatPoseStrip, POSE_SRC });
