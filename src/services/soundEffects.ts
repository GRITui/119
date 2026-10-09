/**
 * Web Audio API procedural sound synthesizer
 * Provides immersive visual novel BGM and SFX without external audio asset dependencies.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.5;
  private bgmVolume: number = 0.35;
  private currentBgm: string | null = null;
  private bgmNodes: {
    gainNode?: GainNode;
    oscillators?: OscillatorNode[];
    noiseNode?: AudioNode;
    intervalId?: number;
  } = {};

  private initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmNodes.gainNode) {
      this.bgmNodes.gainNode.gain.value = muted ? 0 : this.bgmVolume;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolumes(bgm: number, sfx: number) {
    this.bgmVolume = Math.max(0, Math.min(1, bgm));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    if (this.bgmNodes.gainNode && !this.isMuted) {
      this.bgmNodes.gainNode.gain.value = this.bgmVolume;
    }
  }

  // --- Sound Effects ---

  /** Bangkok BTS Skytrain 2-Tone chime ("Ding-Dong") */
  public playBtsChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      // Note 1: E5 (~659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(this.sfxVolume * 0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.85);

      // Note 2: B4 (~493.88Hz) played 0.28s later
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(493.88, now + 0.28);
      gain2.gain.setValueAtTime(this.sfxVolume * 0.45, now + 0.28);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.28);
      osc2.stop(now + 1.25);
    } catch {
      // AudioContext suppressed before interaction
    }
  }

  /** Gentle mechanical keyboard keystroke sound */
  public playKeyType() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Slight pitch variation for realistic typing clack
      const freq = 320 + Math.random() * 80;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(this.sfxVolume * 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  /** Smartphone / LINE message ping */
  public playPhoneNotification() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08); // E6
      gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // ignore
    }
  }

  /** Dramatic confrontation chord / stinger */
  public playDramaticStinger() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      // Minor cluster for dilemma tension
      const freqs = [146.83, 174.61, 220.0]; // D3, F3, A3
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        // Lowpass filter for dark cinema weight
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch {
      // ignore
    }
  }

  /** UI click / choice tap */
  public playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }

  /** Positive resolve / success chime */
  public playSuccessChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(this.sfxVolume * 0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.65);
      });
    } catch {
      // ignore
    }
  }

  // --- Background Ambiences & Music ---

  public stopBgm() {
    if (this.bgmNodes.intervalId) {
      clearInterval(this.bgmNodes.intervalId);
    }
    if (this.bgmNodes.oscillators) {
      this.bgmNodes.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
    }
    if (this.bgmNodes.noiseNode) {
      try {
        this.bgmNodes.noiseNode.disconnect();
      } catch {
        // ignore
      }
    }
    this.bgmNodes = {};
    this.currentBgm = null;
  }

  public playBgm(type: 'chill_lofi' | 'rain_ambient' | 'office_hum' | 'dramatic_tension' | 'none') {
    if (type === 'none') {
      this.stopBgm();
      return;
    }
    if (this.currentBgm === type) return;

    this.stopBgm();
    this.currentBgm = type;

    try {
      const ctx = this.initCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.bgmVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.bgmNodes.gainNode = masterGain;

      if (type === 'rain_ambient') {
        this.startRainSynth(ctx, masterGain);
      } else if (type === 'chill_lofi') {
        this.startLofiSynth(ctx, masterGain);
      } else if (type === 'dramatic_tension') {
        this.startTensionSynth(ctx, masterGain);
      } else if (type === 'office_hum') {
        this.startOfficeHumSynth(ctx, masterGain);
      }
    } catch {
      // Audio context delayed
    }
  }

  private startRainSynth(ctx: AudioContext, destination: GainNode) {
    // Generate pink noise for soft soothing monsoon rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.12;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like rain hitting glass / wet pavement
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.35, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(destination);

    whiteNoise.start();
    this.bgmNodes.noiseNode = whiteNoise;
  }

  private startLofiSynth(ctx: AudioContext, destination: GainNode) {
    // Gentle repeating Rhodes-style chords (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94]  // Cmaj7
    ];
    let chordIndex = 0;

    const playNextChord = () => {
      if (this.currentBgm !== 'chill_lofi' || !this.ctx) return;
      const now = this.ctx.currentTime;
      const currentNotes = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      currentNotes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.04 + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 3.8);

        osc.connect(gain);
        gain.connect(destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 3.9);
      });
    };

    playNextChord();
    this.bgmNodes.intervalId = window.setInterval(playNextChord, 4000);
  }

  private startTensionSynth(ctx: AudioContext, destination: GainNode) {
    // Low drone and pulsating tension tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65.41, ctx.currentTime); // C2

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(69.30, ctx.currentTime); // C#2 (beating dissonance)

    droneGain.gain.setValueAtTime(0.18, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(destination);

    osc1.start();
    osc2.start();
    this.bgmNodes.oscillators = [osc1, osc2];
  }

  private startOfficeHumSynth(ctx: AudioContext, destination: GainNode) {
    // Subtle AC hum with soft harmonic tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, ctx.currentTime); // A2 AC fan drone
    gain.gain.setValueAtTime(0.08, ctx.currentTime);

    osc.connect(gain);
    gain.connect(destination);
    osc.start();
    this.bgmNodes.oscillators = [osc];
  }
}

export const sound = new SoundSynthesizer();
