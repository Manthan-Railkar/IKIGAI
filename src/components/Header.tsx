"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

interface HeaderProps {
  onOpenModal: () => void;
  isLoaded?: boolean;
}

export default function Header({ onOpenModal, isLoaded = true }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setIsVisible(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="relative z-90">
        <div
          ref={headerRef}
          className={`absolute top-[50px] left-0 right-0 px-20 max-lg:px-8 max-lg:top-5 z-90 transition-all duration-700 ${isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-[30px]"
            }`}
        >
          <div className="w-full max-w-[1280px] mx-auto relative">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div>
                <Link href="#" className="inline-block">
                  <Image
                    src="/Assets/logo.svg"
                    alt="History Virtual Museum Logo"
                    width={72}
                    height={40}
                    className="max-md:max-w-[52px]"
                    priority
                  />
                </Link>
              </div>

              {/* Desktop Nav */}
              <div className="max-lg:hidden">
                <nav>
                  <Link
                    href="#virtual-museum"
                    data-anim="link"
                    className="text-grey tracking-[0.1em] uppercase mx-6 no-underline inline-block relative hover:text-white transition-colors duration-200"
                  >
                    Select Museum
                  </Link>
                  <Link
                    href="#exposition"
                    data-anim="link"
                    className="text-grey tracking-[0.1em] uppercase mx-6 no-underline inline-block relative hover:text-white transition-colors duration-200"
                  >
                    Collection
                  </Link>
                  <Link
                    href="#about"
                    data-anim="link"
                    className="text-grey tracking-[0.1em] uppercase mx-6 no-underline inline-block relative hover:text-white transition-colors duration-200"
                  >
                    Badges
                  </Link>
                  <Link
                    href="#about"
                    data-anim="link"
                    className="text-grey tracking-[0.1em] uppercase mx-6 no-underline inline-block relative hover:text-white transition-colors duration-200"
                  >
                    About
                  </Link>
                </nav>
              </div>

              {/* Desktop Login/Signup */}
              <div className="max-lg:hidden">
                <Link
                  href="/login"
                  className="btn-hero-fill inline-block text-center tracking-[0.1em] uppercase bg-transparent border border-white-50 rounded-lg min-w-[190px] px-[30px] pt-[17px] pb-[14px] font-bold text-white no-underline cursor-pointer relative overflow-hidden transition-all duration-200 hover:border-white hover:text-black"
                >
                  <span>Login / Sign Up</span>
                </Link>
              </div>

              {/* Mobile Hamburger */}
              <div className="hidden max-lg:block relative cursor-pointer -mr-[5px]">
                <button
                  onClick={toggleMenu}
                  className="z-0 cursor-pointer flex flex-col justify-center items-center w-6 h-6 p-0 relative bg-transparent border-0"
                  aria-label="Toggle menu"
                >
                  <div
                    className={`bg-white flex-none w-full h-[2px] min-h-[2px] absolute left-0 right-0 transition-all duration-300 ${menuOpen
                        ? "top-[11px] rotate-45"
                        : "top-0 rotate-0"
                      }`}
                  />
                  <div
                    className={`bg-white flex-none h-[2px] min-h-[2px] absolute right-0 transition-all duration-300 ${menuOpen ? "w-0 opacity-0" : "w-[70%] opacity-100"
                      }`}
                  />
                  <div
                    className={`bg-white flex-none w-full h-[2px] min-h-[2px] absolute left-0 right-0 transition-all duration-300 ${menuOpen
                        ? "bottom-[11px] -rotate-45"
                        : "bottom-0 rotate-0"
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={menuOpen}
        onClose={closeMenu}
        onOpenModal={onOpenModal}
      />
    </>
  );
}
