"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface FragmentTile {
  id: number;
  row: number;
  col: number;
  xOffset: number;
  yOffset: number;
  zOffset: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
  delay: number;
}

interface FragmentationTransitionProps {
  isTransitioning: boolean;
  sourceImageUrl?: string;
  revealedImageUrl?: string;
  instrumentName?: string;
  onTransitionComplete?: () => void;
}

// Precompute 64 deterministic outward trajectories statically for pure rendering
function generateStaticTiles(rows = 8, cols = 8): FragmentTile[] {
  const list: FragmentTile[] = [];
  let id = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const normX = (c - 3.5) / 3.5;
      const normY = (r - 3.5) / 3.5;
      const distFromCenter = Math.sqrt(normX * normX + normY * normY);

      // Deterministic hash based on tile coordinate
      const seed = r * cols + c + 1;
      const rnd1 = ((Math.sin(seed * 12.9898) * 43758.5453) % 1 + 1) % 1;
      const rnd2 = ((Math.sin(seed * 78.233) * 43758.5453) % 1 + 1) % 1;
      const rnd3 = ((Math.sin(seed * 45.164) * 43758.5453) % 1 + 1) % 1;
      const rnd4 = ((Math.sin(seed * 91.827) * 43758.5453) % 1 + 1) % 1;

      const angle = Math.atan2(normY, normX) + (rnd1 - 0.5) * 0.5;
      const distance = 140 + rnd2 * 220;

      const xOffset = Math.cos(angle) * distance;
      const yOffset = Math.sin(angle) * distance;
      const zOffset = 80 + rnd3 * 220;

      const rotX = (rnd4 - 0.5) * 120;
      const rotY = (rnd1 - 0.5) * 120;
      const rotZ = (rnd2 - 0.5) * 90;
      const scale = 0.2 + rnd3 * 0.4;
      const delay = distFromCenter * 110;

      list.push({
        id: id++,
        row: r,
        col: c,
        xOffset,
        yOffset,
        zOffset,
        rotX,
        rotY,
        rotZ,
        scale,
        delay,
      });
    }
  }
  return list;
}

const STATIC_TILES = generateStaticTiles(8, 8);

