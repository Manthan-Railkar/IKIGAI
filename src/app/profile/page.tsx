"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile, updateCurrentProfile } from "@/lib/supabase/profile";
import { getUserRecordings, deleteUserRecording } from "@/lib/supabase/recordings";
import { Profile } from "@/types/profile";
import { UserRecording } from "@/types/recording";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [recordings, setRecordings] = useState<UserRecording[]>([]);
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

      const [{ profile: userProfile, error }, count, { recordings: userRecordings }] =
        await Promise.all([
          getCurrentProfile(supabase),
          import("@/lib/supabase/discoveries").then((m) =>
            m.getUserTotalDiscoveriesCount(supabase)
          ),
          getUserRecordings(supabase),
        ]);

      if (error) {
        console.error("Profile load error:", error);
      }

      if (userProfile) {
        setProfile(userProfile);
        setFullName(userProfile.full_name || "");
      }
      setDiscoveredCount(count);
      setRecordings(userRecordings);
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

  const handleDeleteRecording = async (rec: UserRecording) => {
    if (!confirm(`Delete recording "${rec.title}"?`)) return;
    setDeletingId(rec.id);
    const { success } = await deleteUserRecording(supabase, rec.id, rec.audio_url);
    setDeletingId(null);
    if (success) {
      setRecordings((prev) => prev.filter((r) => r.id !== rec.id));
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="noise-bg min-h-screen bg-[#0d0f12] flex flex-col items-center justify-center text-white px-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#ffc75a] rounded-full animate-spin mb-4" />
        <div className="text-xs uppercase tracking-[0.2em] font-grotesque text-white/50">
          Accessing Museum Archive...
        </div>
      </div>
    );
  }

  const initials = (profile?.full_name || profile?.email || "ME")
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Active Season";

  return (
    <div className="noise-bg min-h-screen bg-[#0d0f12] text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background Decor Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[#ffc75a]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Card: Museum Access Pass */}
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-gradient-to-b from-[#181b22] to-[#101216] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Pass Top Badge / Barcode Decor */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffc75a] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-[#ffc75a] uppercase font-semibold">
              Official Heritage Pass
            </span>
          </div>
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest hidden sm:block">
            NO. {profile?.id?.slice(0, 8) || "8841-IKIGAI"}
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl mb-6 text-xs font-grotesque flex items-center gap-2 border ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/40 border-rose-500/40 text-rose-300"
            }`}
          >
            <span>{statusMessage.type === "success" ? "✓" : "!"}</span>
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Profile Card Identity Area */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 mb-8">
          <div className="relative shrink-0">
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
            <div
              className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#15181e]"
              title="Active Explorer"
            />
          </div>

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
        <div className="grid grid-cols-3 gap-3 mb-6">
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
              Recordings
            </span>
            <span className="text-xl font-black font-grotesque text-[#00e5ff]">
              {recordings.length}
            </span>
            <span className="block text-[9px] text-white/30 uppercase mt-0.5">
              Saved Jams
            </span>
          </div>
        </div>

        {/* ── My Cloud Jam Sessions ─────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff]" />
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#00e5ff] font-bold m-0">
                My Recorded Jams
              </h3>
            </div>
            <Link
              href="/scanner"
              className="text-[10px] font-mono text-[#ffc75a] hover:underline uppercase tracking-wider"
            >
              + Jam in Scanner
            </Link>
          </div>

          {recordings.length === 0 ? (
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
              <p className="text-xs text-white/50 font-grotesque mb-2">
                No cloud recordings yet.
              </p>
              <p className="text-[11px] text-white/40 font-mono mb-3">
                Scan museum instruments and tap &ldquo;Record Jam&rdquo; to capture live performances into your pass!
              </p>
              <Link
                href="/scanner"
                className="inline-block px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-[11px] font-grotesque text-white hover:bg-white/10 transition-colors uppercase tracking-wider"
              >
                Go to Scanner →
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold font-grotesque text-white m-0 leading-tight">
                        {rec.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-white/50">
                        <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{formatDuration(rec.duration_ms)}</span>
                        <span>·</span>
                        <span className="text-[#ffc75a]">{rec.notes_count} notes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={rec.audio_url}
                        download={`jam-${rec.id.slice(0, 6)}.mp3`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] uppercase transition-colors"
                        title="Download MP3"
                      >
                        ↓
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecording(rec)}
                        disabled={deletingId === rec.id}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 font-mono text-[10px] uppercase transition-colors cursor-pointer"
                        title="Delete recording"
                      >
                        {deletingId === rec.id ? "…" : "✕"}
                      </button>
                    </div>
                  </div>

                  {rec.instruments && rec.instruments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {rec.instruments.map((inst, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-white/70 uppercase"
                        >
                          {inst}
                        </span>
                      ))}
                    </div>
                  )}

                  <audio
                    controls
                    src={rec.audio_url}
                    className="w-full h-8 rounded filter invert hue-rotate-180"
                  />
                </div>
              ))}
            </div>
          )}
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
