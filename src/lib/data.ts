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
    id: "8ball-pool",
    title: "8 BALL POOL",
    category: "Casino",
    genre: "Physics / Sports",
    platforms: ["Android"],
    tech: ["Unity", "C#", "Photon PUN", "Firebase", "AdMob"],
    responsibilities: [
      "Realistic ball physics with accurate cue-stick mechanics",
      "Real-time 1v1 online multiplayer via Photon rooms",
      "Firebase leaderboard and player progression",
      "AdMob rewarded ads and interstitials",
    ],
    devTime: "3 months",
    lessons:
      "Getting physics to feel right across different frame rates required fixed-timestep simulation decoupled from rendering.",
    color: "#00f0ff",
    blurb: "Realistic 1v1 online pool with Photon netcode and Firebase leaderboards.",
  },
  {
    id: "ludo",
    title: "LUDO GAME",
    category: "Multiplayer",
    genre: "Board Game / Casual",
    platforms: ["Android"],
    tech: ["Unity", "C#", "Photon PUN", "Firebase", "Unity Ads"],
    responsibilities: [
      "Turn-based multiplayer for 2–4 players via Photon",
      "AI bots for offline play with difficulty scaling",
      "Room matchmaking and private lobby codes",
      "Unity Ads integration with reward flow",
    ],
    devTime: "2 months",
    lessons:
      "Turn-based netcode is simpler than real-time but state desync is sneakier — authoritative dice rolls on host solved it.",
    color: "#a855f7",
    blurb: "Classic Ludo with online multiplayer, AI bots, and private room lobbies.",
  },
  {
    id: "bowling",
    title: "BOWLING GAME",
    category: "Hyper Casual",
    genre: "Sports / One-touch",
    platforms: ["Android"],
    tech: ["Unity", "C#", "AdMob", "Firebase Analytics"],
    responsibilities: [
      "Satisfying swipe-to-throw ball physics",
      "Progressive lane and pin layouts",
      "AdMob mediation and A/B tested ad placements",
      "Analytics-driven difficulty tuning",
    ],
    devTime: "6 weeks",
    lessons:
      "Haptic feedback and pin sound design drove retention more than any gameplay tweak.",
    color: "#ffd166",
    blurb: "Addictive swipe-based bowling with polished physics and smart ad monetization.",
  },
  {
    id: "capture-towers",
    title: "3V3V3 CAPTURE THE TOWERS",
    category: "Multiplayer",
    genre: "Real-time Strategy / Brawler",
    platforms: ["Android"],
    tech: ["Unity", "Photon Fusion", "PlayFab", "Firebase"],
    responsibilities: [
      "9-player simultaneous real-time sessions via Photon Fusion",
      "Tower capture mechanics with contested zones",
      "Team balancing and skill-based matchmaking (PlayFab)",
      "PlayFab economy for cosmetics and ranked rewards",
    ],
    devTime: "5 months",
    lessons:
      "9 simultaneous players with contested zones exposed every latency assumption — interest management was non-negotiable.",
    color: "#ff8a2a",
    blurb: "9-player real-time brawler — three teams fight to hold towers using Photon Fusion.",
  },
  {
    id: "veggie-brawl",
    title: "VEGGIE BRAWL",
    category: "Multiplayer",
    genre: "Party Brawler",
    platforms: ["Android"],
    tech: ["Unity", "Photon PUN", "AdMob", "Figma"],
    responsibilities: [
      "Cartoon vegetable character roster with unique abilities",
      "Online brawl rooms with spectate mode",
      "Figma-designed UI translated directly into Unity UGUI",
      "AdMob rewarded lives system",
    ],
    devTime: "3 months",
    lessons:
      "Character readability at small mobile screen sizes forced a complete art restyle halfway through.",
    color: "#4ade80",
    blurb: "Chaotic online party brawler where cartoon vegetables beat each other up.",
  },
  {
    id: "tps-fps",
    title: "TPS / FPS SHOOTER",
    category: "Prototype",
    genre: "Third & First Person Shooter",
    platforms: ["Android"],
    tech: ["Unity", "C#", "Photon Fusion", "Cinemachine", "AdMob"],
    responsibilities: [
      "Switchable TPS / FPS camera with smooth transitions",
      "Weapon system with recoil, reload animations and projectile pooling",
      "Online deathmatch and team modes",
      "Mobile touch controls with aim-assist",
    ],
    devTime: "4 months",
    lessons:
      "Aim-assist tuning is an art form — too little and mobile feels unplayable, too much and it feels cheap.",
    color: "#f472b6",
    blurb: "Mobile shooter with switchable TPS/FPS camera, weapons system, and online deathmatch.",
  },
  {
    id: "racing",
    title: "RACING GAMES",
    category: "Hyper Casual",
    genre: "Arcade Racer",
    platforms: ["Android"],
    tech: ["Unity", "C#", "AdMob", "Firebase Analytics", "Unity Ads"],
    responsibilities: [
      "Multiple arcade racing prototypes with different mechanics",
      "Vehicle physics tuned for mobile feel",
      "Track generation and difficulty progression",
      "Full ad mediation stack with rewarded boost items",
    ],
    devTime: "2–3 months each",
    lessons:
      "Mobile racing needs exaggerated drift feedback — realistic physics felt boring without heavy game-feel juice.",
    color: "#facc15",
    blurb: "Series of arcade mobile racers with juicy vehicle physics and rewarded ad loops.",
  },
  {
    id: "merge-fella",
    title: "MERGE FELLA",
    category: "Puzzle",
    genre: "Merge / Idle",
    platforms: ["Android"],
    tech: ["Unity", "C#", "Firebase", "AdMob", "DOTween"],
    responsibilities: [
      "Merge chain logic with animated combo reactions",
      "Idle progression and offline earnings",
      "Firebase remote config for economy balancing",
      "Rewarded ad integration for extra merges",
    ],
    devTime: "3 months",
    lessons:
      "The satisfying 'pop' on a merge matters as much as the progression system — DOTween juice was half the retention.",
    color: "#22d3ee",
    blurb: "Polished merge-idle puzzler with animated combos and Firebase-tuned economy.",
  },
  {
    id: "quran-cube",
    title: "QURAN CUBE SUITE",
    category: "Educational",
    genre: "Islamic Educational Games",
    platforms: ["Android 4+"],
    tech: ["Unity", "C#", "AdMob", "Firebase", "Unity Ads"],
    responsibilities: [
      "6 games: Jannah Jump, Star Catches, Kickups, Noor Bird, Fruit Slicer, Endless Runner",
      "Quran recitation audio streaming in background across all titles",
      "Islamic visual themes, Arabic typography, halal ad filtering",
      "Android 4.x compatibility — aggressive APK size and memory optimization",
      "Worked directly with Quran Cube client on content and compliance",
    ],
    devTime: "8 months (6 titles)",
    lessons:
      "Supporting Android 4 in 2024 meant stripping every modern API — taught me to build lean from the ground up.",
    color: "#4ade80",
    blurb:
      "6 Islamic educational games for Quran Cube — Quran audio, halal ads, Android 4 compatible.",
  },
  {
    id: "arcana-mmo",
    title: "ARCANA MMO",
    category: "Multiplayer",
    genre: "MMO RPG",
    platforms: ["Android", "iOS"],
    tech: ["Unity", "Photon", "PlayFab", "Firebase", "Unity Matchmaking"],
    responsibilities: [
      "Persistent open world with multiple simultaneous player zones",
      "Character progression, quests, inventory and crafting systems",
      "Unity Matchmaking for instanced dungeons",
      "PlayFab economy: virtual currency, item catalog, player data",
    ],
    devTime: "6+ months (ongoing client project)",
    lessons:
      "MMO scope creep is real — scoping sessions with the client every two weeks kept the feature list from becoming a death march.",
    color: "#c77dff",
    blurb: "Persistent MMO RPG with open world zones, dungeons, and full PlayFab economy.",
  },
  {
    id: "puzzle-games",
    title: "PUZZLE GAMES",
    category: "Puzzle",
    genre: "Casual Puzzle",
    platforms: ["Android"],
    tech: ["Unity", "C#", "AdMob", "Firebase Analytics"],
    responsibilities: [
      "Multiple casual puzzle game prototypes",
      "Level design tooling for rapid content creation",
      "A/B tested difficulty curves via Remote Config",
      "Ad placement optimized against session length",
    ],
    devTime: "2–4 months each",
    lessons:
      "A bad first level kills a puzzle game. Spending 30% of dev time on the FTUE alone doubled D1 retention.",
    color: "#3b82f6",
    blurb: "Collection of casual puzzle games with analytics-driven difficulty tuning.",
  },
];

