"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const paramError = searchParams.get("error");
  const displayError =
    errorMsg || (paramError ? decodeURIComponent(paramError) : null);

  // Check if keys are still placeholder
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);

    if (!isSupabaseConfigured) {
      setErrorMsg(
        "Supabase credentials are not configured yet. Please add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
      );
      setGoogleLoading(false);
      return;
    }

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setGoogleLoading(false);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to sign in with Google"
      );
      setGoogleLoading(false);
    }
  };

  // Email & Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setErrorMsg(
        "Supabase credentials are not configured yet. Please add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
      );
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        const nextDest = searchParams.get("next") || "/museums";
        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          setSuccessMsg("Account created! Redirecting...");
          setTimeout(() => router.push(nextDest), 1200);
        } else {
          setSuccessMsg(
            "Account created! Please check your email inbox to confirm your account."
          );
        }
      } else {
        // Sign In
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          const nextDest = searchParams.get("next") || "/museums";
          setSuccessMsg("Signed in successfully! Redirecting...");
          setTimeout(() => router.push(nextDest), 1000);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="noise-bg min-h-screen relative flex flex-col justify-center items-center px-4 sm:px-6 py-12 select-none overflow-hidden">
      {/* Ambient background glows */}
      <div className="z-0 absolute top-[-250px] right-[-250px] w-[650px] h-[650px] rounded-full bg-[#c11822]/15 blur-[120px] pointer-events-none" />
      <div className="z-0 absolute bottom-[-200px] left-[-200px] w-[550px] h-[550px] rounded-full bg-[#ffc75a]/10 blur-[130px] pointer-events-none" />

      {/* Top Header / Back Link */}
      <div className="w-full max-w-[460px] flex justify-between items-center mb-8 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 text-xs sm:text-sm font-grotesque tracking-wider uppercase"
        >
          <span className="text-lg leading-none">←</span> Back to Museum
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

      {/* Main Glassmorphic Card */}
      <div className="z-10 w-full max-w-[460px] rounded-[28px] border border-white/15 bg-[#15181e]/85 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(193,24,34,0.2)] relative">
        {/* Setup notice if credentials not set yet */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200/90 text-xs leading-relaxed font-grotesque">
            <span className="font-bold block text-amber-400 mb-1">
              ⚡ Supabase Setup Required
            </span>
            Add your Supabase project credentials in <code className="bg-black/30 px-1 py-0.5 rounded">.env.local</code> to connect your live database and Google login.
          </div>
        )}

        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="text-[#d8786f] tracking-[3px] uppercase text-[11px] font-bold mb-2">
            Virtual Museum Pass
          </div>
          <h1 className="font-grotesque font-extrabold text-3xl sm:text-4xl text-white tracking-tight m-0">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-white/50 font-grotesque text-sm mt-2 mb-0">
            {isSignUp
              ? "Join the virtual museum to save favourites and earn badges"
              : "Access your virtual audio guides, saved collections, and badge pass"}
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white font-grotesque text-sm font-medium tracking-wide transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink mx-4 text-white/30 text-xs uppercase tracking-widest font-grotesque">
            or with email
          </span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        {/* Error / Success Notifications */}
        {displayError && (
          <div className="mb-5 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-grotesque leading-relaxed flex items-start gap-2">
            <span className="text-rose-400 font-bold">✕</span>
            <span>{displayError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-grotesque leading-relaxed flex items-start gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-grotesque text-white/70 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arya Sharma"
                required={isSignUp}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 text-sm font-grotesque focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-grotesque text-white/70 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="explorer@museum.org"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 text-sm font-grotesque focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-grotesque text-white/70 uppercase tracking-wider">
                Password
              </label>
              {!isSignUp && (
                <span className="text-[11px] text-white/40 hover:text-white/70 cursor-pointer transition-colors">
                  Forgot password?
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 text-sm font-grotesque focus:outline-none focus:border-white/50 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors bg-transparent border-0 cursor-pointer p-0 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit Button with Hover Fill Effect */}
          <button
            type="submit"
            disabled={loading}
            className="btn-hero-fill w-full py-3.5 px-6 rounded-xl border border-white text-white font-grotesque text-sm font-bold tracking-[0.14em] uppercase cursor-pointer transition-all duration-300 relative overflow-hidden mt-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{isSignUp ? "Create Account" : "Sign In"}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-8 text-center text-xs font-grotesque text-white/50">
          {isSignUp ? "Already have a museum account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-white hover:text-[#d8786f] font-semibold underline bg-transparent border-0 cursor-pointer p-0 ml-1 transition-colors"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark flex items-center justify-center text-white/50 font-grotesque text-sm">
          Loading museum authentication...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

