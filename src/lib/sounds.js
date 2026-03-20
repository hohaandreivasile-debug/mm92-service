// src/lib/sounds.js — UI sound effects using Web Audio API (no external files)

let audioCtx = null;
let _enabled = true;

function getCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function setSoundsEnabled(v) { _enabled = v; }
export function isSoundsEnabled() { return _enabled; }

function playTone(freq, duration = 0.08, volume = 0.12, type = "sine") {
  if (!_enabled) return;
  const ctx = getCtx(); if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// ─── SOUND EFFECTS ───

// Tab switch — soft click
export function playTabSwitch() {
  playTone(800, 0.05, 0.08, "sine");
  setTimeout(() => playTone(1200, 0.04, 0.06, "sine"), 30);
}

// Section select in sidebar
export function playSectionSelect() {
  playTone(600, 0.04, 0.06, "triangle");
}

// Checkbox toggle
export function playCheck() {
  playTone(880, 0.05, 0.1, "sine");
  setTimeout(() => playTone(1320, 0.06, 0.08, "sine"), 50);
}

// Uncheck
export function playUncheck() {
  playTone(440, 0.06, 0.06, "triangle");
}

// Success (save, upload complete)
export function playSuccess() {
  playTone(523, 0.1, 0.1, "sine");
  setTimeout(() => playTone(659, 0.1, 0.1, "sine"), 100);
  setTimeout(() => playTone(784, 0.15, 0.1, "sine"), 200);
}

// Error / warning
export function playError() {
  playTone(220, 0.15, 0.1, "sawtooth");
  setTimeout(() => playTone(180, 0.2, 0.08, "sawtooth"), 120);
}

// Alert notification
export function playAlert() {
  playTone(880, 0.08, 0.08, "sine");
  setTimeout(() => playTone(880, 0.08, 0.08, "sine"), 150);
}

// Button click (subtle)
export function playClick() {
  playTone(700, 0.03, 0.05, "sine");
}

// Welcome / home
export function playWelcome() {
  playTone(440, 0.12, 0.06, "sine");
  setTimeout(() => playTone(554, 0.12, 0.06, "sine"), 120);
  setTimeout(() => playTone(659, 0.12, 0.06, "sine"), 240);
  setTimeout(() => playTone(880, 0.2, 0.08, "sine"), 360);
}
