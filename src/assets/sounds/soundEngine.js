import bgmUrl from './bgm.mp3';

// Web Audio API Sound & Background Music Engine for Christmas Home 3D
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.fireNode = null;
    this.fireGain = null;
    this.bgmAudio = null;
    this.isMuted = false;
    this.volume = 0.65;
    this.isMusicPlaying = false;
    this.fireActive = true;
  }

  init() {
    if (!this.bgmAudio && typeof Audio !== 'undefined') {
      this.bgmAudio = new Audio(bgmUrl);
      this.bgmAudio.loop = true;
      this.bgmAudio.preload = 'auto';
      this.bgmAudio.volume = this.isMuted ? 0 : this.volume;
    }

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

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.7;
    this.sfxGain.connect(this.masterGain);

    this.setupFireCrackle();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgmAudio) {
      this.bgmAudio.muted = this.isMuted;
      this.bgmAudio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  startMusic() {
    this.init();
    if (!this.bgmAudio) return;
    this.bgmAudio.muted = this.isMuted;
    this.bgmAudio.volume = this.isMuted ? 0 : this.volume;
    if (this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {});
    }
    this.isMusicPlaying = true;
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
