"use client";

/** Mutable per-frame state shared between the 3D world and the DOM HUD. */
export const worldState = {
  x: 0,
  z: 4,
  /** car facing angle */
  rot: 0,
  /** car forward velocity (positive = forward) */
  vel: 0,
  /** movement keys currently held */
  keys: new Set<string>(),
  /** click-to-drive target */
  target: null as { x: number; z: number } | null,
  gems: 0,
};
