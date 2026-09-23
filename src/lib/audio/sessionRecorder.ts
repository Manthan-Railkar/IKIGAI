/**
 * App-Level Session Audio Recorder
 * 
 * Captures real-time audio from the shared Web Audio API graph
 * across multiple instruments in a single continuous recording take (Cross-Instrument Jam).
 * 
 * Flow:
 * 1. soundEngine.masterGain -> MediaStreamAudioDestinationNode
 * 2. MediaRecorder captures audio into WebM/OGG chunks
 * 3. On stop: AudioContext.decodeAudioData decodes chunks to PCM AudioBuffer
 * 4. lamejs encodes PCM into standard MP3 format client-side
 * 5. Instant MP3 download link generated (e.g. museum-jam-session.mp3)
 */

import { soundEngine } from "./soundEngine";
import * as lamejs from "lamejs";

export interface LoggedNoteEvent {
  instrument: string;
  note: string;
  timestamp: number; // ms from recording start
  frequency?: number;
}

export interface RecordingResult {
  blob: Blob;
  url: string;
  durationMs: number;
  events: LoggedNoteEvent[];
  filename: string;
}

type StateListener = (state: {
  isRecording: boolean;
  startTime: number | null;
  elapsedMs: number;
  eventsCount: number;
  lastResult: RecordingResult | null;
  isProcessing: boolean;
}) => void;

class SessionRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private streamDest: MediaStreamAudioDestinationNode | null = null;
  private recordedChunks: Blob[] = [];
  private isRecordingState = false;
  private isProcessingState = false;
  private recordingStartTime: number | null = null;
  private loggedEvents: LoggedNoteEvent[] = [];
  private listeners: Set<StateListener> = new Set();
  private timerInterval: number | null = null;
  private lastResultState: RecordingResult | null = null;

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const elapsed = this.isRecordingState && this.recordingStartTime
      ? Date.now() - this.recordingStartTime
      : 0;

    const payload = {
      isRecording: this.isRecordingState,
      startTime: this.recordingStartTime,
      elapsedMs: elapsed,
      eventsCount: this.loggedEvents.length,
      lastResult: this.lastResultState,
      isProcessing: this.isProcessingState,
    };

    this.listeners.forEach((l) => l(payload));
  }

  public isRecording(): boolean {
    return this.isRecordingState;
  }

  public getStartTime(): number | null {
    return this.recordingStartTime;
  }

  public getLoggedEvents(): LoggedNoteEvent[] {
    return [...this.loggedEvents];
  }

  /**
   * Start a cross-instrument jam session recording.
   * Continues running seamlessly across page and instrument navigation.
   */
  public start(): boolean {
    if (this.isRecordingState) return true;

    try {
      soundEngine.resume();
      const ctx = soundEngine.getContext();
      const masterGain = soundEngine.getMasterGain();

      if (!ctx || !masterGain) {
        console.warn("Cannot start session recorder: AudioContext unavailable");
        return false;
      }

      // Create stream destination from Web Audio graph
      this.streamDest = ctx.createMediaStreamDestination();
      masterGain.connect(this.streamDest);

      // Supported MIME type
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "",
      ];
      let selectedMime = "";
      for (const m of mimeTypes) {
        if (!m || MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      this.recordedChunks = [];
      this.loggedEvents = [];
      this.mediaRecorder = selectedMime
        ? new MediaRecorder(this.streamDest.stream, { mimeType: selectedMime })
        : new MediaRecorder(this.streamDest.stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(250); // capture slice every 250ms
      this.isRecordingState = true;
      this.recordingStartTime = Date.now();

      // UI update timer
      this.timerInterval = window.setInterval(() => {
        this.notify();
      }, 500);

      this.notify();
      return true;
    } catch (err) {
      console.error("Failed to start session recorder:", err);
      return false;
    }
  }

  /**
   * Log an instrument note/stroke event to the timeline
   */
  public logNote(instrument: string, note: string, frequency?: number) {
    if (!this.isRecordingState || !this.recordingStartTime) return;

    this.loggedEvents.push({
      instrument,
      note,
      timestamp: Date.now() - this.recordingStartTime,
      frequency,
    });
    this.notify();
  }

  /**
   * Stop session recording, decode to PCM, encode to MP3 via lamejs, and return downloadable file
   */
  public async stop(): Promise<RecordingResult | null> {
    if (!this.isRecordingState && !this.mediaRecorder) {
      return this.lastResultState;
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.isRecordingState = false;
    this.isProcessingState = true;
    this.notify();

    const duration = this.recordingStartTime ? Date.now() - this.recordingStartTime : 0;
    const events = [...this.loggedEvents];

    return new Promise<RecordingResult | null>((resolve) => {
      if (!this.mediaRecorder) {
        this.isProcessingState = false;
        this.notify();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Disconnect stream dest
          if (this.streamDest) {
            try {
              const masterGain = soundEngine.getMasterGain();
              masterGain?.disconnect(this.streamDest);
            } catch {
              // ignore
            }
          }

          const rawBlob = new Blob(this.recordedChunks, {
            type: this.mediaRecorder?.mimeType || "audio/webm",
          });

          // Decode raw audio to AudioBuffer
          const ctx = soundEngine.getContext() || new AudioContext();
          const arrayBuffer = await rawBlob.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

          // Convert AudioBuffer to standard MP3 using lamejs
          const mp3Blob = this.encodeAudioBufferToMp3(audioBuffer);
          const mp3Url = URL.createObjectURL(mp3Blob);

          const dateStr = new Date().toISOString().slice(0, 10);
          const filename = `museum-melody-jam-${dateStr}.mp3`;

          const result: RecordingResult = {
            blob: mp3Blob,
            url: mp3Url,
            durationMs: duration,
            events,
            filename,
          };

          this.lastResultState = result;
          this.isProcessingState = false;
          this.notify();
          resolve(result);
        } catch (err) {
          console.error("Failed to process recording into MP3:", err);
          this.isProcessingState = false;
          this.notify();
          resolve(null);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Encodes standard PCM AudioBuffer to MP3 file Blob
   */
  private encodeAudioBufferToMp3(audioBuffer: AudioBuffer): Blob {
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const mp3encoder = new lamejs.Mp3Encoder(channels >= 2 ? 2 : 1, sampleRate, 128);
    const mp3Data: Uint8Array[] = [];

    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = channels >= 2 ? audioBuffer.getChannelData(1) : leftChannel;

    const sampleBlockSize = 1152;
    const length = leftChannel.length;

    for (let i = 0; i < length; i += sampleBlockSize) {
      const chunkLength = Math.min(sampleBlockSize, length - i);
      const leftChunk = new Int16Array(chunkLength);
      const rightChunk = new Int16Array(chunkLength);

      for (let j = 0; j < chunkLength; j++) {
        const l = Math.max(-1, Math.min(1, leftChannel[i + j]));
        leftChunk[j] = l < 0 ? l * 32768 : l * 32767;

        if (channels >= 2) {
          const r = Math.max(-1, Math.min(1, rightChannel[i + j]));
          rightChunk[j] = r < 0 ? r * 32768 : r * 32767;
        }
      }

      const mp3buf = channels >= 2
        ? mp3encoder.encodeBuffer(leftChunk, rightChunk)
        : mp3encoder.encodeBuffer(leftChunk);

      if (mp3buf && mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }
    }

    const flush = mp3encoder.flush();
    if (flush && flush.length > 0) {
      mp3Data.push(new Uint8Array(flush));
    }

    return new Blob(mp3Data as BlobPart[], { type: "audio/mp3" });
  }

  /**
   * Helper to download recording directly
   */
  public triggerDownload(result?: RecordingResult) {
    const res = result || this.lastResultState;
    if (!res) return;

    const anchor = document.createElement("a");
    anchor.href = res.url;
    anchor.download = res.filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}

export const sessionRecorder = new SessionRecorder();