export const SKILLS = [
  { name: "Unity", pct: 95 },
  { name: "C#", pct: 92 },
  { name: "Photon (PUN / Fusion)", pct: 88 },
  { name: "Firebase", pct: 87 },
  { name: "PlayFab", pct: 85 },
  { name: "AdMob / Unity Ads", pct: 85 },
  { name: "Unity Matchmaking", pct: 80 },
  { name: "Figma", pct: 82 },
  { name: "Adobe Photoshop", pct: 78 },
  { name: "Git", pct: 88 },
  { name: "Android SDK", pct: 83 },
  { name: "UGUI / UI Toolkit", pct: 87 },
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
  { id: "unity", label: "UNITY", desc: "Core engine — 3 years shipping mobile games across 50+ projects.", x: 500, y: 400, color: "#00f0ff" },
  // Networking branch
  { id: "net", label: "Networking", desc: "Real-time multiplayer architecture for mobile.", x: 260, y: 240, parent: "unity", color: "#a855f7" },
  { id: "fusion", label: "Photon Fusion", desc: "Tick-based netcode, 9-player sessions, interest management.", x: 110, y: 150, parent: "net", color: "#a855f7" },
  { id: "pun", label: "Photon PUN", desc: "Room-based multiplayer, RPCs, lobby systems.", x: 200, y: 90, parent: "net", color: "#a855f7" },
  { id: "matchmaking", label: "Unity Matchmaking", desc: "Instanced dungeon queues and skill-based matching.", x: 90, y: 260, parent: "net", color: "#a855f7" },
  // Backend branch
  { id: "backend", label: "Backend", desc: "Live game services & player data.", x: 740, y: 240, parent: "unity", color: "#3b82f6" },
  { id: "playfab", label: "PlayFab", desc: "Economy, inventory, CloudScript, matchmaking, leaderboards.", x: 660, y: 110, parent: "backend", color: "#3b82f6" },
  { id: "firebase", label: "Firebase", desc: "Auth, Firestore, Remote Config, Analytics.", x: 830, y: 120, parent: "backend", color: "#f59e0b" },
  // Monetization
  { id: "ads", label: "AdMob / Unity Ads", desc: "Rewarded ads, interstitials, mediation stacks.", x: 700, y: 420, parent: "unity", color: "#facc15" },
  { id: "analytics", label: "Analytics", desc: "Funnels, A/B tests, retention telemetry.", x: 640, y: 330, parent: "unity", color: "#facc15" },
  // Art & Design
  { id: "design", label: "Design", desc: "UI/UX and visual asset pipeline.", x: 300, y: 570, parent: "unity", color: "#ff8a2a" },
  { id: "figma", label: "Figma", desc: "UI wireframes and design handoff to Unity UGUI.", x: 160, y: 540, parent: "design", color: "#ff8a2a" },
  { id: "photoshop", label: "Photoshop", desc: "Texture work, promotional art, icon design.", x: 180, y: 640, parent: "design", color: "#ff8a2a" },
  // Mobile
  { id: "android", label: "Android", desc: "APK optimization, Android 4+ compat, store submission.", x: 520, y: 620, parent: "unity", color: "#4ade80" },
  { id: "procgen", label: "Proc. Generation", desc: "Procedural levels and noise-based world generation.", x: 780, y: 580, parent: "unity", color: "#4ade80" },
];

