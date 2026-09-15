"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { SWARAS, SwaraDefinition, NoteEvent, soundEngine } from "@/lib/audio/soundEngine";

interface PlayableVeenaProps {
  isRecording?: boolean;
  recordingStartTime?: number | null;
  onNotePlayed?: (event: NoteEvent) => void;
  highlightedNote?: string | null;
  className?: string;
}

export default function PlayableVeena({
  isRecording = false,
  recordingStartTime = null,
  onNotePlayed,
  highlightedNote = null,
  className = "",
}: PlayableVeenaProps) {
  const [activeNote, setActiveNote] = useState<SwaraDefinition | null>(null);
  const [pluckedIndex, setPluckedIndex] = useState<number | null>(null);
  const rippleTimeouts = useRef<{ [key: number]: number }>({});

  const handlePluck = useCallback(
    (swara: SwaraDefinition, index: number) => {
      soundEngine.playVeenaNote(swara.frequency, 2.2, 0.85);
      setActiveNote(swara);
      setPluckedIndex(index);

      // Log note for recording if active
      if (isRecording && recordingStartTime) {
        const timestamp = Math.max(0, Date.now() - recordingStartTime);
        onNotePlayed?.({
          note: swara.name,
          frequency: swara.frequency,
          timestamp,
          duration: 1200,
        });
      }

      // Clear previous timeout for this index
      if (rippleTimeouts.current[index]) {
        window.clearTimeout(rippleTimeouts.current[index]);
      }
      rippleTimeouts.current[index] = window.setTimeout(() => {
        setPluckedIndex((prev) => (prev === index ? null : prev));
      }, 500);
    },
    [isRecording, recordingStartTime, onNotePlayed]
  );

  // Synchronize with external highlight (e.g. playback of curated raga or recording)
  useEffect(() => {
    if (!highlightedNote) return;

    const idx = SWARAS.findIndex((s) => s.name === highlightedNote);
    if (idx === -1) return;

    const triggerTimer = window.setTimeout(() => {
      setPluckedIndex(idx);
      setActiveNote(SWARAS[idx]);
    }, 0);

    const clearTimer = window.setTimeout(() => {
      setPluckedIndex((prev) => (prev === idx ? null : prev));
    }, 400);

    return () => {
      window.clearTimeout(triggerTimer);
      window.clearTimeout(clearTimer);
    };
  }, [highlightedNote]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const keyMap: { [key: string]: number } = {
        "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7,
        "a": 0, "s": 1, "d": 2, "f": 3, "g": 4, "h": 5, "j": 6, "k": 7,
        "A": 0, "S": 1, "D": 2, "F": 3, "G": 4, "H": 5, "J": 6, "K": 7,
      };

      if (keyMap[e.key] !== undefined) {
        const idx = keyMap[e.key];
        const swara = SWARAS[idx];
        if (swara) {
          handlePluck(swara, idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePluck]);

  return (
    <div className={`relative w-full max-w-2xl mx-auto select-none ${className}`}>
      {/* Active Note Feedback Banner */}
      <div className="flex items-center justify-between px-3.5 py-1.5 sm:px-4 sm:py-2.5 mb-2.5 sm:mb-4 rounded-xl border border-white/10 bg-[#15181e]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#e5a955] animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/50">
            Current Swara
          </span>
        </div>

        {activeNote ? (
          <div className="flex items-baseline gap-1.5 sm:gap-2 animate-fade-in">
            <span className="text-lg sm:text-xl font-bold font-grotesque text-[#ffc75a]">
              {activeNote.name}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-white/80">
              ({activeNote.fullIndianName} · {activeNote.western})
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-[#e5a955]/70 hidden xs:inline">
              {activeNote.frequency} Hz
            </span>
          </div>
        ) : (
          <span className="text-[11px] sm:text-xs font-grotesque text-white/40 italic">
            Tap a fret to play
          </span>
        )}
      </div>

      {/* Cinematic Veena Visual Backdrop + String Overlay */}
      <div className="relative rounded-2xl border border-white/15 bg-gradient-to-b from-[#181b22] to-[#0d0f14] overflow-hidden shadow-2xl p-3 sm:p-5 md:p-6">
        {/* Veena Reveal Image Background Accent */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <Image
            src="/Assets/veena_reveal.jpg"
            alt="Veena Acoustic Resonance"
            fill
            className="object-cover object-center filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-[#0d0f14]/80 to-transparent" />
        </div>

        {/* Ambient Warm Golden Glow from Fretboard */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-[#e5a955]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Fretted Fingerboard */}
        <div className="relative z-10">
          {/* Subtle Fret Guide Info */}
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 sm:mb-3 px-1">
            <span>Mandradhari (Lower)</span>
            <span className="hidden sm:inline">24 Brass Frets · Teakwood Dandi</span>
            <span>Taar (Higher)</span>
          </div>

          {/* Longitudinal String Lines */}
          <div className="relative w-full py-2 sm:py-4">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#ffc75a]/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-1/3 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#ffc75a]/25 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-2/3 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#ffc75a]/25 to-transparent pointer-events-none" />

            {/* Interactive Fret Nodes (Sa, Re, Ga, Ma, Pa, Dha, Ni, Sa') */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2.5">
              {SWARAS.map((swara, idx) => {
                const isPlucked = pluckedIndex === idx;
                return (
                  <button
                    key={swara.name}
                    type="button"
                    onClick={() => handlePluck(swara, idx)}
                    className={`relative flex flex-col items-center justify-between p-2 sm:py-3.5 sm:px-2 rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden group touch-manipulation min-h-[82px] sm:min-h-[105px] ${
                      isPlucked
                        ? "border-[#ffc75a] bg-[#ffc75a]/30 shadow-[0_0_25px_rgba(255,199,90,0.55)] scale-[0.97]"
                        : "border-white/15 bg-white/[0.04] hover:bg-white/[0.09] hover:border-[#ffc75a]/50 active:bg-white/15"
                    }`}
                  >
                    {/* Pluck shockwave ripple */}
                    {isPlucked && (
                      <span className="absolute inset-0 rounded-xl bg-[#ffc75a]/30 animate-ping pointer-events-none" />
                    )}

                    {/* Key Hint Pill (Desktop only) */}
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/40 group-hover:text-white/70 tracking-wider hidden sm:inline-block">
                      [{swara.keyHint}]
                    </span>

                    {/* Fret Brass Wire Marker */}
                    <div
                      className={`w-full h-0.5 sm:h-1 my-1 sm:my-1.5 rounded-full transition-all ${
                        isPlucked
                          ? "bg-[#ffc75a] shadow-[0_0_10px_#ffc75a]"
                          : "bg-gradient-to-r from-[#d4af37]/40 via-[#ffc75a]/70 to-[#d4af37]/40"
                      }`}
                    />

                    {/* Swara Name */}
                    <span
                      className={`text-xl sm:text-2xl font-black font-grotesque leading-none tracking-tight transition-colors ${
                        isPlucked
                          ? "text-[#ffc75a] scale-110"
                          : "text-white group-hover:text-[#ffc75a]"
                      }`}
                    >
                      {swara.name}
                    </span>

                    {/* Western note cue */}
                    <span className="text-[10px] sm:text-xs font-mono font-semibold text-white/60 mt-0.5 sm:mt-1">
                      {swara.western}
                    </span>

                    {/* Full Indian Name */}
                    <span className="text-[8px] sm:text-[9px] font-mono text-[#e5a955]/80 truncate max-w-full mt-0.5 opacity-90">
                      {swara.fullIndianName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Playing Instructions / Hints */}
          <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[10px] sm:text-[11px] font-grotesque text-white/50 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffc75a]" />
              <span>
                Tap frets to play
                <span className="hidden sm:inline"> or use keys <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">1-8</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">A-K</kbd></span>
              </span>
            </span>

            <button
              type="button"
              onClick={() => soundEngine.startDrone(0.2)}
              className="text-[#e5a955] hover:text-[#ffc75a] transition-colors uppercase font-mono text-[9px] sm:text-[10px] tracking-wider cursor-pointer bg-transparent border-0 py-1.5 px-2 rounded-lg hover:bg-white/5 active:scale-95"
            >
              Tanpura Drone ~
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
