/**
 * Sample-Based Audio Engine for Museum Melody
 * 
 * Plays real recorded instrument audio samples with authentic timbres:
 * - Real plucks, reed tones, flute notes, hammered strikes, and percussion strokes
 * - Loaded as Web Audio API AudioBuffers and cached in memory
 * - Pitch-shifting via AudioBufferSourceNode.playbackRate when needed
 * - Routes through shared soundEngine masterGain -> analyser -> destination
 * - Capturable by SessionRecorder for multi-instrument jam recordings
 */

import { soundEngine, SWARAS } from "./soundEngine";

const MELODIC_SWARAS = ["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni", "SaHigh"];

const PERCUSSION_STROKES: Record<string, string[]> = {
  tabla: ["Na", "Tin", "Dha", "Ge", "Tun", "Ke"],
  pakhawaj: ["Dha", "Tin", "Ta", "Ge", "Tun", "Na"],
  dholki: ["Na", "Tin", "Dha", "Ge", "Tun", "Ke"],
  khanjira: ["Dha", "Tin", "Ta", "Ge"],
  chimta: ["Tin", "Ta", "Na"],
  manjira: ["Tin", "Ta"],
};

// Map instrument ID or model_class to public/samples/ folder
const SAMPLE_FOLDER_MAP: Record<string, string> = {
  sitar: "sitar",
  "mayuri-veena": "sitar",
  mayuri_veena: "sitar",
  tanpura: "tanpura",
  "miraj-tanpura": "tanpura",
  sarangi: "sarangi",
  sarod: "sarod",
  bansuri: "bansuri",
  shehnai: "shehnai",
  sundari: "shehnai",
  tutari: "shehnai",
  tarpa: "bansuri",
  harmonium: "harmonium",
  santoor: "santoor",
  tabla: "tabla",
  pakhawaj: "pakhawaj",
  dholki: "tabla",
  "ektara-tuntuna": "sitar",
  tuntuna: "sitar",
  dilruba: "sarangi",
  "pungi-been": "shehnai",
  pungi: "shehnai",
  morchang: "santoor",
  swarmandal: "santoor",
  chimta: "tabla",
  khanjira: "tabla",
  "taal-manjira": "santoor",
  manjira: "santoor",
  surshringar: "sarod",
};

class SampleEngine {
  private bufferCache = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<boolean>>();

  /**
   * Resolve directory for instrument
   */
  public getSampleDir(instrumentId: string): string {
    const normalized = instrumentId.toLowerCase().trim();
    return SAMPLE_FOLDER_MAP[normalized] || "sitar";
  }

  /**
   * Check if instrument uses discrete percussion strokes
   */
  public isPercussion(instrumentId: string): boolean {
    const dir = this.getSampleDir(instrumentId);
    return dir === "tabla" || dir === "pakhawaj";
  }

  /**
   * Get stroke names for percussion instruments
   */
  public getStrokes(instrumentId: string): string[] {
    const dir = this.getSampleDir(instrumentId);
    return PERCUSSION_STROKES[dir] || PERCUSSION_STROKES.tabla;
  }

