"use client";

import { DetectionResult, ScannerState } from "@/types/scanner";

interface DetectionOverlayProps {
  detection: DetectionResult;
  state: ScannerState;
  imageUrl?: string;
}

export default function DetectionOverlay({
  detection,
  state,
  imageUrl,
}: DetectionOverlayProps) {
  const isVerifying = state === "VERIFYING";
  const isDiscovered = state === "DISCOVERED";

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-20">
      {/* Target Bounding Box around the sculpture / instrument */}
      <div className="relative w-[70vw] max-w-[270px] aspect-[4/5] sm:w-[300px] sm:h-[380px] transition-all duration-500 animate-fade-in">
        {/* Render the detected instrument image inside the bounding box */}
        {imageUrl && (
          <div className="absolute inset-0 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={detection.name}
              className="w-full h-full object-cover filter brightness-95"
            />
          </div>
        )}
        {/* Warm gold outline & glowing aura around detected object */}
        <div
          className={`absolute -inset-1 rounded-xl transition-all duration-700 pointer-events-none border-2 ${
            isDiscovered
              ? "border-[#ffc75a] bg-[#ffc75a]/20 shadow-[0_0_35px_rgba(255,199,90,0.6)] opacity-100"
              : isVerifying
              ? "border-[#ffc75a] bg-[#ffc75a]/15 shadow-[0_0_25px_rgba(255,199,90,0.4)] opacity-90 animate-pulse"
              : "border-[#e5a955]/80 bg-[#e5a955]/10 shadow-[0_0_15px_rgba(229,169,85,0.3)] opacity-75"
          }`}
        />

        {/* 4 Warm Gold Corner Brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 sm:w-7 sm:h-7 border-t-2 border-l-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />
        <div className="absolute top-0 right-0 w-6 h-6 sm:w-7 sm:h-7 border-t-2 border-r-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />
        <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-7 sm:h-7 border-b-2 border-l-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 border-b-2 border-r-2 border-[#ffc75a] shadow-[0_0_12px_#ffc75a]" />

        {/* Subtle Detection Grid */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="border border-[#ffc75a] flex items-center justify-center"
            >
              <div className="w-1 h-1 rounded-full bg-[#ffc75a]/40" />
            </div>
          ))}
        </div>

        {/* Compact Floating Detection Card */}
        <div className="absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 w-[210px] sm:w-[230px] px-3 py-2 rounded-xl border border-white/15 bg-[#14161c]/95 backdrop-blur-2xl shadow-[0_15px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(255,199,90,0.25)] transition-all duration-300 text-center">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] font-mono font-bold text-[#c88d3e] uppercase tracking-[0.2em]">
              INSTRUMENT DETECTED
            </span>
            <svg
              className="w-3 h-3 text-[#ffc75a]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3" strokeWidth="1.5" />
            </svg>
          </div>

          <h3 className="font-grotesque font-bold text-white text-lg sm:text-2xl m-0 leading-tight uppercase">
            {detection.name}
          </h3>

          <div className="text-[10px] sm:text-xs font-mono text-[#ffc75a] font-bold mt-0.5">
            {detection.confidence}% MATCH
          </div>
        </div>

        {/* Subtle Verification State Badge */}
        {(isVerifying || isDiscovered) && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap py-1 px-3 rounded-full border border-emerald-400/40 bg-[#12141a]/95 backdrop-blur-xl flex items-center justify-center gap-1.5 shadow-lg animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-grotesque font-bold text-emerald-300 uppercase tracking-wider">
              Verified with museum catalogue
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
