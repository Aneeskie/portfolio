"use client";

import { useEffect, useRef, useState } from "react";
import { worldState } from "@/lib/worldStore";

const JOY_R = 52; // joystick base radius px
const THUMB_R = 22;

interface Props {
  active: boolean;
  onInteract: () => void;
}

export default function MobileControls({ active, onInteract }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [thumb, setThumb] = useState({ dx: 0, dy: 0 });
  const [jumpActive, setJumpActive] = useState(false);
  const [fireActive, setFireActive] = useState(false);

  const joystickId = useRef<number | null>(null);
  const camTouchId = useRef<number | null>(null);
  const camLast = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (!isMobile || !active) return;

    const DEAD = 0.22;

    const onStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        const isLeft = t.clientX < window.innerWidth * 0.38;
        if (isLeft && joystickId.current === null) {
          joystickId.current = t.identifier;
          setThumb({ dx: 0, dy: 0 });
        } else if (!isLeft && camTouchId.current === null) {
          // right half drag = camera look
          const isActionArea = t.clientY > window.innerHeight * 0.68;
          if (!isActionArea) {
            camTouchId.current = t.identifier;
            camLast.current = { x: t.clientX, y: t.clientY };
          }
        }
      }
    };

    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joystickId.current) {
          // find the joystick base element center
          const el = document.getElementById("mobile-joystick-base");
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const rawDx = t.clientX - cx;
          const rawDy = t.clientY - cy;
          const dist = Math.hypot(rawDx, rawDy);
          const scale = Math.min(dist, JOY_R) / (dist || 1);
          const nx = (rawDx / (dist || 1)) * (dist > JOY_R ? 1 : dist / JOY_R);
          const ny = (rawDy / (dist || 1)) * (dist > JOY_R ? 1 : dist / JOY_R);
          setThumb({ dx: nx * JOY_R * scale / Math.min(dist / JOY_R, 1) * Math.min(dist, JOY_R) / JOY_R,
                     dy: ny * JOY_R * scale / Math.min(dist / JOY_R, 1) * Math.min(dist, JOY_R) / JOY_R });

          // Simpler: clamp thumb visually and map to keys
          const clampedX = Math.max(-1, Math.min(1, rawDx / JOY_R));
          const clampedY = Math.max(-1, Math.min(1, rawDy / JOY_R));
          setThumb({ dx: clampedX * JOY_R, dy: clampedY * JOY_R });

          if (clampedY < -DEAD) worldState.keys.add("w"); else worldState.keys.delete("w");
          if (clampedY >  DEAD) worldState.keys.add("s"); else worldState.keys.delete("s");
          if (clampedX < -DEAD) worldState.keys.add("a"); else worldState.keys.delete("a");
          if (clampedX >  DEAD) worldState.keys.add("d"); else worldState.keys.delete("d");
        }
        if (t.identifier === camTouchId.current) {
          const dx = t.clientX - camLast.current.x;
          const dy = t.clientY - camLast.current.y;
          worldState.camYaw   -= dx * 0.011;
          worldState.camPitch  = Math.max(-0.3, Math.min(0.6, worldState.camPitch + dy * 0.007));
          camLast.current = { x: t.clientX, y: t.clientY };
        }
      }
    };

    const onEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joystickId.current) {
          joystickId.current = null;
          setThumb({ dx: 0, dy: 0 });
          worldState.keys.delete("w");
          worldState.keys.delete("s");
          worldState.keys.delete("a");
          worldState.keys.delete("d");
        }
        if (t.identifier === camTouchId.current) {
          camTouchId.current = null;
        }
      }
    };

    window.addEventListener("touchstart",  onStart, { passive: false });
    window.addEventListener("touchmove",   onMove,  { passive: false });
    window.addEventListener("touchend",    onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart",  onStart);
      window.removeEventListener("touchmove",   onMove);
      window.removeEventListener("touchend",    onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [isMobile, active]);

  if (!isMobile) return null;

  const btnBase: React.CSSProperties = {
    width: 58, height: 58, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-orbitron, monospace)", fontSize: 14,
    fontWeight: 700, color: "#fff", userSelect: "none",
    WebkitUserSelect: "none", touchAction: "manipulation",
    pointerEvents: "auto",
  };

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none select-none" style={{ touchAction: "none" }}>

      {/* ── Left joystick ── */}
      <div
        id="mobile-joystick-base"
        style={{
          position: "absolute", bottom: 36, left: 24,
          width: JOY_R * 2, height: JOY_R * 2, borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          border: "2px solid rgba(255,255,255,0.22)",
          pointerEvents: "auto", touchAction: "none",
        }}
      >
        <div style={{
          position: "absolute",
          width: THUMB_R * 2, height: THUMB_R * 2, borderRadius: "50%",
          background: "rgba(124,243,200,0.55)",
          border: "2px solid rgba(124,243,200,0.9)",
          top: "50%", left: "50%",
          transform: `translate(calc(-50% + ${thumb.dx}px), calc(-50% + ${thumb.dy}px))`,
          transition: joystickId.current !== null ? "none" : "transform 0.12s ease-out",
          boxShadow: "0 0 12px rgba(124,243,200,0.5)",
        }} />
      </div>

      {/* ── Right action buttons — stacked bottom-right, clear of screen bottom ── */}
      <div style={{
        position: "absolute", bottom: 36, right: 20,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        pointerEvents: "none",
      }}>
        {/* Interact / E — top */}
        <button
          style={{
            ...btnBase, width: 52, height: 52,
            background: "rgba(199,125,255,0.18)",
            border: "2px solid rgba(199,125,255,0.7)",
          }}
          onTouchStart={(e) => { e.preventDefault(); onInteract(); }}
        >
          E
        </button>

        {/* Fire */}
        <button
          style={{
            ...btnBase,
            background: fireActive ? "rgba(255,60,60,0.55)" : "rgba(255,60,60,0.2)",
            border: "2px solid rgba(255,80,80,0.8)",
            fontSize: 22,
          }}
          onTouchStart={(e) => { e.preventDefault(); setFireActive(true); window.dispatchEvent(new CustomEvent("mobile-fire")); }}
          onTouchEnd={(e) => { e.preventDefault(); setFireActive(false); }}
        >
          🔥
        </button>

        {/* Jump — bottom */}
        <button
          style={{
            ...btnBase,
            background: jumpActive ? "rgba(124,243,200,0.5)" : "rgba(124,243,200,0.15)",
            border: "2px solid rgba(124,243,200,0.7)",
          }}
          onTouchStart={(e) => { e.preventDefault(); setJumpActive(true); worldState.keys.add(" "); }}
          onTouchEnd={(e) => { e.preventDefault(); setJumpActive(false); worldState.keys.delete(" "); }}
        >
          ↑
        </button>
      </div>

      {/* MOVE label under joystick */}
      <div style={{
        position: "absolute", bottom: 14, left: 24 + JOY_R - 14,
        fontSize: 8, color: "rgba(255,255,255,0.35)",
        fontFamily: "var(--font-orbitron, monospace)",
        letterSpacing: "0.15em", pointerEvents: "none",
      }}>
        MOVE
      </div>
    </div>
  );
}
