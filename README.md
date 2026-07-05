# SKC//DEV — Playable Portfolio

A game-style interactive portfolio for **Santosh KC, Unity Game Developer**. Built to feel like the menu of a AAA sci-fi game: cinematic boot loader, WebGL nebula + particle world, scroll-driven camera flight, RPG skill tree, and a terminal-style comms section.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Stack

- **Next.js 16 / React / TypeScript / Tailwind v4**
- **Three.js + React Three Fiber** — persistent background world (custom GLSL nebula shader, additive particle field, holographic grid, wireframe props)
- **@react-three/postprocessing** — bloom + vignette
- **GSAP** — loader counter, hero character animation, stat counters
- **Framer Motion** — section reveals, modals, card physics
- **Lenis** — smooth scroll feeding the 3D camera rig (scroll flies the camera, not the page)
- **WebAudio** — fully synthesized UI sounds (hover / click / unlock / ambient), no audio assets

## Structure

```
src/
  app/            layout (fonts/meta) · page · globals.css (theme, glass, neon, keyframes)
  lib/            data.ts (all content) · sound.ts (synth engine) · scrollStore.ts
  components/
    Scene.tsx     WebGL world + scroll camera rig
    Experience.tsx  orchestrator (loader → world, Lenis, parallax)
    LoadingScreen / Hud / ui.tsx
    sections/     Hero · Profile · Projects · SkillTree · MultiplayerLab
                  · EngineRoom · Timeline · Services · Tools · Contact
```

## Customize

All content lives in [src/lib/data.ts](src/lib/data.ts) — projects, skills, skill-tree nodes, timeline chapters, services, tools, and contact links (**update the placeholder email/social URLs and replace `public/resume.pdf`**).

## Performance notes

- Single `<Canvas>` shared across the whole page, `dpr` capped at 1.5, antialias off (bloom hides it)
- Scroll/mouse state flows through a mutable store read per-frame — zero React re-renders during scroll
- Respects `prefers-reduced-motion`
