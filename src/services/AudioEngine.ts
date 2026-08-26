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

  public playTrack(trackId: string, trackTitle: string) {
    this.init();
    this.stop();
    this.currentTrackId = trackId;

    if (!this.ctx || !this.gainNode) return;

    // Check if it's Billy Idol - Eyes Without a Face
    const isEyesWithoutAFace = trackTitle.toLowerCase().includes('eyes without a face') || trackTitle.toLowerCase().includes('billy idol') || trackId.includes('billy');

    if (isEyesWithoutAFace) {
      this.startEyesWithoutAFaceSynth();
    } else {
      this.startGenericSynth(trackTitle);
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
        // Slight chorus detuning for that lush 80s vinyl sound
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

      // Low pass filter for bass warmth
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

      // 80s Kick & Soft Snare Beat
      this.triggerDrumHit(now, 'kick');
      this.triggerDrumHit(now + 0.5, 'hat');
      this.triggerDrumHit(now + 1.0, 'snare');
      this.triggerDrumHit(now + 1.5, 'hat');

      chordIndex++;
    };

    playChordStep();
    this.loopInterval = window.setInterval(playChordStep, 2000);
  }

  private startGenericSynth(title: string) {
    if (!this.ctx || !this.gainNode) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23];
    let noteIdx = 0;

    const playNoteStep = () => {
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const freq = notes[noteIdx % notes.length];

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.exponentialRampToValueAtTime(0.06, now + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode!);

      osc.start(now);
      osc.stop(now + 1.0);
      this.activeOscillators.push(osc);

      this.triggerDrumHit(now, 'kick');
      this.triggerDrumHit(now + 0.5, 'snare');

      noteIdx++;
    };

    playNoteStep();
    this.loopInterval = window.setInterval(playNoteStep, 1000);
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
