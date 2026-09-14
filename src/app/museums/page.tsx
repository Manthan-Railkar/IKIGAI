"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getMuseums } from "@/lib/supabase/museums";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { Museum } from "@/types/museum";
import { Profile } from "@/types/profile";

export default function MuseumsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [museums, setMuseums] = useState<Museum[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<number>(1); // Default to Raja Dinkar Kelkar Museum or center
  const [stageScale, setStageScale] = useState(1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [fetchedMuseums, { profile: userProfile }] = await Promise.all([
        getMuseums(supabase),
        getCurrentProfile(supabase),
      ]);

      setMuseums(fetchedMuseums);
      setProfile(userProfile);
      setLoading(false);
    }

    loadData();
  }, [supabase]);

  // Responsive stage scaling matching the landing page 3D coverflow
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        const containerWidth = wrapperRef.current.clientWidth;
        if (containerWidth < 1250) {
          const scale = Math.min(1, Math.max(0.35, (containerWidth - 20) / 1200));
          setStageScale(scale);
        } else {
          setStageScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectMuseum = (index: number) => {
    if (active === index) {
      const selectedMuseum = museums[index];
      if (selectedMuseum) {
        router.push(`/museum/${selectedMuseum.id}`);
      }
    } else {
      setActive(index);
    }
  };

  const handleEnterMuseum = (museumId: string) => {
    router.push(`/museum/${museumId}`);
  };

  if (loading) {
    return (
      <div className="noise-bg min-h-screen bg-[#0d0f12] flex flex-col items-center justify-center text-white px-4 select-none">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#ffc75a] rounded-full animate-spin mb-4" />
        <div className="text-xs uppercase tracking-[0.2em] font-grotesque text-white/50">
          Loading Museum Archives...
        </div>
      </div>
    );
  }

  const selectedMuseum = museums[active] || museums[0];

  return (
    <div className="noise-bg min-h-screen relative flex flex-col justify-between px-4 sm:px-8 py-8 select-none overflow-hidden bg-[#0d0f12]">
      {/* Ambient background glows */}
      <div className="z-0 absolute top-[-250px] right-[-200px] w-[650px] h-[650px] rounded-full bg-[#c11822]/15 blur-[150px] pointer-events-none" />
      <div className="z-0 absolute bottom-[-220px] left-[-200px] w-[650px] h-[650px] rounded-full bg-[#ffc75a]/12 blur-[150px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="z-20 w-full max-w-[1340px] mx-auto flex justify-between items-center pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-grotesque tracking-wider uppercase no-underline"
          >
            <span className="text-lg leading-none">←</span> Home
          </Link>
          <span className="text-white/20 text-xs">/</span>
          <Link
            href="/profile"
            className="text-[#ffc75a] hover:text-amber-300 transition-colors text-xs font-grotesque tracking-wider uppercase no-underline flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-[#ffc75a]" />
            <span>Pass: {profile?.full_name?.split(" ")[0] || "Active"}</span>
          </Link>
        </div>

        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">
          <Image
            src="/Assets/6aa66eef7361b4711b30b84f_logo.svg"
            alt="Museum Melody Logo"
            width={34}
            height={34}
            className="w-8 h-8"
          />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="z-10 w-full max-w-[1340px] mx-auto my-auto flex flex-col items-center">
        {/* Page Titles */}
        <div className="text-center max-w-2xl mx-auto mt-4 mb-6">
          <div className="text-[#d8786f] tracking-[0.25em] uppercase text-xs font-mono font-bold mb-2">
            SELECT EXPLORATION SITE
          </div>
          <h1 className="font-grotesque font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight m-0">
            Which museum will you explore?
          </h1>
          <p className="text-white/50 font-grotesque text-sm sm:text-base mt-2 mb-0">
            Step inside a museum to scan physical artefacts, unveil ancient instruments, and play their music.
          </p>
        </div>

        {/* 3D Coverflow Stage (Same 3D Card Design) */}
        <div
          ref={wrapperRef}
          className="w-full flex justify-center items-center overflow-visible my-2"
          style={{ height: `${Math.max(280, Math.round(570 * stageScale))}px` }}
        >
          <div
            className="relative will-change-transform"
            style={{
              width: "1200px",
              height: "570px",
              transform: `scale(${stageScale})`,
              transformOrigin: "center center",
              perspective: "1400px",
            }}
          >
            {museums.map((museum, i) => {
              // Exact 3D card layout math from landing page
              let x = (i - 2.5) * 165;
              let y = Math.abs(i - 2.5) * 13;
              let z = 0;
              let scale = 0.88;
              let rot = 0;
              let zIndex = 50 - Math.round(Math.abs(i - 2.5) * 4);
              const isActive = active === i;

              if (active >= 0) {
                if (i === active) {
                  x = 0;
                  y = -15;
                  z = 180;
                  scale = 1.12;
                  rot = 0;
                  zIndex = 100;
                } else {
                  x = (i - active) * 185;
                  y = Math.min(Math.abs(i - active) * 12, 35);
                  z = -Math.abs(i - active) * 35;
                  scale = 0.86;
                  rot = (i - active) * -1.5;
                  zIndex = 50 - Math.abs(i - active);
                }
              }

              return (
                <div
                  key={museum.id}
                  onClick={() => handleSelectMuseum(i)}
                  onMouseEnter={() => setActive(i)}
                  onTouchStart={() => setActive(i)}
                  className="absolute cursor-pointer will-change-transform"
                  style={{
                    top: "50%",
                    left: "50%",
                    width: "250px",
                    height: "480px",
                    borderRadius: "22px",
                    overflow: "hidden",
                    border: isActive
                      ? "1px solid rgba(255,255,255,0.75)"
                      : "1px solid rgba(255,255,255,0.25)",
                    transformStyle: "preserve-3d",
                    transform: `translate(-50%, -50%) translateX(${x}px) translateY(${y}px) translateZ(${z}px) rotateY(${rot}deg) scale(${scale})`,
                    zIndex: zIndex,
                    filter: isActive ? "brightness(1.1)" : "brightness(0.88)",
                    boxShadow: isActive
                      ? "0 35px 95px rgba(0,0,0,0.9), 0 0 45px rgba(193,24,34,0.45)"
                      : "0 18px 45px rgba(0,0,0,0.5)",
                    transition:
                      "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s, box-shadow 0.6s, border-color 0.6s",
                  }}
                >
                  {/* Museum Image */}
                  <Image
                    src={museum.image_url}
                    alt={museum.name}
                    fill
                    sizes="250px"
                    className="object-cover pointer-events-none select-none"
                    priority={i === 1}
                  />

                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 38%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.05) 100%)",
                    }}
                  />

                  {/* Top Badges (Pilot site indicator + Arrow button) */}
                  <div className="absolute top-[18px] left-[18px] right-[18px] z-10 flex justify-between items-center pointer-events-none">
                    {museum.is_pilot ? (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-[#ffc75a]/20 text-[#ffc75a] border border-[#ffc75a]/40 backdrop-blur-md">
                        Pilot Site
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-white/10 text-white/60 border border-white/20 backdrop-blur-md">
                        Archive
                      </span>
                    )}

                    <div
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center"
                      style={{
                        border: isActive
                          ? "1px solid rgba(255,199,90,0.6)"
                          : "1px solid rgba(255,255,255,0.4)",
                        background: isActive
                          ? "rgba(255,199,90,0.2)"
                          : "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Image
                        src="/Assets/ico_btn-arrow.svg"
                        alt=""
                        width={14}
                        height={14}
                        className="invert pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Content (City Location & Museum Name) */}
                  <div className="absolute left-[20px] right-[18px] bottom-[22px] z-10 pointer-events-none">
                    <div className="text-[11px] tracking-[2.5px] font-bold text-[#d5d5d5] uppercase mb-1.5 drop-shadow">
                      {museum.city}
                    </div>
                    <h3 className="font-grotesque font-extrabold text-[19px] sm:text-[21px] leading-[1.18] text-white uppercase drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] m-0">
                      {museum.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Museum Info & Action Bar */}
        {selectedMuseum && (
          <div className="w-full max-w-xl mx-auto text-center mt-2 z-20">
            {/* Museum description */}
            <p className="text-white/70 font-grotesque text-sm leading-relaxed mb-4 max-w-lg mx-auto">
              {selectedMuseum.description}
            </p>

            {/* Pagination / Selector dots */}
            <div className="flex justify-center items-center gap-2 mb-5">
              {museums.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-0 p-0 ${
                    active === idx
                      ? "w-8 bg-[#ffc75a]"
                      : "w-2 bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`Select ${m.name}`}
                />
              ))}
            </div>

            {/* CTA to Enter Selected Museum */}
            <button
              type="button"
              onClick={() => handleEnterMuseum(selectedMuseum.id)}
              className="btn-hero-fill inline-flex items-center justify-center gap-3 py-3.5 px-8 rounded-xl border border-white text-white font-grotesque text-sm font-bold tracking-[0.14em] uppercase cursor-pointer transition-all duration-300 relative overflow-hidden shadow-lg hover:border-[#ffc75a] hover:text-[#ffc75a]"
            >
              <span>Enter {selectedMuseum.name.split(" ")[0]} Collection →</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer info note */}
      <footer className="z-10 w-full max-w-[1340px] mx-auto text-center pt-6 border-t border-white/5 mt-4">
        <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
          Museum Melody • 3 Maharashtra Pilot Sites • Ready for 6
        </span>
      </footer>
    </div>
  );
}
