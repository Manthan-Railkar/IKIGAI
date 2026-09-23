"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sessionRecorder, RecordingResult } from "@/lib/audio/sessionRecorder";
import { createClient } from "@/lib/supabase/client";
import { uploadRecordingToCloud } from "@/lib/supabase/recordings";

export default function RecordingBar({ className = "" }: { className?: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [lastResult, setLastResult] = useState<RecordingResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Cloud upload state
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [cloudSaveStatus, setCloudSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [cloudErrorMessage, setCloudErrorMessage] = useState("");

  const supabase = createClient();

  useEffect(() => {
    const unsubscribe = sessionRecorder.subscribe((state) => {
      setIsRecording(state.isRecording);
      setIsProcessing(state.isProcessing);
      setElapsedMs(state.elapsedMs);
      setEventsCount(state.eventsCount);
      setLastResult(state.lastResult);
      if (state.lastResult && !state.isRecording && !state.isProcessing) {
        setShowResultModal(true);
        setCloudSaveStatus("idle");
        setCloudErrorMessage("");
      }
    });
    return unsubscribe;
  }, []);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleToggle = async () => {
    if (isRecording) {
      await sessionRecorder.stop();
    } else {
      sessionRecorder.start();
    }
  };

  const handleDownload = () => {
    sessionRecorder.triggerDownload();
  };

  const handleSaveToCloud = async () => {
    if (!lastResult) return;
    setIsSavingToCloud(true);
    setCloudSaveStatus("idle");
    setCloudErrorMessage("");

    const instrumentsUsed = Array.from(
      new Set(lastResult.events.map((e) => e.instrument))
    );

    const { recording, error } = await uploadRecordingToCloud(
      supabase,
      lastResult.blob,
      {
        title: `Jam: ${instrumentsUsed.join(" & ") || "Indian Heritage"}`,
        duration_ms: lastResult.durationMs,
        notes_count: lastResult.events.length,
        instruments: instrumentsUsed,
      }
    );

    setIsSavingToCloud(false);
    if (error) {
      setCloudSaveStatus("error");
      setCloudErrorMessage(error.message);
    } else if (recording) {
      setCloudSaveStatus("saved");
    }
  };

  // Unique instruments recorded in this session
  const instrumentsRecorded = Array.from(
    new Set(sessionRecorder.getLoggedEvents().map((e) => e.instrument))
  );

  return (
    <>
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isRecording || isProcessing
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-0 opacity-90 hover:opacity-100 scale-95 hover:scale-100"
        } ${className}`}
      >
        <div className="flex items-center gap-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/20 bg-[#12141a]/95 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
          {/* Status Indicator */}
          {isRecording ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="text-[11px] font-mono tracking-widest text-red-400 font-bold uppercase">
                REC
              </span>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-[#ffc75a] border-t-transparent animate-spin" />
              <span className="text-[11px] font-mono tracking-widest text-[#ffc75a] font-bold uppercase">
                ENCODING MP3
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
              <span className="text-[11px] font-mono tracking-widest text-white/50 font-medium uppercase hidden sm:inline">
                CROSS-INSTRUMENT JAM
              </span>
            </div>
          )}

          {/* Time Counter */}
          {isRecording && (
            <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
              {formatTime(elapsedMs)}
            </span>
          )}

          {/* Instruments & Notes stats chip */}
          {isRecording && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-white/60 border border-white/10">
              <span>{eventsCount} notes</span>
              {instrumentsRecorded.length > 0 && (
                <>
                  <span>·</span>
                  <span className="text-[#ffc75a] font-semibold truncate max-w-[120px]">
                    {instrumentsRecorded.join(", ")}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Action Button */}
          {isRecording ? (
            <button
              type="button"
              onClick={handleToggle}
              className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-grotesque font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <span className="w-2 h-2 bg-white rounded-sm" />
              <span>Stop & Save</span>
            </button>
          ) : isProcessing ? (
            <span className="text-[11px] font-mono text-white/50 px-2 py-1">
              Please wait...
            </span>
          ) : (
            <button
              type="button"
              onClick={handleToggle}
              className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-grotesque font-medium text-xs uppercase tracking-wider transition-all border border-white/15 cursor-pointer hover:border-red-500/50"
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Record Jam</span>
            </button>
          )}

          {/* Completed recording button if available */}
          {!isRecording && !isProcessing && lastResult && (
            <button
              type="button"
              onClick={() => setShowResultModal(true)}
              className="text-[11px] font-mono text-[#ffc75a] hover:underline cursor-pointer px-1"
            >
              View MP3
            </button>
          )}
        </div>
      </div>

      {/* Completed Recording Modal / Download Drawer */}
      {showResultModal && lastResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-2xl border border-white/20 bg-[#161922] shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white">
            <button
              type="button"
              onClick={() => setShowResultModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-lg font-mono cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffc75a] to-[#ff9800] flex items-center justify-center text-black font-black text-xl shadow-lg">
                ♫
              </div>
              <div>
                <h3 className="text-lg font-bold font-grotesque leading-tight">
                  Jam Session Recorded!
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  {lastResult.filename}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
              <div>
                <span className="text-white/40 block text-[10px] uppercase">Duration</span>
                <span className="text-sm font-bold text-white">
                  {formatTime(lastResult.durationMs)}
                </span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase">Notes Played</span>
                <span className="text-sm font-bold text-[#ffc75a]">
                  {lastResult.events.length} notes
                </span>
              </div>
            </div>

            {/* In-Browser Audio Player */}
            <div className="mb-4">
              <audio
                controls
                src={lastResult.url}
                className="w-full rounded-lg filter invert hue-rotate-180"
              />
            </div>

            {/* Cloud Storage Status Banner */}
            {cloudSaveStatus === "saved" ? (
              <div className="mb-4 p-2.5 rounded-xl border border-emerald-400/40 bg-emerald-950/40 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-grotesque font-medium flex items-center gap-1.5">
                  ✓ Saved to your Cloud Profile!
                </span>
                <Link
                  href="/profile"
                  className="text-[10px] font-mono uppercase text-[#ffc75a] underline hover:text-white"
                >
                  View in Profile →
                </Link>
              </div>
            ) : cloudSaveStatus === "error" ? (
              <div className="mb-4 p-2.5 rounded-xl border border-rose-400/40 bg-rose-950/40 text-xs text-rose-300">
                <p className="m-0 font-grotesque">{cloudErrorMessage}</p>
                {cloudErrorMessage.includes("log in") && (
                  <Link
                    href="/login?next=/scanner"
                    className="text-[10px] font-mono text-[#ffc75a] underline mt-1 block"
                  >
                    Log In to your Visitor Pass →
                  </Link>
                )}
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ffc75a] to-[#e5a955] text-black font-bold font-grotesque text-xs uppercase tracking-wider shadow-[0_5px_20px_rgba(255,199,90,0.4)] hover:brightness-110 active:scale-98 transition-all cursor-pointer text-center"
                >
                  Download MP3
                </button>

                <button
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={isSavingToCloud || cloudSaveStatus === "saved"}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#ffc75a]/50 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-grotesque text-xs uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  {isSavingToCloud ? (
                    <>
                      <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : cloudSaveStatus === "saved" ? (
                    <span>✓ In Cloud</span>
                  ) : (
                    <span>☁ Save to Cloud</span>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
