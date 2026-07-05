"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS, Project } from "@/lib/data";
import { SectionShell, SectionHeader, gridStagger, cardRise } from "@/components/ui";
import { sound } from "@/lib/sound";

const CATEGORIES = [
  "All", "Hyper Casual", "Multiplayer", "Casino", "Puzzle",
  "Educational", "Simulation", "Prototype", "Tools",
] as const;

/** A floating "game cartridge" card with 3D hover tilt */
function Cartridge({ project, onOpen, index }: { project: Project; onOpen: () => void; index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  return (
    <motion.button
      variants={cardRise}
      onClick={() => {
        sound.unlock();
        onOpen();
      }}
      onMouseEnter={() => {
        setHover(true);
        sound.hover();
      }}
      onMouseLeave={() => {
        setHover(false);
        setTilt({ x: 0, y: 0 });
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({
          x: ((e.clientY - r.top) / r.height - 0.5) * -14,
          y: ((e.clientX - r.left) / r.width - 0.5) * 14,
        });
      }}
      className="relative text-left group"
      style={{ perspective: 800, animationDelay: `${index * 0.3}s` }}
      aria-label={`Open project ${project.title}`}
    >
      <div
        className="glass panel-clip p-5 h-full transition-transform duration-150 will-change-transform floaty"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hover ? "translateZ(20px) scale(1.03)" : ""}`,
          boxShadow: hover
            ? `0 0 34px ${project.color}55, inset 0 0 24px ${project.color}18`
            : `0 0 10px ${project.color}22`,
          borderColor: hover ? project.color : undefined,
          animationDelay: `${(index % 4) * 0.7}s`,
        }}
      >
        {/* cartridge top notch */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-3 w-1.5 rounded-sm transition-colors"
                style={{ background: hover ? project.color : "#1c2748" }}
              />
            ))}
          </div>
          <span
            className="font-display text-[9px] tracking-[0.2em] px-2 py-0.5 border panel-clip"
            style={{ color: project.color, borderColor: `${project.color}66` }}
          >
            {project.category.toUpperCase()}
          </span>
        </div>

        {/* fake screenshot area — shader-y gradient */}
        <div
          className="relative mb-4 h-32 overflow-hidden panel-clip animated-gradient"
          style={{
            background: `linear-gradient(120deg, ${project.color}33, #0a0e1f 40%, ${project.color}22, #0a0e1f)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center font-display text-3xl font-black opacity-25 tracking-widest select-none">
            {project.title.slice(0, 2)}
          </div>
          {hover && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 font-display text-xs tracking-[0.4em]"
              style={{ color: project.color }}
            >
              ▶ INSERT CARTRIDGE
            </motion.div>
          )}
          {/* hover particles */}
          {hover &&
            [...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, x: "50%", y: "80%" }}
                animate={{
                  opacity: 0,
                  x: `${20 + Math.random() * 60}%`,
                  y: `${Math.random() * 40}%`,
                }}
                transition={{ duration: 0.9 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.12 }}
                className="absolute h-1 w-1 rounded-full"
                style={{ background: project.color, boxShadow: `0 0 6px ${project.color}` }}
              />
            ))}
        </div>

        <h3 className="font-display text-base font-bold tracking-wider mb-1 group-hover:text-white transition-colors" style={{ color: hover ? project.color : undefined }}>
          {project.title}
        </h3>
        <p className="text-sm text-[var(--dim)] leading-snug min-h-[2.6em]">{project.blurb}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.platforms.map((p) => (
            <span key={p} className="text-[10px] tracking-wider text-[var(--dim)] border border-white/10 px-1.5 py-0.5">
              {p}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="glass panel-clip w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 md:p-10"
        style={{ borderColor: project.color }}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="font-display text-[10px] tracking-[0.4em] mb-2" style={{ color: project.color }}>
              MISSION FILE // {project.category.toUpperCase()}
            </div>
            <h3 className="font-display text-2xl md:text-4xl font-black tracking-wider text-gradient animated-gradient">
              {project.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            onMouseEnter={() => sound.hover()}
            className="btn-game !px-4 !py-2 text-xs shrink-0"
            aria-label="Close"
          >
            ✕ EJECT
          </button>
        </div>

        {/* "gameplay video" placeholder screen */}
        <div
          className="relative mb-6 h-48 md:h-64 panel-clip overflow-hidden animated-gradient flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${project.color}30, #070b18 45%, ${project.color}18, #070b18)` }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-14 w-14 rounded-full border-2 flex items-center justify-center pulse-glow cursor-pointer"
              style={{ borderColor: project.color, color: project.color }}
            >
              ▶
            </div>
            <div className="font-display text-[10px] tracking-[0.4em] text-[var(--dim)]">
              GAMEPLAY FOOTAGE — {project.genre.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 text-sm">
          <div>
            <ModalLabel color={project.color}>RESPONSIBILITIES</ModalLabel>
            <ul className="space-y-2">
              {project.responsibilities.map((r) => (
                <li key={r} className="flex gap-2 text-[var(--text)]">
                  <span style={{ color: project.color }}>▸</span> {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-5">
            <div>
              <ModalLabel color={project.color}>TECHNOLOGY</ModalLabel>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="border px-2 py-1 text-xs tracking-wider panel-clip" style={{ borderColor: `${project.color}55`, color: project.color }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ModalLabel color={project.color}>PLATFORMS</ModalLabel>
                <div className="text-[var(--dim)]">{project.platforms.join(" · ")}</div>
              </div>
              <div>
                <ModalLabel color={project.color}>DEV TIME</ModalLabel>
                <div className="text-[var(--dim)]">{project.devTime}</div>
              </div>
            </div>
            <div>
              <ModalLabel color={project.color}>GENRE</ModalLabel>
              <div className="text-[var(--dim)]">{project.genre}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 glass panel-clip p-4">
          <ModalLabel color={project.color}>⚑ LESSONS LEARNED</ModalLabel>
          <p className="text-[var(--dim)] italic leading-relaxed">{project.lessons}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModalLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="font-display text-[10px] tracking-[0.35em] mb-2" style={{ color }}>
      {children}
    </div>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [open, setOpen] = useState<Project | null>(null);
  const visible = PROJECTS.filter((p) => filter === "All" || p.category === filter);

  return (
    <SectionShell id="projects">
      <SectionHeader kicker="Section 02" title="Mission Archive" accent="purple" />

      <div className="mb-10 flex flex-wrap justify-center gap-2 max-w-4xl">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              sound.click();
              setFilter(c);
            }}
            onMouseEnter={() => sound.hover()}
            className={`font-display text-[10px] tracking-[0.2em] px-3 py-1.5 border panel-clip transition-all ${
              filter === c
                ? "border-[var(--cyan)] text-[var(--cyan)] bg-[rgba(0,240,255,0.1)] shadow-[0_0_14px_rgba(0,240,255,0.4)]"
                : "border-white/10 text-[var(--dim)] hover:text-[var(--text)] hover:border-white/30"
            }`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      <motion.div
        variants={gridStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid w-full max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        key={filter}
      >
        {visible.map((p, i) => (
          <Cartridge key={p.id} project={p} index={i} onOpen={() => setOpen(p)} />
        ))}
      </motion.div>

      <AnimatePresence>
        {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </SectionShell>
  );
}
