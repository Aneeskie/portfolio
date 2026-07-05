"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SKILL_TREE, SkillNode } from "@/lib/data";
import { SectionShell, SectionHeader } from "@/components/ui";
import { sound } from "@/lib/sound";

export default function SkillTree() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [active, setActive] = useState<SkillNode | null>(null);

  const byId = Object.fromEntries(SKILL_TREE.map((n) => [n.id, n]));

  return (
    <SectionShell id="skills">
      <SectionHeader kicker="Section 03" title="Skill Tree" accent="cyan" />
      <div ref={ref} className="relative w-full max-w-5xl">
        <div className="glass panel-clip p-2 md:p-6 overflow-hidden">
          <svg
            viewBox="0 0 1080 780"
            className="w-full h-auto select-none"
            role="img"
            aria-label="Interactive skill tree centered on Unity"
          >
            <defs>
              <filter id="nodeGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* connections */}
            {SKILL_TREE.filter((n) => n.parent).map((n, i) => {
              const p = byId[n.parent!];
              return (
                <g key={`c-${n.id}`}>
                  <line
                    x1={p.x} y1={p.y} x2={n.x} y2={n.y}
                    stroke={n.color} strokeWidth="1" opacity={inView ? 0.35 : 0}
                    style={{ transition: `opacity 0.6s ${0.3 + i * 0.07}s` }}
                  />
                  <line
                    x1={p.x} y1={p.y} x2={n.x} y2={n.y}
                    stroke={n.color} strokeWidth="1.5"
                    className="dash-flow"
                    opacity={active && (active.id === n.id || active.id === p.id) ? 0.9 : 0.12}
                    style={{ transition: "opacity 0.3s" }}
                  />
                </g>
              );
            })}

            {/* nodes */}
            {SKILL_TREE.map((n, i) => {
              const isRoot = n.id === "unity";
              const r = isRoot ? 44 : 20;
              const hot = active?.id === n.id;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setActive(n);
                    sound.hover();
                  }}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => sound.unlock()}
                  opacity={inView ? 1 : 0}
                  style={{ transition: `opacity 0.5s ${0.2 + i * 0.08}s` }}
                >
                  {/* unlock ping */}
                  <circle r={r} fill="none" stroke={n.color} strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" values={`${r};${r + 14};${r}`} dur="3s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                  </circle>
                  <circle
                    r={r}
                    fill="#0a0e1f"
                    stroke={n.color}
                    strokeWidth={hot || isRoot ? 2.5 : 1.2}
                    filter={hot || isRoot ? "url(#nodeGlow)" : undefined}
                    style={{ transition: "all 0.2s" }}
                  />
                  {isRoot ? (
                    <>
                      <circle r={r - 8} fill="none" stroke={n.color} strokeWidth="0.8" strokeDasharray="6 4" opacity="0.7">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite" />
                      </circle>
                      <text textAnchor="middle" dy="5" fill={n.color} fontSize="15" fontWeight="900" style={{ fontFamily: "var(--font-display)", letterSpacing: 2 }}>
                        {n.label}
                      </text>
                    </>
                  ) : (
                    <>
                      <circle r={6} fill={n.color} opacity={hot ? 1 : 0.7} />
                      <text
                        textAnchor="middle"
                        y={r + 18}
                        fill={hot ? n.color : "#7a89b8"}
                        fontSize="13"
                        fontWeight="600"
                        style={{ fontFamily: "var(--font-body)", transition: "fill 0.2s" }}
                      >
                        {n.label}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* description readout */}
        <motion.div
          layout
          className="glass panel-clip mt-4 p-4 md:p-5 min-h-[76px] flex items-center gap-4"
        >
          {active ? (
            <>
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ background: active.color, boxShadow: `0 0 12px ${active.color}` }}
              />
              <div>
                <span className="font-display text-sm tracking-[0.2em] mr-3" style={{ color: active.color }}>
                  {active.label.toUpperCase()}
                </span>
                <span className="text-[var(--dim)] text-sm">{active.desc}</span>
              </div>
            </>
          ) : (
            <span className="text-[var(--dim)] text-sm font-display tracking-[0.2em]">
              ▸ HOVER A NODE TO SCAN ABILITY DATA
            </span>
          )}
        </motion.div>
      </div>
    </SectionShell>
  );
}
