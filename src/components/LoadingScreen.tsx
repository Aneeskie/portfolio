"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sound } from "@/lib/sound";

/* deterministic "random" so SSR and client match */
function h(i: number, s: number) {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return Math.abs(v - Math.floor(v));
}

/* Round to N decimal places so SSR and client produce identical strings */
const r2 = (v: number) => Math.round(v * 100) / 100;
const r4 = (v: number) => Math.round(v * 10000) / 10000;

const DRIFT_ANIMS = ["star-a", "star-b", "star-c", "star-d", "star-e", "star-f"];
const STARS = Array.from({ length: 55 }, (_, i) => ({
  x: r4(h(i, 1) * 100),
  y: r4(h(i, 2) * 100),
  r: 1 + Math.floor(h(i, 3) * 3),
  dur: r4(1.1 + h(i, 4) * 1.4),
  del: r4(h(i, 5) * 0.8),
  color: i % 7 === 0 ? "#c77dff" : i % 5 === 0 ? "#7cf3c8" : "#ffffff",
  anim: DRIFT_ANIMS[i % 6],
}));

const VEINS = Array.from({ length: 18 }, (_, i) => ({
  angle: r2((i / 18) * 360),
  length: r2(130 + h(i, 6) * 160),
  dur: r4(1.6 + h(i, 7) * 1.4),
  del: r4(h(i, 8) * 0.8),
  thick: r4(0.8 + h(i, 9) * 1.4),
  color: i % 3 === 0 ? "#7cf3c8" : i % 3 === 1 ? "#c77dff" : "#6ec6ff",
  branchAngle: r2((h(i, 10) - 0.5) * 60),
  branchLength: r2(50 + h(i, 11) * 80),
}));

export default function LoadingScreen({ onStart }: { onStart: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [gone, setGone] = useState(false);

  const begin = () => {
    if (revealed || bursting) return;
    sound.setEnabled(true);
    sound.boot();
    setBursting(true);
    // short burst flash, then circle expands
    setTimeout(() => setRevealed(true), 200);
    setTimeout(() => { setGone(true); onStart(); }, 1500);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") begin(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, bursting]);

  if (gone) return null;

  const CIRCLE_R = 115; // px, radius of the viewport hole

  return (
    <>
      <style>{`
        @keyframes star-a { 0%,100%{opacity:.5;transform:translate(0,0) scale(1)}   50%{opacity:1;transform:translate(18px,-14px) scale(1.6)} }
        @keyframes star-b { 0%,100%{opacity:.6;transform:translate(0,0) scale(1)}   50%{opacity:1;transform:translate(-15px,18px) scale(1.5)} }
        @keyframes star-c { 0%,100%{opacity:.45;transform:translate(0,0) scale(1)}  50%{opacity:1;transform:translate(16px,13px) scale(1.7)} }
        @keyframes star-d { 0%,100%{opacity:.65;transform:translate(0,0) scale(1)}  50%{opacity:1;transform:translate(-20px,-12px) scale(1.5)} }
        @keyframes star-e { 0%,100%{opacity:.5;transform:translate(0,0) scale(1)}   50%{opacity:1;transform:translate(12px,-20px) scale(1.6)} }
        @keyframes star-f { 0%,100%{opacity:.6;transform:translate(0,0) scale(1)}   50%{opacity:1;transform:translate(-14px,10px) scale(1.4)} }
        @keyframes vein-pulse {
          0%   { opacity: 0.25; }
          100% { opacity: 0.85; }
        }
        @keyframes rim-glow {
          0%, 100% { box-shadow: 0 0 18px 4px rgba(124,243,200,0.4); }
          50%       { box-shadow: 0 0 36px 8px rgba(124,243,200,0.75); }
        }
        @keyframes burst-ring {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(10); opacity: 0; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[100]"
        style={{ background: "#00000f" }}
        onClick={begin}
      >
        {/* ── Stars ── */}
        {STARS.map((s, i) => (
          <div
            key={i}
            suppressHydrationWarning
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r,
              height: s.r,
              borderRadius: "50%",
              background: s.color,
              opacity: 0.7,
              animation: `${s.anim} ${s.dur}s ${s.del}s ease-in-out infinite`,
            }}
          />
        ))}

        {/* ── Vein lines radiating from circle center ── */}
        {!revealed && VEINS.map((v, i) => {
          const branchStart = v.length * 0.55;
          return (
            <div key={i} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none" }}>
              {/* main vein */}
              <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                width: v.length,
                height: v.thick,
                transformOrigin: "0 50%",
                transform: `rotate(${v.angle}deg) translateX(${CIRCLE_R}px)`,
                background: `linear-gradient(to right, ${v.color}cc, ${v.color}44, transparent)`,
                borderRadius: 999,
                animation: `vein-pulse ${v.dur}s ${v.del}s ease-in-out infinite alternate`,
              }} />
              {/* branch */}
              <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                width: v.branchLength,
                height: v.thick * 0.6,
                transformOrigin: "0 50%",
                transform: `rotate(${v.angle + v.branchAngle}deg) translateX(${CIRCLE_R + branchStart}px)`,
                background: `linear-gradient(to right, ${v.color}88, transparent)`,
                borderRadius: 999,
                animation: `vein-pulse ${v.dur * 1.2}s ${v.del + 0.3}s ease-in-out infinite alternate`,
              }} />
            </div>
          );
        })}

        {/* ── Circle viewport hole ── */}
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          width: revealed ? "300vmax" : `${CIRCLE_R * 2}px`,
          height: revealed ? "300vmax" : `${CIRCLE_R * 2}px`,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: revealed
            ? "0 0 0 0px rgba(0,0,15,0)"
            : "0 0 0 9999px rgba(0,0,15,0.97)",
          transition: "width 0.9s cubic-bezier(0.22,1,0.36,1), height 0.9s cubic-bezier(0.22,1,0.36,1), box-shadow 0.7s ease-out",
          animation: !revealed ? "rim-glow 1.6s ease-in-out infinite" : "none",
        }} />

        {/* ── Burst ring on click ── */}
        {bursting && (
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            width: `${CIRCLE_R * 2}px`,
            height: `${CIRCLE_R * 2}px`,
            borderRadius: "50%",
            border: "3px solid #7cf3c8",
            pointerEvents: "none",
            animation: "burst-ring 1s ease-out forwards",
          }} />
        )}

        {/* ── UI text (hidden after reveal starts) ── */}
        <AnimatePresence>
          {!bursting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              style={{ pointerEvents: "none" }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              {/* name above the circle */}
              <div style={{ marginBottom: `${CIRCLE_R + 32}px` }}>
                <div
                  className="font-display text-2xl md:text-4xl font-black tracking-[0.14em] text-white"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,1), 0 0 40px #7cf3c899" }}
                >
                  ANEES MUHAMMAD
                </div>
                <div className="font-display text-[11px] md:text-sm tracking-[0.45em] neon-cyan mt-1">
                  UNITY GAME DEVELOPER
                </div>
              </div>

              {/* button below the circle */}
              <div style={{ marginTop: `${CIRCLE_R + 28}px`, pointerEvents: "auto" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); begin(); }}
                  onMouseEnter={() => sound.hover()}
                  className="btn-game pulse-glow text-base"
                >
                  ⚔ Begin Adventure
                </button>
                <div className="mt-3 text-xs tracking-[0.4em] text-white/50 font-display animate-pulse">
                  CLICK ANYWHERE OR PRESS ENTER
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
