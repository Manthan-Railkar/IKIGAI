"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { NoteEvent, soundEngine } from "@/lib/audio/soundEngine";
import { sampleEngine } from "@/lib/audio/sampleEngine";
import { sessionRecorder } from "@/lib/audio/sessionRecorder";
import { Instrument } from "@/types/instrument";
import { getSampleImagePath } from "@/lib/sampleImages";
import { saveLocalDiscovery, getLocalDiscoveredIds, recordDiscovery } from "@/lib/supabase/discoveries";
import { createClient } from "@/lib/supabase/client";
import { CANONICAL_INSTRUMENTS } from "@/lib/supabase/instruments";
import AudioWaveform from "./AudioWaveform";
import PlayableStrings from "./PlayableStrings";
import PlayableTiles from "./PlayableTiles";
import FragmentationTransition from "./FragmentationTransition";
import CompositionStudio from "./CompositionStudio";

export type PostScanStep =
  | "DETECTION_COMPLETE"      // Step 1: Instrument detected + gold outline + catalogue verified
  | "DISCOVERY_TRANSITION"    // Step 2: 3D Tile fragment shatter + reconstruct standalone instrument
  | "INSTRUMENT_DISCOVERY"    // Step 3: Editorial discovery page with history + actions
  | "HEAR_IT"                 // Step 4: Authentic sample + waveform visualization
  | "PLAYABLE"                // Step 5: Interactive playable strings or tiles
  | "RECORDING"               // Step 6a: Active recording state with timer
  | "PERFORMANCE_REVIEW"      // Step 6b: 'Your Performance' with Play, Retake, Add to Song
  | "COMPOSITION";            // Step 7: Multi-track 'My Song' layer view

interface PostScanExperienceProps {
  onReturnToScanner: (discoveredInstrumentId: string) => void;
  museumName?: string;
  capturedFrameUrl?: string;
  initialStep?: PostScanStep;
  instrument?: Instrument;
  className?: string;
}

const DEFAULT_INSTRUMENT: Instrument = {
  id: "saraswati-veena",
  museum_id: "kelkar-museum",
  name: "Veena",
  category: "Tata (String)",
  description:
    "Handcrafted from seasoned jackwood and sacred dried gourds, the Veena has resonated through Indian royal courts and temple sanctuaries for centuries as the divine instrument of Saraswati.",
  historical_context:
    "Its 24 brass frets set in beeswax allow seamless microtonal glides (meend), bridging ancient temple sculpture depictions with living acoustic tradition.",
  image_url: "/Assets/veena_reveal.jpg",
  audio_url: "/Assets/audio_01.png",
  model_class: "veena",
  confidence_threshold: 0.75,
  active: true,
  interaction: "strings",
};

const PLAYABLE_INSTRUMENTS = [
  { id: "tabla", name: "Tabla", category: "Avanaddha (Percussion)", interaction: "tiles" as const, model_class: "tabla" },
  { id: "sitar", name: "Sitar", category: "Tata (String)", interaction: "strings" as const, model_class: "sitar" },
  { id: "tanpura", name: "Tanpura", category: "Tata (String)", interaction: "strings" as const, model_class: "tanpura" },
  { id: "sarangi", name: "Sarangi", category: "Tata (String)", interaction: "strings" as const, model_class: "sarangi" },
  { id: "bansuri", name: "Bansuri", category: "Sushira (Wind)", interaction: "tiles" as const, model_class: "bansuri" },
  { id: "shehnai", name: "Shehnai", category: "Sushira (Wind)", interaction: "tiles" as const, model_class: "shehnai" },
  { id: "pakhawaj", name: "Pakhawaj", category: "Avanaddha (Percussion)", interaction: "tiles" as const, model_class: "pakhawaj" },
  { id: "harmonium", name: "Harmonium", category: "Sushira (Wind)", interaction: "tiles" as const, model_class: "harmonium" },
  { id: "santoor", name: "Santoor", category: "Tata (String)", interaction: "tiles" as const, model_class: "santoor" },
  { id: "sarod", name: "Sarod", category: "Tata (String)", interaction: "strings" as const, model_class: "sarod" },
];

