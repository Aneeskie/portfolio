"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { sound } from "@/lib/sound";

const BOOT_LINES = [
  "SUMMONING WORLD SEED..........",
  "RAISING TERRAIN............... OK",
  "GROWING ENCHANTED FORESTS..... OK",
  "PLACING ANCIENT SHRINES....... OK",
  "CHARGING MANA CRYSTALS........ OK",
  "TAMING THE CLOUDS............. OK",
  "AWAKENING THE ADVENTURER...... OK",
  "HERO FOUND: SANTOSH_KC — LV.37",
];

export default function LoadingScreen({ onStart }: { onStart: () => void }) {
  const [pct, setPct] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const counter = useRef({ v: 0 });

  useEffect(() => {
    const tween = gsap.to(counter.current, {
      v: 100,
      duration: 3.2,
      ease: "power2.inOut",
      onUpdate: () => setPct(Math.floor(counter.current.v)),
      onComplete: () => setReady(true),
    });
    BOOT_LINES.forEach((l, i) =>
      setTimeout(() => setLines((prev) => [...prev, l]), 250 + i * 340)
    );
    // safety net: never let a throttled/background tab block entry
    const failsafe = setTimeout(() => {
      setPct(100);
      setReady(true);
    }, 4500);
    return () => {
      tween.kill();
      clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && ready) begin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const begin = () => {
    if (leaving) return;
    sound.setEnabled(true);
    sound.boot();
    setLeaving(true);
    setTimeout(onStart, 1100);
  };

  return (
    <AnimatePresence>
      {!leaving ? (
        <motion.div
          key="loader"
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1e1640]"
        >
          <LoaderInner pct={pct} lines={lines} ready={ready} begin={begin} />
        </motion.div>
      ) : (
        <motion.div
          key="wipe"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 1, ease: [0.83, 0, 0.17, 1], delay: 0.1 }}
          style={{ transformOrigin: "top" }}
          className="fixed inset-0 z-[100] bg-[#1e1640] flex items-center justify-center"
        >
          <div className="font-display neon-cyan text-xl tracking-[0.6em] animate-pulse">
            ✦ ENTERING THE REALM ✦
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoaderInner({
  pct,
  lines,
  ready,
  begin,
}: {
  pct: number;
  lines: string[];
  ready: boolean;
  begin: () => void;
}) {
  return (
    <div className="relative w-full max-w-2xl px-8">
      {/* rotating reticle */}
      <div className="mx-auto mb-10 relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="absolute inset-0 rotate-slow">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#7cf3c8" strokeWidth="1" strokeDasharray="8 6" opacity="0.6" />
        </svg>
        <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ animation: "rotate-slow 8s linear infinite reverse" }}>
          <circle cx="50" cy="50" r="34" fill="none" stroke="#c77dff" strokeWidth="1.5" strokeDasharray="40 80" opacity="0.8" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display text-lg neon-cyan">
          {pct}%
        </div>
      </div>

      {/* progress bar */}
      <div className="h-1 w-full bg-white/5 overflow-hidden mb-8 panel-clip">
        <div
          className="h-full bg-gradient-to-r from-[var(--cyan)] via-[var(--blue)] to-[var(--purple)] transition-[width] duration-150"
          style={{ width: `${pct}%`, boxShadow: "0 0 16px rgba(124,243,200,0.8)" }}
        />
      </div>

      {/* boot log */}
      <div className="h-44 font-mono text-[11px] leading-5 text-[var(--dim)] overflow-hidden">
        {lines.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-[var(--cyan)]">▸</span> {l}
          </motion.div>
        ))}
        <span className="cursor-blink text-[var(--cyan)]">█</span>
      </div>

      <div className="mt-8 flex justify-center h-16">
        {ready && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={begin}
            onMouseEnter={() => sound.hover()}
            className="btn-game pulse-glow text-base"
          >
            ⚔ Begin Adventure
          </motion.button>
        )}
      </div>
      {ready && (
        <div className="text-center text-xs tracking-[0.4em] text-[var(--dim)] font-display animate-pulse">
          — PRESS ENTER —
        </div>
      )}
    </div>
  );
}
