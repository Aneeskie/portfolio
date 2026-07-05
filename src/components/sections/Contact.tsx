"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { CONTACT } from "@/lib/data";
import { SectionShell, SectionHeader, GameButton } from "@/components/ui";

const TERMINAL_SCRIPT = [
  "> establishing secure uplink...",
  "> handshake complete. channel encrypted.",
  "> operator: ANEESKIE [ONLINE]",
  "> status: OPEN FOR MISSIONS",
  "> response time: < 24 hours",
  "> awaiting transmission_",
];

function TerminalText() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [text, setText] = useState<string[]>([]);

  useEffect(() => {
    if (!inView) return;
    let line = 0;
    let ch = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled || line >= TERMINAL_SCRIPT.length) return;
      const current = TERMINAL_SCRIPT[line];
      ch++;
      setText((prev) => {
        const next = [...prev];
        next[line] = current.slice(0, ch);
        return next;
      });
      if (ch >= current.length) {
        line++;
        ch = 0;
        setTimeout(tick, 260);
      } else {
        setTimeout(tick, 18 + Math.random() * 24);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [inView]);

  return (
    <div ref={ref} className="font-mono text-sm md:text-base leading-7 min-h-[12rem]">
      {text.map((l, i) => (
        <div key={i} className={i === 2 ? "neon-cyan" : i === 3 ? "text-green-400" : "text-[var(--dim)]"}>
          {l}
          {i === text.length - 1 && <span className="cursor-blink text-[var(--cyan)]">█</span>}
        </div>
      ))}
    </div>
  );
}

export default function Contact() {
  return (
    <SectionShell id="contact">
      <SectionHeader kicker="Section 09 — Final Level" title="Comms Terminal" accent="cyan" />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9 }}
        className="glass panel-clip w-full max-w-3xl overflow-hidden"
      >
        {/* terminal chrome */}
        <div className="flex items-center gap-2 border-b border-[var(--glass-border)] px-5 py-3 bg-black/30">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
          <span className="ml-3 font-display text-[10px] tracking-[0.3em] text-[var(--dim)]">
            AM://COMMS_TERMINAL — v3.7.1
          </span>
        </div>

        <div className="p-6 md:p-10">
          <TerminalText />

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <GameButton href={`mailto:${CONTACT.email}`} className="text-center">
              ✉ Send Transmission
            </GameButton>
            <GameButton href={CONTACT.resume} className="text-center !border-[var(--orange)] !text-[var(--orange)]">
              ⬇ Download Resume
            </GameButton>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-5">
            {[
              ["LINKEDIN", CONTACT.linkedin],
              ["GITHUB", CONTACT.github],
              ["FIVERR", CONTACT.fiverr],
              ["INSTAGRAM", CONTACT.instagram],
              ["EMAIL", `mailto:${CONTACT.email}`],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="font-display text-[11px] tracking-[0.3em] text-[var(--dim)] hover:neon-cyan transition-all"
              >
                [{label}]
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="mt-16 text-center">
        <div className="font-display text-[10px] tracking-[0.5em] text-[var(--dim)]">
          ACHIEVEMENT UNLOCKED 🏆 — EXPLORED THE ENTIRE COMMAND CENTER
        </div>
        <div className="mt-3 text-xs text-[var(--dim)]/60">
          © {new Date().getFullYear()} Anees Muhammad — Built with Next.js, Three.js & far too much neon.
        </div>
      </div>
    </SectionShell>
  );
}
