"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ZONES, WORLD_SIZE } from "@/components/zones";
import { worldState } from "@/lib/worldStore";
import { sound } from "@/lib/sound";

function Minimap({ onNav }: { onNav: (id: string) => void }) {
  const dot = useRef<HTMLDivElement>(null);
  const gemLayer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // build gem dots once the world has published spawn spots
    const buildGems = () => {
      if (!gemLayer.current || !worldState.gemSpots.length) return false;
      gemLayer.current.innerHTML = "";
      worldState.gemSpots.forEach((s) => {
        const d = document.createElement("div");
        d.style.cssText = `position:absolute;width:5px;height:5px;border-radius:9999px;background:#ffd166;box-shadow:0 0 4px #ffd166;transform:translate(-50%,-50%);left:${(s.x / WORLD_SIZE + 0.5) * 100}%;top:${(s.z / WORLD_SIZE + 0.5) * 100}%`;
        gemLayer.current!.appendChild(d);
      });
      return true;
    };
    let built = buildGems();

    let raf = 0;
    const loop = () => {
      if (!built) built = buildGems();
      if (dot.current) {
        const px = (worldState.x / WORLD_SIZE + 0.5) * 100;
        const pz = (worldState.z / WORLD_SIZE + 0.5) * 100;
        dot.current.style.left = `${px}%`;
        dot.current.style.top = `${pz}%`;
        dot.current.style.transform = `translate(-50%, -50%) rotate(${worldState.rot}rad)`;
      }
      // hide collected gems
      if (gemLayer.current) {
        const kids = gemLayer.current.children;
        for (let i = 0; i < kids.length; i++) {
          (kids[i] as HTMLElement).style.display = worldState.gemTaken[i] ? "none" : "";
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="glass rounded-full h-32 w-32 md:h-40 md:w-40 relative overflow-hidden border-2 border-[var(--glass-border)]">
      <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #3f7a4a 0%, #35664c 60%, #2a4d59 100%)" }} />
      {/* gem dots */}
      <div ref={gemLayer} className="absolute inset-0 pointer-events-none" />
      {ZONES.map((z) => (
        <button
          key={z.id}
          title={z.label}
          onClick={() => {
            sound.click();
            onNav(z.id);
          }}
          onMouseEnter={() => sound.hover()}
          className="absolute h-3 w-3 rounded-full border border-white/60 cursor-pointer hover:scale-150 transition-transform"
          style={{
            left: `${(z.x / WORLD_SIZE + 0.5) * 100}%`,
            top: `${(z.z / WORLD_SIZE + 0.5) * 100}%`,
            transform: "translate(-50%, -50%)",
            background: z.color,
            boxShadow: `0 0 6px ${z.color}`,
          }}
          aria-label={z.label}
        />
      ))}
      {/* player arrow */}
      <div ref={dot} className="absolute" style={{ left: "50%", top: "50%" }}>
        <div
          className="h-0 w-0"
          style={{
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: "9px solid #fff",
            filter: "drop-shadow(0 0 4px #fff)",
          }}
        />
      </div>
      <div className="absolute bottom-1.5 left-0 right-0 text-center font-display text-[8px] tracking-[0.3em] text-white/70">
        MAP
      </div>
    </div>
  );
}

export default function Hud({
  onNav,
  near,
}: {
  onNav: (id: string) => void;
  near: { label: string; color: string } | null;
}) {
  const [muted, setMuted] = useState(false);
  const [gems, setGems] = useState(worldState.gems);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const onGem = (e: Event) => setGems((e as CustomEvent).detail as number);
    window.addEventListener("gem-collected", onGem);
    return () => window.removeEventListener("gem-collected", onGem);
  }, []);

  return (
    <>
      {/* top bar */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-between px-4 md:px-6 py-3 pointer-events-none"
      >
        <div className="glass panel-clip px-4 py-2 font-display text-xs md:text-sm font-bold tracking-[0.25em] text-white pointer-events-auto">
          ⚔️ SKC<span className="text-[var(--purple)]">//</span>QUEST
        </div>
        {/* vertical stack so chips never overlap each other */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="glass panel-clip px-4 py-2 font-display text-[11px] tracking-[0.2em] text-[var(--orange)]">
              💎 {gems} / 24
            </div>
            <button
              onClick={() => {
                const next = !muted;
                setMuted(next);
                sound.setEnabled(!next);
                if (!next) sound.click();
              }}
              onMouseEnter={() => sound.hover()}
              className="glass panel-clip px-4 py-2 font-display text-[10px] tracking-[0.2em] text-[var(--dim)] hover:text-white transition-colors"
            >
              {muted ? "🔇 OFF" : "🔊 ON"}
            </button>
          </div>
          {near && (
            <div
              className="hidden md:block glass panel-clip px-4 py-2 font-display text-[10px] tracking-[0.25em]"
              style={{ color: near.color }}
            >
              📍 {near.label.toUpperCase()}
            </div>
          )}
        </div>
      </motion.header>

      {/* minimap — bottom right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="fixed bottom-4 right-4 z-[70]"
      >
        <Minimap onNav={onNav} />
      </motion.div>

      {/* controls help — collapsible bottom-left */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="fixed bottom-4 left-4 z-[70] hidden sm:block"
      >
        <button
          onClick={() => setShowControls((v) => !v)}
          onMouseEnter={() => sound.hover()}
          className="glass panel-clip w-8 h-8 flex items-center justify-center font-display text-xs text-[var(--dim)] hover:text-white transition-colors"
          title="Controls"
        >
          ?
        </button>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-10 left-0 glass panel-clip px-4 py-3 whitespace-nowrap"
          >
            <div className="font-display text-[9px] tracking-[0.3em] text-[var(--dim)] mb-2">CONTROLS</div>
            <div className="space-y-1 text-xs text-white/85">
              <div><Key>W A S D</Key> move &nbsp; <Key>SPACE</Key> jump</div>
              <div><Key>CLICK</Key> to enable mouse-look &amp; move</div>
              <div>drag mouse to rotate camera &nbsp; <Key>ESC</Key> release</div>
              <div><Key>E</Key> interact &nbsp; <Key>ESC</Key> close panel</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-[9px] border border-white/30 rounded px-1.5 py-0.5 bg-white/10 tracking-widest">
      {children}
    </span>
  );
}
