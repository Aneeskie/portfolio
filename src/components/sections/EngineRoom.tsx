"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionShell, SectionHeader, gridStagger, cardRise } from "@/components/ui";
import { sound } from "@/lib/sound";

const MONITORS = [
  {
    id: "inventory",
    title: "INVENTORY",
    icon: "🎒",
    color: "#00f0ff",
    lines: ["Grid & list inventories with drag-drop", "Stacking, rarity tiers, item metadata", "PlayFab-backed persistence", "ScriptableObject item database"],
  },
  {
    id: "dialogue",
    title: "DIALOGUE",
    icon: "💬",
    color: "#a855f7",
    lines: ["Node-based branching dialogue", "Localization-aware text pipeline", "Typewriter FX + voice barks", "Quest & flag integration"],
  },
  {
    id: "save",
    title: "SAVE SYSTEM",
    icon: "💾",
    color: "#3b82f6",
    lines: ["Versioned JSON save migrations", "Cloud Save conflict resolution", "Auto-save with corruption guards", "Save slots + screenshots"],
  },
  {
    id: "achievements",
    title: "ACHIEVEMENTS",
    icon: "🏆",
    color: "#facc15",
    lines: ["Platform achievements (GPGS / GameCenter / Steam)", "Progressive & hidden achievements", "Toast notification system", "Server-validated unlocks"],
  },
  {
    id: "ads",
    title: "ADS",
    icon: "📺",
    color: "#ff8a2a",
    lines: ["AdMob / LevelPlay mediation", "Rewarded, interstitial, banner flows", "Frequency capping & segmentation", "eCPM-aware waterfall tuning"],
  },
  {
    id: "iap",
    title: "IN-APP PURCHASE",
    icon: "💎",
    color: "#4ade80",
    lines: ["Unity IAP cross-store setup", "Server-side receipt validation", "Restore purchases & pending txns", "Offers, bundles, starter packs"],
  },
  {
    id: "addressables",
    title: "ADDRESSABLES",
    icon: "📦",
    color: "#22d3ee",
    lines: ["Remote content catalogs on CDN", "Memory-safe load/release patterns", "DLC & live content updates", "Build automation & validation"],
  },
  {
    id: "localization",
    title: "LOCALIZATION",
    icon: "🌐",
    color: "#f472b6",
    lines: ["Unity Localization package pipeline", "10+ languages incl. JP / CJK fonts", "Pseudo-localization testing", "RTL & dynamic font fallbacks"],
  },
];

export default function EngineRoom() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <SectionShell id="engine">
      <SectionHeader kicker="Section 05" title="Engine Room" accent="orange" />
      <p className="-mt-8 mb-12 text-center text-[var(--dim)] max-w-xl">
        Floating monitors — each one a battle-tested Unity system I&apos;ve shipped in production. Click to inspect.
      </p>

      <motion.div
        variants={gridStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid w-full max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4"
        style={{ perspective: 1200 }}
      >
        {MONITORS.map((m, i) => {
          const expanded = open === m.id;
          return (
            <motion.div key={m.id} variants={cardRise} className="floaty" style={{ animationDelay: `${(i % 4) * 0.6}s` }}>
              <button
                onClick={() => {
                  sound.click();
                  setOpen(expanded ? null : m.id);
                }}
                onMouseEnter={() => sound.hover()}
                className="w-full text-left glass panel-clip overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: expanded ? `0 0 30px ${m.color}55` : undefined,
                  borderColor: expanded ? m.color : undefined,
                }}
                aria-expanded={expanded}
              >
                {/* monitor bezel */}
                <div
                  className="relative h-28 flex items-center justify-center animated-gradient"
                  style={{ background: `linear-gradient(135deg, ${m.color}22, #070b18 50%, ${m.color}14)` }}
                >
                  <span className="text-4xl" role="img" aria-hidden>
                    {m.icon}
                  </span>
                  {/* scanline on monitor */}
                  <div
                    className="absolute left-0 right-0 h-px opacity-60"
                    style={{
                      background: m.color,
                      animation: "monitor-scan 3s linear infinite",
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="font-display text-[8px] tracking-widest text-[var(--dim)]">SYS.OK</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-display text-xs tracking-[0.25em] font-bold" style={{ color: m.color }}>
                    {m.title}
                  </div>
                  <div className="mt-1 text-[10px] font-display tracking-[0.2em] text-[var(--dim)]">
                    {expanded ? "▼ COLLAPSE" : "▶ INSPECT MODULE"}
                  </div>
                  <AnimatePresence>
                    {expanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        {m.lines.map((l) => (
                          <li key={l} className="mt-2 flex gap-2 text-sm text-[var(--dim)] leading-snug">
                            <span style={{ color: m.color }}>▸</span>
                            {l}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      <style jsx global>{`
        @keyframes monitor-scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </SectionShell>
  );
}
