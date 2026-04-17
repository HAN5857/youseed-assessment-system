// Procedural sound engine using Web Audio API.
// - No audio files to host. Works offline.
// - Sound effects synthesized from oscillator envelopes + filtered noise.
// - Background music: soft chord pad + pentatonic melody (kid-friendly "music box" vibe).
// Browsers require a user gesture before audio can play; call engine.unlock()
// from a click handler the first time.

export type SfxName =
  | "click"     // general UI click
  | "select"   // option selected
  | "next"      // next question
  | "success"  // per-question delightful chime
  | "whoosh"   // transition
  | "finish"   // final submission fanfare
  | "celebrate"; // applause + cheering crowd

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimers: number[] = [];
  muted = false;
  musicPlaying = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    const sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(master);
    const musicGain = ctx.createGain();
    musicGain.gain.value = 0.14;
    musicGain.connect(master);
    this.ctx = ctx;
    this.master = master;
    this.sfxGain = sfxGain;
    this.musicGain = musicGain;
    return ctx;
  }

  async unlock() {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.master || !this.ctx) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.value = muted ? 0 : 0.7;
    if (muted) this.stopMusic();
  }

  // ── Sound effects ───────────────────────────────────────────────────────
  play(name: SfxName) {
    if (this.muted) return;
    const ctx = this.ensure();
    switch (name) {
      case "click":
        tone(ctx, this.sfxGain!, 620, 0.05, "sine", 0.02);
        break;
      case "select":
        sequence(ctx, this.sfxGain!, [[523.25, 0.07], [659.25, 0.1]], "sine");
        break;
      case "next":
        sequence(ctx, this.sfxGain!, [[523.25, 0.06], [783.99, 0.12]], "triangle");
        break;
      case "success":
        sequence(ctx, this.sfxGain!, [[523.25, 0.08], [659.25, 0.08], [783.99, 0.14]], "sine");
        break;
      case "whoosh":
        sweep(ctx, this.sfxGain!, 900, 300, 0.2);
        break;
      case "finish":
        fanfare(ctx, this.sfxGain!);
        break;
      case "celebrate":
        // Big crowd celebration: cheer-like voices + applause
        cheer(ctx, this.sfxGain!);
        applause(ctx, this.sfxGain!, 2.4);
        fanfare(ctx, this.sfxGain!, 0.15);
        break;
    }
  }

  // ── Background music: energized groove loop (drums + bass + pad + lead) ─
  // 4-bar loop @ 104 BPM in C major with I–V–vi–IV progression.
  // Instruments: kick, clap, hat, square-wave bass, triangle chord pad,
  // square-wave pentatonic lead. All synthesized via Web Audio.
  startMusic() {
    if (this.musicPlaying || this.muted) return;
    const ctx = this.ensure();
    this.musicPlaying = true;

    const BPM = 104;
    const BEAT = 60 / BPM;       // ~0.577s
    const BAR = 4 * BEAT;        // ~2.31s
    const LOOP = 4 * BAR;        // ~9.23s
    const EIGHTH = BEAT / 2;

    // I – V – vi – IV  (C major — universally upbeat, like a game-music loop)
    const CHORDS: number[][] = [
      [261.63, 329.63, 392.0],  // C
      [196.0, 246.94, 293.66],  // G
      [220.0, 261.63, 329.63],  // Am
      [174.61, 220.0, 261.63],  // F
    ];
    const BASS: number[] = [65.41, 98.0, 55.0, 87.31]; // C2, G2, A1, F2

    // 32-step melody in C major pentatonic (8 notes per bar × 4 bars).
    // null = rest. Catchy, hummable shape that resolves home on bar 4.
    const MELODY: (number | null)[] = [
      // Bar 1 (C) — outline C major triad
      523.25, null, 659.25, null, 783.99, null, 659.25, null,
      // Bar 2 (G) — lift up
      783.99, null, 880.0, null, 1046.5, null, 783.99, null,
      // Bar 3 (Am) — pentatonic descent
      880.0, null, 659.25, null, 880.0, null, 1046.5, null,
      // Bar 4 (F) — run back home
      880.0, 783.99, 659.25, null, 587.33, null, 523.25, null,
    ];

    const mg = this.musicGain!;

    const scheduleBar = (bar: number, t0: number) => {
      // Chord pad (triangle), sustained across the bar
      chordPad(ctx, mg, CHORDS[bar], t0, BAR);

      // Bass (square, filtered): root on beat 1 & 3, bounce on &4
      bassNote(ctx, mg, BASS[bar], t0, 0.42);
      bassNote(ctx, mg, BASS[bar], t0 + 2 * BEAT, 0.42);
      bassNote(ctx, mg, BASS[bar] * 1.5, t0 + 3.5 * BEAT, 0.25);

      // Drums
      for (let beat = 0; beat < 4; beat++) {
        const tt = t0 + beat * BEAT;
        if (beat === 0 || beat === 2) kick(ctx, mg, tt);
        if (beat === 1 || beat === 3) clap(ctx, mg, tt);
      }
      // Hi-hat 8ths (accented on downbeats)
      for (let s = 0; s < 8; s++) {
        hihat(ctx, mg, t0 + s * EIGHTH, s % 2 === 1);
      }

      // Lead melody
      for (let s = 0; s < 8; s++) {
        const f = MELODY[bar * 8 + s];
        if (f != null) leadNote(ctx, mg, f, t0 + s * EIGHTH);
      }
    };

    const scheduleLoop = (startTime: number) => {
      for (let bar = 0; bar < 4; bar++) {
        scheduleBar(bar, startTime + bar * BAR);
      }
    };

    const runLoop = () => {
      if (!this.musicPlaying) return;
      const startTime = ctx.currentTime + 0.05;
      scheduleLoop(startTime);
      // Queue the next loop a hair before the current one ends (seamless)
      const nextIn = (LOOP - 0.15) * 1000;
      const t = window.setTimeout(runLoop, nextIn);
      this.musicTimers.push(t);
    };

    runLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    this.musicTimers.forEach(clearTimeout);
    this.musicTimers = [];
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────
function tone(
  ctx: AudioContext, dest: AudioNode, freq: number, dur: number,
  type: OscillatorType, attack = 0.01
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = ctx.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.35, now + attack);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(g).connect(dest);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

function sequence(
  ctx: AudioContext, dest: AudioNode,
  notes: [freq: number, dur: number][], type: OscillatorType
) {
  let t = ctx.currentTime;
  for (const [f, d] of notes) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + d + 0.02);
    t += d * 0.95;
  }
}

