"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { worldState } from "@/lib/worldStore";
import { sound } from "@/lib/sound";
import { ZONES, INTERACT_RADIUS, WORLD_SIZE, Zone } from "@/components/zones";

const MAX_SPEED = 22;
const ACCEL = 22;
const STEER_SPEED = 2.6;

/* ------------------------------------------------------------------ */
/* Terrain height — value noise                                        */
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
export function getHeight(x: number, z: number) {
  // flatter than before — good for driving
  let h = vnoise(x * 0.022 + 50, z * 0.022 + 50) * 4.5 + vnoise(x * 0.07, z * 0.07) * 1.2;
  for (const zn of ZONES) {
    const d = Math.hypot(x - zn.x, z - zn.z);
    if (d < 14) {
      const t = Math.min(1, d / 14);
      const zoneH = vnoise(zn.x * 0.022 + 50, zn.z * 0.022 + 50) * 4.5;
      h = h * t * t + zoneH * (1 - t * t);
    }
  }
  const edge = Math.hypot(x, z) / (WORLD_SIZE / 2);
  h += Math.max(0, edge - 0.82) * 20;
  return h;
}

/* ------------------------------------------------------------------ */
/* Terrain mesh — bright, clean Bruno-style palette                   */
/* ------------------------------------------------------------------ */
function Terrain({ onGround }: { onGround: (e: ThreeEvent<PointerEvent>) => void }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 110, 110);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const sand  = new THREE.Color("#f0dca8");
    const grass1 = new THREE.Color("#b8e07a");
    const grass2 = new THREE.Color("#9ed45e");
    const grass3 = new THREE.Color("#caf090");
    const rock  = new THREE.Color("#c8c0a8");
    const snow  = new THREE.Color("#f4f4f0");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = getHeight(x, z);
      pos.setY(i, h);
      if (h < 1.4) c.copy(sand);
      else if (h < 10) {
        const n = vnoise(x * 0.15, z * 0.15);
        c.lerpColors(grass1, n > 0.5 ? grass2 : grass3, n);
      } else if (h < 15) c.copy(rock);
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
/* Props: trees, rocks                                                 */
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
    if (Math.hypot(x, z) < 12) continue;
    if (ZONES.some((zn) => Math.hypot(x - zn.x, z - zn.z) < 12)) continue;
    if (BUILDING_SPOTS.some((b) => Math.hypot(x - b.x, z - b.z) < 8)) continue;
    const h = getHeight(x, z);
    if (h < 1.8 || h > 11) continue;
    count++;
    const kind = Math.floor(hash(i, 11) * 3);
    const s = 0.7 + hash(i, 13) * 0.9;
    if (kind === 0) coll.push({ x, z, r: Math.max(0.55, 0.6 * s) });
  }
  coll.push({ x: 14, z: -16, r: 2.6 });
  coll.push({ x: -18, z: -12, r: 2.6 });
  coll.push({ x: 20, z: 10, r: 2.6 });
  coll.push({ x: -14, z: 20, r: 2.6 });
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
      if (Math.hypot(x, z) < 12) continue;
      if (ZONES.some((zn) => Math.hypot(x - zn.x, z - zn.z) < 12)) continue;
      if (BUILDING_SPOTS.some((b) => Math.hypot(x - b.x, z - b.z) < 8)) continue;
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
          const leaf = it.tint > 0.5 ? "#68c44a" : "#7ed458";
          return (
            <group key={i} position={[it.x, y, it.z]} scale={it.s} rotation-y={it.r}>
              <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.28, 0.4, 2, 6]} />
                <meshStandardMaterial color="#a06840" flatShading />
              </mesh>
              <mesh position={[0, 2.8, 0]} castShadow>
                <coneGeometry args={[1.6, 2.6, 7]} />
                <meshStandardMaterial color={leaf} flatShading />
              </mesh>
              <mesh position={[0, 4.2, 0]} castShadow>
                <coneGeometry args={[1.1, 1.9, 7]} />
                <meshStandardMaterial color={it.tint > 0.5 ? "#80d860" : "#90e870"} flatShading />
              </mesh>
            </group>
          );
        }
        if (it.kind === 1) {
          return (
            <mesh key={i} position={[it.x, y + 0.3 * it.s, it.z]} scale={it.s * 0.8} rotation-y={it.r} castShadow>
              <dodecahedronGeometry args={[0.9, 0]} />
              <meshStandardMaterial color="#b8b0a0" flatShading />
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
/* Buildings                                                           */
/* ------------------------------------------------------------------ */
function Cottage({ x, z, hue, rot }: { x: number; z: number; hue: string; rot: number }) {
  const y = getHeight(x, z);
  return (
    <group position={[x, y, z]} rotation-y={rot}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[3.4, 2.8, 3]} />
        <meshStandardMaterial color="#f4ede0" flatShading />
      </mesh>
      {([-1.7, -1.5], [1.7, -1.5], [-1.7, 1.5], [1.7, 1.5]) && [[-1.7, -1.5], [1.7, -1.5], [-1.7, 1.5], [1.7, 1.5]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx, 1.4, bz]}>
          <boxGeometry args={[0.25, 2.8, 0.25]} />
          <meshStandardMaterial color="#8a6040" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 3.6, 0]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[3, 1.9, 4]} />
        <meshStandardMaterial color={hue} flatShading />
      </mesh>
      <mesh position={[0, 0.85, 1.52]}>
        <boxGeometry args={[0.9, 1.7, 0.1]} />
        <meshStandardMaterial color="#7a5030" flatShading />
      </mesh>
      {[-1.1, 1.1].map((wx) => (
        <mesh key={wx} position={[wx, 1.7, 1.52]}>
          <boxGeometry args={[0.6, 0.6, 0.08]} />
          <meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={0.9} />
        </mesh>
      ))}
      <mesh position={[1, 3.9, -0.6]}>
        <boxGeometry args={[0.5, 1.4, 0.5]} />
        <meshStandardMaterial color="#b0a0a0" flatShading />
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
        <meshStandardMaterial color="#ece0c8" flatShading />
      </mesh>
      <mesh position={[0, 6.6, 0]} castShadow>
        <coneGeometry args={[2, 1.8, 8]} />
        <meshStandardMaterial color="#d05040" flatShading />
      </mesh>
      <mesh position={[0, 4.6, 1.9]}>
        <boxGeometry args={[0.5, 0.5, 0.9]} />
        <meshStandardMaterial color="#8a6040" flatShading />
      </mesh>
      <group ref={blades} position={[0, 4.6, 2.5]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation-z={(i * Math.PI) / 2} castShadow>
            <boxGeometry args={[0.35, 4.6, 0.08]} />
            <meshStandardMaterial color="#f4e8d4" flatShading transparent opacity={0.95} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.35, 8, 6]} />
          <meshStandardMaterial color="#8a6040" flatShading />
        </mesh>
      </group>
    </group>
  );
}

