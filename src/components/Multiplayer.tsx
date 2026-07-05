"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import PartySocket from "partysocket";
import { worldState } from "@/lib/worldStore";
import { getGroundY } from "@/components/World";

/* One colour per player slot — cycles if more than 8 visitors */
const PLAYER_COLORS = [
  "#ff70a6", "#ffd166", "#7cf3c8", "#6ec6ff",
  "#c77dff", "#ff9944", "#4ade80", "#f472b6",
];

type RemotePlayer = {
  id: string;
  x: number; z: number; rot: number;
  tx: number; tz: number; trot: number; // lerp targets
  color: string;
  mesh: THREE.Group | null;
};

let colorIndex = 0;

function makeWizard(color: string): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, flatShading: true });
  const bodyGeo = new THREE.BoxGeometry(0.55, 0.75, 0.42);
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.y = 0.5;
  g.add(body);
  const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
  const head = new THREE.Mesh(headGeo, mat);
  head.position.y = 1.08;
  g.add(head);
  const hatGeo = new THREE.ConeGeometry(0.22, 0.55, 6);
  const hat = new THREE.Mesh(hatGeo, mat);
  hat.position.y = 1.58;
  g.add(hat);
  return g;
}

export default function Multiplayer() {
  const players = useRef<Record<string, RemotePlayer>>({});
  const scene = useRef<THREE.Scene | null>(null);
  const myColor = useRef(PLAYER_COLORS[colorIndex++ % PLAYER_COLORS.length]);
  const frameCount = useRef(0);
  const socket = useRef<PartySocket | null>(null);

  const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "anees-portfolio.aneeskie.partykit.dev";

  useEffect(() => {
    const ws = new PartySocket({ host, room: "world" });
    socket.current = ws;

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

      if (msg.type === "world") {
        // Existing players when we join
        for (const [id, p] of Object.entries(msg.players as Record<string, { x: number; z: number; rot: number; color: string }>)) {
          addPlayer(id, p.x, p.z, p.rot, p.color);
        }
      } else if (msg.type === "pos") {
        const p = players.current[msg.id];
        if (p) {
          p.tx = msg.x; p.tz = msg.z; p.trot = msg.rot;
        } else {
          addPlayer(msg.id, msg.x, msg.z, msg.rot, msg.color);
        }
      } else if (msg.type === "leave") {
        removePlayer(msg.id);
      }
    };

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addPlayer(id: string, x: number, z: number, rot: number, color: string) {
    if (players.current[id]) return;
    const mesh = makeWizard(color);
    mesh.position.set(x, getGroundY(x, z), z);
    if (scene.current) scene.current.add(mesh);
    players.current[id] = { id, x, z, rot, tx: x, tz: z, trot: rot, color, mesh };
  }

  function removePlayer(id: string) {
    const p = players.current[id];
    if (p?.mesh && scene.current) scene.current.remove(p.mesh);
    delete players.current[id];
  }

  useFrame(({ scene: sc }, dt) => {
    // Grab the scene ref once
    if (!scene.current) scene.current = sc;

    // Send our position every 6 frames (~10 updates/sec)
    frameCount.current++;
    if (frameCount.current % 6 === 0 && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({
        type: "pos",
        x: +worldState.x.toFixed(2),
        z: +worldState.z.toFixed(2),
        rot: +worldState.rot.toFixed(3),
        color: myColor.current,
      }));
    }

    // Lerp remote players to their latest position
    const dtc = Math.min(dt, 0.05);
    for (const p of Object.values(players.current)) {
      if (!p.mesh) continue;
      p.x += (p.tx - p.x) * Math.min(1, dtc * 10);
      p.z += (p.tz - p.z) * Math.min(1, dtc * 10);
      // Shortest-arc rotation lerp
      let dr = p.trot - p.rot;
      if (dr > Math.PI) dr -= Math.PI * 2;
      if (dr < -Math.PI) dr += Math.PI * 2;
      p.rot += dr * Math.min(1, dtc * 10);
      p.mesh.position.set(p.x, getGroundY(p.x, p.z), p.z);
      p.mesh.rotation.y = p.rot;
    }
  });

  return null; // meshes are added imperatively to the scene
}
