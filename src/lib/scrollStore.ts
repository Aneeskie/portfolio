"use client";

/**
 * Minimal mutable store shared between the DOM scroll (Lenis) and the
 * R3F camera rig — read every frame without triggering React renders.
 */
export const scrollState = {
  /** 0..1 overall page progress */
  progress: 0,
  /** smoothed velocity for motion effects */
  velocity: 0,
  /** normalized mouse -1..1 */
  mouseX: 0,
  mouseY: 0,
};