  /**
   * Preload an audio file and decode into AudioBuffer
   */
  private async loadBuffer(url: string): Promise<AudioBuffer | null> {
    const ctx = soundEngine.getContext();
    if (!ctx) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch sample: ${url} (${response.status})`);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (err) {
      console.warn(`Error decoding audio sample ${url}:`, err);
      return null;
    }
  }

  /**
   * Preload all samples for an instrument
   */
  public async loadInstrument(instrumentId: string): Promise<boolean> {
    const dir = this.getSampleDir(instrumentId);
    if (this.loadingPromises.has(dir)) {
      return this.loadingPromises.get(dir)!;
    }

    const loadPromise = (async () => {
      soundEngine.resume();
      const ctx = soundEngine.getContext();
      if (!ctx) return false;

      const isPerc = this.isPercussion(instrumentId);
      const keysToLoad = isPerc
        ? this.getStrokes(instrumentId)
        : MELODIC_SWARAS;

      const results = await Promise.all(
        keysToLoad.map(async (key) => {
          const cacheKey = `${dir}/${key}`;
          if (this.bufferCache.has(cacheKey)) return true;

          const url = `/samples/${dir}/${key}.mp3`;
          const buffer = await this.loadBuffer(url);
          if (buffer) {
            this.bufferCache.set(cacheKey, buffer);
            return true;
          }
          return false;
        })
      );

      const loadedCount = results.filter(Boolean).length;
      return loadedCount > 0;
    })();

    this.loadingPromises.set(dir, loadPromise);
    return loadPromise;
  }

  /**
   * Check if instrument is already loaded
   */
  public isInstrumentLoaded(instrumentId: string): boolean {
    const dir = this.getSampleDir(instrumentId);
    const sampleKey = this.isPercussion(instrumentId)
      ? this.getStrokes(instrumentId)[0]
      : "Sa";
    return this.bufferCache.has(`${dir}/${sampleKey}`);
  }

  /**
   * Play a real melodic instrument note.
   * Uses the exact recorded note sample if available, or pitch-shifts the base Sa note.
   */
  public playNote(
    instrumentId: string,
    noteName: string,
    frequency?: number,
    durationSec = 2.0,
    volume = 0.85
  ) {
    soundEngine.resume();
    const ctx = soundEngine.getContext();
    const masterGain = soundEngine.getMasterGain();
    if (!ctx || !masterGain) return;

    const dir = this.getSampleDir(instrumentId);

    // Normalize note key
    let noteKey = noteName.replace("'", "High");
    let buffer = this.bufferCache.get(`${dir}/${noteKey}`);
    let playbackRate = 1.0;

    // If specific note sample not loaded yet, try base "Sa" with pitch shifting
    if (!buffer) {
      buffer = this.bufferCache.get(`${dir}/Sa`);
      if (buffer && frequency) {
        // Base Sa is C4 (261.63 Hz)
        playbackRate = frequency / 261.63;
      }
    }

    if (!buffer) {
      // Background lazy load if missing
      this.loadInstrument(instrumentId).catch(console.warn);

      // Fallback to synthesis while loading
      const swara = SWARAS.find((s) => s.name === noteName);
      const freq = frequency || (swara ? swara.frequency : 261.63);
      soundEngine.playVeenaNote(freq, durationSec, volume);
      return;
    }

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, now);

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(volume, now);
    // Smooth release near end
    const decayStart = Math.min(buffer.duration / playbackRate, durationSec);
    noteGain.gain.setValueAtTime(volume, now + decayStart * 0.7);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + decayStart);

    source.connect(noteGain);
    noteGain.connect(masterGain);

    source.start(now);
    source.stop(now + decayStart);
  }

  /**
   * Play a real percussion stroke (e.g. Na, Tin, Dha, Ge, Tun, Ke)
   */
  public playStroke(
    instrumentId: string,
    strokeName: string,
    volume = 0.9
  ) {
    soundEngine.resume();
    const ctx = soundEngine.getContext();
    const masterGain = soundEngine.getMasterGain();
    if (!ctx || !masterGain) return;

    const dir = this.getSampleDir(instrumentId);
    let buffer = this.bufferCache.get(`${dir}/${strokeName}`);

    if (!buffer) {
      // If stroke not found, try fallback stroke
      const strokes = this.getStrokes(instrumentId);
      for (const s of strokes) {
        buffer = this.bufferCache.get(`${dir}/${s}`);
        if (buffer) break;
      }
    }

    if (!buffer) {
      this.loadInstrument(instrumentId).catch(console.warn);
      // Fallback synthesis
      const type = (strokeName.toLowerCase() as "dha" | "dhin" | "tin" | "ta" | "ge");
      soundEngine.playTablaStroke(type || "dha", volume);
      return;
    }

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const strokeGain = ctx.createGain();
    strokeGain.gain.setValueAtTime(volume, now);
    strokeGain.gain.exponentialRampToValueAtTime(0.0001, now + buffer.duration);

    source.connect(strokeGain);
    strokeGain.connect(masterGain);

    source.start(now);
  }
}

export const sampleEngine = new SampleEngine();
