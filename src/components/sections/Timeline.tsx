"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TIMELINE } from "@/lib/data";
import { SectionShell, SectionHeader } from "@/components/ui";
import { sound } from "@/lib/sound";

export default function Timeline() {
  const [open, setOpen] = useState<number>(3);

  return (
    <SectionShell id="timeline">
      <SectionHeader kicker="Section 06" title="Campaign Progression" accent="orange" />

      <div className="relative w-full max-w-3xl">
        {/* central beam */}
        <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--cyan)] via-[var(--purple)] to-[var(--orange)] opacity-40" />

        <div className="space-y-10">
          {TIMELINE.map((t, i) => {
            const expanded = open === i;
            const left = i % 2 === 0;
            return (
              <motion.div
                key={t.place}
                initial={{ opacity: 0, x: left ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`relative md:w-[calc(50%-2.5rem)] pl-14 md:pl-0 ${
                  left ? "md:mr-auto md:text-right" : "md:ml-auto"
                }`}
              >
                {/* node on beam */}
                <div
                  className={`absolute top-6 left-5 md:left-auto ${
                    left ? "md:-right-[3.05rem]" : "md:-left-[3.05rem]"
                  } -translate-x-1/2 md:translate-x-0`}
                >
                  <div
                    className="h-5 w-5 rotate-45 border-2 bg-[#0a0e1f]"
                    style={{ borderColor: t.color, boxShadow: `0 0 16px ${t.color}` }}
                  />
                </div>

                <button
                  onClick={() => {
                    sound.click();
                    setOpen(expanded ? -1 : i);
                  }}
                  onMouseEnter={() => sound.hover()}
                  className={`w-full glass panel-clip p-5 md:p-6 transition-all hover:-translate-y-0.5 ${
                    left ? "md:text-right" : "text-left"
                  }`}
                  style={{ borderColor: expanded ? t.color : undefined, boxShadow: expanded ? `0 0 26px ${t.color}33` : undefined }}
                  aria-expanded={expanded}
                >
                  <div className="font-display text-[10px] tracking-[0.4em]" style={{ color: t.color }}>
                    {t.chapter} — {t.period}
                  </div>
                  <div className="mt-1 font-display text-xl md:text-2xl font-black tracking-wider text-white">
                    {t.place}
                  </div>
                  <div className="text-sm italic text-[var(--dim)]">“{t.title}”</div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-sm leading-relaxed text-[var(--text)]">{t.body}</p>
                        <div className={`mt-4 flex flex-wrap gap-2 ${left ? "md:justify-end" : ""}`}>
                          {t.tech.map((tech) => (
                            <span
                              key={tech}
                              className="border px-2 py-0.5 text-[11px] tracking-wider panel-clip"
                              style={{ borderColor: `${t.color}55`, color: t.color }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
