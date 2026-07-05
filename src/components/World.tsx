"use client";

import { forwardRef, Suspense, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Html, Sparkles, Text3D } from "@react-three/drei";
import * as THREE from "three";
import { worldState } from "@/lib/worldStore";
import { sound } from "@/lib/sound";
import { ZONES, INTERACT_RADIUS, WORLD_SIZE, Zone } from "@/components/zones";

const SPEED = 13;
const CART_SPEED = 26;

/* ------------------------------------------------------------------ */
/* Terrain height — value noise shared by geometry, player & props     */
/* ------------------------------------------------------------------ */
function hash(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, z: number) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  return (
    hash(xi, zi) * (1 - u) * (1 - v) +
    hash(xi + 1, zi) * u * (1 - v) +
    hash(xi, zi + 1) * (1 - u) * v +
    hash(xi + 1, zi + 1) * u * v
  );
}
const TEMPLE = { x: 0, z: 0 };
const GOAL = { x: 26, z: 34 };

export function getHeight(x: number, z: number) {
  let h = vnoise(x * 0.022 + 50, z * 0.022 + 50) * 9 + vnoise(x * 0.07, z * 0.07) * 2.2;
  // flatten around each zone so landmarks sit on a neat plaza
  for (const zn of ZONES) {
    const d = Math.hypot(x - zn.x, z - zn.z);
    if (d < 14) {
      const t = Math.min(1, d / 14);
      const zoneH = vnoise(zn.x * 0.022 + 50, zn.z * 0.022 + 50) * 9;
      h = h * t * t + zoneH * (1 - t * t);
    }
  }
  // flat plaza for the sky temple
  {
    const d = Math.hypot(x - TEMPLE.x, z - TEMPLE.z);
    if (d < 18) {
      const t = Math.min(1, d / 18);
      const th = vnoise(TEMPLE.x * 0.022 + 50, TEMPLE.z * 0.022 + 50) * 9;
      h = h * t * t + th * (1 - t * t);
    }
  }
  // steep ring of mountains so you can never see off the island
  const edge = Math.hypot(x, z) / (WORLD_SIZE / 2);
  h += Math.max(0, edge - 0.72) * 85;
  return h;
}

/* Temple ziggurat height — stairs + tiers the player can climb. */
const TIER_H = 1.5;
const TIER_SIZES = [10, 8, 6, 4.2];
function templeHeight(x: number, z: number) {
  const dx = x - TEMPLE.x, dz = z - TEMPLE.z;
  const ax = Math.abs(dx), az = Math.abs(dz);
  if (ax > 13 || az > 13) return 0;
  let h = 0;
  // stair ramp on the south (+z) face
  if (ax < 2.4 && dz > 3.2 && dz < 12.5) {
    h = ((12.5 - dz) / (12.5 - 3.2)) * TIER_H * TIER_SIZES.length;
  }
  // stacked tiers
  for (let k = 0; k < TIER_SIZES.length; k++) {
    if (ax < TIER_SIZES[k] && az < TIER_SIZES[k]) h = Math.max(h, TIER_H * (k + 1));
  }
  return h;
}

/** What the player actually stands on: terrain + climbable structures. */
export function getGroundY(x: number, z: number) {
  const base = getHeight(x, z);
  const t = templeHeight(x, z);
  return t > 0 ? getHeight(TEMPLE.x, TEMPLE.z) + t : base;
}

/* ------------------------------------------------------------------ */
/* Terrain mesh with painted vertex colors                             */
/* ------------------------------------------------------------------ */
function Terrain({ onGround }: { onGround: (e: ThreeEvent<PointerEvent>) => void }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 110, 110);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const grass = new THREE.Color("#58b95c");
    const grass2 = new THREE.Color("#8ed86b");
    const grass3 = new THREE.Color("#6fca62");
    const sand = new THREE.Color("#eed892");
    const rock = new THREE.Color("#8d8577");
    const snow = new THREE.Color("#f4f6ff");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = getHeight(x, z);
      pos.setY(i, h);
      if (h < 1.6) c.copy(sand);
      else if (h < 12.5) {
        // greens everywhere in the playfield
        const n = vnoise(x * 0.15, z * 0.15);
        c.lerpColors(grass, n > 0.5 ? grass2 : grass3, n);
      } else if (h < 17) c.copy(rock);
      else c.copy(snow);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} onPointerDown={onGround} receiveShadow name="terrain">
      <meshStandardMaterial vertexColors flatShading roughness={1} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Scattered props: trees, rocks, mushrooms                            */
/* ------------------------------------------------------------------ */
const BUILDING_SPOTS = [
  { x: 14, z: -16 }, { x: -18, z: -12 }, { x: 20, z: 10 }, { x: -14, z: 20 },
];

/* Precomputed circle colliders for trees + buildings */
function buildColliders() {
  const coll: { x: number; z: number; r: number }[] = [];
  let i = 0, count = 0;
  while (count < 90 && i < 800) {
    i++;
    const x = (hash(i, 3) - 0.5) * (WORLD_SIZE - 24);
    const z = (hash(i, 7) - 0.5) * (WORLD_SIZE - 24);
    if (Math.hypot(x, z) < 18) continue; // central temple clearing
    if (ZONES.some((zn) => Math.hypot(x - zn.x, z - zn.z) < 12)) continue;
    if (BUILDING_SPOTS.some((b) => Math.hypot(x - b.x, z - b.z) < 8)) continue;
    if (Math.hypot(x - GOAL.x, z - GOAL.z) < 9) continue;
    const h = getHeight(x, z);
    if (h < 1.8 || h > 11) continue;
    count++;
    const kind = Math.floor(hash(i, 11) * 3);
    const s = 0.7 + hash(i, 13) * 0.9;
    if (kind === 0) coll.push({ x, z, r: Math.max(0.5, 0.55 * s) }); // tree trunk
  }
  // cottages + windmill
  coll.push({ x: 14, z: -16, r: 2.4 });
  coll.push({ x: -18, z: -12, r: 2.4 });
  coll.push({ x: 20, z: 10, r: 2.4 });
  coll.push({ x: -14, z: 20, r: 2.4 });
  return coll;
}
const COLLIDERS = buildColliders();