export default function PostScanExperience({
  onReturnToScanner,
  museumName = "Museum Heritage Collection",
  capturedFrameUrl = "/Assets/museum_sculpture_veena.jpg",
  initialStep = "DISCOVERY_TRANSITION",
  instrument = DEFAULT_INSTRUMENT,
  className = "",
}: PostScanExperienceProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(instrument || DEFAULT_INSTRUMENT);
  const activeInstrument = selectedInstrument;
  const [currentStep, setCurrentStep] = useState<PostScanStep>(initialStep);

  useEffect(() => {
    if (instrument) {
      setSelectedInstrument(instrument);
    }
  }, [instrument]);

  const [isSavedInCollection, setIsSavedInCollection] = useState<boolean>(false);

  useEffect(() => {
    const local = getLocalDiscoveredIds(activeInstrument.museum_id);
    setIsSavedInCollection(
      local.has(activeInstrument.id) ||
      (activeInstrument.model_class ? local.has(activeInstrument.model_class) : false)
    );
  }, [activeInstrument]);

  const handleSaveInstrument = useCallback(() => {
    saveLocalDiscovery(activeInstrument.id, activeInstrument.museum_id || "csmvs", "physical");
    try {
      const supabase = createClient();
      recordDiscovery(supabase, {
        museum_id: activeInstrument.museum_id || "csmvs",
        instrument_id: activeInstrument.id,
        source: "physical",
      }).catch(console.warn);
    } catch (e) {
      console.warn(e);
    }
    setIsSavedInCollection(true);
  }, [activeInstrument]);

  const handleSelectInstrument = (instId: string) => {
    soundEngine.stopCuratedRaga();
    soundEngine.stopDrone();
    const found = CANONICAL_INSTRUMENTS.find((i) => i.id === instId);
    if (found) {
      setSelectedInstrument(found);
      sampleEngine.loadInstrument(found.id);
    } else {
      const info = PLAYABLE_INSTRUMENTS.find((p) => p.id === instId);
      if (info) {
        setSelectedInstrument({
          ...DEFAULT_INSTRUMENT,
          id: info.id,
          name: info.name,
          category: info.category,
          interaction: info.interaction,
          model_class: info.model_class,
        });
        sampleEngine.loadInstrument(info.id);
      }
    }
  };

  // Hear It playback state
  const [isHearItPlaying, setIsHearItPlaying] = useState(false);
  const [hearItNote, setHearItNote] = useState<string | null>(null);

  // Recording engine state
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);
  const [recordedNotes, setRecordedNotes] = useState<NoteEvent[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Performance review playback state
  const [isReviewPlaying, setIsReviewPlaying] = useState(false);
  const [reviewHighlightedNote, setReviewHighlightedNote] = useState<string | null>(null);
  const reviewCleanupRef = useRef<(() => void) | null>(null);

  // Preload real samples for the active instrument
  useEffect(() => {
    sampleEngine.loadInstrument(activeInstrument.id);
  }, [activeInstrument.id]);

  // Auto-advance from Step 1 (Detection Complete) to Step 2 (Discovery Transition)
  useEffect(() => {
    if (currentStep === "DETECTION_COMPLETE") {
      const timer = window.setTimeout(() => {
        setCurrentStep("DISCOVERY_TRANSITION");
      }, 2200);
      return () => window.clearTimeout(timer);
    }
  }, [currentStep]);

  // ── Hear It Action Handlers ────────────────────────────────────
  const handleStartHearIt = useCallback(() => {
    setCurrentStep("HEAR_IT");
    setIsHearItPlaying(true);

    if (activeInstrument.interaction === "strings") {
      soundEngine.playCuratedRaga(
        (swara) => setHearItNote(swara),
        () => {
          setIsHearItPlaying(false);
          setHearItNote(null);
        }
      );
    } else if (sampleEngine.isPercussion(activeInstrument.id)) {
      // Play brief rhythmic phrase of real strokes
      const strokes = sampleEngine.getStrokes(activeInstrument.id);
      strokes.slice(0, 4).forEach((stroke, idx) => {
        window.setTimeout(() => {
          sampleEngine.playStroke(activeInstrument.id, stroke, 0.9);
          setHearItNote(stroke);
        }, idx * 450);
      });
      window.setTimeout(() => {
        setIsHearItPlaying(false);
        setHearItNote(null);
      }, strokes.length * 450 + 600);
    } else {
      // Melodic tile instrument phrase
      const swaras = ["Sa", "Re", "Ga", "Ma", "Pa"];
      swaras.forEach((swara, idx) => {
        window.setTimeout(() => {
          sampleEngine.playNote(activeInstrument.id, swara);
          setHearItNote(swara);
        }, idx * 600);
      });
      window.setTimeout(() => {
        setIsHearItPlaying(false);
        setHearItNote(null);
      }, swaras.length * 600 + 800);
    }
  }, [activeInstrument]);

  const handleStopHearIt = useCallback(() => {
    soundEngine.stopCuratedRaga();
    setIsHearItPlaying(false);
    setHearItNote(null);
  }, []);

  // ── Recording Action Handlers ──────────────────────────────────
  const handleStopRecording = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingStartTime(null);
    setCurrentStep("PERFORMANCE_REVIEW");
  }, []);

  const handleStartRecording = useCallback(() => {
    soundEngine.stopCuratedRaga();
    soundEngine.stopDrone();
    setRecordedNotes([]);
    setRecordingElapsedMs(0);
    const start = Date.now();
    setRecordingStartTime(start);
    setCurrentStep("RECORDING");

    // Also start app-level session recorder if not already active
    if (!sessionRecorder.isRecording()) {
      sessionRecorder.start();
    }

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      setRecordingElapsedMs(elapsed);
      if (elapsed >= 15000) {
        handleStopRecording();
      }
    }, 100);
  }, [handleStopRecording]);

  const handleRetakeRecording = useCallback(() => {
    if (reviewCleanupRef.current) {
      reviewCleanupRef.current();
      reviewCleanupRef.current = null;
    }
    setIsReviewPlaying(false);
    setReviewHighlightedNote(null);
    handleStartRecording();
  }, [handleStartRecording]);

  const handleNotePlayed = useCallback(
    (event: NoteEvent) => {
      setRecordedNotes((prev) => [...prev, event]);
      // Log to session recorder for cross-instrument jam
      sessionRecorder.logNote(activeInstrument.name, event.note, event.frequency);
    },
    [activeInstrument.name]
  );

  // ── Performance Review Playback ───────────────────────────────
  const handlePlayReview = useCallback(() => {
    if (isReviewPlaying) {
      if (reviewCleanupRef.current) reviewCleanupRef.current();
      setIsReviewPlaying(false);
      setReviewHighlightedNote(null);
      return;
    }

    setIsReviewPlaying(true);
    const notesToPlay =
      recordedNotes.length > 0
        ? recordedNotes
        : [
            { note: "Sa", frequency: 261.63, timestamp: 0, duration: 1000 },
            { note: "Re", frequency: 293.66, timestamp: 800, duration: 1000 },
            { note: "Ga", frequency: 329.63, timestamp: 1600, duration: 1000 },
            { note: "Pa", frequency: 392.0, timestamp: 2400, duration: 1200 },
          ];

    const timeouts: number[] = [];

    notesToPlay.forEach((ev) => {
      const timer = window.setTimeout(() => {
        if (activeInstrument.interaction === "strings") {
          sampleEngine.playNote(activeInstrument.id, ev.note, ev.frequency);
        } else if (sampleEngine.isPercussion(activeInstrument.id)) {
          sampleEngine.playStroke(activeInstrument.id, ev.note);
        } else {
          sampleEngine.playNote(activeInstrument.id, ev.note, ev.frequency);
        }
        setReviewHighlightedNote(ev.note);
      }, ev.timestamp);
      timeouts.push(timer);
    });

    const maxTime = notesToPlay[notesToPlay.length - 1]?.timestamp || 3000;
    const endTimer = window.setTimeout(() => {
      setIsReviewPlaying(false);
      setReviewHighlightedNote(null);
    }, maxTime + 1200);
    timeouts.push(endTimer);

    reviewCleanupRef.current = () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [isReviewPlaying, recordedNotes, activeInstrument]);

  // Cleanups
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (reviewCleanupRef.current) reviewCleanupRef.current();
      soundEngine.stopCuratedRaga();
      soundEngine.stopDrone();
    };
  }, []);

  const formatTimer = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const displayImage =
    getSampleImagePath(activeInstrument.model_class || activeInstrument.id) ||
    activeInstrument.image_url ||
    "/sample/sitar.jpeg";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#0c0e12] via-[#090b0e] to-[#050608] text-white select-none ${className}`}
    >
      {/* ── Persistent Heritage Header ──────────────────────────── */}
      <header className="z-20 w-full max-w-4xl mx-auto px-4 pt-3 sm:pt-4 pb-2 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffc75a] shadow-[0_0_10px_#ffc75a]" />
          <div>
            <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#ffc75a] font-semibold">
              MUSEUM MELODY // {activeInstrument.name.toUpperCase()}
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-white/40 truncate max-w-[190px] sm:max-w-xs">
              {museumName}
            </div>
          </div>
        </div>

        {/* Quick Return / Exit Action */}
        <button
          type="button"
          onClick={() => onReturnToScanner(activeInstrument.id)}
          className="text-[10px] sm:text-xs font-grotesque uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1 py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors shrink-0"
        >
          <span>Exit</span>
          <span className="text-xs">✕</span>
        </button>
      </header>

      {/* ── Main Stage Viewport ─────────────────────────────────── */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-2 sm:py-4 w-full max-w-4xl mx-auto my-auto">
        {/* ══════════════════════════════════════════════════════════
            STEP 1: DETECTION COMPLETE (Camera view with gold verification)
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "DETECTION_COMPLETE" && (
          <div className="relative w-full max-w-md mx-auto flex flex-col items-center animate-fade-in py-1">
            <div className="relative w-[270px] h-[340px] sm:w-[340px] sm:h-[420px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,199,90,0.35)] border-2 border-[#ffc75a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedFrameUrl}
                alt="Detected Artefact"
                className="w-full h-full object-cover filter brightness-95"
              />

              {/* Bounding Box Warm Gold Corner Brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 sm:w-7 sm:h-7 border-t-2 border-l-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />
              <div className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 border-t-2 border-r-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />
              <div className="absolute bottom-2 left-2 w-6 h-6 sm:w-7 sm:h-7 border-b-2 border-l-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />
              <div className="absolute bottom-2 right-2 w-6 h-6 sm:w-7 sm:h-7 border-b-2 border-r-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />

              {/* Floating Detection Card */}
              <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[220px] sm:w-[240px] p-2.5 sm:p-3 rounded-xl border border-[#ffc75a]/40 bg-[#16181e]/90 backdrop-blur-xl shadow-2xl text-center">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#c88d3e] uppercase tracking-[0.2em] block mb-0.5">
                  INSTRUMENT DETECTED
                </span>
                <h3 className="font-grotesque font-bold text-white text-xl sm:text-2xl m-0 tracking-tight">
                  {activeInstrument.name.toUpperCase()}
                </h3>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-[#ffc75a] block mt-0.5">
                  {Math.round(activeInstrument.confidence_threshold * 100)}% MATCH
                </span>
              </div>

              {/* Verified State */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-[240px] sm:w-[260px] py-1.5 sm:py-2 px-3 rounded-full border border-emerald-400/40 bg-[#15181e]/90 backdrop-blur-xl flex items-center justify-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] sm:text-[11px] font-grotesque font-bold text-emerald-300 uppercase tracking-wider">
                  Verified with museum catalogue
                </span>
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs font-mono text-white/40 uppercase tracking-widest text-center">
              Extracting physical artefact into sound...
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 2: DISCOVERY TRANSITION (3D Tile Shatter Animation)
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "DISCOVERY_TRANSITION" && (
          <FragmentationTransition
            isTransitioning={true}
            sourceImageUrl={capturedFrameUrl}
            revealedImageUrl={displayImage}
            instrumentName={activeInstrument.name.toUpperCase()}
            onTransitionComplete={() => setCurrentStep("INSTRUMENT_DISCOVERY")}
          />
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 3: INSTRUMENT DISCOVERY PAGE (Editorial presentation)
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "INSTRUMENT_DISCOVERY" && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center animate-fade-in py-1 sm:py-2 px-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full border border-[#ffc75a]/40 bg-[#ffc75a]/10 backdrop-blur-md mb-2 sm:mb-3 shadow-[0_0_20px_rgba(255,199,90,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffc75a]" />
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-[#ffc75a] font-bold">
                DISCOVERY UNLOCKED
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-grotesque text-white tracking-tight uppercase m-0 leading-none">
              {activeInstrument.name}
            </h1>

            <div className="text-[10px] sm:text-xs font-mono text-[#ffc75a] tracking-widest uppercase mt-1 mb-2.5 sm:mb-4">
              {activeInstrument.category} · Authentic Sound
            </div>

            <div className="relative w-full max-w-[280px] sm:max-w-sm h-52 sm:h-64 md:h-72 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#ffc75a]/50 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(255,199,90,0.25)] mb-3 sm:mb-4 bg-[#0a0c10] group flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage}
                alt={activeInstrument.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 filter brightness-100"
              />
            </div>

            <div className="max-w-sm sm:max-w-md text-white/70 font-grotesque text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 space-y-1.5 sm:space-y-2 px-2">
              <p className="m-0">{activeInstrument.description}</p>
              <p className="m-0 text-white/50 text-[10px] sm:text-[11px] font-mono">
                {activeInstrument.historical_context}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={handleStartHearIt}
                className="btn-hero-fill w-full sm:flex-1 min-h-[44px] py-3 sm:py-3.5 px-4 rounded-xl border border-white/30 bg-white/5 hover:bg-white/15 text-white font-grotesque text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>▶ HEAR IT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.stopCuratedRaga();
                  setCurrentStep("PLAYABLE");
                }}
                className="btn-hero-fill w-full sm:flex-1 min-h-[44px] py-3 sm:py-3.5 px-4 rounded-xl border border-[#ffc75a] text-black bg-[#ffc75a] hover:bg-transparent hover:text-[#ffc75a] font-grotesque text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(255,199,90,0.35)] active:scale-95"
              >
                <span>PLAY THIS INSTRUMENT →</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 4: HEAR IT (Authentic sample & live waveform visualizer)
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "HEAR_IT" && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center animate-fade-in py-1 sm:py-2 px-2">
            <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-[#ffc75a] shadow-[0_0_40px_rgba(255,199,90,0.4)] mb-3 sm:mb-4">
              <Image
                src={displayImage}
                alt={activeInstrument.name}
                fill
                priority
                className="object-cover object-center scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="text-[9px] sm:text-[10px] font-mono text-[#ffc75a] uppercase tracking-[0.25em] mb-1">
              {activeInstrument.name.toUpperCase()} // ACOUSTIC RESONANCE
            </div>

            <h2 className="text-xl sm:text-3xl font-bold font-grotesque text-white tracking-tight m-0">
              Listen to the sound of history.
            </h2>

            {hearItNote && (
              <div className="mt-1.5 text-xs font-mono text-white/60">
                Resonating: <span className="text-[#ffc75a] font-bold text-sm">[{hearItNote}]</span>
              </div>
            )}

            <div className="w-full max-w-[240px] sm:max-w-xs my-3 sm:my-5">
              <AudioWaveform isActive={isHearItPlaying} height={40} barCount={28} />
            </div>

            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={isHearItPlaying ? handleStopHearIt : handleStartHearIt}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 font-grotesque text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                {isHearItPlaying ? "Pause Audio" : "Replay Sample"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                handleStopHearIt();
                setCurrentStep("PLAYABLE");
              }}
              className="btn-hero-fill w-full max-w-sm min-h-[44px] py-3.5 px-6 rounded-xl border border-[#ffc75a] text-black bg-[#ffc75a] hover:bg-transparent hover:text-[#ffc75a] font-grotesque text-xs font-bold uppercase tracking-widest cursor-pointer shadow-[0_0_30px_rgba(255,199,90,0.4)] transition-all active:scale-95"
            >
              <span>PLAY THIS INSTRUMENT →</span>
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 5: PLAYABLE INSTRUMENT (Strings or Tiles)
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "PLAYABLE" && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in py-1 sm:py-2 px-1 sm:px-2">
            <div className="text-center mb-2 sm:mb-2.5">
              <h2 className="text-xl sm:text-3xl font-black font-grotesque text-white uppercase tracking-tight m-0">
                PLAYABLE {activeInstrument.name.toUpperCase()}
              </h2>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#ffc75a] uppercase tracking-wider block mt-0.5">
                {activeInstrument.interaction === "strings"
                  ? "Sa · Re · Ga · Ma · Pa · Dha · Ni · Sa'"
                  : sampleEngine.isPercussion(activeInstrument.id)
                  ? "Na · Tin · Dha · Ge · Tun · Ke"
                  : "Sa · Re · Ga · Ma · Pa · Dha · Ni · Sa'"}
              </span>
            </div>

            {/* Instrument Manual Switcher */}
            <div className="flex items-center justify-between w-full max-w-xs mb-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">
                Switch:
              </span>
              <select
                value={activeInstrument.id}
                onChange={(e) => handleSelectInstrument(e.target.value)}
                className="bg-[#12141a] text-xs font-grotesque font-bold text-[#ffc75a] border border-[#ffc75a]/30 rounded-lg px-2 py-0.5 outline-none cursor-pointer"
              >
                {PLAYABLE_INSTRUMENTS.map((inst) => (
                  <option key={inst.id} value={inst.id} className="bg-[#12141a] text-white">
                    {inst.name.toUpperCase()} ({inst.category.split(" ")[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons: Record & Save to Collection */}
            <div className="mb-2.5 sm:mb-3.5 w-full max-w-xs flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleStartRecording}
                className="flex-1 min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border border-rose-500/60 bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-300 hover:text-rose-100 font-grotesque text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(244,63,94,0.25)] cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>● Record</span>
              </button>

              <button
                type="button"
                onClick={handleSaveInstrument}
                className={`flex-1 min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border transition-all cursor-pointer ${
                  isSavedInCollection
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "border-[#ffc75a]/60 bg-[#ffc75a]/15 hover:bg-[#ffc75a]/25 text-[#ffc75a] shadow-[0_0_15px_rgba(255,199,90,0.2)] active:scale-95"
                } font-grotesque text-xs font-bold uppercase tracking-wider`}
              >
                <span>{isSavedInCollection ? "✓ In Collection" : "💾 Save to Museum"}</span>
              </button>
            </div>

            {/* Dynamic Layout: Strings vs Tiles */}
            {activeInstrument.interaction === "strings" ? (
              <PlayableStrings instrument={activeInstrument} />
            ) : (
              <PlayableTiles instrument={activeInstrument} />
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 6a: RECORDING ACTIVE
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "RECORDING" && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in py-1 sm:py-2 px-1 sm:px-2">
            <div className="text-center mb-2 sm:mb-2.5">
              <h2 className="text-xl sm:text-3xl font-black font-grotesque text-white uppercase tracking-tight m-0">
                RECORDING {activeInstrument.name.toUpperCase()}
              </h2>
              <span className="text-[9px] sm:text-[10px] font-mono text-rose-400 uppercase tracking-wider block mt-0.5">
                Play notes to capture your phrase (max 15s)
              </span>
            </div>

            <div className="w-full flex items-center justify-between p-2.5 sm:p-3 mb-2.5 sm:mb-3.5 rounded-xl border border-rose-500/50 bg-rose-950/30 backdrop-blur-xl shadow-[0_0_30px_rgba(244,63,94,0.25)]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <span className="text-[11px] sm:text-xs font-mono uppercase font-bold text-rose-400 tracking-widest block leading-tight">
                    RECORDING
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-white/50 block">
                    {recordedNotes.length} notes captured
                  </span>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-mono font-bold text-white tracking-widest">
                {formatTimer(recordingElapsedMs)}
              </div>

              <button
                type="button"
                onClick={handleStopRecording}
                className="min-h-[44px] flex items-center gap-1.5 py-2 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-grotesque text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
              >
                <span className="w-2 h-2 bg-white rounded-sm" />
                <span>STOP</span>
              </button>
            </div>

            {/* Interactive Component for Recording */}
            {activeInstrument.interaction === "strings" ? (
              <PlayableStrings
                instrument={activeInstrument}
                isRecording={true}
                recordingStartTime={recordingStartTime}
                onNotePlayed={handleNotePlayed}
              />
            ) : (
              <PlayableTiles
                instrument={activeInstrument}
                isRecording={true}
                recordingStartTime={recordingStartTime}
                onNotePlayed={handleNotePlayed}
              />
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 6b: YOUR PERFORMANCE REVIEW
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "PERFORMANCE_REVIEW" && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center animate-fade-in py-1 sm:py-2 px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#ffc75a]" />
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-white/70">
                RECORDING COMPLETE
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black font-grotesque text-white tracking-tight uppercase m-0">
              YOUR PERFORMANCE
            </h2>

            <p className="text-white/50 text-xs font-grotesque mt-1 mb-4 sm:mb-5">
              {recordedNotes.length > 0
                ? `${recordedNotes.length} notes played over ${Math.ceil(recordingElapsedMs / 1000)} seconds`
                : "Acoustic phrase captured"}
            </p>

            {/* Performance Timeline Visualization Card */}
            <div className="w-full p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-white/15 bg-[#14171d]/90 backdrop-blur-xl shadow-xl mb-4 sm:mb-6">
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2.5 sm:mb-3">
                <span>{activeInstrument.name.toUpperCase()} // TAKE 01</span>
                <span>{recordedNotes.length} NOTES</span>
              </div>

              {/* Note markers on timeline track */}
              <div className="relative w-full h-11 sm:h-14 rounded-xl bg-black/50 border border-white/10 flex items-center px-3 sm:px-4 overflow-hidden mb-2.5">
                <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5">
                  {(recordedNotes.length > 0
                    ? recordedNotes
                    : [
                        { note: "Sa", timestamp: 0 },
                        { note: "Re", timestamp: 500 },
                        { note: "Ga", timestamp: 1000 },
                        { note: "Pa", timestamp: 1500 },
                      ]
                  ).map((ev, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center transition-all"
                    >
                      <span className="text-[8px] sm:text-[9px] font-mono text-[#ffc75a] font-bold">
                        {ev.note}
                      </span>
                      <div className="w-1 sm:w-1.5 h-4 sm:h-6 rounded-full bg-gradient-to-t from-[#d4af37] to-[#ffc75a] shadow-[0_0_8px_#ffc75a]" />
                    </div>
                  ))}
                </div>

                {isReviewPlaying && (
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_#fff]"
                    style={{ animation: "scan-beam 4s linear infinite" }}
                  />
                )}
              </div>

              {reviewHighlightedNote && (
                <div className="text-xs font-mono text-[#ffc75a]">
                  Resonating: [{reviewHighlightedNote}]
                </div>
              )}
            </div>

            {/* Performance Actions: [PLAY], [RETAKE], [ADD TO MY SONG →] */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full">
              <button
                type="button"
                onClick={handlePlayReview}
                className="btn-hero-fill w-full sm:w-1/3 min-h-[44px] py-3 sm:py-3.5 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-grotesque text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                {isReviewPlaying ? (
                  <>
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>PLAY</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRetakeRecording}
                className="w-full sm:w-1/3 min-h-[44px] py-3 sm:py-3.5 px-4 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 text-white/70 hover:text-white font-grotesque text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center active:scale-95"
              >
                ↺ RETAKE
              </button>

              <button
                type="button"
                onClick={() => {
                  if (reviewCleanupRef.current) reviewCleanupRef.current();
                  setIsReviewPlaying(false);
                  setCurrentStep("COMPOSITION");
                }}
                className="btn-hero-fill w-full sm:flex-1 min-h-[44px] py-3 sm:py-3.5 px-4 rounded-xl border border-[#ffc75a] text-black bg-[#ffc75a] hover:bg-transparent hover:text-[#ffc75a] font-grotesque text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[0_0_25px_rgba(255,199,90,0.35)] transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>ADD TO MY SONG →</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 7: COMPOSITION STUDIO (Multi-track layered song)
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "COMPOSITION" && (
          <CompositionStudio
            recordedNotes={recordedNotes}
            instrumentName={activeInstrument.name.toUpperCase()}
            onKeepExploring={() => onReturnToScanner(activeInstrument.id)}
          />
        )}
      </main>
    </div>
  );
}
