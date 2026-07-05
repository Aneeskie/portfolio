export type Project = {
  id: string;
  title: string;
  category:
    | "Hyper Casual"
    | "Multiplayer"
    | "Casino"
    | "Puzzle"
    | "Educational"
    | "Simulation"
    | "Prototype"
    | "Tools";
  genre: string;
  platforms: string[];
  tech: string[];
  responsibilities: string[];
  devTime: string;
  lessons: string;
  color: string;
  blurb: string;
};

export const PROJECTS: Project[] = [
  {
    id: "arena-clash",
    title: "ARENA CLASH",
    category: "Multiplayer",
    genre: "Real-time PvP Arena",
    platforms: ["Android", "iOS"],
    tech: ["Unity", "Photon Fusion", "PlayFab", "Addressables", "DOTween"],
    responsibilities: [
      "Client-side prediction & lag compensation",
      "Matchmaking + lobby flow with Photon rooms",
      "PlayFab economy, inventory & leaderboards",
      "Live-ops events and remote config",
    ],
    devTime: "10 months",
    lessons:
      "Tick-accurate rollback netcode is 20% code, 80% testing under packet loss. Building a network simulator early saved weeks.",
    color: "#00f0ff",
    blurb: "4-player real-time arena brawler with rollback netcode and full LiveOps stack.",
  },
  {
    id: "neon-drift",
    title: "NEON DRIFT",
    category: "Hyper Casual",
    genre: "One-touch Arcade Racer",
    platforms: ["Android", "iOS"],
    tech: ["Unity", "DOTween", "Firebase Analytics", "AdMob"],
    responsibilities: [
      "Core loop prototyping in 2-week sprints",
      "A/B tested difficulty curves via Remote Config",
      "Ad mediation & rewarded video placement",
    ],
    devTime: "3 months",
    lessons:
      "Retention lives in the first 30 seconds. We rebuilt the FTUE four times based on funnel analytics.",
    color: "#ff8a2a",
    blurb: "Slick one-touch drift racer — 2M+ downloads, 38% D1 retention.",
  },
  {
    id: "royal-spin",
    title: "ROYAL SPIN CASINO",
    category: "Casino",
    genre: "Social Casino / Slots",
    platforms: ["Android", "iOS", "Web"],
    tech: ["Unity", "PlayFab", "Firebase", "REST APIs", "Spine"],
    responsibilities: [
      "Server-authoritative RNG & payout validation",
      "Virtual economy with anti-cheat receipts",
      "Daily missions, VIP tiers, seasonal events",
    ],
    devTime: "14 months (live)",
    lessons:
      "In social casino, economy tuning IS the game design. Telemetry dashboards became my most-used tool.",
    color: "#a855f7",
    blurb: "Live social casino with server-authoritative economy and seasonal LiveOps.",
  },
  {
    id: "cube-logic",
    title: "CUBE LOGIC",
    category: "Puzzle",
    genre: "3D Spatial Puzzle",
    platforms: ["Android", "iOS", "Steam"],
    tech: ["Unity", "Shader Graph", "Timeline", "Cloud Save"],
    responsibilities: [
      "Procedural level generator with difficulty solver",
      "Custom stylized shaders & bloom pipeline",
      "Cross-platform cloud save with UGS",
    ],
    devTime: "6 months",
    lessons:
      "A solver that rates level difficulty automatically let designers ship 300 hand-feel-perfect levels.",
    color: "#3b82f6",
    blurb: "Award-nominated 3D puzzler with procedural levels and a custom render style.",
  },
  {
    id: "kanji-quest",
    title: "KANJI QUEST",
    category: "Educational",
    genre: "Language-learning RPG",
    platforms: ["Android", "iOS"],
    tech: ["Unity", "Firebase", "Localization", "UI Toolkit"],
    responsibilities: [
      "Spaced-repetition engine wrapped in RPG combat",
      "Full JP/EN localization pipeline",
      "Offline-first sync architecture",
    ],
    devTime: "8 months",
    lessons:
      "Built in Japan for Japanese learners — playtesting across cultures reshaped the entire reward loop.",
    color: "#22d3ee",
    blurb: "Learn 2,000 kanji by battling them. Built during my years in Japan.",
  },
  {
    id: "harvest-sim",
    title: "HARVEST HORIZON",
    category: "Simulation",
    genre: "Farming / Management Sim",
    platforms: ["Steam", "iOS"],
    tech: ["Unity", "DOTS-style jobs", "Addressables", "Cinemachine"],
    responsibilities: [
      "Simulation tick system for 10k+ entities",
      "Save system with versioned migrations",
      "Streaming world chunks via Addressables",
    ],
    devTime: "12 months",
    lessons:
      "Deterministic simulation + replayable saves made bug reports trivially reproducible.",
    color: "#4ade80",
    blurb: "Cozy management sim simulating 10,000+ entities at a locked 60fps.",
  },
  {
    id: "proto-lab",
    title: "PROTO LAB",
    category: "Prototype",
    genre: "Rapid Prototyping",
    platforms: ["Android", "iOS", "WebGL"],
    tech: ["Unity", "DOTween", "Firebase A/B"],
    responsibilities: [
      "15+ market-test prototypes in 12 months",
      "CPI testing pipelines & creative iteration",
      "Reusable game-feel toolkit (juice library)",
    ],
    devTime: "1–3 weeks each",
    lessons:
      "Kill fast, learn faster. A reusable 'juice' package cut prototype time from 3 weeks to 8 days.",
    color: "#f472b6",
    blurb: "A year of hyper-fast market-test prototypes — 15 games, 3 green-lights.",
  },
  {
    id: "asset-forge",
    title: "ASSET FORGE",
    category: "Tools",
    genre: "Editor Tooling",
    platforms: ["Unity Editor"],
    tech: ["Unity Editor API", "UI Toolkit", "Git", "Plastic SCM"],
    responsibilities: [
      "Custom editor windows for level & economy design",
      "Automated Addressables build & validation CI",
      "One-click multi-store build pipeline",
    ],
    devTime: "Ongoing",
    lessons:
      "Every hour spent on tooling returned ten. Designers shipping without engineers is the real velocity unlock.",
    color: "#facc15",
    blurb: "Internal editor toolkit that let designers build, validate and ship without code.",
  },
];

