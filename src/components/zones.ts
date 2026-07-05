export type Zone = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  x: number;
  z: number;
};

export const ZONES: Zone[] = [
  { id: "profile", label: "Hero Shrine", emoji: "🛡️", color: "#7cf3c8", x: -38, z: -34 },
  { id: "projects", label: "Mission Vault", emoji: "🗺️", color: "#ffb703", x: 44, z: -38 },
  { id: "skills", label: "Skill Grove", emoji: "🌳", color: "#7ac74f", x: 54, z: 24 },
  { id: "multiplayer", label: "Netmancer Tower", emoji: "🔮", color: "#c77dff", x: 24, z: 54 },
  { id: "engine", label: "Engine Forge", emoji: "⚙️", color: "#ff70a6", x: -30, z: 48 },
  { id: "timeline", label: "Campaign Road", emoji: "🏰", color: "#6ec6ff", x: -54, z: 8 },
  { id: "services", label: "Quest Board", emoji: "📜", color: "#ffd166", x: 2, z: -58 },
  { id: "contact", label: "Message Owlery", emoji: "🦉", color: "#8ecae6", x: 58, z: -6 },
];

export const INTERACT_RADIUS = 9;
export const WORLD_SIZE = 170;