function Buildings() {
  return (
    <group>
      <Cottage x={14} z={-16} hue="#d05040" rot={0.4} />
      <Cottage x={-18} z={-12} hue="#5080c0" rot={-0.8} />
      <Cottage x={20} z={10} hue="#608040" rot={2.2} />
      <Windmill x={-14} z={20} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Collectible gems — no useState, direct ref mutation                 */
/* ------------------------------------------------------------------ */
const GEM_COLORS = ["#ffd166", "#7cf3c8", "#c77dff", "#ff70a6", "#6ec6ff"];

function Gems() {
  const spots = useMemo(() => {
    const out: { x: number; z: number; c: string; baseY: number }[] = [];
    let i = 0;
    while (out.length < 24 && i < 600) {
      i++;
      const x = (hash(i, 51) - 0.5) * (WORLD_SIZE - 40);
      const z = (hash(i, 57) - 0.5) * (WORLD_SIZE - 40);
      const h = getHeight(x, z);
      if (h < 2.5 || h > 10) continue;
      if (BUILDING_SPOTS.some((b) => Math.hypot(x - b.x, z - b.z) < 5)) continue;
      if (ZONES.some((zn) => Math.hypot(x - zn.x, z - zn.z) < 7)) continue;
      out.push({ x, z, c: GEM_COLORS[out.length % GEM_COLORS.length], baseY: h });
    }
    return out;
  }, []);

  const collected = useRef<boolean[]>(new Array(spots.length).fill(false));
  const gemRefs = useRef<THREE.Group[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const px = worldState.x, pz = worldState.z;
    for (let i = 0; i < spots.length; i++) {
      if (collected.current[i]) continue;
      const g = gemRefs.current[i];
      if (g) {
        g.rotation.y = t * 2 + i;
        g.position.y = spots[i].baseY + 1.2 + Math.sin(t * 2.5 + i) * 0.22;
      }
      const dx = px - spots[i].x, dz = pz - spots[i].z;
      if (dx * dx + dz * dz < 4) { // bigger pickup radius for car
        collected.current[i] = true;
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
          position={[s.x, s.baseY + 1.2, s.z]}
        >
          <mesh castShadow>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color={s.c} emissive={s.c} emissiveIntensity={1.2} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Zone landmark                                                       */
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
        scale={[1, 1.7, 1]}
        onClick={(e) => { e.stopPropagation(); onZoneClick(zone.id); }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; sound.hover(); }}
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
        <meshBasicMaterial color={zone.color} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
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
            background: "rgba(20,16,40,0.82)",
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
/* Driveable car — arcade physics, camera follows behind              */
/* ------------------------------------------------------------------ */
function Car({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const wheelFL = useRef<THREE.Mesh>(null);
  const wheelFR = useRef<THREE.Mesh>(null);
  const wheelBL = useRef<THREE.Mesh>(null);
  const wheelBR = useRef<THREE.Mesh>(null);
  const camVec = useRef(new THREE.Vector3());

  useFrame(({ camera }, dt) => {
    if (!group.current) return;
    const dtc = Math.min(dt, 0.05);
    const k = worldState.keys;

    if (active) {
      const fwd =
        (k.has("w") || k.has("arrowup") ? 1 : 0) -
        (k.has("s") || k.has("arrowdown") ? 1 : 0);
      const steer =
        (k.has("d") || k.has("arrowright") ? 1 : 0) -
        (k.has("a") || k.has("arrowleft") ? 1 : 0);

      // Accelerate / brake
      if (fwd > 0) worldState.vel = Math.min(MAX_SPEED, worldState.vel + ACCEL * dtc);
      else if (fwd < 0) worldState.vel = Math.max(-MAX_SPEED * 0.45, worldState.vel - ACCEL * 0.8 * dtc);

      // Steering (proportional to speed, flip in reverse)
      if (Math.abs(worldState.vel) > 0.3 && steer !== 0) {
        const sf = Math.min(1, Math.abs(worldState.vel) / MAX_SPEED);
        worldState.rot -= steer * STEER_SPEED * sf * Math.sign(worldState.vel) * dtc;
      }

      // Click-to-drive
      if (worldState.target && fwd === 0 && steer === 0) {
        const tx = worldState.target.x - worldState.x;
        const tz = worldState.target.z - worldState.z;
        const d = Math.hypot(tx, tz);
        if (d > 1.8) {
          const tRot = Math.atan2(-tx, -tz);
          let diff = tRot - worldState.rot;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          worldState.rot += diff * Math.min(1, dtc * 3.5);
          worldState.vel = Math.min(worldState.vel + ACCEL * 0.55 * dtc, MAX_SPEED * 0.7);
        } else {
          worldState.target = null;
        }
      }
    }

    // Drag — fast when no key, gentle when driving
    const hasFwd = k.has("w") || k.has("arrowup") || k.has("s") || k.has("arrowdown");
    if (!hasFwd || !active) {
      worldState.vel *= Math.pow(0.12, dtc);
    }
    if (Math.abs(worldState.vel) < 0.06) worldState.vel = 0;

    // Move
    worldState.x -= Math.sin(worldState.rot) * worldState.vel * dtc;
    worldState.z -= Math.cos(worldState.rot) * worldState.vel * dtc;

    // Clamp to world
    const lim = WORLD_SIZE / 2 - 8;
    worldState.x = Math.max(-lim, Math.min(lim, worldState.x));
    worldState.z = Math.max(-lim, Math.min(lim, worldState.z));

    // Collider push (cars have larger radius)
    const CAR_R = 1.4;
    for (const col of COLLIDERS) {
      const dx = worldState.x - col.x, dz = worldState.z - col.z;
      const dist = Math.hypot(dx, dz);
      const minD = col.r + CAR_R;
      if (dist < minD && dist > 0.001) {
        const push = (minD - dist) / dist;
        worldState.x += dx * push;
        worldState.z += dz * push;
        worldState.vel *= 0.2;
      }
    }

    // Position on terrain
    const groundY = getHeight(worldState.x, worldState.z);
    group.current.position.set(worldState.x, groundY + 0.38, worldState.z);
    group.current.rotation.y = worldState.rot;

    // Wheel spin
    const spin = worldState.vel * dtc * 2.8;
    if (wheelFL.current) wheelFL.current.rotation.x += spin;
    if (wheelFR.current) wheelFR.current.rotation.x += spin;
    if (wheelBL.current) wheelBL.current.rotation.x += spin;
    if (wheelBR.current) wheelBR.current.rotation.x += spin;

    // Camera: always behind the car, Bruno-Simon style
    const camDist = 14;
    const camH = 7;
    const bx = worldState.x + Math.sin(worldState.rot) * camDist;
    const bz = worldState.z + Math.cos(worldState.rot) * camDist;
    const cy = Math.max(groundY + camH, getHeight(bx, bz) + 4);
    camVec.current.set(bx, cy, bz);
    camera.position.lerp(camVec.current, Math.min(1, dtc * 5));
    camera.lookAt(worldState.x, groundY + 0.8, worldState.z);
  });

  return (
    <group ref={group}>
      {/* Main body */}
      <mesh position={[0, 0.3, 0.1]} castShadow>
        <boxGeometry args={[1.5, 0.52, 3.2]} />
        <meshStandardMaterial color="#e05a28" flatShading />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.72, -0.18]} castShadow>
        <boxGeometry args={[1.2, 0.5, 1.8]} />
        <meshStandardMaterial color="#c44818" flatShading />
      </mesh>
      {/* Front windshield */}
      <mesh position={[0, 0.74, 0.72]}>
        <boxGeometry args={[1.1, 0.44, 0.08]} />
        <meshStandardMaterial color="#b8dcf0" transparent opacity={0.7} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 0.74, -1.1]}>
        <boxGeometry args={[1.1, 0.4, 0.08]} />
        <meshStandardMaterial color="#b8dcf0" transparent opacity={0.65} />
      </mesh>
      {/* Front bumper */}
      <mesh position={[0, 0.16, 1.68]}>
        <boxGeometry args={[1.42, 0.22, 0.14]} />
        <meshStandardMaterial color="#b83c10" flatShading />
      </mesh>
      {/* Rear bumper */}
      <mesh position={[0, 0.16, -1.68]}>
        <boxGeometry args={[1.42, 0.22, 0.14]} />
        <meshStandardMaterial color="#b83c10" flatShading />
      </mesh>
      {/* Headlights */}
      {[-0.44, 0.44].map((wx, i) => (
        <mesh key={`hl-${i}`} position={[wx, 0.32, 1.73]}>
          <boxGeometry args={[0.3, 0.18, 0.06]} />
          <meshStandardMaterial color="#fffce0" emissive="#ffeeaa" emissiveIntensity={1.6} />
        </mesh>
      ))}
      {/* Taillights */}
      {[-0.44, 0.44].map((wx, i) => (
        <mesh key={`tl-${i}`} position={[wx, 0.32, -1.73]}>
          <boxGeometry args={[0.3, 0.16, 0.06]} />
          <meshStandardMaterial color="#ff2211" emissive="#ff1100" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* Wheels */}
      {([[-0.9, 0.2, 1.05, "FL"], [0.9, 0.2, 1.05, "FR"], [-0.9, 0.2, -1.05, "BL"], [0.9, 0.2, -1.05, "BR"]] as [number, number, number, string][]).map(([wx, wy, wz, name]) => {
        const r = name === "FL" ? wheelFL : name === "FR" ? wheelFR : name === "BL" ? wheelBL : wheelBR;
        return (
          <group key={name} position={[wx, wy, wz]}>
            <mesh ref={r} rotation-z={Math.PI / 2} castShadow>
              <cylinderGeometry args={[0.34, 0.34, 0.26, 10]} />
              <meshStandardMaterial color="#1e1e1e" flatShading />
            </mesh>
            <mesh rotation-z={Math.PI / 2} position={[wx < 0 ? -0.14 : 0.14, 0, 0]}>
              <cylinderGeometry args={[0.19, 0.19, 0.04, 8]} />
              <meshStandardMaterial color="#888" flatShading />
            </mesh>
          </group>
        );
      })}
      {/* Blob shadow */}
      <mesh position={[0, -0.37, 0.1]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.4, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Proximity sensor                                                    */
/* ------------------------------------------------------------------ */
function ProximitySensor({ onNear }: { onNear: (id: string | null) => void }) {
  const last = useRef<string | null>(null);
  useFrame(() => {
    let found: string | null = null;
    for (const z of ZONES) {
      if (Math.hypot(worldState.x - z.x, worldState.z - z.z) < INTERACT_RADIUS) {
        found = z.id;
        break;
      }
    }
    if (found !== last.current) {
      last.current = found;
      if (found) sound.hover();
      onNear(found);
    }
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Click handler — terrain click-to-drive, crystal click              */
/* ------------------------------------------------------------------ */
function ClickHandler({ active, onZoneClick }: { active: boolean; onZoneClick: (id: string) => void }) {
  const { camera, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!active) return;
      const ndc = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
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
    return () => window.removeEventListener("mousedown", onDown);
  }, [active, camera, scene, raycaster, onZoneClick]);

  return null;
}

/* ------------------------------------------------------------------ */
/* Drifting clouds                                                     */
/* ------------------------------------------------------------------ */
function Clouds() {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({
      x: (hash(i, 23) - 0.5) * 220,
      y: 38 + hash(i, 29) * 14,
      z: (hash(i, 31) - 0.5) * 220,
      s: 2.8 + hash(i, 37) * 3,
      v: 0.7 + hash(i, 41),
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

/* ------------------------------------------------------------------ */
/* Scene                                                               */
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
  useEffect(() => {
    scene.background = new THREE.Color("#b4dcf8");
    scene.fog = new THREE.Fog("#c8eaf8", 70, 190);
  }, [scene]);

  const onGround = (e: ThreeEvent<PointerEvent>) => {
    if (!active) return;
    worldState.target = { x: e.point.x, z: e.point.z };
    sound.click();
  };

  return (
    <>
      <hemisphereLight args={["#d0eeff", "#78a860", 1.0]} />
      <directionalLight
        position={[45, 70, 25]}
        intensity={1.7}
        color="#fff8e8"
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
      <Gems />
      <Clouds />
      {ZONES.map((z) => (
        <ZoneMarker key={z.id} zone={z} onZoneClick={onZoneClick} />
      ))}
      <Car active={active} />
      <ProximitySensor onNear={onNear} />
      <ClickHandler active={active} onZoneClick={onZoneClick} />
      <Sparkles count={60} scale={[120, 20, 120]} position={[0, 12, 0]} size={2.5} speed={0.25} color="#fff8d8" />
    </>
  );
}

/* ------------------------------------------------------------------ */
export default function World({
  active,
  onNear,
  onZoneClick,
}: {
  active: boolean;
  onNear: (id: string | null) => void;
  onZoneClick: (id: string) => void;
}) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        worldState.keys.add(k);
        if (k.startsWith("arrow")) e.preventDefault();
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
