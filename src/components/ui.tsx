"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { sound } from "@/lib/sound";

export function SectionShell({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-5 py-28 md:px-12 ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  kicker,
  title,
  accent = "cyan",
}: {
  kicker: string;
  title: string;
  accent?: "cyan" | "purple" | "orange";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-14 text-center"
    >
      <div className={`font-display text-xs tracking-[0.5em] uppercase mb-3 neon-${accent}`}>
        {"// "}
        {kicker}
      </div>
      <h2 className="font-display text-3xl md:text-5xl font-black tracking-wider text-gradient animated-gradient uppercase">
        {title}
      </h2>
      <div className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />
    </motion.div>
  );
}

/** Framer variants for staggered card grids */
export const gridStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
export const cardRise = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function GameButton({
  children,
  onClick,
  href,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const props = {
    className: `btn-game text-sm ${className}`,
    onMouseEnter: () => sound.hover(),
    onClick: () => {
      sound.click();
      onClick?.();
    },
  };
  if (href)
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" {...props}>
        {children}
      </a>
    );
  return <button {...props}>{children}</button>;
}
