/**
 * Web Audio Synthesizer for Sync Beats
 * Generates real, synchronized procedural sound for test tracks
 * including 80s synthwave / Billy Idol - Eyes Without a Face tribute chords.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.4;
  private activeOscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;
  private loopInterval: number | null = null;
  private currentTrackId: string = '';

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx && !this.isMuted) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public playTrack(trackId: string, trackTitle: string, audioStyle?: string) {
    this.init();
    this.stop();
    this.currentTrackId = trackId;

    if (!this.ctx || !this.gainNode) return;

    // Check audio style or match by title
    const t = trackTitle.toLowerCase();
    const style = audioStyle || (
      (t.includes('eyes without a face') || t.includes('billy idol')) ? 'billy_idol' :
      (t.includes('shibuya') || t.includes('lofi') || t.includes('podcast')) ? 'lofi' :
      (t.includes('neon') || t.includes('pulse') || t.includes('cyber')) ? 'cyberpunk' :
      (t.includes('tropical') || t.includes('sunset') || t.includes('house')) ? 'deephouse' :
      'synthwave'
    );

    switch (style) {
      case 'billy_idol':
        this.startEyesWithoutAFaceSynth();
        break;
      case 'lofi':
        this.startLofiSynth();
        break;
      case 'cyberpunk':
        this.startCyberpunkSynth();
        break;
      case 'deephouse':
        this.startDeepHouseSynth();
        break;
      case 'synthwave':
      default:
        this.startSynthwaveRetroSynth();
        break;
    }
  }

  /**
   * Signature 80s Dreamy Synth Pad & Arpeggio for "Eyes Without a Face"
   * Chords: Emaj7 (E4, G#4, B4, D#5) -> C#m7 (C#4, E4, G#4, B4) -> G#m7 (G#3, B3, D#4, F#4) -> A (A3, C#4, E4)
   */
  private startEyesWithoutAFaceSynth() {
    if (!this.ctx || !this.gainNode) return;

    const chords = [
      // Emaj7
      [329.63, 415.30, 493.88, 622.25],
      // C#m7
      [277.18, 329.63, 415.30, 493.88],
      // G#m7
      [207.65, 246.94, 311.13, 369.99],
      // Amaj7
      [220.00, 277.18, 329.63, 415.30]
    ];

    let chordIndex = 0;

    const playChordStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIndex % chords.length];

      // Dreamy chorus pad
      currentChord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((i - 1.5) * 6, now);

        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.exponentialRampToValueAtTime(0.08, now + 0.3);
        oscGain.gain.exponentialRampToValueAtTime(0.04, now + 1.2);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.95);

        osc.connect(oscGain);
        oscGain.connect(this.gainNode!);

        osc.start(now);
        osc.stop(now + 2.0);
        this.activeOscillators.push(osc);
      });

      // 80s Soft Bass Note
      const bassFreq = currentChord[0] / 2;
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(this.gainNode);

      bassOsc.start(now);
      bassOsc.stop(now + 1.9);
      this.activeOscillators.push(bassOsc);

      // 80s Drums
      this.triggerDrumHit(now, 'kick');
      this.triggerDrumHit(now + 0.5, 'hat');
      this.triggerDrumHit(now + 1.0, 'snare');
      this.triggerDrumHit(now + 1.5, 'hat');

      chordIndex++;
    };

    playChordStep();
    this.loopInterval = window.setInterval(playChordStep, 2000);
  }

  /**
   * High-Energy Retro Synthwave (Midnight City / Blinding Lights / Sweet Dreams)
   */
  private startSynthwaveRetroSynth() {
    if (!this.ctx || !this.gainNode) return;

    // Fast Synth Arpeggio notes (Fm / Cm / Bm)
    const arpNotes = [174.61, 220.00, 261.63, 349.23, 440.00, 523.25, 698.46, 523.25];
    let arpIdx = 0;

    const playStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const freq = arpNotes[arpIdx % arpNotes.length];

      // Bright synth lead
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.2);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 0.24);
      this.activeOscillators.push(osc);

      // Driving 80s bass every 2 steps
      if (arpIdx % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'square';
        bassOsc.frequency.setValueAtTime(freq / 4, now);

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.exponentialRampToValueAtTime(0.09, now + 0.03);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        bassOsc.connect(bassGain);
        bassGain.connect(this.gainNode);
        bassOsc.start(now);
        bassOsc.stop(now + 0.48);
        this.activeOscillators.push(bassOsc);

        this.triggerDrumHit(now, arpIdx % 4 === 0 ? 'kick' : 'snare');
      } else {
        this.triggerDrumHit(now, 'hat');
      }

      arpIdx++;
    };

    playStep();
    this.loopInterval = window.setInterval(playStep, 250); // 120 BPM 1/8th notes
  }

  /**
   * Warm Lo-Fi Chillhop Synth (Rainy Shibuya / Focus)
   */
  private startLofiSynth() {
    if (!this.ctx || !this.gainNode) return;

    // Jazzy 7th chords: Dm9 -> G13 -> Cmaj9 -> A7b13
    const lofiChords = [
      [146.83, 220.00, 261.63, 329.63, 392.00], // Dm9
      [196.00, 246.94, 329.63, 392.00, 440.00], // G13
      [130.81, 196.00, 246.94, 329.63, 392.00], // Cmaj9
      [220.00, 277.18, 329.63, 415.30, 523.25]  // A7alt
    ];
    let chordIdx = 0;

    const playLofiStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const currentChord = lofiChords[chordIdx % lofiChords.length];

      // Mellow Electric Piano Rhodes chords with warm lowpass
      currentChord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (idx * 0.03)); // subtle strum

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.exponentialRampToValueAtTime(0.06, now + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.gainNode!);

        osc.start(now);
        osc.stop(now + 1.9);
        this.activeOscillators.push(osc);
      });

      // Lazy boom-bap drums
      this.triggerDrumHit(now, 'kick');
      this.triggerDrumHit(now + 0.45, 'hat');
      this.triggerDrumHit(now + 0.9, 'snare');
      this.triggerDrumHit(now + 1.35, 'hat');

      chordIdx++;
    };

    playLofiStep();
    this.loopInterval = window.setInterval(playLofiStep, 1800);
  }

  /**
   * Cyberpunk Heavy Bass & Distorted Lead (Neon Nights)
   */
  private startCyberpunkSynth() {
    if (!this.ctx || !this.gainNode) return;

    const bassNotes = [65.41, 65.41, 73.42, 65.41, 87.31, 77.78, 65.41, 98.00];
    let stepIdx = 0;

    const playCyberStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const freq = bassNotes[stepIdx % bassNotes.length];

      // Aggressive Reese Bass
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.01, now); // Detune for fat sound

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.gainNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
      this.activeOscillators.push(osc1, osc2);

      // Heavy 4-on-the-floor
      if (stepIdx % 2 === 0) {
        this.triggerDrumHit(now, 'kick');
      } else {
        this.triggerDrumHit(now, 'snare');
      }
      this.triggerDrumHit(now + 0.15, 'hat');

      stepIdx++;
    };

    playCyberStep();
    this.loopInterval = window.setInterval(playCyberStep, 300);
  }

  /**
   * Melodic Deep House Synth (Vibe Tropical / Sunset)
   */
  private startDeepHouseSynth() {
    if (!this.ctx || !this.gainNode) return;

    // Warm deep house chords (Dm7 -> Am7 -> Bbmaj7 -> Gm7)
    const houseChords = [
      [293.66, 349.23, 440.00, 523.25],
      [220.00, 261.63, 329.63, 392.00],
      [233.08, 293.66, 349.23, 440.00],
      [196.00, 233.08, 293.66, 349.23]
    ];
    let step = 0;

    const playHouseStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const chord = houseChords[step % houseChords.length];

      // Organ-like FM synth chord stab
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);

        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.exponentialRampToValueAtTime(0.07, now + 0.03);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.gainNode!);

        osc.start(now);
        osc.stop(now + 0.65);
        this.activeOscillators.push(osc);
      });

      // Deep Sub Bass
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(chord[0] / 2, now);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      subOsc.connect(subGain);
      subGain.connect(this.gainNode);
      subOsc.start(now);
      subOsc.stop(now + 0.9);
      this.activeOscillators.push(subOsc);

      // House 4x4 Kick
      this.triggerDrumHit(now, 'kick');
      this.triggerDrumHit(now + 0.25, 'hat');
      this.triggerDrumHit(now + 0.5, 'hat');
      this.triggerDrumHit(now + 0.75, 'hat');

      step++;
    };

    playHouseStep();
    this.loopInterval = window.setInterval(playHouseStep, 1000);
  }

  private triggerDrumHit(time: number, type: 'kick' | 'snare' | 'hat') {
    if (!this.ctx || !this.gainNode) return;

    if (type === 'kick') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.gainNode);
      osc.start(time);
      osc.stop(time + 0.16);
      this.activeOscillators.push(osc);
    } else if (type === 'snare') {
      // Noise / tone burst for snare
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.gainNode);
      osc.start(time);
      osc.stop(time + 0.13);
      this.activeOscillators.push(osc);
    } else if (type === 'hat') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(8000, time);

      gain.gain.setValueAtTime(0.03, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      osc.connect(gain);
      gain.connect(this.gainNode);
      osc.start(time);
      osc.stop(time + 0.06);
      this.activeOscillators.push(osc);
    }
  }

  public stop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.activeOscillators = [];
  }
}

export const audioEngine = new AudioEngine();
