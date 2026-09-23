"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getMuseumById } from "@/lib/supabase/museums";
import { getMuseumCollectionStatus } from "@/lib/supabase/discoveries";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { getSampleImagePath } from "@/lib/sampleImages";
import { Museum } from "@/types/museum";
import {
  MuseumCollectionStatus,
  InstrumentWithDiscoveryStatus,
} from "@/types/discovery";
import { Profile } from "@/types/profile";

export default function MuseumCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const museumId = (params?.museumId as string) || "kelkar-museum";

  const supabase = useMemo(() => createClient(), []);

  const [museum, setMuseum] = useState<Museum | null>(null);
  const [collection, setCollection] = useState<MuseumCollectionStatus | null>(
    null
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "discovered" | "hidden">(
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [museumData, collectionData, { profile: userProfile }] =
        await Promise.all([
          getMuseumById(supabase, museumId),
          getMuseumCollectionStatus(supabase, museumId),
          getCurrentProfile(supabase),
        ]);

      setMuseum(museumData);
      setCollection(collectionData);
      setProfile(userProfile);
      setLoading(false);
    }

    if (museumId) {
      loadData();
    }

    // Refresh collection when user returns to this tab or when discoveries are updated
    const handleRefresh = () => {
      getMuseumCollectionStatus(supabase, museumId).then((data) => {
        setCollection(data);
      });
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("mm_discovery_updated", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("mm_discovery_updated", handleRefresh);
    };
  }, [museumId, supabase]);

  // Derive unique categories present in this collection
  const categories = useMemo(() => {
    if (!collection) return [];
    const set = new Set(collection.instruments.map((i) => i.category));
    return Array.from(set);
  }, [collection]);

  // Filter instruments based on user selection
  const filteredInstruments = useMemo(() => {
    if (!collection) return [];
    return collection.instruments.filter((inst) => {
      // Filter by discovery state
      if (filterMode === "discovered" && !inst.is_discovered) return false;
      if (filterMode === "hidden" && inst.is_discovered) return false;

      // Filter by category
      if (selectedCategory !== "all" && inst.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [collection, filterMode, selectedCategory]);

  if (loading) {
    return (
      <div className="noise-bg min-h-screen bg-[#0d0f12] flex flex-col items-center justify-center text-white px-4 select-none">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#ffc75a] rounded-full animate-spin mb-4" />
        <div className="text-xs uppercase tracking-[0.2em] font-grotesque text-white/50">
          Unveiling Museum Archives...
        </div>
      </div>
    );
  }

  if (!museum) {
    return (
      <div className="noise-bg min-h-screen bg-[#0d0f12] flex flex-col items-center justify-center text-white px-4">
        <h2 className="text-xl font-bold font-grotesque mb-2">
          Museum Not Found
        </h2>
        <p className="text-white/50 text-sm mb-4">
          The requested museum exhibition does not exist.
        </p>
        <Link
          href="/museums"
          className="btn-hero-fill py-3 px-6 rounded-xl border border-white text-white font-grotesque text-xs font-bold uppercase tracking-wider no-underline"
        >
          ← Return to Museum Selection
        </Link>
      </div>
    );
  }

  const discoveredCount = collection?.discovered_count || 0;
  const totalCount = collection?.total || 0;
  const progressPercent = collection?.progress_percentage || 0;

  return (
    <div className="noise-bg min-h-screen bg-[#0d0f12] text-white select-none relative overflow-x-hidden pb-32">
      {/* Ambient background glows */}
      <div className="z-0 absolute top-[-200px] right-[-200px] w-[650px] h-[650px] rounded-full bg-[#c11822]/15 blur-[160px] pointer-events-none" />
      <div className="z-0 absolute top-[400px] left-[-220px] w-[600px] h-[600px] rounded-full bg-[#ffc75a]/10 blur-[160px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="z-20 w-full max-w-[1280px] mx-auto px-4 sm:px-8 py-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/museums"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-grotesque tracking-wider uppercase no-underline"
          >
            <span className="text-base leading-none">←</span> All Museums
          </Link>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-white/80 text-xs font-grotesque tracking-wider uppercase truncate max-w-[180px] sm:max-w-none">
            {museum.name}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-xs font-grotesque uppercase no-underline text-white"
          >
            <span className="w-2 h-2 rounded-full bg-[#ffc75a]" />
            <span className="hidden sm:inline text-white/60">Pass:</span>
            <span className="font-bold text-[#ffc75a]">
              {profile?.full_name?.split(" ")[0] || "Active"}
            </span>
          </Link>

          <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">
            <Image
              src="/Assets/6aa66eef7361b4711b30b84f_logo.svg"
              alt="Museum Melody Logo"
              width={30}
              height={30}
              className="w-7 h-7"
            />
          </Link>
        </div>
      </header>

      {/* Hero Exhibition Header */}
      <section className="z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 pb-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 pb-8 border-b border-white/10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider bg-[#ffc75a]/15 text-[#ffc75a] border border-[#ffc75a]/30">
                {museum.city}, Maharashtra
              </span>
              <span className="text-white/40 text-xs font-mono">•</span>
              <span className="text-white/50 text-xs font-mono">
                {museum.category}
              </span>
            </div>

            <h1 className="font-grotesque font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight m-0">
              {museum.name}
            </h1>

            <p className="text-white/60 font-grotesque text-sm sm:text-base leading-relaxed mt-3 mb-0">
              {museum.description}
            </p>
          </div>

          {/* Progress Card */}
          <div className="w-full lg:w-auto min-w-[300px] p-5 rounded-2xl border border-white/15 bg-[#15181e]/85 backdrop-blur-xl shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-mono uppercase text-white/50 tracking-wider">
                Discovery Progress
              </span>
              <span className="text-xs font-mono font-bold text-[#ffc75a]">
                {progressPercent}% Unlocked
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#c11822] via-[#ffc75a] to-[#ffc75a] transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-grotesque">
              <span className="text-white font-bold text-base">
                {discoveredCount}{" "}
                <span className="text-white/40 text-xs font-normal">
                  / {totalCount} Found
                </span>
              </span>

              <span className="text-white/40 text-[11px] font-mono">
                {totalCount - discoveredCount} Remaining
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls & View Modes */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
          {/* Status Tabs: All / Discovered / Hidden */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-grotesque uppercase tracking-wider font-bold transition-all cursor-pointer border-0 ${
                filterMode === "all"
                  ? "bg-white text-black shadow-md"
                  : "bg-transparent text-white/50 hover:text-white"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("discovered")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-grotesque uppercase tracking-wider font-bold transition-all cursor-pointer border-0 ${
                filterMode === "discovered"
                  ? "bg-[#ffc75a] text-black shadow-md"
                  : "bg-transparent text-white/50 hover:text-white"
              }`}
            >
              Discovered ({discoveredCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("hidden")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-grotesque uppercase tracking-wider font-bold transition-all cursor-pointer border-0 ${
                filterMode === "hidden"
                  ? "bg-[#c11822] text-white shadow-md"
                  : "bg-transparent text-white/50 hover:text-white"
              }`}
            >
              Hidden ({totalCount - discoveredCount})
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-full text-[11px] font-grotesque uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === "all"
                  ? "border-[#ffc75a] bg-[#ffc75a]/15 text-[#ffc75a]"
                  : "border-white/10 bg-transparent text-white/40 hover:text-white/80"
              }`}
            >
              All Families
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-grotesque uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedCategory === cat
                    ? "border-[#ffc75a] bg-[#ffc75a]/15 text-[#ffc75a]"
                    : "border-white/10 bg-transparent text-white/40 hover:text-white/80"
                }`}
              >
                {cat.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Instruments Grid */}
      <section className="z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-8">
        {filteredInstruments.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-white/10 bg-white/[0.02]">
            <p className="text-white/50 font-grotesque text-sm mb-4">
              No instruments match the current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterMode("all");
                setSelectedCategory("all");
              }}
              className="text-xs font-grotesque uppercase tracking-wider text-[#ffc75a] underline bg-transparent border-0 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredInstruments.map((instrument, idx) => {
              if (instrument.is_discovered) {
                return (
                  <DiscoveredInstrumentCard
                    key={instrument.id}
                    instrument={instrument}
                  />
                );
              } else {
                return (
                  <HiddenMysteryCard
                    key={instrument.id}
                    instrument={instrument}
                    index={idx + 1}
                    museumId={museum.id}
                  />
                );
              }
            })}
          </div>
        )}
      </section>

      {/* Floating Bottom Action Bar to Open Scanner */}
      <div className="fixed bottom-6 sm:bottom-8 left-0 right-0 z-40 px-3 sm:px-4 flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
        <div className="pointer-events-auto flex items-center justify-between gap-2.5 sm:gap-6 px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-full border border-white/20 bg-[#15181e]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,199,90,0.2)] max-w-lg w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffc75a] shrink-0 animate-pulse" />
            <div className="text-left min-w-0 flex-1">
              <span className="block text-[11px] sm:text-xs font-bold font-grotesque text-white leading-tight truncate">
                Physical Artefact Scanner
              </span>
              <span className="block text-[9px] sm:text-[10px] font-mono text-white/50 uppercase tracking-wide truncate">
                Find hidden instruments
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/scanner?museum=${museum.id}`)}
            className="btn-hero-fill flex items-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-5 rounded-full border border-white text-white font-grotesque text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer hover:border-[#ffc75a] hover:text-[#ffc75a] shrink-0 whitespace-nowrap min-h-[40px] sm:min-h-[44px] active:scale-95"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="inline">Scan Museum</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Card component for Discovered / Unlocked Instruments
 */
function DiscoveredInstrumentCard({
  instrument,
}: {
  instrument: InstrumentWithDiscoveryStatus;
}) {
  const cardImg =
    getSampleImagePath(instrument.model_class || instrument.id) ||
    instrument.image_url;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-white/20 bg-[#15181e]/85 backdrop-blur-md overflow-hidden hover:border-[#ffc75a]/70 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,199,90,0.2)]">
      {/* Instrument Image */}
      <div className="relative w-full h-56 bg-black/40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardImg}
          alt={instrument.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15181e] via-transparent to-black/30 pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono uppercase font-bold tracking-wider backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Discovered</span>
        </div>

        {/* Source badge if available */}
        {instrument.discovery_source && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 border border-white/20 text-white/70 text-[9px] font-mono uppercase tracking-wider backdrop-blur-md">
            {instrument.discovery_source}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-mono text-[#ffc75a] uppercase tracking-widest mb-1">
            {instrument.category}
          </div>
          <h3 className="font-grotesque font-bold text-lg text-white m-0 leading-snug group-hover:text-[#ffc75a] transition-colors">
            {instrument.name}
          </h3>
          <p className="text-white/60 font-grotesque text-xs leading-relaxed mt-2 line-clamp-2">
            {instrument.description}
          </p>
        </div>

        {/* Action Link */}
        <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
          <Link
            href={`/instrument/${instrument.id}`}
            className="text-xs font-grotesque uppercase tracking-wider font-bold text-white hover:text-[#ffc75a] transition-colors no-underline flex items-center gap-1.5"
          >
            <span>Explore Story & Play</span>
            <span>→</span>
          </Link>

          <Link
            href={`/play/${instrument.id}`}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[#ffc75a] transition-colors"
            title="Play Instrument"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Card component for Hidden / Locked Mystery Instruments
 */
function HiddenMysteryCard({
  instrument,
  index,
  museumId,
}: {
  instrument: InstrumentWithDiscoveryStatus;
  index: number;
  museumId: string;
}) {
  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121419]/90 backdrop-blur-md overflow-hidden p-5 transition-all duration-300 hover:border-white/25 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
      {/* Top Mystery Header */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
            Artefact #{index.toString().padStart(2, "0")}
          </span>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-white/50 text-[10px] font-mono uppercase tracking-wider">
            <svg
              className="w-3 h-3 text-[#c11822]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Locked</span>
          </div>
        </div>

        {/* Silhouette Center Graphic */}
        <div className="relative w-full h-36 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center overflow-hidden mb-4 group">
          {/* Subtle blurred silhouette */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 filter blur-sm">
            <Image
              src={instrument.image_url}
              alt="Mystery Artefact Silhouette"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-[#ffc75a] shadow-inner mb-2">
            <svg
              className="w-6 h-6 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
            Hidden Instrument
          </span>
        </div>

        {/* Mystery Clue */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-[#ffc75a]/70 uppercase tracking-widest">
            Family: {instrument.category}
          </div>
          <h4 className="font-grotesque font-bold text-base text-white/90 m-0">
            Mystery Sound Artefact
          </h4>
          <p className="text-white/40 font-grotesque text-xs leading-relaxed line-clamp-3 italic">
            &ldquo;{instrument.historical_context.split(".")[0]}.&rdquo;
          </p>
        </div>
      </div>

      {/* Scan CTA */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <Link
          href={`/scanner?museum=${museumId}&target=${instrument.id}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#ffc75a]/50 text-white/80 hover:text-white font-grotesque text-xs font-bold uppercase tracking-wider transition-colors no-underline"
        >
          <svg
            className="w-3.5 h-3.5 text-[#ffc75a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
          </svg>
          <span>Find in Museum</span>
        </Link>
      </div>
    </div>
  );
}
