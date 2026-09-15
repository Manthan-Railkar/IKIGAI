"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { NoteEvent, soundEngine } from "@/lib/audio/soundEngine";
import AudioWaveform from "./AudioWaveform";
import PlayableVeena from "./PlayableVeena";
import FragmentationTransition from "./FragmentationTransition";
import CompositionStudio from "./CompositionStudio";

export type PostScanStep =
  | "DETECTION_COMPLETE"      // Step 1: Instrument detected + gold outline + catalogue verified
  | "DISCOVERY_TRANSITION"    // Step 2: 3D Tile fragment shatter + reconstruct standalone Veena
  | "INSTRUMENT_DISCOVERY"    // Step 3: Editorial discovery page with history + actions
  | "HEAR_IT"                 // Step 4: Authentic raga sample + waveform visualization
  | "PLAYABLE"                // Step 5: Interactive playable Veena with Sa-Re-Ga-Ma-Pa-Dha-Ni
  | "RECORDING"               // Step 6a: Active recording state with 15s timer
  | "PERFORMANCE_REVIEW"      // Step 6b: 'Your Performance' with Play, Retake, Add to Song
  | "COMPOSITION";            // Step 7: Multi-track 'My Song' layer view

interface PostScanExperienceProps {
  onReturnToScanner: (discoveredInstrumentId: string) => void;
  museumName?: string;
  capturedFrameUrl?: string;
  initialStep?: PostScanStep;
  className?: string;
}

