"use client";

interface ScanningReticleProps {
  isScanning: boolean;
  isDetecting: boolean;
}

export default function ScanningReticle({
  isScanning,
  isDetecting,
}: ScanningReticleProps) {
  return (
    <div className="relative w-[70vw] max-w-[270px] aspect-[4/5] sm:w-[300px] sm:h-[380px] pointer-events-none select-none transition-all duration-500">
      {/* Top-Left Corner Bracket */}
      <div className="absolute top-0 left-0 w-6 h-6 sm:w-7 sm:h-7 border-t-2 border-l-2 border-white" />
      {/* Top-Right Corner Bracket */}
      <div className="absolute top-0 right-0 w-6 h-6 sm:w-7 sm:h-7 border-t-2 border-r-2 border-white" />
      {/* Bottom-Left Corner Bracket */}
      <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-7 sm:h-7 border-b-2 border-l-2 border-white" />
      {/* Bottom-Right Corner Bracket */}
      <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 border-b-2 border-r-2 border-white" />

      {/* Central Intersecting Reticle Lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        {/* Horizontal center line */}
        <div className="w-full h-px bg-white/35" />
        {/* Vertical center line */}
        <div className="h-full w-px bg-white/35 -ml-[1px]" />
      </div>

      {/* Center Reticle Focus Ticks */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-5 h-5 sm:w-6 sm:h-6 border border-white/60" />
      </div>

      {/* Subtle Animated Scanning Beam */}
      {isScanning && !isDetecting && (
        <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#ffc75a] to-transparent shadow-[0_0_12px_rgba(255,199,90,0.7)] animate-[scan-beam_2.8s_ease-in-out_infinite]" />
      )}
    </div>
  );
}
