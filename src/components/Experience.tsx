"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ZONES } from "@/components/zones";
import { worldState } from "@/lib/worldStore";
import { sound } from "@/lib/sound";
import LoadingScreen from "@/components/LoadingScreen";
import Hud from "@/components/Hud";
import Profile from "@/components/sections/Profile";
import Projects from "@/components/sections/Projects";
import SkillTree from "@/components/sections/SkillTree";
import MultiplayerLab from "@/components/sections/MultiplayerLab";
import EngineRoom from "@/components/sections/EngineRoom";
import Timeline from "@/components/sections/Timeline";
import Services from "@/components/sections/Services";
import Tools from "@/components/sections/Tools";
import Contact from "@/components/sections/Contact";

const World = dynamic(() => import("@/components/World"), { ssr: false });

const PANELS: Record<string, React.ComponentType> = {
  profile: Profile,
  projects: Projects,
  skills: SkillTree,
  multiplayer: MultiplayerLab,
  engine: EngineRoom,
  timeline: Timeline,
  services: ServicesAndTools,
  contact: Contact,
};

function ServicesAndTools() {
  return (
    <>
      <Services />
      <Tools />
    </>
  );
}

const CONFETTI_COLORS = ["#ff70a6", "#ffd166", "#7cf3c8", "#6ec6ff", "#c77dff"];

/** DOM confetti burst — fires once per "goal-scored" event from the World. */
function Confetti() {
  const [burstId, setBurstId] = useState(0);

  useEffect(() => {
    const onGoal = () => setBurstId((v) => v + 1);
    window.addEventListener("goal-scored", onGoal);
    return () => window.removeEventListener("goal-scored", onGoal);
  }, []);

  if (!burstId) return null;
  return (
    <div key={burstId} className="fixed inset-0 z-[95] pointer-events-none overflow-hidden">
      {Array.from({ length: 46 }, (_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const dur = 1.2 + Math.random() * 0.9;
        const rot = Math.random() * 360;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-6%",
              left: `${left}%`,
              width: 8,
              height: 14,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              opacity: 0.9,
              transform: `rotate(${rot}deg)`,
              animation: `confetti-fall ${dur}s ${delay}s ease-in forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function Experience() {
  const [started, setStarted] = useState(false);
  const [near, setNear] = useState<string | null>(null);
  const [panel, setPanel] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [, forceTick] = useState(0);

  const nearZone = ZONES.find((z) => z.id === near) ?? null;
  const openZone = ZONES.find((z) => z.id === panel) ?? null;
  const nearCart = near === "__cart";
  const riding = near === "__cart_riding";

  const openPanel = (id: string) => {
    sound.unlock();
    worldState.keys.clear();
    worldState.target = null;
    setPanel(id);
  };

  const toggleRide = () => {
    worldState.riding = !worldState.riding;
    sound.click();
    forceTick((v) => v + 1);
  };

  // E / Enter to interact, Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) return;
      const k = e.key.toLowerCase();
      if ((k === "e" || k === "enter") && !panel) {
        if (nearCart || riding) toggleRide();
        else if (near && !near.startsWith("__")) openPanel(near);
      }
      if (k === "escape" && panel) setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, near, panel, nearCart, riding]);

  // welcome banner after start
  useEffect(() => {
    if (!started) return;
    setShowIntro(true);
    const t = setTimeout(() => setShowIntro(false), 7000);
    return () => clearTimeout(t);
  }, [started]);

  const PanelComponent = panel ? PANELS[panel] : null;

  return (
    <>
      <World active={started && !panel} onNear={setNear} onZoneClick={openPanel} />

      {!started && <LoadingScreen onStart={() => setStarted(true)} />}

      {started && (
        <Hud
          onNav={openPanel}
          near={nearZone ? { label: nearZone.label, color: nearZone.color } : null}
        />
      )}

      {/* welcome banner */}
      <AnimatePresence>
        {showIntro && !panel && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[70] text-center pointer-events-none px-4 w-full max-w-2xl"
          >
            <div className="font-display text-2xl md:text-4xl font-black tracking-[0.12em] text-white" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5), 0 0 30px #c77dff88" }}>
              SANTOSH KC
            </div>
            <div className="font-display text-[11px] md:text-sm tracking-[0.45em] neon-cyan mt-1">
              UNITY GAME DEVELOPER
            </div>
            <div className="mt-3 text-sm text-white/85 glass panel-clip inline-block px-4 py-2">
              🧭 Explore the island — visit the glowing crystals, collect gems, ride the cart!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* interact prompt */}
      <AnimatePresence>
        {started && !panel && (nearZone || nearCart || riding) && (
          <motion.button
            key={near}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={() => (nearCart || riding ? toggleRide() : nearZone && openPanel(nearZone.id))}
            onMouseEnter={() => sound.hover()}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] glass panel-clip px-6 py-3 flex items-center gap-3 cursor-pointer pulse-glow"
            style={{ borderColor: nearZone?.color ?? "#ffd166" }}
          >
            <span
              className="font-display text-xs font-bold h-7 w-7 flex items-center justify-center border-2 rounded"
              style={{ borderColor: nearZone?.color ?? "#ffd166", color: nearZone?.color ?? "#ffd166" }}
            >
              E
            </span>
            <span className="font-display text-sm tracking-[0.2em] text-white">
              {riding
                ? "🛒 DISMOUNT CART"
                : nearCart
                ? "🛒 RIDE THE MAGIC CART"
                : `${nearZone!.emoji} ENTER ${nearZone!.label.toUpperCase()}`}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* info panel overlay */}
      <AnimatePresence>
        {PanelComponent && openZone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] flex items-center justify-center bg-[#14102cbb] backdrop-blur-sm p-3 md:p-8"
            onClick={() => setPanel(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="glass panel-clip w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden"
              style={{ borderColor: openZone.color, borderWidth: 2 }}
              role="dialog"
              aria-modal="true"
              aria-label={openZone.label}
            >
              <div
                className="flex items-center justify-between px-5 md:px-8 py-4 border-b shrink-0"
                style={{ borderColor: `${openZone.color}44` }}
              >
                <div className="font-display text-sm md:text-lg font-bold tracking-[0.25em] text-white flex items-center gap-3">
                  <span className="text-xl">{openZone.emoji}</span>
                  {openZone.label.toUpperCase()}
                </div>
                <button
                  onClick={() => {
                    sound.click();
                    setPanel(null);
                  }}
                  onMouseEnter={() => sound.hover()}
                  className="btn-game !px-4 !py-2 text-xs"
                  style={{ borderColor: openZone.color, color: openZone.color }}
                >
                  ✕ Back to World
                </button>
              </div>
              <div className="panel-body flex-1 overflow-y-auto overscroll-contain">
                <PanelComponent />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Confetti />
      <div className="vignette" aria-hidden />
    </>
  );
}