export const TIMELINE = [
  {
    chapter: "CHAPTER 1",
    place: "EDUCATION",
    period: "2021 — Present",
    title: "The Origin Quest",
    body: "Studying BSc Software Engineering, graduating January 2027. While in university, self-taught Unity game development in parallel — shipping real Android games to the Play Store from year one instead of waiting to graduate.",
    tech: ["Unity", "C#", "Android", "Git"],
    color: "#00f0ff",
  },
  {
    chapter: "CHAPTER 2",
    place: "AFINITI",
    period: "2023 — Internship",
    title: "Operational Excellence",
    body: "Interned at Afiniti as an Operational Excellence engineer. Worked on process monitoring, operational metrics and system reliability workflows in a global AI/telecom company. Built tooling to track and report on operational KPIs.",
    tech: ["SRE Tooling", "Process Monitoring", "Reporting", "Automation"],
    color: "#a855f7",
  },
  {
    chapter: "CHAPTER 3",
    place: "AFINITI",
    period: "2024 — Internship",
    title: "Site Reliability Engineer",
    body: "Returned to Afiniti as an SRE intern. Focused on system uptime, incident response, and reliability engineering across production infrastructure. Deepened understanding of how large-scale systems stay alive under load.",
    tech: ["SRE", "Incident Response", "Infrastructure", "Monitoring"],
    color: "#ff8a2a",
  },
  {
    chapter: "CHAPTER 4",
    place: "FREELANCE",
    period: "2022 — Now",
    title: "50+ Games Shipped",
    body: "Built 50+ Unity games on Fiverr across mobile genres — multiplayer brawlers, Islamic educational suites, casino games, MMOs and hyper-casual titles. Worked with clients worldwide including Quran Cube, indie studios and solo founders.",
    tech: ["Unity", "Photon", "PlayFab", "Firebase", "AdMob", "Figma"],
    color: "#4ade80",
  },
];