function sweep(ctx: AudioContext, dest: AudioNode, from: number, to: number, dur: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + dur);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.2, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(g).connect(dest);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

/** Full "Ta-daa!" fanfare — C major arpeggio + octave leap. */
function fanfare(ctx: AudioContext, dest: AudioNode, delay = 0) {
  const start = ctx.currentTime + delay;
  const notes: [number, number, number][] = [
    // [freq, startOffset, dur]
    [523.25, 0.00, 0.10], // C5
    [659.25, 0.10, 0.10], // E5
    [783.99, 0.20, 0.10], // G5
    [1046.5, 0.30, 0.35], // C6 (hold)
    [1318.51,0.50, 0.45], // E6 (overlay)
  ];
  for (const [f, offset, dur] of notes) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = f;
    const t = start + offset;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
}

/**
 * Synthesized applause — bursts of filtered white noise overlapping.
 * Sounds like a clapping crowd.
 */
function applause(ctx: AudioContext, dest: AudioNode, duration = 2.0) {
  const sampleRate = ctx.sampleRate;
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate "clap" bursts randomly across the duration
  const clapsPerSecond = 22;
  const clapDur = 0.04;
  const clapSamples = Math.floor(sampleRate * clapDur);
  const numClaps = Math.floor(duration * clapsPerSecond);

  for (let c = 0; c < numClaps; c++) {
    // Randomize clap position (slight rush at start)
    const tProgress = c / numClaps;
    const pos = Math.floor(tProgress * totalSamples + (Math.random() - 0.5) * sampleRate * 0.08);
    if (pos < 0 || pos >= totalSamples - clapSamples) continue;

    const amp = 0.4 + Math.random() * 0.4;
    for (let i = 0; i < clapSamples; i++) {
      // Short attack + exponential decay, white noise
      const env = Math.exp(-i / (clapSamples * 0.3));
      const sample = (Math.random() * 2 - 1) * amp * env;
      data[pos + i] += sample;
    }
  }

  // Overall envelope — quick swell, sustain, soft fade
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let env = 1;
    if (t < 0.2) env = t / 0.2;                     // swell in
    else if (t > duration - 0.4) env = (duration - t) / 0.4; // fade out
    data[i] *= Math.max(0, Math.min(1, env)) * 0.55;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  // Bandpass filter to centre energy around 2-4 kHz (realistic clap)
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2800;
  bp.Q.value = 0.6;
  // Highpass to remove low rumble
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 800;

  const g = ctx.createGain();
  g.gain.value = 0.7;
  source.connect(hp).connect(bp).connect(g).connect(dest);
  source.start();
  source.stop(ctx.currentTime + duration + 0.1);
}

