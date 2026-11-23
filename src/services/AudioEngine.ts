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
      (t.includes('fuego') || t.includes('808')) ? 'trapeton_dark' :
      (t.includes('miami') || t.includes('noche')) ? 'trapeton_miami' :
      (t.includes('sin freno') || t.includes('perreo')) ? 'trapeton_club' :
      (t.includes('sombra') || t.includes('luz')) ? 'trapeton_melodic' :
      (t.includes('eyes without a face') || t.includes('billy idol')) ? 'billy_idol' :
      (t.includes('shibuya') || t.includes('lofi') || t.includes('podcast')) ? 'lofi' :
      (t.includes('neon') || t.includes('pulse') || t.includes('cyber')) ? 'cyberpunk' :
      (t.includes('tropical') || t.includes('sunset') || t.includes('house')) ? 'deephouse' :
      'synthwave'
    );

    switch (style) {
      case 'trapeton_dark':
        this.startDarkTrapetonSynth();
        break;
      case 'trapeton_miami':
        this.startMiamiTrapetonSynth();
        break;
      case 'trapeton_club':
        this.startClubBangerTrapetonSynth();
        break;
      case 'trapeton_melodic':
        this.startMelodicChillRapSynth();
        break;
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

  /**
   * Dispara um sub-grave 808 clássico do Rap Americano (Travis Scott / Kendrick Lamar)
   */
  private trigger808Bass(time: number, freq: number = 65.4, duration: number = 0.6) {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Pitch drop característico do 808
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.08);

    gain.gain.setValueAtTime(0.28, time);
    gain.gain.setValueAtTime(0.22, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + duration + 0.05);
    this.activeOscillators.push(osc);
  }

  /**
   * Dispara a caixa sincopada estalada do Dembow (Reggaeton)
   */
  private triggerDembowSnare(time: number, snapLevel: number = 0.12) {
    if (!this.ctx || !this.gainNode) return;

    // Tom corpo
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.09);

    gain.gain.setValueAtTime(snapLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain);
    gain.connect(this.gainNode);
    osc.start(time);
    osc.stop(time + 0.11);
    this.activeOscillators.push(osc);

    // Ruído estalado de alta frequência
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(3200, time);

    snapGain.gain.setValueAtTime(snapLevel * 0.7, time);
    snapGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    snapOsc.connect(snapGain);
    snapGain.connect(this.gainNode);
    snapOsc.start(time);
    snapOsc.stop(time + 0.07);
    this.activeOscillators.push(snapOsc);
  }

  /**
   * 01. FUEGO & 808S (INTRO) - Dark Trapeton (90 BPM, Dó menor / Cm)
   * Travis Scott dark synths + Dembow acelerado + Sub 808 pesado
   */
  private startDarkTrapetonSynth() {
    if (!this.ctx || !this.gainNode) return;

    // Cm chords / basslines (C2: 65.4, Eb2: 77.8, G2: 98, Bb2: 116.5)
    const bassNotes = [65.41, 65.41, 77.78, 58.27];
    const synthNotes = [261.63, 311.13, 392.00, 466.16]; // C4, Eb4, G4, Bb4
    let step = 0;

    const barDuration = (60 / 90) * 4; // 90 BPM = 2.66s por compasso de 4 tempos
    const beatSec = 60 / 90; // ~0.666s

    const playDarkTrapStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const chordIdx = step % 4;
      const rootFreq = bassNotes[chordIdx];
      const padFreq = synthNotes[chordIdx];

      // 1. Dark Trap Pad Obscuro (Estilo Travis Scott)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(padFreq, now);
      osc2.frequency.setValueAtTime(padFreq * 1.5, now); // 5th
      osc1.detune.setValueAtTime(-8, now);
      osc2.detune.setValueAtTime(8, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, now);
      filter.frequency.exponentialRampToValueAtTime(1100, now + beatSec * 2);
      filter.frequency.exponentialRampToValueAtTime(500, now + barDuration - 0.1);

      padGain.gain.setValueAtTime(0.001, now);
      padGain.gain.linearRampToValueAtTime(0.04, now + 0.1);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + barDuration - 0.05);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(padGain);
      padGain.connect(this.gainNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + barDuration);
      osc2.stop(now + barDuration);
      this.activeOscillators.push(osc1, osc2);

      // 2. Sub-808 Massivo
      this.trigger808Bass(now, rootFreq, beatSec * 1.8);
      this.trigger808Bass(now + beatSec * 2, rootFreq * 1.18, beatSec * 1.6);

      // 3. Batida Dembow & Kicks
      // Tempo 1: Kick
      this.triggerDrumHit(now, 'kick');
      // Dembow Snare sincopado (tempo 1.75, 2.5, 3.75)
      this.triggerDembowSnare(now + beatSec * 0.75, 0.12);
      // Tempo 2: Kick
      this.triggerDrumHit(now + beatSec, 'kick');
      this.triggerDembowSnare(now + beatSec * 1.5, 0.14);
      // Tempo 3: Kick
      this.triggerDrumHit(now + beatSec * 2, 'kick');
      this.triggerDembowSnare(now + beatSec * 2.75, 0.12);
      // Tempo 4: Kick
      this.triggerDrumHit(now + beatSec * 3, 'kick');
      this.triggerDembowSnare(now + beatSec * 3.5, 0.15);

      // 4. Trap Hi-Hats rápidos (16ths & 32nd rolls)
      for (let h = 0; h < 16; h++) {
        const hatTime = now + (h * beatSec) / 4;
        this.triggerTrapHiHat(hatTime, h % 4 === 0 ? 0.035 : 0.02);
      }
      // Roll no final do compasso
      this.triggerTrapHiHat(now + beatSec * 3.75, 0.04);
      this.triggerTrapHiHat(now + beatSec * 3.875, 0.045);

      step++;
    };

    playDarkTrapStep();
    this.loopInterval = window.setInterval(playDarkTrapStep, barDuration * 1000);
  }

  /**
   * 02. NOCHE EN MIAMI - Commercial Trapeton (96 BPM, Lá menor / Am)
   * Pluck marcante no refrão + Flow US rap com graves profundos + Dembow latino
   */
  private startMiamiTrapetonSynth() {
    if (!this.ctx || !this.gainNode) return;

    const beatSec = 60 / 96; // ~0.625s
    const barDuration = beatSec * 4; // 2.5s
    // Am, F, C, G
    const chords = [
      { bass: 55.00, pluck: [440, 523.25, 659.25] }, // Am (A1, A4, C5, E5)
      { bass: 43.65, pluck: [349.23, 440, 523.25] }, // F (F1, F4, A4, C5)
      { bass: 65.41, pluck: [523.25, 659.25, 783.99] }, // C (C2, C5, E5, G5)
      { bass: 48.99, pluck: [392.00, 493.88, 587.33] }  // G (G1, G4, B4, D5)
    ];
    let step = 0;

    const playMiamiStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const current = chords[step % chords.length];

      // 1. Pluck Melódico Marcante no Refrão
      current.pluck.forEach((freq, idx) => {
        const pluckTime = now + idx * 0.15;
        const osc = this.ctx!.createOscillator();
        const pluckGain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, pluckTime);

        pluckGain.gain.setValueAtTime(0.001, pluckTime);
        pluckGain.gain.linearRampToValueAtTime(0.06, pluckTime + 0.015);
        pluckGain.gain.exponentialRampToValueAtTime(0.001, pluckTime + 0.35);

        osc.connect(pluckGain);
        pluckGain.connect(this.gainNode!);
        osc.start(pluckTime);
        osc.stop(pluckTime + 0.36);
        this.activeOscillators.push(osc);
      });

      // 2. Sub 808 Profundo de Miami
      this.trigger808Bass(now, current.bass, beatSec * 1.8);
      this.trigger808Bass(now + beatSec * 2, current.bass * 1.33, beatSec * 1.5);

      // 3. Batida Dembow Reggaeton
      this.triggerDrumHit(now, 'kick');
      this.triggerDembowSnare(now + beatSec * 0.75, 0.13);
      this.triggerDrumHit(now + beatSec, 'kick');
      this.triggerDembowSnare(now + beatSec * 1.5, 0.14);
      this.triggerDrumHit(now + beatSec * 2, 'kick');
      this.triggerDembowSnare(now + beatSec * 2.75, 0.13);
      this.triggerDrumHit(now + beatSec * 3, 'kick');
      this.triggerDembowSnare(now + beatSec * 3.5, 0.15);

      // 4. Trap Hi-Hats
      for (let h = 0; h < 8; h++) {
        this.triggerTrapHiHat(now + (h * beatSec) / 2, 0.025);
      }

      step++;
    };

    playMiamiStep();
    this.loopInterval = window.setInterval(playMiamiStep, barDuration * 1000);
  }

  /**
   * 03. SIN FRENO - Club Banger / Perreo Duro (100 BPM, Fá menor / Fm)
   * Caixas bem estaladas no contra-tempo e sub-808s contínuos
   */
  private startClubBangerTrapetonSynth() {
    if (!this.ctx || !this.gainNode) return;

    const beatSec = 60 / 100; // 0.6s
    const barDuration = beatSec * 4; // 2.4s
    const bassNotes = [43.65, 43.65, 51.91, 38.89]; // Fm, Fm, Ab, Eb
    let step = 0;

    const playClubBangerStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const root = bassNotes[step % bassNotes.length];

      // 1. Synth Club Lead Agressivo
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'sawtooth';
      leadOsc.frequency.setValueAtTime(174.61 * 2, now); // F4
      leadGain.gain.setValueAtTime(0.04, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      leadOsc.connect(leadGain);
      leadGain.connect(this.gainNode);
      leadOsc.start(now);
      leadOsc.stop(now + 0.45);
      this.activeOscillators.push(leadOsc);

      // 2. Sub-808 Contínuo Pesado
      this.trigger808Bass(now, root, beatSec * 1.5);
      this.trigger808Bass(now + beatSec * 1.5, root * 1.25, beatSec * 1.2);
      this.trigger808Bass(now + beatSec * 3, root, beatSec * 0.9);

      // 3. Perreo Duro Snare (Caixas estaladas no contra-tempo)
      this.triggerDrumHit(now, 'kick');
      this.triggerDembowSnare(now + beatSec * 0.75, 0.16);
      this.triggerDrumHit(now + beatSec, 'kick');
      this.triggerDembowSnare(now + beatSec * 1.5, 0.18);
      this.triggerDrumHit(now + beatSec * 2, 'kick');
      this.triggerDembowSnare(now + beatSec * 2.75, 0.16);
      this.triggerDrumHit(now + beatSec * 3, 'kick');
      this.triggerDembowSnare(now + beatSec * 3.5, 0.20);

      // 4. Hi-Hats rápidos
      for (let i = 0; i < 16; i++) {
        this.triggerTrapHiHat(now + (i * beatSec) / 4, 0.02);
      }

      step++;
    };

    playClubBangerStep();
    this.loopInterval = window.setInterval(playClubBangerStep, barDuration * 1000);
  }

  /**
   * 04. SOMBRA & LUZ - Melodic Chill Rap (92 BPM, Sol menor / Gm)
   * Pianos sutis, atmosfera noturna, R&B cadenciado e dembow suave
   */
  private startMelodicChillRapSynth() {
    if (!this.ctx || !this.gainNode) return;

    const beatSec = 60 / 92; // ~0.652s
    const barDuration = beatSec * 4; // 2.6s
    // Gm, Eb, Bb, F
    const chords = [
      { bass: 48.99, notes: [196.00, 233.08, 293.66] }, // Gm
      { bass: 38.89, notes: [155.56, 196.00, 233.08] }, // Eb
      { bass: 58.27, notes: [233.08, 293.66, 349.23] }, // Bb
      { bass: 43.65, notes: [174.61, 220.00, 261.63] }  // F
    ];
    let step = 0;

    const playMelodicStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const cur = chords[step % chords.length];

      // 1. Piano Elétrico Sutil Rhodes / Vocais Noturnos
      cur.notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.2);

        gain.gain.setValueAtTime(0.001, now + idx * 0.2);
        gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.2 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.2 + 1.2);

        osc.connect(gain);
        gain.connect(this.gainNode!);
        osc.start(now + idx * 0.2);
        osc.stop(now + idx * 0.2 + 1.25);
        this.activeOscillators.push(osc);
      });

      // 2. Sub-Bass Aveludado
      this.trigger808Bass(now, cur.bass, beatSec * 2.2);

      // 3. Dembow Mid-Tempo Suave
      this.triggerDrumHit(now, 'kick');
      this.triggerDembowSnare(now + beatSec * 0.75, 0.09);
      this.triggerDrumHit(now + beatSec * 1.5, 'kick');
      this.triggerDembowSnare(now + beatSec * 2.5, 0.10);
      this.triggerDembowSnare(now + beatSec * 3.5, 0.08);

      // 4. Shaker / Hi-Hat sutil
      for (let s = 0; s < 8; s++) {
        this.triggerTrapHiHat(now + (s * beatSec) / 2, 0.018);
      }

      step++;
    };

    playMelodicStep();
    this.loopInterval = window.setInterval(playMelodicStep, barDuration * 1000);
  }

  private triggerTrapHiHat(time: number, velocity: number = 0.03) {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(9500, time);

    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.04);

    osc.connect(gain);
    gain.connect(this.gainNode);
    osc.start(time);
    osc.stop(time + 0.045);
    this.activeOscillators.push(osc);
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
