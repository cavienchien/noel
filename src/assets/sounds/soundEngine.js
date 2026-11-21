// Web Audio API Procedural Sound & Music Engine for Christmas Home 3D
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.fireNode = null;
    this.fireGain = null;
    this.isMuted = false;
    this.volume = 0.65;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.noteIndex = 0;
    this.fireActive = true;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.28;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.7;
    this.sfxGain.connect(this.masterGain);

    this.setupFireCrackle();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  startMusic() {
    this.init();
    if (!this.ctx || this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Gentle Christmas Celesta / Music Box Melody (Silent Night & Winter Chimes)
    // Frequencies in Hz with duration multipliers
    const melody = [
      { f: 392.0, d: 1.5, bass: 130.81 }, // G4
      { f: 440.0, d: 0.5, bass: null },   // A4
      { f: 392.0, d: 1.0, bass: 196.0 },  // G4
      { f: 329.63, d: 2.5, bass: 164.81 },// E4
      { f: 392.0, d: 1.5, bass: 130.81 }, // G4
      { f: 440.0, d: 0.5, bass: null },   // A4
      { f: 392.0, d: 1.0, bass: 196.0 },  // G4
      { f: 329.63, d: 2.5, bass: 164.81 },// E4
      { f: 587.33, d: 2.0, bass: 146.83 },// D5
      { f: 587.33, d: 1.0, bass: 196.0 }, // D5
      { f: 493.88, d: 2.5, bass: 146.83 },// B4
      { f: 523.25, d: 2.0, bass: 130.81 },// C5
      { f: 523.25, d: 1.0, bass: 196.0 }, // C5
      { f: 392.0, d: 2.5, bass: 130.81 }, // G4
      { f: 440.0, d: 2.0, bass: 174.61 }, // A4
      { f: 440.0, d: 1.0, bass: 220.0 },  // A4
      { f: 523.25, d: 1.5, bass: 174.61 },// C5
      { f: 493.88, d: 0.5, bass: null },  // B4
      { f: 440.0, d: 1.0, bass: 130.81 }, // A4
      { f: 392.0, d: 1.5, bass: 130.81 }, // G4
      { f: 440.0, d: 0.5, bass: null },   // A4
      { f: 392.0, d: 1.0, bass: 196.0 },  // G4
      { f: 329.63, d: 2.5, bass: 164.81 },// E4
    ];

    const playNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx) return;
      const item = melody[this.noteIndex % melody.length];
      this.noteIndex++;

      const now = this.ctx.currentTime;
      // Celesta bell tone
      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.f, now);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(item.f * 2, now);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.08, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.22, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0008, now + item.d * 0.95);

      osc.connect(noteGain);
      subOsc.connect(subGain);
      subGain.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + item.d);
      subOsc.stop(now + item.d);

      // Warm harmonic bass pad
      if (item.bass) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(item.bass, now);
        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + item.d * 1.4);
        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + item.d * 1.45);
      }

      this.musicTimer = setTimeout(playNextNote, item.d * 620);
    };

    playNextNote();
  }

  setupFireCrackle() {
    if (!this.ctx) return;
    this.fireGain = this.ctx.createGain();
    this.fireGain.gain.value = 0.08;
    this.fireGain.connect(this.sfxGain);

    // Periodic gentle fire crackle impulses
    this.crackleInterval = setInterval(() => {
      if (!this.ctx || !this.fireActive || this.isMuted || this.ctx.state !== 'running') return;
      if (Math.random() > 0.65) {
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.045;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200 + Math.random() * 1600;
        filter.Q.value = 3.0;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.06 + Math.random() * 0.08;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.fireGain);
        noise.start(now);
      }
    }, 180);
  }

  setFireAudioActive(active) {
    this.fireActive = active;
  }

  playDoorSound(isOpening = true) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Latch click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(isOpening ? 320 : 240, now);
    clickOsc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
    clickGain.gain.setValueAtTime(0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    clickOsc.connect(clickGain);
    clickGain.connect(this.sfxGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.1);

    // Gentle wooden swing resonance
    const woodOsc = this.ctx.createOscillator();
    const woodGain = this.ctx.createGain();
    woodOsc.type = 'sine';
    woodOsc.frequency.setValueAtTime(isOpening ? 110 : 140, now + 0.08);
    woodOsc.frequency.linearRampToValueAtTime(isOpening ? 145 : 95, now + 0.75);
    woodGain.gain.setValueAtTime(0.001, now + 0.08);
    woodGain.gain.linearRampToValueAtTime(0.11, now + 0.25);
    woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    woodOsc.connect(woodGain);
    woodGain.connect(this.sfxGain);
    woodOsc.start(now + 0.08);
    woodOsc.stop(now + 0.9);
  }

  playBellSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.055);
      gain.gain.setValueAtTime(0.001, now + idx * 0.055);
      gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.055 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.055 + 0.9);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.95);
    });
  }

  playInteractSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.14);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }
}

export const soundEngine = new SoundEngine();
