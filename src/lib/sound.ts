"use client";

/**
 * Synthesized UI sound engine — no audio assets needed.
 * All sounds are generated with the WebAudio API so the bundle stays tiny.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  enabled = false;

  private ensure() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) {
      this.ensure();
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain).connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.05);
  }

  hover() {
    this.tone(880, 0.08, "sine", 0.08, 1320);
  }

  click() {
    this.tone(220, 0.12, "square", 0.1, 110);
    this.tone(1760, 0.06, "sine", 0.06);
  }

  unlock() {
    if (!this.enabled) return;
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.25, "triangle", 0.12), i * 90)
    );
  }

  boot() {
    if (!this.enabled) return;
    this.tone(110, 1.2, "sawtooth", 0.06, 220);
    this.tone(440, 0.6, "sine", 0.08, 880);
  }

  private startAmbient() {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.ambientNodes.length) return;
    [55, 82.5, 110.2].forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 3);
      osc.connect(gain).connect(this.master!);
      osc.start();
      this.ambientNodes.push({ osc, gain });
    });
  }

  private stopAmbient() {
    const ctx = this.ctx;
    this.ambientNodes.forEach(({ osc, gain }) => {
      if (ctx) gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => osc.stop(), 600);
    });
    this.ambientNodes = [];
  }
}

export const sound = new SoundEngine();