export const SKILLS = [
  { name: "Unity", pct: 98 },
  { name: "C#", pct: 95 },
  { name: "Photon Fusion", pct: 88 },
  { name: "PlayFab", pct: 90 },
  { name: "Firebase", pct: 92 },
  { name: "Unity Gaming Services", pct: 85 },
  { name: "Addressables", pct: 90 },
  { name: "Shader Graph", pct: 80 },
  { name: "DOTween", pct: 94 },
  { name: "Git / Plastic SCM", pct: 92 },
  { name: "REST APIs", pct: 88 },
  { name: "UI Toolkit / UGUI", pct: 91 },
];

export type SkillNode = {
  id: string;
  label: string;
  desc: string;
  x: number;
  y: number;
  parent?: string;
  color: string;
};

export const SKILL_TREE: SkillNode[] = [
  { id: "unity", label: "UNITY", desc: "Core engine mastery — 3+ years shipping across mobile, PC and web.", x: 500, y: 400, color: "#00f0ff" },
  // Networking branch (left top)
  { id: "net", label: "Networking", desc: "Real-time multiplayer architecture.", x: 260, y: 240, parent: "unity", color: "#a855f7" },
  { id: "fusion", label: "Photon Fusion", desc: "Tick-based netcode, client prediction, rollback.", x: 110, y: 150, parent: "net", color: "#a855f7" },
  { id: "pun", label: "Photon PUN", desc: "Room-based multiplayer, RPCs, lobbies.", x: 200, y: 90, parent: "net", color: "#a855f7" },
  // Backend branch (right top)
  { id: "backend", label: "Backend", desc: "Live game services & server logic.", x: 740, y: 240, parent: "unity", color: "#3b82f6" },
  { id: "playfab", label: "PlayFab", desc: "Economy, inventory, CloudScript, matchmaking.", x: 660, y: 110, parent: "backend", color: "#3b82f6" },
  { id: "firebase", label: "Firebase", desc: "Auth, Firestore, Remote Config, Analytics, FCM.", x: 830, y: 120, parent: "backend", color: "#f59e0b" },
  { id: "ugs", label: "Unity Services", desc: "UGS suite integration.", x: 900, y: 260, parent: "backend", color: "#3b82f6" },
  { id: "auth", label: "Authentication", desc: "Anonymous, social & platform sign-in flows.", x: 960, y: 160, parent: "ugs", color: "#3b82f6" },
  { id: "cloudsave", label: "Cloud Save", desc: "Cross-device save sync with conflict resolution.", x: 980, y: 330, parent: "ugs", color: "#3b82f6" },
  { id: "economy", label: "Economy", desc: "Virtual currencies, catalogs, receipts.", x: 890, y: 400, parent: "ugs", color: "#3b82f6" },
  { id: "leaderboards", label: "Leaderboards", desc: "Tiered, seasonal, friend leaderboards.", x: 950, y: 470, parent: "ugs", color: "#3b82f6" },
  // Content branch (left bottom)
  { id: "addressables", label: "Addressables", desc: "Remote content, memory management, CDN delivery.", x: 250, y: 430, parent: "unity", color: "#00f0ff" },
  { id: "anim", label: "Animation", desc: "Game feel & cinematic motion.", x: 300, y: 570, parent: "unity", color: "#ff8a2a" },
  { id: "timeline", label: "Timeline", desc: "Cutscenes & scripted sequences.", x: 160, y: 540, parent: "anim", color: "#ff8a2a" },
  { id: "cinemachine", label: "Cinemachine", desc: "Procedural camera systems.", x: 180, y: 640, parent: "anim", color: "#ff8a2a" },
  { id: "dotween", label: "DOTween", desc: "Tweening & juice — my go-to for game feel.", x: 340, y: 690, parent: "anim", color: "#ff8a2a" },
  // Graphics (bottom)
  { id: "shadergraph", label: "Shader Graph", desc: "Custom stylized shaders, VFX, dissolves, holograms.", x: 520, y: 620, parent: "unity", color: "#f472b6" },
  { id: "ai", label: "Game AI", desc: "Behaviour trees, FSMs, utility AI.", x: 660, y: 560, parent: "unity", color: "#4ade80" },
  { id: "procgen", label: "Proc. Generation", desc: "Procedural levels, noise-based worlds.", x: 780, y: 630, parent: "ai", color: "#4ade80" },
  // Monetization
  { id: "ads", label: "Ads", desc: "AdMob / LevelPlay mediation, rewarded flows.", x: 700, y: 420, parent: "unity", color: "#facc15" },
  { id: "analytics", label: "Analytics", desc: "Funnels, cohorts, A/B testing, telemetry.", x: 640, y: 330, parent: "unity", color: "#facc15" },
];