export default function PostScanExperience({
  onReturnToScanner,
  museumName = "Raja Dinkar Kelkar Museum",
  capturedFrameUrl = "/Assets/museum_sculpture_veena.jpg",
  initialStep = "DISCOVERY_TRANSITION",
  className = "",
}: PostScanExperienceProps) {
  const [currentStep, setCurrentStep] = useState<PostScanStep>(initialStep);

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
    soundEngine.playCuratedRaga(
      (swara) => setHearItNote(swara),
      () => {
        setIsHearItPlaying(false);
        setHearItNote(null);
      }
    );
  }, []);

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

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      setRecordingElapsedMs(elapsed);
      if (elapsed >= 15000) {
        handleStopRecording();
      }
    }, 100);
  }, [handleStopRecording]);

  const handleNotePlayed = useCallback((event: NoteEvent) => {
    setRecordedNotes((prev) => [...prev, event]);
  }, []);

  const handleRetakeRecording = useCallback(() => {
    if (reviewCleanupRef.current) {
      reviewCleanupRef.current();
      reviewCleanupRef.current = null;
    }
    setIsReviewPlaying(false);
    setRecordedNotes([]);
    handleStartRecording();
  }, [handleStartRecording]);

  const handlePlayReview = useCallback(() => {
    if (isReviewPlaying) {
      if (reviewCleanupRef.current) {
        reviewCleanupRef.current();
        reviewCleanupRef.current = null;
      }
      setIsReviewPlaying(false);
      setReviewHighlightedNote(null);
      return;
    }

    setIsReviewPlaying(true);
    reviewCleanupRef.current = soundEngine.playComposition(
      recordedNotes.length > 0
        ? recordedNotes
        : [
            { note: "Sa", frequency: 261.63, timestamp: 0, duration: 1000 },
            { note: "Re", frequency: 293.66, timestamp: 800, duration: 1000 },
            { note: "Ga", frequency: 329.63, timestamp: 1600, duration: 1200 },
            { note: "Pa", frequency: 392.0, timestamp: 2600, duration: 1600 },
          ],
      {
        includeTabla: false,
        includeSitar: true,
        onNoteHighlight: (note) => setReviewHighlightedNote(note),
        onComplete: () => {
          setIsReviewPlaying(false);
          setReviewHighlightedNote(null);
        },
      }
    );
  }, [isReviewPlaying, recordedNotes]);

  // Clean up sounds on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopCuratedRaga();
      soundEngine.stopDrone();
      soundEngine.stopTablaLoop();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (reviewCleanupRef.current) reviewCleanupRef.current();
    };
  }, []);

  // Format recording timer MM:SS
  const formatTimer = (ms: number) => {
    const totalSec = Math.min(15, Math.floor(ms / 1000));
    const secStr = totalSec.toString().padStart(2, "0");
    return `00:${secStr} / 00:15`;
  };

  return (
    <div className={`fixed inset-0 z-40 bg-[#0d0f12] text-white flex flex-col overflow-y-auto noise-bg ${className}`}>
      {/* ── Top Bar Header (Compact & Mobile-Optimized) ───────────── */}
      <header className="z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-5 pb-2 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
            <Image
              src="/Assets/6aa66eef7361b4711b30b84f_logo.svg"
              alt="Logo"
              width={18}
              height={18}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-grotesque font-bold text-xs uppercase tracking-wider leading-none">
                Museum Melody
              </span>
              <span className="text-[#ffc75a] text-[9px] sm:text-[10px] font-mono tracking-widest uppercase shrink-0">
                {"// LIVING ARCHIVE"}
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-white/50 tracking-wide mt-0.5 truncate max-w-[170px] sm:max-w-xs">
              {museumName}
            </div>
          </div>
        </div>

        {/* Quick Return / Exit Action */}
        <button
          type="button"
          onClick={() => onReturnToScanner("saraswati-veena")}
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
            {/* Frozen Frame of Real Museum Sculpture or Real Camera Capture */}
            <div className="relative w-[270px] h-[340px] sm:w-[340px] sm:h-[420px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,199,90,0.35)] border-2 border-[#ffc75a]">
              {capturedFrameUrl.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={capturedFrameUrl}
                  alt="Detected Real Camera Frame"
                  className="w-full h-full object-cover filter brightness-95"
                />
              ) : (
                <Image
                  src={capturedFrameUrl}
                  alt="Detected Veena Sculpture in Museum"
                  fill
                  priority
                  className="object-cover object-center filter brightness-95"
                />
              )}

              {/* Bounding Box Warm Gold Corner Brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 sm:w-7 sm:h-7 border-t-2 border-l-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />
              <div className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 border-t-2 border-r-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />
              <div className="absolute bottom-2 left-2 w-6 h-6 sm:w-7 sm:h-7 border-b-2 border-l-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />
              <div className="absolute bottom-2 right-2 w-6 h-6 sm:w-7 sm:h-7 border-b-2 border-r-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />

              {/* Subtle Detection Grid */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="border border-[#ffc75a]/50" />
                ))}
              </div>

              {/* Floating Detection Card */}
              <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[220px] sm:w-[240px] p-2.5 sm:p-3 rounded-xl border border-[#ffc75a]/40 bg-[#16181e]/90 backdrop-blur-xl shadow-2xl text-center">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#c88d3e] uppercase tracking-[0.2em] block mb-0.5">
                  INSTRUMENT DETECTED
                </span>
                <h3 className="font-grotesque font-bold text-white text-xl sm:text-2xl m-0 tracking-tight">
                  VEENA
                </h3>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-[#ffc75a] block mt-0.5">
                  87% MATCH
                </span>
              </div>

              {/* Subtle Verification State */}
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
            revealedImageUrl="/Assets/veena_reveal.jpg"
            instrumentName="VEENA"
            onTransitionComplete={() => setCurrentStep("INSTRUMENT_DISCOVERY")}
          />
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 3: INSTRUMENT DISCOVERY PAGE (Editorial presentation)
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "INSTRUMENT_DISCOVERY" && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center animate-fade-in py-1 sm:py-2 px-2">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full border border-[#ffc75a]/40 bg-[#ffc75a]/10 backdrop-blur-md mb-2 sm:mb-3 shadow-[0_0_20px_rgba(255,199,90,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffc75a]" />
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-[#ffc75a] font-bold">
                DISCOVERY UNLOCKED
              </span>
            </div>

            {/* Instrument Name */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-grotesque text-white tracking-tight uppercase m-0 leading-none">
              VEENA
            </h1>

            {/* Metadata Line */}
            <div className="text-[10px] sm:text-xs font-mono text-[#ffc75a] tracking-widest uppercase mt-1 mb-2.5 sm:mb-4">
              Strings · India · 16th Century
            </div>

            {/* Cinematic Veena Visual (Proportioned for mobile screens) */}
            <div className="relative w-full max-w-[280px] sm:max-w-sm h-48 sm:h-64 md:h-72 rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(255,199,90,0.25)] mb-3 sm:mb-4 group">
              <Image
                src="/Assets/veena_reveal.jpg"
                alt="Veena Masterpiece"
                fill
                priority
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-transparent" />
            </div>

            {/* Concise Historical Explanation */}
            <div className="max-w-sm sm:max-w-md text-white/70 font-grotesque text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 space-y-1.5 sm:space-y-2 px-2">
              <p className="m-0">
                Handcrafted from seasoned jackwood and sacred dried gourds, the Veena has resonated through Indian royal courts and temple sanctuaries for centuries as the divine instrument of Saraswati.
              </p>
              <p className="m-0 text-white/50 text-[10px] sm:text-[11px] font-mono">
                Its 24 brass frets set in beeswax allow seamless microtonal glides (meend), bridging ancient temple sculpture depictions with living acoustic tradition.
              </p>
            </div>

            {/* Primary Actions */}
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
            {/* Prominent Visual Header */}
            <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-[#ffc75a] shadow-[0_0_40px_rgba(255,199,90,0.4)] mb-3 sm:mb-4">
              <Image
                src="/Assets/veena_reveal.jpg"
                alt="Veena Acoustic Resonance"
                fill
                priority
                className="object-cover object-center scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="text-[9px] sm:text-[10px] font-mono text-[#ffc75a] uppercase tracking-[0.25em] mb-1">
              RAGA YAMAN // MEDITATIVE ALAP
            </div>

            <h2 className="text-xl sm:text-3xl font-bold font-grotesque text-white tracking-tight m-0">
              Listen to the sound of history.
            </h2>

            {hearItNote && (
              <div className="mt-1.5 text-xs font-mono text-white/60">
                Playing Swara: <span className="text-[#ffc75a] font-bold text-sm">[{hearItNote}]</span>
              </div>
            )}

            {/* Subtle Audio Waveform Visualizer */}
            <div className="w-full max-w-[240px] sm:max-w-xs my-3 sm:my-5">
              <AudioWaveform isActive={isHearItPlaying} height={40} barCount={28} />
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={isHearItPlaying ? handleStopHearIt : handleStartHearIt}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 font-grotesque text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                {isHearItPlaying ? "Pause Audio" : "Replay Sample"}
              </button>
            </div>

            {/* Primary Action Button */}
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
            STEP 5: PLAYABLE INSTRUMENT
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "PLAYABLE" && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in py-1 sm:py-2 px-1 sm:px-2">
            {/* Title */}
            <div className="text-center mb-2 sm:mb-2.5">
              <h2 className="text-xl sm:text-3xl font-black font-grotesque text-white uppercase tracking-tight m-0">
                PLAYABLE VEENA
              </h2>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#ffc75a] uppercase tracking-wider block mt-0.5">
                Sa · Re · Ga · Ma · Pa · Dha · Ni · Sa&apos;
              </span>
            </div>

            {/* Record Action Button (Min 44px comfortable touch target) */}
            <div className="mb-2.5 sm:mb-3.5 w-full max-w-xs flex justify-center">
              <button
                type="button"
                onClick={handleStartRecording}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-6 rounded-full border border-rose-500/60 bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-300 hover:text-rose-100 font-grotesque text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>● RECORD PERFORMANCE</span>
              </button>
            </div>

            {/* Interactive Playable Veena Component */}
            <PlayableVeena />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 6a: RECORDING ACTIVE
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "RECORDING" && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in py-1 sm:py-2 px-1 sm:px-2">
            {/* Title */}
            <div className="text-center mb-2 sm:mb-2.5">
              <h2 className="text-xl sm:text-3xl font-black font-grotesque text-white uppercase tracking-tight m-0">
                RECORDING VEENA
              </h2>
              <span className="text-[9px] sm:text-[10px] font-mono text-rose-400 uppercase tracking-wider block mt-0.5">
                Pluck frets to capture your phrase (max 15s)
              </span>
            </div>

            {/* Recording Active Status Bar */}
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

              {/* 15s Timer */}
              <div className="text-xs sm:text-sm font-mono font-bold text-white tracking-widest">
                {formatTimer(recordingElapsedMs)}
              </div>

              {/* Stop Recording Button (Min 44px touch target) */}
              <button
                type="button"
                onClick={handleStopRecording}
                className="min-h-[44px] flex items-center gap-1.5 py-2 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-grotesque text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
              >
                <span className="w-2 h-2 bg-white rounded-sm" />
                <span>STOP</span>
              </button>
            </div>

            {/* Interactive Frets for Recording */}
            <PlayableVeena
              isRecording={true}
              recordingStartTime={recordingStartTime}
              onNotePlayed={handleNotePlayed}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 6b: YOUR PERFORMANCE REVIEW
           ══════════════════════════════════════════════════════════ */}
        {currentStep === "PERFORMANCE_REVIEW" && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center animate-fade-in py-1 sm:py-2 px-2">
            {/* Header Badge */}
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
                ? `${recordedNotes.length} Swaras played over ${Math.ceil(recordingElapsedMs / 1000)} seconds`
                : "Acoustic phrase captured"}
            </p>

            {/* Performance Timeline Visualization Card */}
            <div className="w-full p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-white/15 bg-[#14171d]/90 backdrop-blur-xl shadow-xl mb-4 sm:mb-6">
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2.5 sm:mb-3">
                <span>VEENA // TAKE 01</span>
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
            instrumentName="VEENA"
            onKeepExploring={() => onReturnToScanner("saraswati-veena")}
          />
        )}
      </main>
    </div>
  );
}