export default function FragmentationTransition({
  isTransitioning,
  sourceImageUrl = "/Assets/museum_sculpture_veena.jpg",
  revealedImageUrl = "/Assets/veena_reveal.jpg",
  instrumentName = "VEENA",
  onTransitionComplete,
}: FragmentationTransitionProps) {
  const rows = 8;
  const cols = 8;
  const tiles = STATIC_TILES;

  // Phase tracking: 'freeze' | 'shattering' | 'reconstructing' | 'unlocked'
  const [phase, setPhase] = useState<"idle" | "freeze" | "shattering" | "reconstructing" | "unlocked">(
    () => (isTransitioning ? "freeze" : "idle")
  );

  useEffect(() => {
    if (!isTransitioning) {
      const t = window.setTimeout(() => setPhase("idle"), 0);
      return () => clearTimeout(t);
    }

    // Step 1: Freeze frame and isolate bounding box
    const freezeTimer = window.setTimeout(() => {
      setPhase("freeze");
    }, 0);

    // Step 2: Begin fragment shatter
    const shatterTimer = window.setTimeout(() => {
      setPhase("shattering");
    }, 450);

    // Step 3: Reconstruct standalone visual
    const reconstructTimer = window.setTimeout(() => {
      setPhase("reconstructing");
    }, 1450);

    // Step 4: Display "DISCOVERY UNLOCKED"
    const unlockedTimer = window.setTimeout(() => {
      setPhase("unlocked");
    }, 2200);

    // Step 5: Transition to Instrument Discovery Page
    const completeTimer = window.setTimeout(() => {
      onTransitionComplete?.();
    }, 3600);

    return () => {
      clearTimeout(freezeTimer);
      clearTimeout(shatterTimer);
      clearTimeout(reconstructTimer);
      clearTimeout(unlockedTimer);
      clearTimeout(completeTimer);
    };
  }, [isTransitioning, onTransitionComplete]);

  if (!isTransitioning && phase === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center select-none pointer-events-auto">
      {/* Background darkening transition: from camera translucency to pure dark charcoal/black */}
      <div
        className="absolute inset-0 transition-colors duration-1000 ease-in-out"
        style={{
          backgroundColor:
            phase === "shattering" || phase === "reconstructing" || phase === "unlocked"
              ? "rgba(10, 11, 14, 0.98)"
              : "rgba(10, 11, 14, 0.65)",
        }}
      />

      {/* Radiant ambient gold extraction flare */}
      <div
        className={`absolute w-[450px] h-[450px] rounded-full bg-[#ffc75a]/20 blur-[130px] transition-all duration-1000 pointer-events-none ${
          phase === "reconstructing" || phase === "unlocked"
            ? "opacity-100 scale-125"
            : phase === "shattering"
            ? "opacity-80 scale-100"
            : "opacity-30 scale-75"
        }`}
      />

      {/* Central 3D Extraction Zone */}
      <div
        className="relative w-[300px] h-[380px] sm:w-[340px] sm:h-[440px] flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {/* ── 1. Fragmented Tiles (The Disintegrating Museum Artefact) ── */}
        {(phase === "freeze" || phase === "shattering") && (
          <div className="absolute inset-0 overflow-visible" style={{ transformStyle: "preserve-3d" }}>
            {/* Outline highlight before break */}
            {phase === "freeze" && (
              <div className="absolute -inset-1 rounded-xl border-2 border-[#ffc75a] shadow-[0_0_30px_rgba(255,199,90,0.8)] animate-pulse pointer-events-none z-20" />
            )}

            {tiles.map((tile) => {
              const bgX = (tile.col / (cols - 1)) * 100;
              const bgY = (tile.row / (rows - 1)) * 100;
              const isShattering = phase === "shattering";

              return (
                <div
                  key={tile.id}
                  className="absolute border border-black/30"
                  style={{
                    width: `${100 / cols}%`,
                    height: `${100 / rows}%`,
                    left: `${(tile.col / cols) * 100}%`,
                    top: `${(tile.row / rows) * 100}%`,
                    backgroundImage: `url("${sourceImageUrl}")`,
                    backgroundSize: `${cols * 100}% ${rows * 100}%`,
                    backgroundPosition: `${bgX}% ${bgY}%`,
                    transform: isShattering
                      ? `translate3d(${tile.xOffset}px, ${tile.yOffset}px, ${tile.zOffset}px) rotateX(${tile.rotX}deg) rotateY(${tile.rotY}deg) rotateZ(${tile.rotZ}deg) scale(${tile.scale})`
                      : "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)",
                    opacity: isShattering ? 0 : 1,
                    transition: isShattering
                      ? `transform 1100ms cubic-bezier(0.12, 0.9, 0.25, 1) ${tile.delay}ms, opacity 950ms ease-out ${tile.delay + 60}ms`
                      : "none",
                    boxShadow: isShattering
                      ? "0 0 20px rgba(255,199,90,0.85), 0 0 40px rgba(229,169,85,0.4)"
                      : "0 0 2px rgba(0,0,0,0.5)",
                    zIndex: Math.floor(tile.zOffset),
                  }}
                />
              );
            })}
          </div>
        )}

        {/* ── 2. Reconstructed High-Quality Standalone Visual ── */}
        {(phase === "reconstructing" || phase === "unlocked") && (
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,199,90,0.35)] border border-[#ffc75a]/50 animate-fade-in z-30"
            style={{
              animation: "scaleIn 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <Image
              src={revealedImageUrl}
              alt={instrumentName}
              fill
              priority
              className="object-cover object-center scale-105 filter brightness-105"
            />
            {/* Golden radial shimmer veil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Radiant Corner Accents */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#ffc75a]" />
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#ffc75a]" />
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#ffc75a]" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#ffc75a]" />
          </div>
        )}
      </div>

      {/* ── 3. "DISCOVERY UNLOCKED" Announcement Banner ── */}
      {phase === "unlocked" && (
        <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 flex flex-col items-center text-center px-4 z-40 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#ffc75a]/40 bg-[#16181e]/90 backdrop-blur-xl mb-2.5 shadow-[0_0_20px_rgba(255,199,90,0.3)]">
            <span className="w-2 h-2 rounded-full bg-[#ffc75a] animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ffc75a] font-bold">
              PHYSICAL ARTEFACT EXTRACTED
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-grotesque text-white tracking-tight uppercase m-0 leading-tight">
            DISCOVERY UNLOCKED
          </h2>

          <p className="text-white/60 font-grotesque text-xs sm:text-sm tracking-widest uppercase mt-1">
            {instrumentName} · Entering Living Archive...
          </p>
        </div>
      )}
    </div>
  );
}
