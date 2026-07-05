"use client";

import { motion } from "framer-motion";
import { TOOLS } from "@/lib/data";
import { SectionShell, SectionHeader, gridStagger, cardRise } from "@/components/ui";
import { sound } from "@/lib/sound";

const COLORS = ["#00f0ff", "#a855f7", "#3b82f6", "#ff8a2a", "#4ade80", "#f472b6", "#facc15"];

/** Spinning wireframe cube built in CSS 3D */
function IsoCube({ color }: { color: string }) {
  const face = `absolute inset-0 border`;
  return (
    <div className="relative h-12 w-12" style={{ perspective: 300 }}>
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", animation: "cube-spin 8s linear infinite" }}
      >
        {[
          "rotateY(0deg) translateZ(24px)",
          "rotateY(90deg) translateZ(24px)",
          "rotateY(180deg) translateZ(24px)",
          "rotateY(270deg) translateZ(24px)",
          "rotateX(90deg) translateZ(24px)",
          "rotateX(-90deg) translateZ(24px)",
        ].map((t) => (
          <div
            key={t}
            className={face}
            style={{ transform: t, borderColor: color, background: `${color}0d`, boxShadow: `inset 0 0 10px ${color}22` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Tools() {
  return (
    <SectionShell id="tools" className="!min-h-[70vh]">
      <SectionHeader kicker="Section 08" title="Loadout" accent="purple" />

      <motion.div
        variants={gridStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid w-full max-w-4xl grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {TOOLS.map((tool, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <motion.div
              key={tool}
              variants={cardRise}
              whileHover={{ scale: 1.08, rotate: -2 }}
              onMouseEnter={() => sound.hover()}
              className="glass panel-clip p-4 flex flex-col items-center gap-3 cursor-default group"
              style={{ boxShadow: `0 0 0px ${color}00` }}
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                <IsoCube color={color} />
              </div>
              <div
                className="font-display text-[10px] tracking-[0.2em] text-center text-[var(--dim)] group-hover:text-white transition-colors"
              >
                {tool.toUpperCase()}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <style jsx global>{`
        @keyframes cube-spin {
          from { transform: rotateX(-20deg) rotateY(0deg); }
          to { transform: rotateX(-20deg) rotateY(360deg); }
        }
      `}</style>
    </SectionShell>
  );
}
