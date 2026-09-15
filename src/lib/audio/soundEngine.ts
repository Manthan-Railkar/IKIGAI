/**
 * Web Audio API Sound Engine for Museum Melody
 * 
 * Provides authentic Indian classical sound synthesis:
 * - Veena string pluck modeling (Sa, Re, Ga, Ma, Pa, Dha, Ni)
 * - Curated raga alap phrase for 'Hear It' preview
 * - Realtime audio AnalyserNode for waveforms
 * - Tabla percussion synthesis (Dayan treble + Bayan bass)
 * - Sitar / Tanpura acoustic drone
 * - Multi-track playback sequencer for user recordings
 */

export interface NoteEvent {
  note: string;
  frequency: number;
  timestamp: number; // ms from recording start
  duration: number; // ms
}

export interface SwaraDefinition {
  name: string;
  western: string;
  frequency: number;
  fullIndianName: string;
  keyHint: string;
}

export const SWARAS: SwaraDefinition[] = [
  { name: "Sa", western: "C4", frequency: 261.63, fullIndianName: "Shadja", keyHint: "1" },
  { name: "Re", western: "D4", frequency: 293.66, fullIndianName: "Rishabh", keyHint: "2" },
  { name: "Ga", western: "E4", frequency: 329.63, fullIndianName: "Gandhar", keyHint: "3" },
  { name: "Ma", western: "F4", frequency: 349.23, fullIndianName: "Madhyam", keyHint: "4" },
  { name: "Pa", western: "G4", frequency: 392.00, fullIndianName: "Pancham", keyHint: "5" },
  { name: "Dha", western: "A4", frequency: 440.00, fullIndianName: "Dhaivat", keyHint: "6" },
  { name: "Ni", western: "B4", frequency: 493.88, fullIndianName: "Nishad", keyHint: "7" },
  { name: "Sa'", western: "C5", frequency: 523.25, fullIndianName: "Taar Shadja", keyHint: "8" },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private isDroneActive = false;
  private tablaInterval: number | null = null;
  private isTablaActive = false;
  private curatedTimeouts: number[] = [];
  private isCuratedPlaying = false;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    } catch (err) {
      console.warn("AudioContext init failed:", err);
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(console.warn);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  /**
   * Synthesize a single authentic plucked Veena string tone.
   * Uses harmonic blend + jawari buzz + dual resonant acoustic filters.
   */
  public playVeenaNote(frequency: number, durationSec = 2.2, volume = 0.8) {
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Output node for this pluck
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + 0.012); // sharp attack
    noteGain.gain.exponentialRampToValueAtTime(volume * 0.45, now + 0.35); // initial ring
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec); // long acoustic decay

    // Resonant body filter (simulating Veena dried gourd acoustic resonance)
    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = "bandpass";
    bodyFilter.frequency.setValueAtTime(Math.min(frequency * 1.8, 1200), now);
    bodyFilter.Q.setValueAtTime(2.2, now);

    // Highpass to eliminate sub rumble
    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = "highpass";
    hpFilter.frequency.setValueAtTime(140, now);

    // Fundamental Tone (warm saw/triangle mix)
    const osc1 = this.ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(frequency, now);

    // Subtle pitch dip simulating initial finger plectrum release
    osc1.frequency.exponentialRampToValueAtTime(frequency * 1.008, now + 0.04);
    osc1.frequency.exponentialRampToValueAtTime(frequency, now + 0.12);

    const osc1Gain = this.ctx.createGain();
    osc1Gain.gain.setValueAtTime(0.5, now);

    // Second harmonic overtone
    const osc2 = this.ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(frequency * 2, now);
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.35, now);

    // Sympathetic chime harmonic (3rd harmonic)
    const osc3 = this.ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(frequency * 3, now);
    const osc3Gain = this.ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.18, now);

    // Pluck noise burst (pithy click of ivory mizrab / plectrum)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.02);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28, now);

    // Connections
    osc1.connect(osc1Gain);
    osc2.connect(osc2Gain);
    osc3.connect(osc3Gain);
    noiseSource.connect(noiseGain);

    osc1Gain.connect(bodyFilter);
    osc2Gain.connect(bodyFilter);
    osc3Gain.connect(bodyFilter);
    noiseGain.connect(bodyFilter);

    bodyFilter.connect(hpFilter);
    hpFilter.connect(noteGain);
    noteGain.connect(this.masterGain);

    // Start & stop
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    noiseSource.start(now);

    osc1.stop(now + durationSec);
    osc2.stop(now + durationSec);
    osc3.stop(now + durationSec);
    noiseSource.stop(now + 0.05);

    setTimeout(() => {
      noteGain.disconnect();
      bodyFilter.disconnect();
      hpFilter.disconnect();
    }, (durationSec + 0.1) * 1000);
  }

  /**
   * Play curated Raga phrase for 'HEAR IT'
   * Classical melodic phrase in Raga Yaman / Bhairav
   */
  public playCuratedRaga(onNote?: (noteName: string) => void, onComplete?: () => void) {
    this.stopCuratedRaga();
    this.resume();
    this.isCuratedPlaying = true;

    // Start background tanpura drone for lush classical ambiance
    this.startDrone(0.25);

    const ragaPhrase: { swara: string; delay: number; duration: number }[] = [
      { swara: "Sa", delay: 100, duration: 1200 },
      { swara: "Re", delay: 1200, duration: 900 },
      { swara: "Ga", delay: 2000, duration: 1400 },
      { swara: "Ma", delay: 3300, duration: 800 },
      { swara: "Pa", delay: 4000, duration: 1600 },
      { swara: "Dha", delay: 5500, duration: 900 },
      { swara: "Ni", delay: 6300, duration: 1100 },
      { swara: "Sa'", delay: 7300, duration: 2000 },
      { swara: "Ni", delay: 9200, duration: 800 },
      { swara: "Dha", delay: 9900, duration: 800 },
      { swara: "Pa", delay: 10600, duration: 1200 },
      { swara: "Ga", delay: 11700, duration: 1000 },
      { swara: "Re", delay: 12600, duration: 1100 },
      { swara: "Sa", delay: 13600, duration: 2400 },
    ];

    ragaPhrase.forEach((item) => {
      const timer = window.setTimeout(() => {
        if (!this.isCuratedPlaying) return;
        const swaraObj = SWARAS.find((s) => s.name === item.swara);
        if (swaraObj) {
          this.playVeenaNote(swaraObj.frequency, item.duration / 1000, 0.75);
          onNote?.(item.swara);
        }
      }, item.delay);
      this.curatedTimeouts.push(timer);
    });

    const totalDuration = 16200;
    const endTimer = window.setTimeout(() => {
      this.isCuratedPlaying = false;
      this.stopDrone();
      onComplete?.();
    }, totalDuration);
    this.curatedTimeouts.push(endTimer);
  }

  public stopCuratedRaga() {
    this.isCuratedPlaying = false;
    this.curatedTimeouts.forEach((t) => clearTimeout(t));
    this.curatedTimeouts = [];
    this.stopDrone();
  }

  /**
   * Continuous Tanpura / Drone accompaniment
   */
  public startDrone(volume = 0.2) {
    if (this.isDroneActive) return;
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.droneGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.2);
    this.droneGain.connect(this.masterGain);

    const droneFreqs = [130.81, 196.00, 261.63]; // C3, G3, C4 (Sa-Pa-Sa')
    this.droneOscillators = droneFreqs.map((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = idx === 1 ? "sine" : "sawtooth";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, this.ctx!.currentTime);

      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.35 / (idx + 1), this.ctx!.currentTime);

      osc.connect(filter);
      filter.connect(g);
      g.connect(this.droneGain!);
      osc.start();
      return osc;
    });

    this.isDroneActive = true;
  }

  public stopDrone() {
    if (!this.isDroneActive || !this.droneGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    setTimeout(() => {
      this.droneOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.droneOscillators = [];
      if (this.droneGain) {
        this.droneGain.disconnect();
        this.droneGain = null;
      }
      this.isDroneActive = false;
    }, 850);
  }

  /**
   * Synthesize Tabla rhythm stroke
   */
  public playTablaStroke(type: "dha" | "dhin" | "tin" | "ta" | "ge", volume = 0.6) {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Bayan (Bass drum stroke) for 'dha', 'dhin', 'ge'
    if (type === "dha" || type === "dhin" || type === "ge") {
      const bayanOsc = this.ctx.createOscillator();
      bayanOsc.type = "sine";
      bayanOsc.frequency.setValueAtTime(135, now);
      bayanOsc.frequency.exponentialRampToValueAtTime(68, now + 0.32); // modulated bass bend

      const bayanGain = this.ctx.createGain();
      bayanGain.gain.setValueAtTime(volume * 0.9, now);
      bayanGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

      bayanOsc.connect(bayanGain);
      bayanGain.connect(this.masterGain);

      bayanOsc.start(now);
      bayanOsc.stop(now + 0.38);
    }

    // Dayan (Treble drum stroke)
    const dayanOsc = this.ctx.createOscillator();
    dayanOsc.type = "sine";
    const dayanFreq = type === "tin" || type === "ta" ? 315 : 293.66;
    dayanOsc.frequency.setValueAtTime(dayanFreq, now);

    const dayanFilter = this.ctx.createBiquadFilter();
    dayanFilter.type = "bandpass";
    dayanFilter.frequency.setValueAtTime(dayanFreq * 1.5, now);
    dayanFilter.Q.setValueAtTime(3.0, now);

    const dayanGain = this.ctx.createGain();
    dayanGain.gain.setValueAtTime(volume * 0.75, now);
    dayanGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    dayanOsc.connect(dayanFilter);
    dayanFilter.connect(dayanGain);
    dayanGain.connect(this.masterGain);

    dayanOsc.start(now);
    dayanOsc.stop(now + 0.28);
  }

  /**
   * Start looping rhythmic accompaniment (Teentaal groove)
   */
  public startTablaLoop(bpm = 78, volume = 0.5) {
    if (this.isTablaActive) return;
    this.isTablaActive = true;

    const beatDurationMs = (60 / bpm) * 500; // eighth notes
    const pattern: ("dha" | "dhin" | "tin" | "ta" | "ge")[] = [
      "dha", "dhin", "dhin", "dha",
      "dha", "dhin", "dhin", "dha",
      "dha", "tin",  "tin",  "ta",
      "ta",  "dhin", "dhin", "dha"
    ];
    let step = 0;

    this.tablaInterval = window.setInterval(() => {
      if (!this.isTablaActive) return;
      const stroke = pattern[step % pattern.length];
      this.playTablaStroke(stroke, volume);
      step++;
    }, beatDurationMs);
  }

  public stopTablaLoop() {
    this.isTablaActive = false;
    if (this.tablaInterval !== null) {
      clearInterval(this.tablaInterval);
      this.tablaInterval = null;
    }
  }

  /**
   * Synchronized multi-track player for composition
   */
  public playComposition(
    recordedNotes: NoteEvent[],
    options: {
      includeTabla: boolean;
      includeSitar: boolean;
      veenaVolume?: number;
      tablaVolume?: number;
      sitarVolume?: number;
      onNoteHighlight?: (note: string) => void;
      onComplete?: () => void;
    }
  ): () => void {
    this.resume();

    // Start background sitar/drone if enabled
    if (options.includeSitar) {
      this.startDrone(options.sitarVolume ?? 0.25);
    }

    // Start tabla rhythmic backing if enabled
    if (options.includeTabla) {
      this.startTablaLoop(76, options.tablaVolume ?? 0.5);
    }

    const timers: number[] = [];
    let maxTime = 3000;

    recordedNotes.forEach((event) => {
      const endTime = event.timestamp + (event.duration || 1000);
      if (endTime > maxTime) maxTime = endTime;

      const t = window.setTimeout(() => {
        this.playVeenaNote(event.frequency, (event.duration || 1200) / 1000, options.veenaVolume ?? 0.85);
        options.onNoteHighlight?.(event.note);
      }, event.timestamp);
      timers.push(t);
    });

    const completionTimer = window.setTimeout(() => {
      if (options.includeTabla) this.stopTablaLoop();
      if (options.includeSitar) this.stopDrone();
      options.onComplete?.();
    }, maxTime + 600);
    timers.push(completionTimer);

    // Return cleanup callback
    return () => {
      timers.forEach((t) => clearTimeout(t));
      this.stopTablaLoop();
      this.stopDrone();
    };
  }
}

export const soundEngine = new SoundEngine();
