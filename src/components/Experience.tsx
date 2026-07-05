"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ZONES } from "@/components/zones";
import { worldState } from "@/lib/worldStore";
import { sound } from "@/lib/sound";
import LoadingScreen from "@/components/LoadingScreen";
import MobileControls from "@/components/MobileControls";
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

/** DOM confetti burst */
function ConfettiBurst({ count }: { count: number }) {
  return (
    <div className="fixed inset-0 z-[95] pointer-events-none overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const dur = 1.2 + Math.random() * 1.2;
        const rot = Math.random() * 360;
        const w = 6 + Math.floor(Math.random() * 8);
        const h = 10 + Math.floor(Math.random() * 10);
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: `${-4 - Math.random() * 8}%`,
              left: `${left}%`,
              width: w,
              height: h,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              opacity: 0.92,
              borderRadius: i % 4 === 0 ? "50%" : 2,
              transform: `rotate(${rot}deg)`,
              animation: `confetti-fall ${dur}s ${delay}s ease-in forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

function Confetti() {
  const [bursts, setBursts] = useState<{ id: number; count: number }[]>([]);

  useEffect(() => {
    const onGoal = () =>
      setBursts((v) => [...v, { id: Date.now() + Math.random(), count: 140 }]);
    const onGem = (e: Event) => {
      const total = (e as CustomEvent).detail as number;
      if (total >= 24)
        setBursts((v) => [...v, { id: Date.now() + Math.random(), count: 200 }]);
    };
    window.addEventListener("goal-scored", onGoal);
    window.addEventListener("gem-collected", onGem);
    return () => {
      window.removeEventListener("goal-scored", onGoal);
      window.removeEventListener("gem-collected", onGem);
    };
  }, []);

  return (
    <>
      {bursts.map((b) => (
        <ConfettiBurst key={b.id} count={b.count} />
      ))}
    </>
  );
}

export default function Experience() {
  const [started, setStarted] = useState(false);
  const [near, setNear] = useState<string | null>(null);
  const [panel, setPanel] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDeath, setShowDeath] = useState(false);
  const [, forceTick] = useState(0);

  const nearZone = ZONES.find((z) => z.id === near) ?? null;
  const openZone = ZONES.find((z) => z.id === panel) ?? null;
  const nearCart = near === "__cart";
  const riding = near === "__cart_riding";

  const openPanel = (id: string) => {
    if (!worldState.unlockedZones.has(id)) return; // must destroy crystal first
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

  // welcome banner + tutorial after start
  useEffect(() => {
    if (!started) return;
    setShowIntro(true);
    setShowTutorial(true);
    const t1 = setTimeout(() => setShowIntro(false), 7000);
    return () => clearTimeout(t1);
  }, [started]);

  // death screen
  useEffect(() => {
    const onDied = () => {
      setShowDeath(true);
      setTimeout(() => setShowDeath(false), 1800);
    };
    window.addEventListener("player-died", onDied);
    return () => window.removeEventListener("player-died", onDied);
  }, []);

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
        {showIntro && !panel && !showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[70] text-center pointer-events-none px-4 w-full max-w-2xl"
          >
            <div className="font-display text-2xl md:text-4xl font-black tracking-[0.12em] text-white" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5), 0 0 30px #c77dff88" }}>
              ANEES MUHAMMAD
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
                : worldState.unlockedZones.has(nearZone!.id)
                ? `${nearZone!.emoji} ENTER ${nearZone!.label.toUpperCase()}`
                : `🔒 DESTROY THE CRYSTAL FIRST`}
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

      {/* tutorial overlay — shows once at game start */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[75] glass panel-clip px-6 py-5 max-w-sm w-full pointer-events-auto"
            style={{ borderColor: "#7cf3c8" }}
          >
            <div className="font-display text-[10px] tracking-[0.4em] neon-cyan mb-3">⚔ MISSION BRIEFING</div>
            <ul className="space-y-2 text-sm text-white/90">
              <li>🔒 <span className="text-[var(--cyan)]">Zone crystals are locked</span> — aim &amp; click to fire fireballs. Hit each crystal <strong>10 times</strong> to unlock it.</li>
              <li>⚠️ <span className="text-red-400">Crystals shoot back!</span> Dodge enemy shots — you have 10 HP. Die → respawn at start.</li>
              <li>💎 Collect all <strong>24 gems</strong> scattered across the island.</li>
              <li>⚽ Push the ball into the <strong>football goal</strong> for confetti!</li>
              <li>🛒 Walk near the cart &amp; press <strong>E</strong> to ride it.</li>
            </ul>
            <button
              onClick={() => setShowTutorial(false)}
              className="btn-game !px-4 !py-2 text-xs mt-4 w-full text-center"
            >
              ✓ GOT IT — LET&apos;S GO
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* death screen */}
      <AnimatePresence>
        {showDeath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 0] }}
            transition={{ duration: 1.8, times: [0, 0.15, 0.5, 1] }}
            className="fixed inset-0 z-[98] pointer-events-none flex flex-col items-center justify-center gap-4"
            style={{ background: "rgba(140,0,0,0.75)" }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.4 }}
              className="font-display text-5xl md:text-7xl font-black text-white"
              style={{ textShadow: "0 0 40px #ff0000, 0 4px 20px rgba(0,0,0,0.8)" }}
            >
              💀 YOU DIED
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="font-display text-sm tracking-[0.4em] text-white/70"
            >
              RESPAWNING AT SPAWN POINT...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {started && !panel && (
        <MobileControls
          active={started && !panel}
          onInteract={() => {
            if (nearCart || riding) toggleRide();
            else if (near && !near.startsWith("__")) openPanel(near);
          }}
        />
      )}

      <Confetti />
      <div className="vignette" aria-hidden />
    </>
  );
}