/**
 * Synthesized "cheer" — multiple voice-like oscillators with vibrato
 * gliding up in pitch, plus filtered noise for breathy "yay" quality.
 */
function cheer(ctx: AudioContext, dest: AudioNode) {
  const now = ctx.currentTime;
  const voices = 5;
  for (let v = 0; v < voices; v++) {
    const startOffset = v * 0.03 + Math.random() * 0.05;
    const t = now + startOffset;
    const dur = 0.8 + Math.random() * 0.3;

    // Base pitch with slight detune per "voice"
    const baseFreq = 260 + Math.random() * 120; // speech-range frequencies
    const endFreq = baseFreq * (1.6 + Math.random() * 0.3);

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur * 0.7);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, t + dur);

    // Vibrato
    const vibratoOsc = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibratoOsc.frequency.value = 5 + Math.random() * 3;
    vibratoGain.gain.value = 6;
    vibratoOsc.connect(vibratoGain).connect(osc.frequency);
    vibratoOsc.start(t);
    vibratoOsc.stop(t + dur + 0.1);

    // Low-pass filter to soften (make more voice-like)
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    lp.Q.value = 0.7;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.15, t + 0.05);
    g.gain.linearRampToValueAtTime(0.1, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(lp).connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  }
}

// ── Groove-loop synth voices ─────────────────────────────────────────────
// Each plays a single note/hit at scheduled time `t`, mixed into `dest`.

function chordPad(ctx: AudioContext, dest: AudioNode, freqs: number[], t: number, dur: number) {
  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07, t + 0.12);
    g.gain.linearRampToValueAtTime(0.05, t + dur - 0.25);
    g.gain.linearRampToValueAtTime(0, t + dur);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  });
}

function bassNote(ctx: AudioContext, dest: AudioNode, f: number, t: number, dur: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = f;
  // Warm the square wave with a lowpass filter
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 500;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.18, t + 0.005);
  g.gain.linearRampToValueAtTime(0.12, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(lp).connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function kick(ctx: AudioContext, dest: AudioNode, t: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(130, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.32, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  osc.connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + 0.18);
}

function clap(ctx: AudioContext, dest: AudioNode, t: number) {
  // Band-passed noise burst — sounds like a hand-clap / snare clap
  const samples = Math.floor(ctx.sampleRate * 0.12);
  const buf = ctx.createBuffer(1, samples, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < samples; i++) {
    const env = Math.exp(-i / (samples * 0.22));
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.9;
  const g = ctx.createGain();
  g.gain.value = 0.18;
  src.connect(bp).connect(g).connect(dest);
  src.start(t);
}

function hihat(ctx: AudioContext, dest: AudioNode, t: number, soft = false) {
  const samples = Math.floor(ctx.sampleRate * 0.04);
  const buf = ctx.createBuffer(1, samples, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < samples; i++) {
    const env = Math.exp(-i / (samples * 0.15));
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 6500;
  const g = ctx.createGain();
  g.gain.value = soft ? 0.035 : 0.07;
  src.connect(hp).connect(g).connect(dest);
  src.start(t);
}

function leadNote(ctx: AudioContext, dest: AudioNode, f: number, t: number) {
  // Classic chiptune-y square lead, softened with lowpass
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = f;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3200;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.08, t + 0.008);
  g.gain.linearRampToValueAtTime(0.06, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
  osc.connect(lp).connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + 0.3);
}

// Singleton
let _engine: SoundEngine | null = null;
export function sound(): SoundEngine {
  if (typeof window === "undefined") {
    return {
      muted: true, musicPlaying: false,
      unlock: async () => {}, setMuted: () => {},
      play: () => {}, startMusic: () => {}, stopMusic: () => {},
    } as unknown as SoundEngine;
  }
  if (!_engine) _engine = new SoundEngine();
  return _engine;
}
