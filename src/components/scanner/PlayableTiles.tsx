"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { SWARAS, SwaraDefinition, NoteEvent } from "@/lib/audio/soundEngine";
import { sampleEngine } from "@/lib/audio/sampleEngine";
import { Instrument } from "@/types/instrument";

interface PlayableTilesProps {
  instrument: Instrument;
  isRecording?: boolean;
  recordingStartTime?: number | null;
  onNotePlayed?: (event: NoteEvent) => void;
  highlightedNote?: string | null;
  className?: string;
}

// Percussion Bol definitions with English pronunciation and stroke characteristic
interface BolDefinition {
  name: string;
  description: string;
  keyHint: string;
  hand: "Dayan (Right)" | "Bayan (Left)" | "Both";
}

const TABLA_BOLS: Record<string, BolDefinition> = {
  Na: { name: "Na / Ta", description: "Sharp edge rim strike", keyHint: "1", hand: "Dayan (Right)" },
  Tin: { name: "Tin", description: "Resonant ringing bell", keyHint: "2", hand: "Dayan (Right)" },
  Dha: { name: "Dha", description: "Combined open bass + rim", keyHint: "3", hand: "Both" },
  Ge: { name: "Ge / Ga", description: "Deep modulated bass palm", keyHint: "4", hand: "Bayan (Left)" },
  Tun: { name: "Tun", description: "Open resonant center", keyHint: "5", hand: "Dayan (Right)" },
  Ke: { name: "Ke / Ka", description: "Flat damped bass slap", keyHint: "6", hand: "Bayan (Left)" },
  Ta: { name: "Ta", description: "Crisp centered strike", keyHint: "3", hand: "Dayan (Right)" },
};

