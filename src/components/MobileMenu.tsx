"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Profile } from "@/types/profile";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal?: () => void;
  profile?: Profile | null;
}

export default function MobileMenu({
  isOpen,
  onClose,
  profile,
}: MobileMenuProps) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavClick = () => {
    onClose();
  };

  const handleSignOut = async () => {
    onClose();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div
      className={`hidden max-lg:block fixed inset-0 z-[89] transition-all duration-500 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      style={{ height: "100vh" }}
    >
      <div
        className="z-[1] bg-dark relative flex flex-col justify-between w-full h-full px-8 pt-[125px] pb-20 max-md:pt-[105px]"
        style={{
          backgroundImage: `radial-gradient(circle farthest-side at -30% 140%, rgba(193,24,34,0.5), transparent 64%),
            radial-gradient(circle farthest-side at 130% -40%, rgba(193,24,34,0.5), transparent 64%),
            url(/Assets/Noise.png)`,
        }}
      >
        <nav
          className={`flex flex-col w-full overflow-hidden transition-all duration-500 ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[50px]"
          }`}
          style={{ transitionDelay: isOpen ? "200ms" : "0ms" }}
        >
          <Link
            href="/museums"
            onClick={handleNavClick}
            className="text-white uppercase pt-[25px] pb-[25px] no-underline dash-border-bottom"
          >
            Select Museum
          </Link>
          <Link
            href="#exposition"
            onClick={handleNavClick}
            className="text-white uppercase pt-[25px] pb-[25px] no-underline dash-border-bottom"
          >
            Collection
          </Link>
          <Link
            href="#about"
            onClick={handleNavClick}
            className="text-white uppercase pt-[25px] pb-[25px] no-underline dash-border-bottom"
          >
            Badges
          </Link>
          <Link
            href="#about"
            onClick={handleNavClick}
            className="text-white uppercase pt-[25px] pb-[25px] no-underline -mb-px"
          >
            About
          </Link>
        </nav>

        <div
          className={`flex flex-col gap-3 items-center transition-all duration-500 ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[50px]"
          }`}
          style={{ transitionDelay: isOpen ? "400ms" : "0ms" }}
        >
          {profile ? (
            <>
              <Link
                href="/profile"
                onClick={handleNavClick}
                className="w-full max-w-[280px] flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/30 bg-white/5 hover:bg-white/10 transition-colors text-white font-grotesque text-sm font-bold tracking-wider uppercase no-underline text-center"
              >
                <span>Virtual Pass ({profile.full_name?.split(" ")[0] || "Visitor"})</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-white/50 hover:text-rose-400 text-xs font-grotesque uppercase tracking-widest bg-transparent border-0 cursor-pointer pt-1 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={handleNavClick}
              className="btn-hero-fill inline-block text-center tracking-[0.1em] uppercase bg-transparent border border-white-50 rounded-lg min-w-[190px] px-[30px] pt-[17px] pb-[14px] font-bold text-white no-underline cursor-pointer relative overflow-hidden transition-all duration-200 hover:border-white hover:text-black max-xs:min-w-[160px] max-xs:pt-[14px] max-xs:pb-[12px]"
            >
              <span>Login / Sign Up</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