export const TIMELINE = [
  {
    chapter: "CHAPTER 1",
    place: "NEPAL",
    period: "Origin — 2021",
    title: "The Spawn Point",
    body: "Computer engineering roots in Kathmandu. First Unity prototypes, game jams, and an obsession with making things feel alive. Learned C#, OOP fundamentals, and shipped my first Android game solo.",
    tech: ["Unity", "C#", "Android", "Blender basics"],
    color: "#00f0ff",
  },
  {
    chapter: "CHAPTER 2",
    place: "JAPAN",
    period: "2021 — 2023",
    title: "The Discipline Arc",
    body: "Joined a Tokyo mobile studio. Shipped hyper-casual and educational titles for the Japanese market. Learned production discipline, code review culture, localization pipelines, and cross-cultural playtesting.",
    tech: ["Photon PUN", "Firebase", "Localization", "Addressables", "CI/CD"],
    color: "#a855f7",
  },
  {
    chapter: "CHAPTER 3",
    place: "AUSTRALIA",
    period: "2023 — 2025",
    title: "The Multiplayer Campaign",
    body: "Senior Unity developer on real-time multiplayer and social casino titles in Melbourne. Owned netcode, backend integration and LiveOps. Led a small client team and mentored juniors.",
    tech: ["Photon Fusion", "PlayFab", "UGS", "Shader Graph", "Plastic SCM"],
    color: "#ff8a2a",
  },
  {
    chapter: "CHAPTER 4",
    place: "CURRENT",
    period: "2025 — Now",
    title: "New Game+",
    body: "Freelance & contract Unity development worldwide. Building multiplayer experiences, rescuing troubled codebases, and shipping to Google Play, App Store and Steam. Open to ambitious projects.",
    tech: ["Everything above", "+ your stack"],
    color: "#4ade80",
  },
];

export const SERVICES = [
  { icon: "🎮", title: "Unity Game Development", desc: "Full-cycle development from concept to store — 2D, 3D, mobile and PC." },
  { icon: "⚡", title: "Game Prototyping", desc: "Playable market-test prototypes in 1–3 weeks with analytics baked in." },
  { icon: "📱", title: "Mobile Optimization", desc: "Profiling, draw-call surgery, memory budgets — locked 60fps on mid-range devices." },
  { icon: "🌐", title: "Multiplayer", desc: "Photon Fusion / PUN real-time netcode, matchmaking, lobbies, anti-cheat." },
  { icon: "🗄️", title: "Backend Integration", desc: "Firebase, PlayFab, Unity Gaming Services — auth, economy, cloud save, LiveOps." },
  { icon: "🔧", title: "Bug Fixing & Rescue", desc: "Codebase audits, crash hunting, and rescuing stalled Unity projects." },
  { icon: "🚀", title: "Publishing", desc: "Google Play, App Store and Steam submission, store assets and release management." },
];

export const TOOLS = [
  "Unity", "Blender", "Photoshop", "Illustrator", "VS Code", "Git",
  "Plastic SCM", "Firebase", "PlayFab", "Photon", "Spline", "Rive", "Figma",
];

export const CONTACT = {
  email: "santosh.kc@example.com",
  linkedin: "https://linkedin.com/in/santoshkc",
  github: "https://github.com/santoshkc",
  whatsapp: "https://wa.me/9779800000000",
  resume: "/resume.pdf",
};
