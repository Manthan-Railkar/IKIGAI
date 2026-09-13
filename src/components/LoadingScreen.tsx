"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  onLoaded: () => void;
  duration?: number; // duration in ms, default ~2800ms
}

export default function LoadingScreen({
  onLoaded,
  duration = 2800,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    // Progress counter animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsFading(true);
        // Fade-out transition completes in 600ms
        setTimeout(() => {
          setIsRemoved(true);
          onLoaded();
        }, 600);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [duration, onLoaded]);

  if (isRemoved) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col justify-between items-center px-8 py-14 select-none noise-bg transition-all duration-600 ${
        isFading ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#1d2228",
        backgroundImage: `radial-gradient(circle farthest-side at 15% 15%, rgba(193,24,34,0.35), transparent 60%),
          radial-gradient(circle farthest-side at 85% 85%, rgba(193,24,34,0.3), transparent 60%),
          url(/Assets/Noise.png)`,
      }}
    >
      {/* Top Header info */}
      <div className="w-full max-w-[1280px] flex justify-between items-center text-xs tracking-[0.2em] text-white/50 uppercase">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#52f3b0] animate-pulse" />
          <span>VIRTUAL MUSEUM</span>
        </div>
        <div className="font-grotesque font-mono text-sm tracking-wider text-white">
          {progress < 10 ? `00${progress}` : progress < 100 ? `0${progress}` : progress}%
        </div>
      </div>

      {/* Center Brand / Aesthetics Logo & Sculptural Elements */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Subtle glowing ring decoration */}
        <div className="absolute -inset-12 rounded-full border border-white/10 animate-spin [animation-duration:12s]" />
        <div className="absolute -inset-20 rounded-full border border-dashed border-white/5 animate-spin [animation-duration:20s] [animation-direction:reverse]" />

        {/* Logo */}
        <div className="relative z-10 mb-8 transform transition-transform duration-500 hover:scale-105">
          <Image
            src="/Assets/logo.svg"
            alt="History Virtual Museum"
            width={96}
            height={54}
            priority
            className="w-20 sm:w-24 h-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Title */}
        <h2 className="font-grotesque text-2xl sm:text-3xl font-bold uppercase tracking-[0.12em] text-center text-white mb-3">
          History Virtual Museum
        </h2>

        {/* Subtitle with classic styling */}
        <div className="text-grey text-xs sm:text-sm tracking-[0.25em] uppercase text-center">
          Mankind history explained
        </div>

        {/* Sleek loading bar */}
        <div className="w-48 sm:w-64 h-[2px] bg-white/10 rounded-full mt-8 overflow-hidden relative">
          <div
            className="h-full bg-white transition-all ease-out duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom info */}
      <div className="w-full max-w-[1280px] flex justify-between items-center text-[11px] tracking-[0.15em] text-white/40 uppercase font-light">
        <div>Classical Antiquity</div>
        <div className="flex items-center space-x-3">
          <span>Loading Collection</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/60 animate-ping" />
        </div>
      </div>
    </div>
  );
}
