"use client";

import { useState, useEffect, useRef } from "react";
import { NoteEvent, soundEngine } from "@/lib/audio/soundEngine";
import AudioWaveform from "./AudioWaveform";

interface CompositionStudioProps {
  recordedNotes: NoteEvent[];
  instrumentName?: string;
  onKeepExploring: () => void;
  className?: string;
}

export default function CompositionStudio({
  recordedNotes,
  instrumentName = "VEENA",
  onKeepExploring,
  className = "",
}: CompositionStudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeHighlightedNote, setActiveHighlightedNote] = useState<string | null>(null);

  // Track toggles
  const [veenaMuted, setVeenaMuted] = useState(false);
  const [tablaMuted, setTablaMuted] = useState(false);
  const [sitarMuted, setSitarMuted] = useState(false);

  // Track volumes
  const veenaVol = 0.85;
  const tablaVol = 0.5;
  const sitarVol = 0.25;

  const cleanupRef = useRef<(() => void) | null>(null);

  const stopPlayback = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setIsPlaying(false);
    setActiveHighlightedNote(null);
  };

  const startPlayback = () => {
    stopPlayback();
    setIsPlaying(true);

    cleanupRef.current = soundEngine.playComposition(
      recordedNotes.length > 0
        ? recordedNotes
        : [
            // Fallback default melody if user didn't record any notes
            { note: "Sa", frequency: 261.63, timestamp: 0, duration: 1200 },
            { note: "Ga", frequency: 329.63, timestamp: 1200, duration: 1200 },
            { note: "Pa", frequency: 392.0, timestamp: 2400, duration: 1400 },
            { note: "Ni", frequency: 493.88, timestamp: 3800, duration: 1200 },
            { note: "Sa'", frequency: 523.25, timestamp: 5000, duration: 2000 },
          ],
      {
        includeTabla: !tablaMuted,
        includeSitar: !sitarMuted,
        veenaVolume: veenaMuted ? 0 : veenaVol,
        tablaVolume: tablaMuted ? 0 : tablaVol,
        sitarVolume: sitarMuted ? 0 : sitarVol,
        onNoteHighlight: (note) => setActiveHighlightedNote(note),
        onComplete: () => {
          setIsPlaying(false);
          setActiveHighlightedNote(null);
        },
      }
    );
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  return (
    <div className={`w-full max-w-xl mx-auto flex flex-col justify-between py-1 sm:py-2 px-2 sm:px-4 select-none ${className}`}>
      {/* ── Top Celebration Badge ─────────────────────────────── */}
      <div className="text-center mb-3 sm:mb-5 animate-fade-in">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 backdrop-blur-md mb-1.5 sm:mb-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
          <span className="text-emerald-400 text-xs font-bold">✓</span>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
            {instrumentName} ADDED
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-grotesque text-white tracking-tight uppercase m-0">
          MY SONG
        </h2>
        <p className="text-white/50 text-[11px] sm:text-xs font-grotesque mt-0.5 sm:mt-1">
          Your recorded history woven into a living museum ensemble
        </p>
      </div>

      {/* ── Multi-Track Layer Stack ────────────────────────────── */}
      <div className="space-y-2.5 sm:space-y-3.5 mb-4 sm:mb-6">
        {/* Track 1: VEENA (User Performance) */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#ffc75a]/40 bg-[#161920]/90 backdrop-blur-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:border-[#ffc75a]">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#ffc75a] shadow-[0_0_8px_#ffc75a]" />
              <div>
                <span className="text-xs font-bold font-grotesque text-white uppercase tracking-wider block">
                  VEENA
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#ffc75a]/80 block">
                  Your Performance ({recordedNotes.length} notes)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setVeenaMuted(!veenaMuted)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-mono uppercase tracking-wider border cursor-pointer transition-colors ${
                veenaMuted
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-white/10 text-white/80 border-white/20 hover:text-white"
              }`}
            >
              {veenaMuted ? "MUTED" : "ACTIVE"}
            </button>
          </div>

          {/* Visual Track Bar */}
          <div className="relative w-full h-8 sm:h-10 rounded-xl bg-black/40 border border-white/10 flex items-center px-2.5 sm:px-3 overflow-hidden">
            {/* Waveform Visualization */}
            <div className="w-full flex items-center justify-between gap-1 opacity-80">
              {Array.from({ length: 32 }).map((_, i) => {
                const isHighlight = isPlaying && activeHighlightedNote !== null && i % 4 === 0;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-200 ${
                      isHighlight
                        ? "bg-[#ffc75a] shadow-[0_0_10px_#ffc75a] scale-y-125"
                        : "bg-gradient-to-t from-[#e5a955]/40 to-[#ffc75a]"
                    }`}
                    style={{
                      height: `${10 + ((i * 7) % 20)}px`,
                      opacity: veenaMuted ? 0.2 : 0.85,
                    }}
                  />
                );
              })}
            </div>

            {/* Playhead line */}
            {isPlaying && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_#fff]"
                style={{
                  animation: "scan-beam 8s linear infinite",
                }}
              />
            )}
          </div>
        </div>

        {/* Track 2: TABLA (Rhythm Layer) */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/15 bg-[#14161c]/80 backdrop-blur-xl shadow-md relative overflow-hidden transition-all duration-300 hover:border-white/30">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-cyan-400" />
              <div>
                <span className="text-xs font-bold font-grotesque text-white uppercase tracking-wider block">
                  TABLA
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400/80 block">
                  Teentaal Acoustic Rhythm · 76 BPM
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTablaMuted(!tablaMuted)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-mono uppercase tracking-wider border cursor-pointer transition-colors ${
                tablaMuted
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-white/10 text-white/80 border-white/20 hover:text-white"
              }`}
            >
              {tablaMuted ? "MUTED" : "ACTIVE"}
            </button>
          </div>

          <div className="relative w-full h-7 sm:h-8 rounded-xl bg-black/40 border border-white/10 flex items-center px-2.5 sm:px-3 overflow-hidden">
            <div className="w-full flex items-center justify-between gap-1.5 opacity-70">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-cyan-400/60"
                  style={{
                    height: `${i % 2 === 0 ? 14 : 7}px`,
                    opacity: tablaMuted ? 0.2 : 0.75,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Track 3: SITAR / DRONE (Harmonic Layer) */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/15 bg-[#14161c]/80 backdrop-blur-xl shadow-md relative overflow-hidden transition-all duration-300 hover:border-white/30">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500" />
              <div>
                <span className="text-xs font-bold font-grotesque text-white uppercase tracking-wider block">
                  SITAR & TANPURA
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-amber-400/80 block">
                  Sa-Pa Harmonic Acoustic Drone
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSitarMuted(!sitarMuted)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-mono uppercase tracking-wider border cursor-pointer transition-colors ${
                sitarMuted
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-white/10 text-white/80 border-white/20 hover:text-white"
              }`}
            >
              {sitarMuted ? "MUTED" : "ACTIVE"}
            </button>
          </div>

          <div className="relative w-full h-7 sm:h-8 rounded-xl bg-black/40 border border-white/10 flex items-center px-2.5 sm:px-3 overflow-hidden">
            <div className="w-full flex items-center justify-between gap-1 opacity-70">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-amber-400/50"
                  style={{
                    height: `${8 + Math.sin(i * 0.4) * 6}px`,
                    opacity: sitarMuted ? 0.2 : 0.75,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Playback Controls ──────────────────────────────────── */}
      <div className="flex flex-col items-center mb-6">
        <button
          type="button"
          onClick={handleTogglePlay}
          className="btn-hero-fill flex items-center gap-3 min-h-[44px] py-3.5 px-8 rounded-full border-2 border-white text-white font-grotesque text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(255,199,90,0.35)] cursor-pointer hover:border-[#ffc75a] hover:text-[#ffc75a] transition-all active:scale-95"
        >
          {isPlaying ? (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>PLAY</span>
            </>
          )}
        </button>

        {isPlaying && (
          <div className="mt-3 w-full max-w-xs">
            <AudioWaveform isActive={isPlaying} height={32} barCount={28} />
          </div>
        )}
      </div>

      {/* ── Bottom Section: Keep Exploring ─────────────────────── */}
      <div className="text-center pt-4 border-t border-white/10">
        <p className="text-white/60 font-grotesque text-xs sm:text-sm tracking-wide mb-3">
          &ldquo;More sounds are hidden in this museum.&rdquo;
        </p>

        <button
          type="button"
          onClick={onKeepExploring}
          className="btn-hero-fill w-full min-h-[44px] py-3.5 px-6 rounded-xl border border-[#ffc75a] text-black bg-[#ffc75a] hover:bg-transparent hover:text-[#ffc75a] font-grotesque text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg transition-all active:scale-95 flex items-center justify-center"
        >
          <span>KEEP EXPLORING →</span>
        </button>
      </div>
    </div>
  );
}
