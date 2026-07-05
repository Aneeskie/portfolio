"use client";

/** Mutable per-frame state shared between the 3D world and the DOM HUD. */
export const worldState = {
  x: 0,
  z: 38,
  /** facing angle of the character */
  rot: 0,
  /** camera orbit yaw (mouse look) */
  camYaw: 0,
  /** camera height offset from mouse Y */
  camPitch: 0,
  /** movement keys currently held */
  keys: new Set<string>(),
  /** click-to-move target */
  target: null as { x: number; z: number } | null,
  locked: false,
  /** vertical jump state */
  jumpY: 0,
  jumpVel: 0,
  /** riding the cart */
  riding: false,
  cartX: 14,
  cartZ: 18,
  gems: 0,
  /** gem locations + collected flags, filled by the Gems component for the minimap */
  gemSpots: [] as { x: number; z: number }[],
  gemTaken: [] as boolean[],
  /** ms timestamp (performance.now) a zone crystal was last hit by a fireball */
  hitZones: {} as Record<string, number>,
  /** zones unlocked by destroying their crystal with a fireball */
  unlockedZones: new Set<string>(),
  /** remaining HP per zone (10 = full, 0 = unlocked) */
  zoneHP: {} as Record<string, number>,
  /** player health */
  playerHP: 10,
  playerMaxHP: 10,
};
