"use client";

import { motion } from "framer-motion";
import { SERVICES } from "@/lib/data";
import { SectionShell, SectionHeader, gridStagger, cardRise } from "@/components/ui";
import { sound } from "@/lib/sound";

export default function Services() {
  return (
    <SectionShell id="services">
      <SectionHeader kicker="Section 07" title="Available Quests" accent="cyan" />
      <p className="-mt-8 mb-12 text-center text-[var(--dim)] max-w-xl">
        Contract services for studios, publishers and founders.
      </p>

      <motion.div
        variants={gridStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid w-full max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.title}
            variants={cardRise}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onMouseEnter={() => sound.hover()}
            className="glass panel-clip p-6 group cursor-default holo-sweep overflow-hidden"
            style={{ animationDelay: `${i * 0.5}s` }}
          >
            <div className="text-3xl mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6 inline-block">
              {s.icon}
            </div>
            <h3 className="font-display text-sm font-bold tracking-[0.15em] mb-2 group-hover:neon-cyan transition-all">
              {s.title.toUpperCase()}
            </h3>
            <p className="text-sm text-[var(--dim)] leading-relaxed">{s.desc}</p>
            <div className="mt-4 h-px w-full bg-gradient-to-r from-[var(--cyan)] to-transparent opacity-0 group-hover:opacity-60 transition-opacity" />
            <div className="mt-2 font-display text-[9px] tracking-[0.3em] text-[var(--dim)] opacity-0 group-hover:opacity-100 transition-opacity">
              ▸ QUEST AVAILABLE
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  );
}