function Props() {
  const items = useMemo(() => {
    const out: { kind: number; x: number; z: number; s: number; r: number; tint: number }[] = [];
    let i = 0;
    while (out.length < 90 && i < 800) {
      i++;
      const x = (hash(i, 3) - 0.5) * (WORLD_SIZE - 24);
      const z = (hash(i, 7) - 0.5) * (WORLD_SIZE - 24);
      if (Math.hypot(x, z) < 18) continue; // central temple clearing
      if (ZONES.some((zn) => Math.hypot(x - zn.x, z - zn.z) < 12)) continue;
      if (BUILDING_SPOTS.some((b) => Math.hypot(x - b.x, z - b.z) < 8)) continue;
      if (Math.hypot(x - GOAL.x, z - GOAL.z) < 9) continue;
      const h = getHeight(x, z);
      if (h < 1.8 || h > 11) continue;
      out.push({ kind: Math.floor(hash(i, 11) * 3), x, z, s: 0.7 + hash(i, 13) * 0.9, r: hash(i, 17) * Math.PI * 2, tint: hash(i, 19) });
    }
    return out;
  }, []);

  return (
    <group>
      {items.map((it, i) => {
        const y = getHeight(it.x, it.z);
        if (it.kind === 0) {
          const leaf = it.tint > 0.5 ? "#4ea94e" : "#67c257";
          return (
            <group key={i} position={[it.x, y, it.z]} scale={it.s} rotation-y={it.r}>
              <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.28, 0.4, 2, 6]} />
                <meshStandardMaterial color="#8a5a34" flatShading />
              </mesh>
              <mesh position={[0, 2.8, 0]} castShadow>
                <coneGeometry args={[1.6, 2.6, 7]} />
                <meshStandardMaterial color={leaf} flatShading />
              </mesh>
              <mesh position={[0, 4.2, 0]} castShadow>
                <coneGeometry args={[1.1, 1.9, 7]} />
                <meshStandardMaterial color={it.tint > 0.5 ? "#5fbf60" : "#7ad168"} flatShading />
              </mesh>
            </group>
          );
        }
        if (it.kind === 1) {
          return (
            <mesh key={i} position={[it.x, y + 0.3 * it.s, it.z]} scale={it.s * 0.8} rotation-y={it.r} castShadow>
              <dodecahedronGeometry args={[0.9, 0]} />
              <meshStandardMaterial color="#9aa387" flatShading />
            </mesh>
          );
        }
        return (
          <group key={i} position={[it.x, y, it.z]} scale={it.s * 0.5} rotation-y={it.r}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.22, 0.3, 0.8, 6]} />
              <meshStandardMaterial color="#f2e7cf" flatShading />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <sphereGeometry args={[0.6, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={it.tint > 0.5 ? "#ff6b6b" : "#c77dff"} flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Buildings: cottages + windmill                                      */
/* ------------------------------------------------------------------ */
function Cottage({ x, z, hue, rot }: { x: number; z: number; hue: string; rot: number }) {
  const y = getHeight(x, z);
  return (
    <group position={[x, y, z]} rotation-y={rot}>
      {/* walls */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[3.4, 2.8, 3]} />
        <meshStandardMaterial color="#f4e5c3" flatShading />
      </mesh>
      {/* timber corners */}
      {[[-1.7, -1.5], [1.7, -1.5], [-1.7, 1.5], [1.7, 1.5]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx, 1.4, bz]}>
          <boxGeometry args={[0.25, 2.8, 0.25]} />
          <meshStandardMaterial color="#7a4a24" flatShading />
        </mesh>
      ))}
      {/* roof */}
      <mesh position={[0, 3.6, 0]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[3, 1.9, 4]} />
        <meshStandardMaterial color={hue} flatShading />
      </mesh>
      {/* door */}
      <mesh position={[0, 0.85, 1.52]}>
        <boxGeometry args={[0.9, 1.7, 0.1]} />
        <meshStandardMaterial color="#6b3f1d" flatShading />
      </mesh>
      {/* windows — warm glow */}
      {[-1.1, 1.1].map((wx) => (
        <mesh key={wx} position={[wx, 1.7, 1.52]}>
          <boxGeometry args={[0.6, 0.6, 0.08]} />
          <meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* chimney */}
      <mesh position={[1, 3.9, -0.6]}>
        <boxGeometry args={[0.5, 1.4, 0.5]} />
        <meshStandardMaterial color="#9b8b8b" flatShading />
      </mesh>
    </group>
  );
}

function Windmill({ x, z }: { x: number; z: number }) {
  const blades = useRef<THREE.Group>(null);
  const y = getHeight(x, z);
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 0.9;
  });
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[1.6, 2.2, 6, 8]} />
        <meshStandardMaterial color="#e8dcc0" flatShading />
      </mesh>
      <mesh position={[0, 6.6, 0]} castShadow>
        <coneGeometry args={[2, 1.8, 8]} />
        <meshStandardMaterial color="#c1543f" flatShading />
      </mesh>
      <mesh position={[0, 4.6, 1.9]}>
        <boxGeometry args={[0.5, 0.5, 0.9]} />
        <meshStandardMaterial color="#7a4a24" flatShading />
      </mesh>
      <group ref={blades} position={[0, 4.6, 2.5]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation-z={(i * Math.PI) / 2} position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.35, 4.6, 0.08]} />
            <meshStandardMaterial color="#f4e5c3" flatShading transparent opacity={0.95} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.35, 8, 6]} />
          <meshStandardMaterial color="#7a4a24" flatShading />
        </mesh>
      </group>
    </group>
  );
}