export const SERVICES = [
  { icon: "🎮", title: "Unity Game Development", desc: "Full-cycle mobile game dev from concept to Play Store — 2D, 3D, hyper-casual to MMO." },
  { icon: "🌐", title: "Multiplayer", desc: "Photon Fusion / PUN real-time netcode, Unity Matchmaking, lobbies, rooms and anti-cheat." },
  { icon: "🗄️", title: "Backend Integration", desc: "Firebase, PlayFab — auth, economy, inventory, leaderboards, remote config and cloud save." },
  { icon: "📱", title: "Mobile Monetization", desc: "AdMob and Unity Ads mediation, rewarded video flows and A/B tested placements." },
  { icon: "⚡", title: "Game Prototyping", desc: "Playable prototypes in 1–3 weeks. Fast iteration, analytics baked in from day one." },
  { icon: "🎨", title: "UI / UX Design", desc: "Figma-first UI design translated to Unity UGUI — game menus, HUDs, onboarding flows." },
  { icon: "🚀", title: "Store Publishing", desc: "Google Play submission, store listing assets, versioning and release management." },
];

export const TOOLS = [
  "Unity", "C#", "Photon", "PlayFab", "Firebase", "AdMob", "Unity Ads",
  "Figma", "Photoshop", "Git", "Android SDK", "DOTween", "Cinemachine",
];

export const CONTACT = {
  email: "shaida.muhammad@gmail.com",
  linkedin: "https://www.linkedin.com/in/anees-muhammad-791885288/",
  github: "https://github.com/Aneeskie",
  fiverr: "https://www.fiverr.com/sellers/anees_muhammad",
  instagram: "https://www.instagram.com/aneeskie",
  discord: "689831522915844101",
  resume: "/resume.pdf",
};