export default function PlayableTiles({
  instrument,
  isRecording = false,
  recordingStartTime = null,
  onNotePlayed,
  highlightedNote = null,
  className = "",
}: PlayableTilesProps) {
  const isPercussion = sampleEngine.isPercussion(instrument.id);
  const percussionStrokes = sampleEngine.getStrokes(instrument.id);

  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const feedbackTimeout = useRef<number | null>(null);

  // Preload instrument samples on mount
  useEffect(() => {
    sampleEngine.loadInstrument(instrument.id);
  }, [instrument.id]);

  // Handle melodic tile tap
  const handleMelodicTap = useCallback(
    (swara: SwaraDefinition, index: number) => {
      sampleEngine.playNote(instrument.id, swara.name, swara.frequency, 2.0, 0.9);
      setActiveItem(`${swara.name} (${swara.fullIndianName} · ${swara.western})`);
      setPressedIndex(index);

      if (isRecording && recordingStartTime) {
        const timestamp = Math.max(0, Date.now() - recordingStartTime);
        onNotePlayed?.({
          note: swara.name,
          frequency: swara.frequency,
          timestamp,
          duration: 1000,
        });
      }

      if (feedbackTimeout.current) window.clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = window.setTimeout(() => {
        setPressedIndex((prev) => (prev === index ? null : prev));
      }, 350);
    },
    [instrument.id, isRecording, recordingStartTime, onNotePlayed]
  );

  // Handle percussion tile tap
  const handlePercussionTap = useCallback(
    (stroke: string, index: number) => {
      sampleEngine.playStroke(instrument.id, stroke, 0.95);
      const bolInfo = TABLA_BOLS[stroke];
      setActiveItem(
        bolInfo
          ? `${bolInfo.name} · ${bolInfo.description} [${bolInfo.hand}]`
          : stroke
      );
      setPressedIndex(index);

      if (isRecording && recordingStartTime) {
        const timestamp = Math.max(0, Date.now() - recordingStartTime);
        onNotePlayed?.({
          note: stroke,
          frequency: 0,
          timestamp,
          duration: 600,
        });
      }

      if (feedbackTimeout.current) window.clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = window.setTimeout(() => {
        setPressedIndex((prev) => (prev === index ? null : prev));
      }, 300);
    },
    [instrument.id, isRecording, recordingStartTime, onNotePlayed]
  );

  // Synchronize external highlight
  useEffect(() => {
    if (!highlightedNote) return;

    if (isPercussion) {
      const idx = percussionStrokes.findIndex((s) => s.toLowerCase() === highlightedNote.toLowerCase());
      if (idx !== -1) {
        setPressedIndex(idx);
        setActiveItem(percussionStrokes[idx]);
        const t = window.setTimeout(() => setPressedIndex((prev) => (prev === idx ? null : prev)), 350);
        return () => window.clearTimeout(t);
      }
    } else {
      const idx = SWARAS.findIndex((s) => s.name === highlightedNote);
      if (idx !== -1) {
        setPressedIndex(idx);
        setActiveItem(SWARAS[idx].name);
        const t = window.setTimeout(() => setPressedIndex((prev) => (prev === idx ? null : prev)), 350);
        return () => window.clearTimeout(t);
      }
    }
  }, [highlightedNote, isPercussion, percussionStrokes]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (isPercussion) {
        const keyMap: Record<string, number> = {
          "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5,
          "q": 0, "w": 1, "e": 2, "r": 3, "t": 4, "y": 5,
          "Q": 0, "W": 1, "E": 2, "R": 3, "T": 4, "Y": 5,
        };
        const idx = keyMap[e.key];
        if (idx !== undefined && idx < percussionStrokes.length) {
          handlePercussionTap(percussionStrokes[idx], idx);
        }
      } else {
        const keyMap: Record<string, number> = {
          "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7,
          "a": 0, "s": 1, "d": 2, "f": 3, "g": 4, "h": 5, "j": 6, "k": 7,
          "A": 0, "S": 1, "D": 2, "F": 3, "G": 4, "H": 5, "J": 6, "K": 7,
        };
        const idx = keyMap[e.key];
        if (idx !== undefined && idx < SWARAS.length) {
          handleMelodicTap(SWARAS[idx], idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPercussion, percussionStrokes, handlePercussionTap, handleMelodicTap]);

  // Color accents based on category
  const isWind = instrument.category?.includes("Wind");
  const accentColor = isPercussion
    ? "from-[#00e5ff] to-[#00a3ff]"
    : isWind
    ? "from-[#00f5a0] to-[#00d9f5]"
    : "from-[#ffc75a] to-[#ff9800]";
  const accentBorder = isPercussion
    ? "border-[#00e5ff]"
    : isWind
    ? "border-[#00f5a0]"
    : "border-[#ffc75a]";
  const accentText = isPercussion
    ? "text-[#00e5ff]"
    : isWind
    ? "text-[#00f5a0]"
    : "text-[#ffc75a]";

  return (
    <div className={`relative w-full max-w-2xl mx-auto select-none ${className}`}>
      {/* Current item feedback banner */}
      <div className="flex items-center justify-between px-3.5 py-1.5 sm:px-4 sm:py-2.5 mb-2.5 sm:mb-4 rounded-xl border border-white/10 bg-[#15181e]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${accentBorder} animate-pulse bg-current`} />
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/50">
            {isPercussion ? "Active Bol" : "Current Swara"}
          </span>
        </div>

        {activeItem ? (
          <div className="flex items-baseline gap-1.5 sm:gap-2 animate-fade-in truncate max-w-[70%]">
            <span className={`text-base sm:text-lg font-bold font-grotesque ${accentText} truncate`}>
              {activeItem}
            </span>
          </div>
        ) : (
          <span className="text-[11px] sm:text-xs font-grotesque text-white/40 italic">
            Tap a tile to play
          </span>
        )}
      </div>

      {/* Main Tile Board */}
      <div className="relative rounded-2xl border border-white/15 bg-gradient-to-b from-[#181b22] to-[#0d0f14] overflow-hidden shadow-2xl p-3 sm:p-5 md:p-6">
        {/* Background Instrument Image Accent */}
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          <Image
            src={instrument.image_url || "/Assets/hero_elem-03.jpg"}
            alt={instrument.name}
            fill
            className="object-cover object-center filter blur-md scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-[#0d0f14]/80 to-transparent" />
        </div>

        {/* Ambient Center Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 rounded-full blur-3xl pointer-events-none opacity-20 bg-gradient-to-r ${accentColor}`} />

        <div className="relative z-10">
          {/* Header Subtitle */}
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3 px-1">
            <span>{instrument.name}</span>
            <span>{isPercussion ? "Indian Percussion Bols" : "Sapta Swara Grid"}</span>
            <span>Live Authentic Samples</span>
          </div>

          {/* Tiles Grid */}
          {isPercussion ? (
            /* Percussion Layout (6 large tactile pads) */
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {percussionStrokes.map((stroke, idx) => {
                const isPressed = pressedIndex === idx;
                const bol = TABLA_BOLS[stroke] || {
                  name: stroke,
                  description: "Percussion Stroke",
                  keyHint: String(idx + 1),
                  hand: "Drum",
                };

                return (
                  <button
                    key={stroke}
                    type="button"
                    onClick={() => handlePercussionTap(stroke, idx)}
                    className={`relative flex flex-col items-center justify-between p-3 sm:py-4 sm:px-2 rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden group touch-manipulation min-h-[95px] sm:min-h-[120px] ${
                      isPressed
                        ? `border-[#00e5ff] bg-[#00e5ff]/25 shadow-[0_0_25px_rgba(0,229,255,0.55)] scale-95`
                        : "border-white/15 bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/40 active:bg-white/15"
                    }`}
                  >
                    {isPressed && (
                      <span className="absolute inset-0 rounded-xl bg-[#00e5ff]/20 animate-ping pointer-events-none" />
                    )}

                    {/* Key Hint */}
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/40 group-hover:text-white/70 tracking-wider">
                      [{idx + 1}]
                    </span>

                    {/* Stroke Syllable */}
                    <span
                      className={`text-2xl sm:text-3xl font-black font-grotesque leading-none tracking-tight transition-transform ${
                        isPressed ? "text-[#00e5ff] scale-110" : "text-white group-hover:text-[#00e5ff]"
                      }`}
                    >
                      {stroke}
                    </span>

                    {/* Hand Indicator */}
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/60 text-center truncate max-w-full">
                      {bol.hand}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Melodic Swara Grid (8 tiles) */
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2.5">
              {SWARAS.map((swara, idx) => {
                const isPressed = pressedIndex === idx;

                return (
                  <button
                    key={swara.name}
                    type="button"
                    onClick={() => handleMelodicTap(swara, idx)}
                    className={`relative flex flex-col items-center justify-between p-2 sm:py-3.5 sm:px-2 rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden group touch-manipulation min-h-[85px] sm:min-h-[105px] ${
                      isPressed
                        ? `${accentBorder} bg-white/20 shadow-[0_0_25px_rgba(255,199,90,0.5)] scale-95`
                        : "border-white/15 bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/40 active:bg-white/15"
                    }`}
                  >
                    {isPressed && (
                      <span className="absolute inset-0 rounded-xl bg-white/20 animate-ping pointer-events-none" />
                    )}

                    {/* Key hint */}
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/40 group-hover:text-white/70 tracking-wider hidden sm:inline-block">
                      [{swara.keyHint}]
                    </span>

                    {/* Swara Note */}
                    <span
                      className={`text-xl sm:text-2xl font-black font-grotesque leading-none tracking-tight transition-colors ${
                        isPressed ? accentText : "text-white group-hover:text-white"
                      }`}
                    >
                      {swara.name}
                    </span>

                    {/* Western note */}
                    <span className="text-[10px] sm:text-xs font-mono font-semibold text-white/60 mt-0.5">
                      {swara.western}
                    </span>

                    {/* Full Indian Name */}
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/50 truncate max-w-full mt-0.5">
                      {swara.fullIndianName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Playing Instructions / Hints */}
          <div className="mt-3 flex items-center justify-between text-[10px] sm:text-[11px] font-grotesque text-white/50 px-1">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${accentBorder} bg-current`} />
              <span>
                Tap pads to trigger real sound
                <span className="hidden sm:inline">
                  {" "}or press keys <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">1-{isPercussion ? percussionStrokes.length : 8}</kbd>
                </span>
              </span>
            </span>

            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-white/40">
              {instrument.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
