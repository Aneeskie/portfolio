"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionShell, SectionHeader, gridStagger, cardRise } from "@/components/ui";
import { sound } from "@/lib/sound";

/* Animated network diagram: clients ↔ Photon cloud ↔ backend services */
function NetworkDiagram() {
  const clients = [
    { x: 80, y: 90, label: "CLIENT A" },
    { x: 80, y: 230, label: "CLIENT B" },
    { x: 80, y: 370, label: "CLIENT C" },
  ];
  const hub = { x: 420, y: 230 };
  const services = [
    { x: 760, y: 80, label: "PLAYFAB", sub: "Economy · Inventory", color: "#3b82f6" },
    { x: 760, y: 200, label: "AUTH", sub: "Anonymous · Social", color: "#00f0ff" },
    { x: 760, y: 320, label: "CLOUD SAVE", sub: "Cross-device sync", color: "#a855f7" },
    { x: 760, y: 440, label: "FIREBASE", sub: "Analytics · Config", color: "#f59e0b" },
  ];

  return (
    <svg viewBox="0 0 880 520" className="w-full h-auto" role="img" aria-label="Realtime multiplayer architecture diagram">
      <defs>
        <filter id="netGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* client → hub links + packets */}
      {clients.map((c, i) => (
        <g key={c.label}>
          <line x1={c.x + 46} y1={c.y} x2={hub.x - 60} y2={hub.y} stroke="#00f0ff" strokeWidth="1" opacity="0.25" />
          {/* upstream packet */}
          <circle r="4" fill="#00f0ff" filter="url(#netGlow)">
            <animateMotion dur={`${1.6 + i * 0.4}s`} repeatCount="indefinite" path={`M ${c.x + 46} ${c.y} L ${hub.x - 60} ${hub.y}`} />
          </circle>
          {/* downstream packet */}
          <circle r="4" fill="#a855f7" filter="url(#netGlow)">
            <animateMotion dur={`${1.9 + i * 0.3}s`} repeatCount="indefinite" path={`M ${hub.x - 60} ${hub.y} L ${c.x + 46} ${c.y}`} />
          </circle>
          {/* client box */}
          <rect x={c.x - 46} y={c.y - 26} width="92" height="52" fill="#0a0e1f" stroke="#00f0ff" strokeWidth="1" opacity="0.9" />
          <text x={c.x} y={c.y - 2} textAnchor="middle" fill="#00f0ff" fontSize="11" fontWeight="700" style={{ fontFamily: "var(--font-display)", letterSpacing: 1.5 }}>
            {c.label}
          </text>
          <text x={c.x} y={c.y + 14} textAnchor="middle" fill="#7a89b8" fontSize="9">
            Unity · Fusion SDK
          </text>
        </g>
      ))}

      {/* hub → services links + packets */}
      {services.map((s, i) => (
        <g key={s.label}>
          <line x1={hub.x + 60} y1={hub.y} x2={s.x - 70} y2={s.y} stroke={s.color} strokeWidth="1" opacity="0.25" />
          <circle r="3.5" fill={s.color} filter="url(#netGlow)">
            <animateMotion dur={`${2 + i * 0.35}s`} repeatCount="indefinite" path={`M ${hub.x + 60} ${hub.y} L ${s.x - 70} ${s.y}`} />
          </circle>
          <rect x={s.x - 70} y={s.y - 28} width="140" height="56" fill="#0a0e1f" stroke={s.color} strokeWidth="1" opacity="0.9" />
          <text x={s.x} y={s.y - 4} textAnchor="middle" fill={s.color} fontSize="11" fontWeight="700" style={{ fontFamily: "var(--font-display)", letterSpacing: 1.5 }}>
            {s.label}
          </text>
          <text x={s.x} y={s.y + 13} textAnchor="middle" fill="#7a89b8" fontSize="9">
            {s.sub}
          </text>
        </g>
      ))}

      {/* Photon hub */}
      <g filter="url(#netGlow)">
        <circle cx={hub.x} cy={hub.y} r="58" fill="#0a0e1f" stroke="#a855f7" strokeWidth="2" />
        <circle cx={hub.x} cy={hub.y} r="70" fill="none" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="8 6" opacity="0.6">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${hub.x} ${hub.y}`} to={`360 ${hub.x} ${hub.y}`} dur="14s" repeatCount="indefinite" />
        </circle>
        <text x={hub.x} y={hub.y - 6} textAnchor="middle" fill="#a855f7" fontSize="13" fontWeight="900" style={{ fontFamily: "var(--font-display)", letterSpacing: 2 }}>
          PHOTON
        </text>
        <text x={hub.x} y={hub.y + 12} textAnchor="middle" fill="#d7e3ff" fontSize="9" style={{ letterSpacing: 1 }}>
          ROOMS · RELAY · TICK 60Hz
        </text>
      </g>

      {/* lobby / matchmaking pipeline under the hub */}
      {["LOBBY", "MATCHMAKING", "ROOM JOIN"].map((step, i) => (
        <g key={step}>
          <rect x={250 + i * 120} y={455} width={104} height={30} fill="#0a0e1f" stroke="#00f0ff" strokeWidth="0.8" opacity="0.85" />
          <text x={302 + i * 120} y={474} textAnchor="middle" fill="#00f0ff" fontSize="9.5" fontWeight="700" style={{ fontFamily: "var(--font-display)", letterSpacing: 1 }}>
            {step}
          </text>
          {i < 2 && (
            <text x={358 + i * 120} y={474} fill="#7a89b8" fontSize="12">→</text>
          )}
        </g>
      ))}
      <line x1={hub.x} y1={hub.y + 70} x2={hub.x} y2={450} stroke="#00f0ff" strokeWidth="0.8" opacity="0.3" className="dash-flow" />
    </svg>
  );
}

const FLOW_CARDS = [
  {
    title: "AUTHENTICATION FLOW",
    color: "#00f0ff",
    steps: ["Device / Guest login", "Link Google · Apple · Facebook", "Session token → PlayFab", "Entity claims & permissions"],
  },
  {
    title: "PLAYFAB ARCHITECTURE",
    color: "#3b82f6",
    steps: ["Title data & catalogs", "CloudScript (server logic)", "Economy v2 + receipts", "Tiered leaderboards & stats"],
  },
  {
    title: "FIREBASE ARCHITECTURE",
    color: "#f59e0b",
    steps: ["Remote Config A/B tests", "Firestore game data", "Cloud Messaging (re-engagement)", "Crashlytics + Analytics funnels"],
  },
];

export default function MultiplayerLab() {
  const [paused] = useState(false);
  return (
    <SectionShell id="multiplayer">
      <SectionHeader kicker="Section 04" title="Multiplayer Lab" accent="purple" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9 }}
        className="glass panel-clip w-full max-w-5xl p-3 md:p-8 holo-sweep overflow-hidden"
        style={{ opacity: paused ? 0.6 : 1 }}
      >
        <div className="font-display text-[10px] tracking-[0.4em] text-[var(--dim)] mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse inline-block" />
          LIVE NETWORK TOPOLOGY — 3 CLIENTS CONNECTED
        </div>
        <NetworkDiagram />
      </motion.div>

      <motion.div
        variants={gridStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-8 grid w-full max-w-5xl gap-5 md:grid-cols-3"
      >
        {FLOW_CARDS.map((card) => (
          <motion.div
            key={card.title}
            variants={cardRise}
            onMouseEnter={() => sound.hover()}
            className="glass panel-clip p-5 transition-shadow hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]"
          >
            <div className="font-display text-xs tracking-[0.25em] mb-4" style={{ color: card.color }}>
              {card.title}
            </div>
            <ol className="space-y-2.5">
              {card.steps.map((s, i) => (
                <li key={s} className="flex items-start gap-3 text-sm text-[var(--dim)]">
                  <span
                    className="font-display text-[10px] mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center border"
                    style={{ borderColor: `${card.color}66`, color: card.color }}
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  );
}
