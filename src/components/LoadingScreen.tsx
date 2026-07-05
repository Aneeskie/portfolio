"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sound } from "@/lib/sound";

/**
 * Spotlight intro: the live 3D world already renders behind this overlay
 * (World mounts immediately, just without input). We only dim everything
 * outside a small circle around the player, then expand that circle to
 * fully reveal the world on click/Enter.
 */
export default function LoadingScreen({ onStart }: { onStart: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [gone, setGone] = useState(false);

  const begin = () => {
    if (revealed) return;
    sound.setEnabled(true);
    sound.boot();
    setRevealed(true);
    setTimeout(() => {
      setGone(true);
      onStart();
    }, 1300);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") begin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  if (gone) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={begin}>
      {/* the "hole" — a growing circle whose box-shadow darkens everything outside it */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          width: revealed ? "300vmax" : "420px",
          height: revealed ? "300vmax" : "420px",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: revealed ? "0 0 0 0 rgba(8,6,22,0)" : "0 0 0 9999px rgba(8,6,22,0.86)",
          transition:
            "width 1.2s cubic-bezier(.7,0,.2,1), height 1.2s cubic-bezier(.7,0,.2,1), box-shadow 1.2s cubic-bezier(.7,0,.2,1)",
        }}
      />
      <AnimatePresence>
        {!revealed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          >
            <div
              className="font-display text-2xl md:text-4xl font-black tracking-[0.12em] text-white"
              style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
            >
              SANTOSH KC
            </div>
            <div className="font-display text-[11px] md:text-sm tracking-[0.4em] neon-cyan mt-1">
              UNITY GAME DEVELOPER
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                begin();
              }}
              onMouseEnter={() => sound.hover()}
              className="btn-game pulse-glow text-base mt-8"
            >
              ⚔ Begin Adventure
            </button>
            <div className="mt-3 text-xs tracking-[0.4em] text-white/60 font-display animate-pulse">
              CLICK ANYWHERE OR PRESS ENTER
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