function Buildings() {
  return (
    <group>
      <Cottage x={14} z={-16} hue="#c1543f" rot={0.4} />
      <Cottage x={-18} z={-12} hue="#5f7fbf" rot={-0.8} />
      <Cottage x={20} z={10} hue="#7a9b4f" rot={2.2} />
      <Windmill x={-14} z={20} />
      <Temple />
      <Goalpost />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Football goal — push the ball through the posts for confetti       */
/* ------------------------------------------------------------------ */
function Goalpost() {
  const y = getHeight(GOAL.x, GOAL.z);
  return (
    <group position={[GOAL.x, y, GOAL.z]}>
      {[-2.4, 2.4].map((ox, i) => (
        <mesh key={i} position={[ox, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 3.2, 8]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[5, 0.22, 0.22]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
      <mesh position={[0, 1.6, -0.45]}>
        <boxGeometry args={[4.8, 3.0, 0.05]} />
        <meshStandardMaterial color="#dfe9f0" transparent opacity={0.3} />
      </mesh>
      <Html center position={[0, 4, 0]} distanceFactor={40} occlude={false} zIndexRange={[20, 0]}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 12,
            letterSpacing: "0.1em",
            color: "#fff",
            background: "rgba(20,16,40,0.75)",
            border: "2px solid #ffd166",
            borderRadius: 10,
            padding: "4px 12px",
            whiteSpace: "nowrap",
            textShadow: "0 1px 3px rgba(0,0,0,0.6)",
          }}
        >
          ⚽ PUSH THE BALL IN FOR A GOAL
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Sky Temple — climbable ziggurat; geometry mirrors templeHeight()    */
/* ------------------------------------------------------------------ */
function Temple() {
  const baseY = getHeight(TEMPLE.x, TEMPLE.z);
  const topY = TIER_H * TIER_SIZES.length;

  return (
    <group position={[TEMPLE.x, baseY, TEMPLE.z]}>
      {/* stacked stone tiers */}
      {TIER_SIZES.map((s, k) => (
        <mesh key={k} position={[0, TIER_H * k + TIER_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[s * 2, TIER_H, s * 2]} />
          <meshStandardMaterial color={k % 2 ? "#b8ad98" : "#cbc0a8"} flatShading />
        </mesh>
      ))}
      {/* grand staircase (visual — walkable via templeHeight ramp) */}
      {Array.from({ length: 12 }, (_, i) => {
        const t = i / 12;
        const z = 12.5 - t * (12.5 - 3.2);
        return (
          <mesh key={`s${i}`} position={[0, t * topY - 0.15, z]} receiveShadow>
            <boxGeometry args={[4.8, 0.3, 0.95]} />
            <meshStandardMaterial color="#d8cdb4" flatShading />
          </mesh>
        );
      })}
      {/* corner pillars on top */}
      {[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([px, pz], i) => (
        <group key={`p${i}`} position={[px, topY, pz]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.45, 2.4, 8]} />
            <meshStandardMaterial color="#e0d6be" flatShading />
          </mesh>
          <mesh position={[0, 2.55, 0]}>
            <boxGeometry args={[1, 0.3, 1]} />
            <meshStandardMaterial color="#c9bda0" flatShading />
          </mesh>
        </group>
      ))}
      <pointLight color="#ffd166" intensity={26} distance={18} position={[0, topY + 4, 0]} />
      <Sparkles count={14} scale={[7, 6, 7]} position={[0, topY + 3, 0]} size={4} speed={0.4} color="#ffd166" />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Giant pushable ball — starts on the temple summit, rolls downhill   */
/* ------------------------------------------------------------------ */
const BALL_R = 1.6;

function ballSpawn() {
  return {
    x: TEMPLE.x,
    z: TEMPLE.z,
    y: getHeight(TEMPLE.x, TEMPLE.z) + TIER_H * TIER_SIZES.length + BALL_R,
    vx: 0, vz: 0, vy: 0,
  };
}

function PushBall() {
  const mesh = useRef<THREE.Mesh>(null);
  const p = useRef(ballSpawn());
  const scored = useRef(false);

  useFrame((_, dt) => {
    const dtc = Math.min(dt, 0.05);
    const b = p.current;

    // player (or cart) shoves the ball
    const pushR = (worldState.riding ? 2 : 1.1) + BALL_R;
    const pdx = b.x - worldState.x, pdz = b.z - worldState.z;
    const pd = Math.hypot(pdx, pdz);
    if (pd < pushR && pd > 0.01) {
      const f = ((pushR - pd) / pushR) * (worldState.riding ? 34 : 18);
      b.vx += (pdx / pd) * f * dtc * 6;
      b.vz += (pdz / pd) * f * dtc * 6;
    }

    // roll downhill along the ground gradient
    const e = 0.6;
    const gx = (getGroundY(b.x + e, b.z) - getGroundY(b.x - e, b.z)) / (2 * e);
    const gz = (getGroundY(b.x, b.z + e) - getGroundY(b.x, b.z - e)) / (2 * e);
    b.vx -= gx * 14 * dtc;
    b.vz -= gz * 14 * dtc;

    // rolling friction + integrate
    const fr = Math.pow(0.45, dtc);
    b.vx *= fr; b.vz *= fr;
    b.x += b.vx * dtc;
    b.z += b.vz * dtc;

    // trees & buildings bounce the ball
    for (const col of COLLIDERS) {
      const dx = b.x - col.x, dz = b.z - col.z;
      const dist = Math.hypot(dx, dz);
      const minD = col.r + BALL_R;
      if (dist < minD && dist > 0.001) {
        const push = (minD - dist) / dist;
        b.x += dx * push;
        b.z += dz * push;
        // reflect velocity for a playful bounce
        const nx = dx / dist, nz = dz / dist;
        const dot = b.vx * nx + b.vz * nz;
        if (dot < 0) { b.vx -= 1.6 * dot * nx; b.vz -= 1.6 * dot * nz; }
      }
    }

    // keep on the island
    const lim = WORLD_SIZE / 2 - 10;
    b.x = Math.max(-lim, Math.min(lim, b.x));
    b.z = Math.max(-lim, Math.min(lim, b.z));

    // score check — ball settled inside the goal mouth
    const gd = Math.hypot(b.x - GOAL.x, b.z - GOAL.z);
    if (!scored.current && gd < 2.3) {
      scored.current = true;
      window.dispatchEvent(new CustomEvent("goal-scored"));
      sound.unlock();
      const fresh = ballSpawn();
      Object.assign(b, fresh);
    } else if (gd > 6) {
      scored.current = false;
    }

    // vertical: fall with gravity, land on ground/temple tiers
    const groundY = getGroundY(b.x, b.z) + BALL_R;
    if (b.y > groundY + 0.02) {
      b.vy -= 30 * dtc;
      b.y = Math.max(groundY, b.y + b.vy * dtc);
      if (b.y === groundY) b.vy = 0;
    } else {
      b.y = groundY;
      b.vy = 0;
    }

    if (mesh.current) {
      mesh.current.position.set(b.x, b.y, b.z);
      // spin to match travel
      mesh.current.rotation.x += (b.vz * dtc) / BALL_R;
      mesh.current.rotation.z -= (b.vx * dtc) / BALL_R;
    }
  });

  return (
    <mesh ref={mesh} castShadow>
      <sphereGeometry args={[BALL_R, 18, 14]} />
      <meshStandardMaterial color="#ff70a6" emissive="#ff70a6" emissiveIntensity={0.25} flatShading />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Rideable cart                                                       */
/* ------------------------------------------------------------------ */
function Cart() {
  const group = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  useFrame((_, dt) => {
    if (!group.current) return;
    const y = getGroundY(worldState.cartX, worldState.cartZ);
    group.current.position.set(worldState.cartX, y + 0.55, worldState.cartZ);
    if (worldState.riding) {
      // smooth cart rotation
      const target = worldState.rot + Math.PI;
      let diff = target - group.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      group.current.rotation.y += diff * Math.min(1, dt * 8);
      wheels.current.forEach((w) => w && (w.rotation.x += dt * 9));
    }
  });
  return (
    <group ref={group}>
      {/* body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.7, 0.6, 2.6]} />
        <meshStandardMaterial color="#a3622f" flatShading />
      </mesh>
      <mesh position={[0, 0.95, -1.1]}>
        <boxGeometry args={[1.7, 0.7, 0.2]} />
        <meshStandardMaterial color="#8a5a34" flatShading />
      </mesh>
      {/* wheels */}
      {[[-0.95, 0.9], [0.95, 0.9], [-0.95, -0.9], [0.95, -0.9]].map(([wx, wz], i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) wheels.current[i] = el; }}
          position={[wx, 0.45, wz]}
          rotation-z={Math.PI / 2}
          castShadow
        >
          <cylinderGeometry args={[0.45, 0.45, 0.18, 10]} />
          <meshStandardMaterial color="#5c3a1e" flatShading />
        </mesh>
      ))}
      {/* magic engine crystal — it's a self-driving fantasy cart */}
      <mesh position={[0, 1.1, 1]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#7cf3c8" emissive="#7cf3c8" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* ANEES MUHAMMAD — pushable 3D letters near spawn                     */
/* ------------------------------------------------------------------ */
const NAME = "ANEES MUHAMMAD";
const LETTER_COLORS = ["#ff70a6", "#ffb703", "#7cf3c8", "#6ec6ff", "#c77dff"];

function NameLetters() {
  const letters = useMemo(() => {
    const out: { ch: string; x: number; z: number; c: string }[] = [];
    const chars = NAME.split("");
    const spacing = 1.7;
    const width = (chars.length - 1) * spacing;
    let ci = 0;
    chars.forEach((ch, i) => {
      if (ch === " ") return;
      out.push({
        ch,
        x: -width / 2 + i * spacing,
        z: 17,
        c: LETTER_COLORS[ci++ % LETTER_COLORS.length],
      });
    });
    return out;
  }, []);

  // simple arcade physics per letter: position, velocity, spin
  const phys = useRef(
    letters.map((l) => ({ x: l.x, z: l.z, vx: 0, vz: 0, ry: 0 }))
  );
  const refs = useRef<THREE.Group[]>([]);

  useFrame((_, dt) => {
    const dtc = Math.min(dt, 0.05);
    const pushR = worldState.riding ? 2.2 : 1.3;
    for (let i = 0; i < letters.length; i++) {
      const p = phys.current[i];
      // player shoves the letter
      const dx = p.x - worldState.x, dz = p.z - worldState.z;
      const d = Math.hypot(dx, dz);
      if (d < pushR && d > 0.01) {
        const f = ((pushR - d) / pushR) * (worldState.riding ? 26 : 14);
        p.vx += (dx / d) * f * dtc * 8;
        p.vz += (dz / d) * f * dtc * 8;
        p.ry += (dx > 0 ? 1 : -1) * f * dtc * 0.5;
      }
      // friction + integrate
      const fr = Math.pow(0.14, dtc);
      p.vx *= fr; p.vz *= fr; p.ry *= fr;
      p.x += p.vx * dtc;
      p.z += p.vz * dtc;
      // keep letters inside the island
      const lim = WORLD_SIZE / 2 - 10;
      p.x = Math.max(-lim, Math.min(lim, p.x));
      p.z = Math.max(-lim, Math.min(lim, p.z));
      const g = refs.current[i];
      if (g) {
        g.position.set(p.x, getGroundY(p.x, p.z), p.z);
        g.rotation.y = p.ry;
      }
    }
  });

  return (
    <group>
      {letters.map((l, i) => (
        <group key={i} ref={(el) => { if (el) refs.current[i] = el; }} position={[l.x, getGroundY(l.x, l.z), l.z]}>
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={1.5}
            height={0.55}
            bevelEnabled
            bevelSize={0.04}
            bevelThickness={0.04}
            position={[-0.65, 0.05, -0.28]}
            castShadow
          >
            {l.ch}
            <meshStandardMaterial color={l.c} flatShading />
          </Text3D>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Collectible gems                                                    */
/* ------------------------------------------------------------------ */
const GEM_COLORS = ["#ffd166", "#7cf3c8", "#c77dff", "#ff70a6", "#6ec6ff"];

function Gems() {
  const spots = useMemo(() => {
    const out: { x: number; z: number; c: string; baseY: number }[] = [];
    let i = 0;
    while (out.length < 24 && i < 600) {
      i++;
      const x = (hash(i, 51) - 0.5) * (WORLD_SIZE - 50);
      const z = (hash(i, 57) - 0.5) * (WORLD_SIZE - 50);
      const h = getHeight(x, z);
      if (h < 1.8 || h > 10) continue;
      // never hide a gem inside a zone plaza, building, or the temple
      if (ZONES.some((zn) => Math.hypot(x - zn.x, z - zn.z) < 8)) continue;
      if (BUILDING_SPOTS.some((b) => Math.hypot(x - b.x, z - b.z) < 5)) continue;
      if (Math.hypot(x - TEMPLE.x, z - TEMPLE.z) < 15) continue;
      if (Math.hypot(x - GOAL.x, z - GOAL.z) < 9) continue;
      out.push({ x, z, c: GEM_COLORS[out.length % GEM_COLORS.length], baseY: h });
    }
    // share with the minimap
    worldState.gemSpots = out.map(({ x, z }) => ({ x, z }));
    worldState.gemTaken = new Array(out.length).fill(false);
    return out;
  }, []);

  const taken = useRef<boolean[]>(new Array(spots.length).fill(false));
  const gemRefs = useRef<THREE.Group[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < spots.length; i++) {
      if (taken.current[i]) continue;
      const g = gemRefs.current[i];
      if (g) {
        g.rotation.y = t * 2 + i;
        g.position.y = spots[i].baseY + 1 + Math.sin(t * 2.5 + i) * 0.25;
      }
      const dx = worldState.x - spots[i].x, dz = worldState.z - spots[i].z;
      if (dx * dx + dz * dz < 3.5) {
        // ref mutation only — no React re-render, no frame hitch
        taken.current[i] = true;
        worldState.gemTaken[i] = true;
        if (g) g.visible = false;
        worldState.gems++;
        window.dispatchEvent(new CustomEvent("gem-collected", { detail: worldState.gems }));
        sound.unlock();
      }
    }
  });

  return (
    <group>
      {spots.map((s, i) => (
        <group
          key={i}
          ref={(el) => { if (el) gemRefs.current[i] = el; }}
          position={[s.x, s.baseY + 1, s.z]}
        >
          <mesh>
            <octahedronGeometry args={[0.45, 0]} />
            <meshStandardMaterial color={s.c} emissive={s.c} emissiveIntensity={1.3} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Zone landmark: floating crystal + beam + label                      */
/* ------------------------------------------------------------------ */
function ZoneMarker({ zone, onZoneClick }: { zone: Zone; onZoneClick: (id: string) => void }) {
  const crystal = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const y = getHeight(zone.x, zone.z);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (crystal.current) {
      crystal.current.position.y = 3.4 + Math.sin(t * 1.4 + zone.x) * 0.4;
      crystal.current.rotation.y = t * 0.8;
      // fireball impact reaction — quick decaying shake/scale pulse
      const hitAt = worldState.hitZones[zone.id];
      const age = hitAt ? performance.now() - hitAt : Infinity;
      const shake = age < 350 ? (1 - age / 350) * 0.4 * Math.sin(age * 0.09) : 0;
      crystal.current.scale.set(1 + shake, 1.7 + shake, 1 + shake);
    }
    if (ring.current) ring.current.rotation.z = t * 0.5;
  });

  return (
    <group position={[zone.x, y, zone.z]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[4.4, 5, 0.35, 8]} />
        <meshStandardMaterial color="#cbb9e8" flatShading />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 3.6, 1, Math.sin(a) * 3.6]} castShadow>
            <boxGeometry args={[0.7, 2 + (i % 2) * 0.7, 0.7]} />
            <meshStandardMaterial color="#b3a6cf" flatShading />
          </mesh>
        );
      })}
      <mesh
        ref={crystal}
        name={`crystal-${zone.id}`}
        userData={{ zoneId: zone.id }}
        position={[0, 3.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onZoneClick(zone.id);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
          sound.hover();
        }}
        onPointerOut={() => (document.body.style.cursor = "")}
        castShadow
      >
        <octahedronGeometry args={[1.15, 0]} />
        <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.55} flatShading transparent opacity={0.95} />
      </mesh>
      <mesh ref={ring} position={[0, 3.4, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.9, 0.06, 6, 32]} />
        <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[0.25, 1.1, 14, 8, 1, true]} />
        <meshBasicMaterial color={zone.color} transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight color={zone.color} intensity={30} distance={16} position={[0, 4, 0]} />
      <Sparkles count={16} scale={[6, 5, 6]} position={[0, 3, 0]} size={4} speed={0.4} color={zone.color} />
      <Html center position={[0, 7.2, 0]} distanceFactor={45} occlude={false} zIndexRange={[20, 0]}>
        <div
          onClick={() => onZoneClick(zone.id)}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            letterSpacing: "0.15em",
            color: "#fff",
            background: "rgba(30,22,58,0.75)",
            border: `2px solid ${zone.color}`,
            borderRadius: 12,
            padding: "6px 14px",
            whiteSpace: "nowrap",
            cursor: "pointer",
            textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            boxShadow: `0 0 18px ${zone.color}66`,
          }}
        >
          {zone.emoji} {zone.label.toUpperCase()}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The adventurer — animated limbs, jump, camera-relative movement     */
/* ------------------------------------------------------------------ */
function Player({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const hat = useRef<THREE.Mesh>(null);
  const walk = useRef(0);

  // priority -1: runs before the Cart's frame callback so the cart never
  // reads a stale player position (that one-frame lag caused visible jitter)
  useFrame(({ camera, clock }, dt) => {
    if (!group.current) return;
    const dtc = Math.min(dt, 0.05);
    const speed = worldState.riding ? CART_SPEED : SPEED;

    // camera-relative input
    let fwd = 0, strafe = 0;
    if (active) {
      const k = worldState.keys;
      if (k.has("w") || k.has("arrowup")) fwd += 1;
      if (k.has("s") || k.has("arrowdown")) fwd -= 1;
      if (k.has("d") || k.has("arrowright")) strafe += 1;
      if (k.has("a") || k.has("arrowleft")) strafe -= 1;
    }
    const yaw = worldState.camYaw;
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    const rx = Math.cos(yaw), rz = -Math.sin(yaw);

    let moving = false;
    let mx = fx * fwd + rx * strafe;
    let mz = fz * fwd + rz * strafe;
    if (mx !== 0 || mz !== 0) {
      worldState.target = null;
      const len = Math.hypot(mx, mz);
      mx /= len; mz /= len;
      worldState.x += mx * speed * dtc;
      worldState.z += mz * speed * dtc;
      worldState.rot = Math.atan2(mx, mz);
      moving = true;
    } else if (worldState.target && active) {
      const tx = worldState.target.x - worldState.x;
      const tz = worldState.target.z - worldState.z;
      const d = Math.hypot(tx, tz);
      if (d > 0.6) {
        worldState.x += (tx / d) * speed * dtc;
        worldState.z += (tz / d) * speed * dtc;
        worldState.rot = Math.atan2(tx, tz);
        moving = true;
      } else {
        worldState.target = null;
      }
    }

    // jump physics
    if (active && worldState.keys.has(" ") && worldState.jumpY === 0 && !worldState.riding) {
      worldState.jumpVel = 9;
      sound.hover();
    }
    if (worldState.jumpY > 0 || worldState.jumpVel > 0) {
      worldState.jumpVel -= 28 * dtc;
      worldState.jumpY = Math.max(0, worldState.jumpY + worldState.jumpVel * dtc);
      if (worldState.jumpY === 0) worldState.jumpVel = 0;
    }

    // clamp to world
    const lim = WORLD_SIZE / 2 - 6;
    worldState.x = Math.max(-lim, Math.min(lim, worldState.x));
    worldState.z = Math.max(-lim, Math.min(lim, worldState.z));

    // push out of tree/building colliders (cart is wider than the player)
    const PR = worldState.riding ? 1.3 : 0.5;
    for (const col of COLLIDERS) {
      const dx = worldState.x - col.x;
      const dz = worldState.z - col.z;
      const dist = Math.hypot(dx, dz);
      const minDist = col.r + PR;
      if (dist < minDist && dist > 0.001) {
        const push = (minDist - dist) / dist;
        worldState.x += dx * push;
        worldState.z += dz * push;
      }
    }
    // the parked cart is solid too
    if (!worldState.riding) {
      const dx = worldState.x - worldState.cartX;
      const dz = worldState.z - worldState.cartZ;
      const dist = Math.hypot(dx, dz);
      const minDist = 1.7;
      if (dist < minDist && dist > 0.001) {
        const push = (minDist - dist) / dist;
        worldState.x += dx * push;
        worldState.z += dz * push;
      }
    }

    // cart follows while riding
    if (worldState.riding) {
      worldState.cartX = worldState.x;
      worldState.cartZ = worldState.z;
    }

    const groundY = getGroundY(worldState.x, worldState.z);
    const rideY = worldState.riding ? 1.1 : 0;
    group.current.position.set(worldState.x, groundY + worldState.jumpY + rideY, worldState.z);

    // smooth shortest-arc rotation
    let diff = worldState.rot - group.current.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    group.current.rotation.y += diff * Math.min(1, dtc * 10);

    // ---- animation ----
    const t = clock.elapsedTime;
    // freeze walk cycle while riding
    if (worldState.riding) moving = false;
    walk.current += (moving ? 10 : 0) * dtc;
    const w = walk.current;
    const idle = Math.sin(t * 2) * 0.03;
    if (body.current) {
      body.current.position.y =
        0.9 + (moving ? Math.abs(Math.sin(w)) * 0.14 : idle) + (worldState.jumpY > 0 ? 0.1 : 0);
      body.current.rotation.x = moving ? Math.sin(w * 2) * 0.05 : 0;
    }
    const swing = worldState.jumpY > 0 ? 2.4 : moving ? Math.sin(w) : Math.sin(t * 2) * 0.06;
    if (armL.current) armL.current.rotation.x = worldState.jumpY > 0 ? -2.4 : swing * 0.7;
    if (armR.current) armR.current.rotation.x = worldState.jumpY > 0 ? -2.4 : -swing * 0.7;
    if (legL.current) legL.current.rotation.x = worldState.riding ? -1.4 : -swing * 0.8;
    if (legR.current) legR.current.rotation.x = worldState.riding ? -1.4 : swing * 0.8;
    if (hat.current) hat.current.rotation.z = 0.12 + (moving ? Math.sin(w) * 0.06 : idle);

    // ---- camera: orbit yaw from mouse look ----
    const camDist = worldState.riding ? 17 : 13;
    const camH = 9 + worldState.camPitch;
    const cx = worldState.x + Math.sin(yaw) * camDist;
    const cz = worldState.z + Math.cos(yaw) * camDist;
    const cy = Math.max(groundY + camH, getGroundY(cx, cz) + 3);
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dtc * 4));
    camera.lookAt(worldState.x, groundY + 2 + worldState.jumpY, worldState.z);
  }, -1);

  return (
    <group ref={group}>
      <group ref={body} position={[0, 0.9, 0]}>
        {/* tunic */}
        <mesh castShadow>
          <capsuleGeometry args={[0.42, 0.6, 4, 8]} />
          <meshStandardMaterial color="#4f83e0" flatShading />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.14, 10]} />
          <meshStandardMaterial color="#7a4a24" flatShading />
        </mesh>
        {/* head */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <sphereGeometry args={[0.38, 12, 10]} />
          <meshStandardMaterial color="#ffd9b3" flatShading />
        </mesh>
        {/* hat */}
        <mesh ref={hat} position={[0, 1.25, 0]} castShadow>
          <coneGeometry args={[0.45, 0.9, 8]} />
          <meshStandardMaterial color="#8b5cf6" flatShading />
        </mesh>
        <mesh position={[0, 0.99, 0]}>
          <torusGeometry args={[0.44, 0.09, 6, 12]} />
          <meshStandardMaterial color="#8b5cf6" flatShading />
        </mesh>
        {/* eyes */}
        <mesh position={[0.14, 0.95, 0.32]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[-0.14, 0.95, 0.32]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* arms */}
        <group ref={armL} position={[-0.5, 0.25, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.11, 0.45, 3, 6]} />
            <meshStandardMaterial color="#4f83e0" flatShading />
          </mesh>
          <mesh position={[0, -0.62, 0]}>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshStandardMaterial color="#ffd9b3" flatShading />
          </mesh>
        </group>
        <group ref={armR} position={[0.5, 0.25, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.11, 0.45, 3, 6]} />
            <meshStandardMaterial color="#4f83e0" flatShading />
          </mesh>
          {/* staff in right hand */}
          <group position={[0, -0.62, 0.1]}>
            <mesh position={[0, 0.35, 0]} rotation-x={0.2}>
              <cylinderGeometry args={[0.05, 0.05, 1.7, 6]} />
              <meshStandardMaterial color="#8a5a34" flatShading />
            </mesh>
            <mesh position={[0, 1.25, 0.16]}>
              <octahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial color="#7cf3c8" emissive="#7cf3c8" emissiveIntensity={1.4} />
            </mesh>
          </group>
        </group>
        {/* legs */}
        <mesh ref={legL} position={[-0.2, -0.62, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.4, 3, 6]} />
          <meshStandardMaterial color="#3a5a8f" flatShading />
        </mesh>
        <mesh ref={legR} position={[0.2, -0.62, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.4, 3, 6]} />
          <meshStandardMaterial color="#3a5a8f" flatShading />
        </mesh>
      </group>
      {/* blob shadow */}
      <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Proximity watcher → nearest zone or cart                            */
/* ------------------------------------------------------------------ */
function ProximitySensor({ onNear }: { onNear: (id: string | null) => void }) {
  const last = useRef<string | null>(null);
  useFrame(() => {
    let found: string | null = null;
    if (!worldState.riding && Math.hypot(worldState.x - worldState.cartX, worldState.z - worldState.cartZ) < 4) {
      found = "__cart";
    } else if (worldState.riding) {
      found = "__cart_riding";
    }
    if (!found) {
      for (const z of ZONES) {
        if (Math.hypot(worldState.x - z.x, worldState.z - z.z) < INTERACT_RADIUS) {
          found = z.id;
          break;
        }
      }
    }
    if (found !== last.current) {
      last.current = found;
      if (found && !found.startsWith("__cart_r")) sound.hover();
      onNear(found);
    }
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Combat — click-to-cast fireballs at zone "enemies", pooled meshes   */
/* ------------------------------------------------------------------ */
export type CombatHandle = { fireAt: (zone: Zone) => void };
const FIRE_POOL = 6;

const Combat = forwardRef<CombatHandle>(function Combat(_props, ref) {
  const slots = useRef(
    Array.from({ length: FIRE_POOL }, () => ({
      active: false,
      x: 0, y: 0, z: 0,
      tx: 0, ty: 0, tz: 0,
      t: 0, dur: 0.5,
      zoneId: "",
    }))
  );
  const meshRefs = useRef<THREE.Mesh[]>([]);

  useImperativeHandle(ref, () => ({
    fireAt(zone: Zone) {
      const slot = slots.current.find((s) => !s.active) ?? slots.current[0];
      slot.active = true;
      slot.x = worldState.x;
      slot.y = getGroundY(worldState.x, worldState.z) + 1.6;
      slot.z = worldState.z;
      slot.tx = zone.x;
      slot.ty = getHeight(zone.x, zone.z) + 3.4;
      slot.tz = zone.z;
      slot.t = 0;
      slot.dur = 0.45;
      slot.zoneId = zone.id;
    },
  }), []);

  useFrame((_, dt) => {
    slots.current.forEach((s, i) => {
      const m = meshRefs.current[i];
      if (!s.active) {
        if (m) m.visible = false;
        return;
      }
      s.t += dt;
      const p = Math.min(1, s.t / s.dur);
      if (m) {
        m.visible = true;
        m.position.set(
          THREE.MathUtils.lerp(s.x, s.tx, p),
          THREE.MathUtils.lerp(s.y, s.ty, p) + Math.sin(p * Math.PI) * 2.2,
          THREE.MathUtils.lerp(s.z, s.tz, p)
        );
        m.rotation.y += dt * 22;
        m.rotation.x += dt * 14;
      }
      if (p >= 1) {
        s.active = false;
        worldState.hitZones[s.zoneId] = performance.now();
      }
    });
  });

  return (
    <group>
      {slots.current.map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) meshRefs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshStandardMaterial color="#ff5c33" emissive="#ff7b00" emissiveIntensity={2.4} flatShading />
        </mesh>
      ))}
    </group>
  );
});

/** Finds the zone crystal roughly centered in the camera's view — the "auto-lock" target. */
function findLockTarget(camera: THREE.Camera): Zone | null {
  const fwd = new THREE.Vector3();
  camera.getWorldDirection(fwd);
  let best: Zone | null = null;
  let bestScore = 0.86;
  for (const z of ZONES) {
    const zy = getHeight(z.x, z.z) + 3.4;
    const dir = new THREE.Vector3(z.x - camera.position.x, zy - camera.position.y, z.z - camera.position.z);
    const dist = dir.length();
    if (dist > 60 || dist < 0.1) continue;
    dir.normalize();
    const score = dir.dot(fwd);
    if (score > bestScore) {
      bestScore = score;
      best = z;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Pointer-lock third-person mouse look + click routing                */
/* ------------------------------------------------------------------ */
function MouseLook({
  active,
  onZoneClick,
  onFire,
}: {
  active: boolean;
  onZoneClick: (id: string) => void;
  onFire: (zone: Zone) => void;
}) {
  const { camera, scene, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    const canvas = gl.domElement;

    const onLockChange = () => {
      worldState.locked = document.pointerLockElement === canvas;
      window.dispatchEvent(new CustomEvent("lock-changed", { detail: worldState.locked }));
    };
    document.addEventListener("pointerlockchange", onLockChange);

    const onMove = (e: MouseEvent) => {
      if (!worldState.locked) return;
      // true third-person: direct mouse → camera rotation
      worldState.camYaw -= e.movementX * 0.0028;
      worldState.camPitch = Math.max(-4, Math.min(6, worldState.camPitch + e.movementY * 0.0028));
    };
    window.addEventListener("mousemove", onMove);

    const onDown = (e: MouseEvent) => {
      if (!worldState.locked) {
        if (e.target === canvas && active) {
          // may be rejected in iframes / rapid toggles — never crash on it
          try {
            const p = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
            p?.catch?.(() => {});
          } catch { /* pointer lock unavailable */ }
        }
        return;
      }
      if (!active) return;
      // auto-lock: a zone roughly centered in view is cast at with a fireball first
      const lockTarget = findLockTarget(camera);
      if (lockTarget) {
        onFire(lockTarget);
        sound.click();
        setTimeout(() => onZoneClick(lockTarget.id), 480);
        return;
      }
      // raycast from screen center (crosshair style)
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const hit of hits) {
        const zid = hit.object.userData?.zoneId;
        if (zid) { onZoneClick(zid); sound.click(); return; }
        if (hit.object.name === "terrain") {
          worldState.target = { x: hit.point.x, z: hit.point.z };
          sound.click();
          return;
        }
      }
    };
    window.addEventListener("mousedown", onDown);

    return () => {
      document.removeEventListener("pointerlockchange", onLockChange);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
    };
  }, [gl, camera, scene, raycaster, active, onZoneClick, onFire]);

  return null;
}

/* ------------------------------------------------------------------ */
function SceneContents({
  active,
  onNear,
  onZoneClick,
}: {
  active: boolean;
  onNear: (id: string | null) => void;
  onZoneClick: (id: string) => void;
}) {
  const { scene } = useThree();
  const combatRef = useRef<CombatHandle>(null);
  useEffect(() => {
    scene.background = new THREE.Color("#8fd3ff");
    scene.fog = new THREE.Fog("#a6dcff", 60, 170);
  }, [scene]);

  const onGround = (e: ThreeEvent<PointerEvent>) => {
    if (!active || worldState.locked) return;
    worldState.target = { x: e.point.x, z: e.point.z };
    sound.click();
  };

  return (
    <>
      <hemisphereLight args={["#bfe8ff", "#6a8f5a", 0.85]} />
      <directionalLight
        position={[45, 70, 25]}
        intensity={1.6}
        color="#fff3d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
      />
      <Terrain onGround={onGround} />
      <Props />
      <Buildings />
      <Cart />
      <Gems />
      {/* letters suspend while the font streams in — never block the world */}
      <Suspense fallback={null}>
        <NameLetters />
      </Suspense>
      <PushBall />
      <Clouds />
      {ZONES.map((z) => (
        <ZoneMarker key={z.id} zone={z} onZoneClick={onZoneClick} />
      ))}
      <Player active={active} />
      <ProximitySensor onNear={onNear} />
      <Combat ref={combatRef} />
      <MouseLook
        active={active}
        onZoneClick={onZoneClick}
        onFire={(zone) => combatRef.current?.fireAt(zone)}
      />
      <Sparkles count={60} scale={[120, 20, 120]} position={[0, 10, 0]} size={2.5} speed={0.25} color="#fff8d8" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Drifting cartoon clouds                                             */
/* ------------------------------------------------------------------ */
function Clouds() {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        x: (hash(i, 23) - 0.5) * 220,
        y: 34 + hash(i, 29) * 14,
        z: (hash(i, 31) - 0.5) * 220,
        s: 2.5 + hash(i, 37) * 3,
        v: 0.6 + hash(i, 41),
      })),
    []
  );
  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.children.forEach((c, i) => {
      c.position.x += clouds[i].v * dt;
      if (c.position.x > 130) c.position.x = -130;
    });
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {[[-1, 0, 0.9], [0, 0.35, 1.2], [1.1, 0, 0.85], [0.3, -0.2, 1]].map(([ox, oy, s], j) => (
            <mesh key={j} position={[ox, oy, 0]} scale={[s, s * 0.6, s]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color="#ffffff" flatShading transparent opacity={0.92} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function World({
  active,
  onNear,
  onZoneClick,
}: {
  active: boolean;
  onNear: (id: string | null) => void;
  onZoneClick: (id: string) => void;
}) {
  // keyboard capture
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", " ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        worldState.keys.add(k);
        if (k.startsWith("arrow") || k === " ") e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => worldState.keys.delete(e.key.toLowerCase());
    const blur = () => worldState.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // release pointer lock while a panel is open
  useEffect(() => {
    if (!active && document.pointerLockElement) document.exitPointerLock();
  }, [active]);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 14, 20], fov: 55 }}
      >
        <SceneContents active={active} onNear={onNear} onZoneClick={onZoneClick} />
      </Canvas>
    </div>
  );
}
