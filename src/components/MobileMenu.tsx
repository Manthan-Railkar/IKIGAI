"use client";

import { useEffect } from "react";
import Link from "next/link";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  onOpenModal,
}: MobileMenuProps) {
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

  const handleLogin = () => {
    onClose();
    onOpenModal();
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
            href="#virtual-museum"
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
          className={`flex justify-center items-center transition-all duration-500 ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[50px]"
          }`}
          style={{ transitionDelay: isOpen ? "400ms" : "0ms" }}
        >
          <Link
            href="/login"
            onClick={handleNavClick}
            className="btn-hero-fill inline-block text-center tracking-[0.1em] uppercase bg-transparent border border-white-50 rounded-lg min-w-[190px] px-[30px] pt-[17px] pb-[14px] font-bold text-white no-underline cursor-pointer relative overflow-hidden transition-all duration-200 hover:border-white hover:text-black max-xs:min-w-[160px] max-xs:pt-[14px] max-xs:pb-[12px]"
          >
            <span>Login / Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
