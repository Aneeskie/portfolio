"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { SKILLS } from "@/lib/data";
import { SectionShell, SectionHeader } from "@/components/ui";
import { sound } from "@/lib/sound";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: to,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = `${Math.floor(obj.v)}${suffix}`;
      },
    });
  }, [inView, to, suffix]);
  return <span ref={ref}>0</span>;
}

/** SVG hologram avatar — rotating rings + glitching silhouette */
function Hologram() {
  return (
    <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96 floaty">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,240,255,0.14),transparent_65%)]" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 rotate-slow">
        <circle cx="100" cy="100" r="95" fill="none" stroke="#00f0ff" strokeWidth="0.6" strokeDasharray="4 8" opacity="0.7" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="60 40" opacity="0.5" />
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0" style={{ animation: "rotate-slow 10s linear infinite reverse" }}>
        <circle cx="100" cy="100" r="88" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="20 30" opacity="0.6" />
      </svg>
      {/* silhouette */}
      <svg viewBox="0 0 200 200" className="absolute inset-6 flicker">
        <defs>
          <linearGradient id="holo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="66" r="26" fill="url(#holo)" opacity="0.85" />
        <path d="M52 168 C52 118 76 102 100 102 C124 102 148 118 148 168 Z" fill="url(#holo)" opacity="0.8" />
        {/* scan bar */}
        <rect x="30" y="0" width="140" height="3" fill="#00f0ff" opacity="0.5">
          <animate attributeName="y" values="20;170;20" dur="4s" repeatCount="indefinite" />
        </rect>
      </svg>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-[0.4em] neon-cyan whitespace-nowrap">
        ◈ HOLOGRAM ACTIVE ◈
      </div>
    </div>
  );
}

function XPBar() {
  return (
    <div>
      <div className="flex justify-between font-display text-[10px] tracking-[0.3em] mb-1.5">
        <span className="neon-orange">LEVEL 50 GAME DEV</span>
        <span className="text-[var(--dim)]">XP 9,200 / 10,000</span>
      </div>
      <div className="h-3 bg-white/5 panel-clip overflow-hidden border border-[var(--glass-border)]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "84%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="h-full bg-gradient-to-r from-[var(--orange)] via-[#ffc36a] to-[var(--orange)] animated-gradient"
          style={{ boxShadow: "0 0 14px rgba(255,138,42,0.7)" }}
        />
      </div>
    </div>
  );
}

function SkillBar({ name, pct, i }: { name: string; pct: number; i: number }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="group"
      onMouseEnter={() => {
        setHover(true);
        sound.hover();
      }}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex justify-between text-sm mb-1">
        <span className={`font-semibold tracking-wide ${hover ? "neon-cyan" : "text-[var(--text)]"}`}>
          {name}
        </span>
        <span className="font-display text-xs text-[var(--dim)]">{pct}</span>
      </div>
      <div className="h-2 bg-white/5 overflow-hidden panel-clip">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--purple)]"
          style={{ boxShadow: hover ? "0 0 12px rgba(0,240,255,0.8)" : "0 0 4px rgba(0,240,255,0.3)" }}
        />
      </div>
    </div>
  );
}

const EXTRA_TAGS = ["Google Play", "AdMob", "Unity Ads", "UGUI", "Analytics", "Photon", "PlayFab", "Firebase"];

export default function Profile() {
  return (
    <SectionShell id="profile">
      <SectionHeader kicker="Section 01" title="Player Profile" />
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_1.3fr] items-center">
        {/* left: hologram + stats */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="space-y-8"
        >
          <Hologram />
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "PROJECTS", value: 50, suffix: "+" },
              { label: "YEARS EXP", value: 3, suffix: "+" },
              { label: "FIVERR GIGS", value: 50, suffix: "+" },
            ].map((s) => (
              <div key={s.label} className="glass panel-clip p-4 text-center holo-sweep overflow-hidden">
                <div className="font-display text-2xl md:text-3xl font-bold neon-cyan">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 font-display text-[9px] tracking-[0.25em] text-[var(--dim)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="glass panel-clip p-4 text-center text-sm text-[var(--dim)]">
            🎮 <span className="text-[var(--cyan)]">Unity</span> ·{" "}
            <span className="text-[var(--purple)]">Multiplayer</span> ·{" "}
            <span className="text-[var(--orange)]">Mobile</span> · Afiniti SRE Alumni
          </div>
        </motion.div>

        {/* right: XP + attributes */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="glass panel-clip p-6 md:p-8 space-y-6"
        >
          <XPBar />
          <div className="font-display text-[10px] tracking-[0.4em] text-[var(--dim)] pt-2">
            ▸ ATTRIBUTES
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {SKILLS.map((s, i) => (
              <SkillBar key={s.name} {...s} i={i} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {EXTRA_TAGS.map((t) => (
              <span
                key={t}
                onMouseEnter={() => sound.hover()}
                className="border border-[var(--glass-border)] px-3 py-1 text-xs tracking-wider text-[var(--dim)] hover:text-[var(--cyan)] hover:border-[var(--cyan)] transition-colors panel-clip cursor-default"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}
