"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile, updateCurrentProfile } from "@/lib/supabase/profile";
import { Profile } from "@/types/profile";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?next=/profile");
        return;
      }

      const [{ profile: userProfile, error }, count] = await Promise.all([
        getCurrentProfile(supabase),
        import("@/lib/supabase/discoveries").then((m) =>
          m.getUserTotalDiscoveriesCount(supabase)
        ),
      ]);

      if (error) {
        console.error("Profile load error:", error);
      }

      if (userProfile) {
        setProfile(userProfile);
        setFullName(userProfile.full_name || "");
      }
      setDiscoveredCount(count);
      setLoading(false);
    }

    loadUserData();
  }, [router, supabase]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSavingName(true);
    setStatusMessage(null);

    const { profile: updated, error } = await updateCurrentProfile(supabase, {
      full_name: fullName.trim(),
    });

    if (error) {
      setStatusMessage({
        type: "error",
        text: "Could not update name. Please try again.",
      });
    } else if (updated) {
      setProfile(updated);
      setEditingName(false);
      setStatusMessage({
        type: "success",
        text: "Pass credential updated successfully.",
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
    setSavingName(false);
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="noise-bg min-h-screen bg-[#0d0f12] flex flex-col items-center justify-center text-white px-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#ffc75a] rounded-full animate-spin mb-4" />
        <div className="text-xs uppercase tracking-[0.2em] font-grotesque text-white/50">
          Retrieving Museum Pass...
        </div>
      </div>
    );
  }

  const initials = (profile?.full_name || "Visitor")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Active Member";

  const passId = profile?.id
    ? `MM-${profile.id.substring(0, 8).toUpperCase()}`
    : "MM-PILOT-01";

  return (
    <div className="noise-bg min-h-screen relative flex flex-col justify-center items-center px-4 sm:px-6 py-12 select-none overflow-hidden bg-[#0d0f12]">
      {/* Ambient museum lighting glows */}
      <div className="z-0 absolute top-[-200px] right-[-180px] w-[600px] h-[600px] rounded-full bg-[#c11822]/15 blur-[140px] pointer-events-none" />
      <div className="z-0 absolute bottom-[-220px] left-[-180px] w-[600px] h-[600px] rounded-full bg-[#ffc75a]/12 blur-[140px] pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="w-full max-w-[540px] flex justify-between items-center mb-8 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 text-xs sm:text-sm font-grotesque tracking-wider uppercase"
        >
          <span className="text-lg leading-none">←</span> Return to Museum
        </Link>
        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">
          <Image
            src="/Assets/6aa66eef7361b4711b30b84f_logo.svg"
            alt="Museum Logo"
            width={32}
            height={32}
            className="w-7 h-7"
          />
        </Link>
      </div>

      {/* Main Virtual Pass Card */}
      <div className="z-10 w-full max-w-[540px] rounded-[28px] border border-white/20 bg-[#15181e]/90 backdrop-blur-2xl p-6 sm:p-9 shadow-[0_30px_80px_rgba(0,0,0,0.85),0_0_45px_rgba(255,199,90,0.15)] relative overflow-hidden">
        {/* Pass Top Metallic Gold Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#c11822] via-[#ffc75a] to-[#c11822]" />

        {/* Card Header Stamp */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div>
            <div className="text-[#ffc75a] tracking-[0.25em] uppercase text-[10px] font-mono font-bold mb-1">
              Official Visitor Credential
            </div>
            <h1 className="font-grotesque font-black text-2xl sm:text-3xl text-white tracking-tight m-0">
              Virtual Museum Pass
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider bg-[#ffc75a]/15 text-[#ffc75a] border border-[#ffc75a]/30">
              {profile?.role || "Visitor"}
            </span>
            <span className="text-[10px] text-white/40 font-mono mt-1">
              {passId}
            </span>
          </div>
        </div>

        {/* Feedback Messages */}
        {statusMessage && (
          <div
            className={`mb-6 p-3 rounded-xl border text-xs font-grotesque leading-relaxed flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            }`}
          >
            <span>{statusMessage.type === "success" ? "✓" : "✕"}</span>
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Visitor Identity Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
          {/* Avatar / Monogram */}
          <div className="relative">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || "Visitor"}
                width={80}
                height={80}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center text-[#ffc75a] font-grotesque font-bold text-2xl tracking-wider shadow-inner">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#15181e]" title="Active Explorer" />
          </div>

          {/* Visitor Details */}
          <div className="flex-1 text-center sm:text-left">
            {editingName ? (
              <form onSubmit={handleUpdateName} className="flex flex-col gap-2">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-white/10 border border-white/30 text-white text-sm font-grotesque focus:outline-none focus:border-[#ffc75a]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingName}
                    className="px-3 py-1 bg-[#ffc75a] text-black font-bold text-xs rounded-md uppercase tracking-wider hover:bg-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {savingName ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(false);
                      setFullName(profile?.full_name || "");
                    }}
                    className="px-3 py-1 bg-white/10 text-white text-xs rounded-md hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-white font-grotesque m-0">
                  {profile?.full_name || "Museum Explorer"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="text-white/40 hover:text-white transition-colors text-xs font-grotesque uppercase tracking-wider underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Edit
                </button>
              </div>
            )}
            <p className="text-white/50 text-xs font-mono mt-1 mb-2">
              {profile?.email || "Authenticated Visitor"}
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-white/60">
              <span>Member Since:</span>
              <span className="text-white/90">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Discovery Progress Statistics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-center">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              Museums
            </span>
            <span className="text-xl font-black font-grotesque text-[#ffc75a]">
              0 / 3
            </span>
            <span className="block text-[9px] text-white/30 uppercase mt-0.5">
              Pilot Sites
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-center">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              Found
            </span>
            <span className="text-xl font-black font-grotesque text-white">
              {discoveredCount}
            </span>
            <span className="block text-[9px] text-white/30 uppercase mt-0.5">
              Instruments
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-center">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              Badges
            </span>
            <span className="text-xl font-black font-grotesque text-[#c11822]">
              0
            </span>
            <span className="block text-[9px] text-white/30 uppercase mt-0.5">
              Earned
            </span>
          </div>
        </div>

        {/* Pass Actions */}
        <div className="space-y-3">
          <Link
            href="/museums"
            className="btn-hero-fill w-full py-3.5 px-6 rounded-xl border border-white text-white font-grotesque text-sm font-bold tracking-[0.14em] uppercase cursor-pointer transition-all duration-300 relative overflow-hidden flex items-center justify-center text-center no-underline hover:border-[#ffc75a] hover:text-[#ffc75a]"
          >
            <span>Enter Museum Experience →</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="w-full py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/40 text-white/70 hover:text-rose-300 font-grotesque text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? "Signing Out..." : "Sign Out of Pass"}
          </button>
        </div>
      </div>
    </div>
  );
}
