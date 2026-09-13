"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";

interface MediaSectionProps {
  onOpenModal: () => void;
}

export default function MediaSection({ onOpenModal }: MediaSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTextRevealed, setIsTextRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="noise-bg relative px-4 sm:px-8 lg:px-16 py-20 max-md:py-12 overflow-hidden select-none"
    >
      <div className="w-full max-w-[1340px] mx-auto relative z-10">
        {/* Full Screen Section Intro */}
        <div
          className={`text-center max-w-3xl mx-auto mb-14 max-md:mb-8 transition-all duration-700 ${isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[25px]"
            }`}
        >
          <div className="text-[#d8786f] tracking-[4px] uppercase text-xs sm:text-sm font-bold mb-3">
            IMMERSIVE ACOUSTIC STACK
          </div>
          <h2 className="font-grotesque font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mt-0 mb-4 leading-tight">
            Uncover The Story &amp; Play The Instruments
          </h2>

        </div>

        {/* 1. Full-Screen Window Scroll Stack (No nested small box or inner scrollbar) */}
        <div className="w-full relative">
          <ScrollStack
            useWindowScroll={true}
            itemDistance={120}
            itemScale={0.04}
            itemStackDistance={28}
            stackPosition="18%"
            scaleEndPosition="8%"
            baseScale={0.88}
            rotationAmount={-1}
            onStackComplete={() => setIsTextRevealed(true)}
          >
            {/* Card 1 */}
            <ScrollStackItem>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 h-full">
                <div className="flex-1 text-left">
                  <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[3px] text-[#d8786f] uppercase bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full mb-3">
                    Step 01 / Discovery
                  </span>
                  <h3 className="font-grotesque text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-0 mb-3">
                    Find Hidden Instruments
                  </h3>
                  <p className="text-white/70 font-grotesque text-sm sm:text-base md:text-lg leading-relaxed m-0 max-w-xl">
                    Explore ancient musical artefacts, intricate sitars, veenas, and historic instruments hidden throughout Maharashtra&apos;s museum archives.
                  </p>
                </div>
                <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-black/40 shadow-inner flex items-center justify-center">
                  <Image
                    src="/Assets/audio_01.png"
                    alt="Historical Instrument"
                    fill
                    className="object-contain p-3"
                  />
                </div>
              </div>
            </ScrollStackItem>

            {/* Card 2 */}
            <ScrollStackItem>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 h-full">
                <div className="flex-1 text-left">
                  <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[3px] text-[#ffc75a] uppercase bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full mb-3">
                    Step 02 / Acoustic Scan
                  </span>
                  <h3 className="font-grotesque text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-0 mb-3">
                    Scan &amp; Hear How It Sounds
                  </h3>
                  <p className="text-white/70 font-grotesque text-sm sm:text-base md:text-lg leading-relaxed m-0 max-w-xl">
                    Point your device scanner at the relic or artwork to unlock authentic acoustic frequencies and hear centuries-old melodies recreated in real time.
                  </p>
                </div>
                <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-black/40 shadow-inner flex items-center justify-center">
                  <Image
                    src="/Assets/audio_02.png"
                    alt="Acoustic Scan"
                    fill
                    className="object-contain p-3"
                  />
                </div>
              </div>
            </ScrollStackItem>

            {/* Card 3 */}
            <ScrollStackItem>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 h-full">
                <div className="flex-1 text-left">
                  <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[3px] text-white/90 uppercase bg-[#c11822]/40 border border-[#c11822]/60 px-3.5 py-1.5 rounded-full mb-3">
                    Step 03 / Interactive Play
                  </span>
                  <h3 className="font-grotesque text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-0 mb-3">
                    Bring History To Life
                  </h3>
                  <p className="text-white/70 font-grotesque text-sm sm:text-base md:text-lg leading-relaxed m-0 max-w-xl">
                    Interact with the instruments yourself in full 3D spatial resonance. Experience history you can actually play.
                  </p>
                </div>
                <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-black/40 shadow-inner flex items-center justify-center">
                  <Image
                    src="/Assets/media_illustr.png"
                    alt="Classical Sculpture &amp; Music"
                    fill
                    className="object-contain p-3"
                  />
                </div>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>

        {/* 2. Revealed Content Section (Text & Centerpiece Image Reveal After Stack) */}
        <div
          className={`mt-16 rounded-[14px] flex justify-between items-start min-h-[560px] pt-20 pl-[100px] pr-10 relative max-lg:flex-col max-lg:items-stretch max-lg:min-h-auto max-lg:pt-10 max-lg:pb-10 max-lg:pl-10 max-md:p-0 transition-all duration-1000 ${isTextRevealed
              ? "opacity-100 translate-y-0 filter-none pointer-events-auto"
              : "opacity-35 translate-y-8 blur-[1px]"
            }`}
        >
          {/* Border */}
          <div className="z-[-1] border border-white/15 rounded-[14px] absolute inset-0 max-md:hidden bg-gradient-to-b from-[#14171d]/60 to-[#0c0e12]/80 backdrop-blur-md" />

          {/* Center Illustration */}
          <div
            className={`z-0 flex justify-center items-end absolute bottom-0 left-0 right-0 max-lg:relative max-lg:-mb-[150px] max-md:-mb-[75px] transition-all duration-1000 ${isTextRevealed
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-8"
              }`}
          >
            <Image
              src="/Assets/media_illustr.png"
              alt="Classical Greek illustration"
              width={606}
              height={500}
              className="max-w-none relative max-md:max-w-full"
              sizes="(max-width: 767px) 100vw, 606px"
              priority
            />
          </div>

          {/* Revealed Heading: History you can play */}
          <h2
            className={`z-[2] relative font-grotesque text-[98px] font-bold leading-[1em] mt-0 mb-10 max-md:text-[52px] transition-all duration-800 ${isTextRevealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-[30px]"
              }`}
          >
            <span
              className={`inline-block relative transition-all duration-800 ${isTextRevealed
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-[50px]"
                }`}
              style={{ transitionDelay: "200ms" }}
            >
              History
            </span>
            <br />
            <span
              className={`inline-block relative transition-all duration-800 ${isTextRevealed
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-[50px]"
                }`}
              style={{ transitionDelay: "400ms" }}
            >
              you
            </span>
            <br />
            <span
              className={`inline-block relative transition-all duration-800 ${isTextRevealed
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-[50px]"
                }`}
              style={{ transitionDelay: "600ms" }}
            >
              can play
            </span>
          </h2>

          {/* Revealed Description & Button */}
          <div
            className={`z-[2] w-full max-w-[270px] mt-6 relative transition-all duration-800 max-lg:max-w-[600px] max-lg:-mt-5 ${isTextRevealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-[30px]"
              }`}
            style={{ transitionDelay: "600ms" }}
          >
            <p className="tracking-[0.02em] font-grotesque text-lg font-light leading-[1.45em] mb-[60px] max-lg:mb-10 max-md:text-[15px] text-white/80">
              Discover musical instruments hidden throughout museums. Scan an artefact, artwork, or historical reference to uncover its story, hear how it sounds, and bring it to life by playing it yourself.
            </p>
            <button
              onClick={onOpenModal}
              className="text-center tracking-[0.12em] uppercase bg-transparent border border-white/50 rounded-lg min-w-[176px] px-[30px] pt-[17px] pb-[14px] font-medium text-white cursor-pointer transition-all duration-200 hover:border-white hover:bg-white/10 max-md:font-normal"
            >
              Start Exploring
            </button>
          </div>

          {/* Decorative Element 1 - Half circle */}
          <div
            className={`w-[83px] h-[166px] absolute bottom-[-26px] left-[178px] overflow-hidden max-lg:inset-auto max-lg:top-0 max-lg:left-0 max-md:w-[40px] max-md:h-[80px] max-md:top-0 max-md:left-[71px] max-md:rotate-[-120deg] max-xs:left-[30px] transition-all duration-800 ${isTextRevealed ? "opacity-100" : "opacity-0"
              }`}
            style={{ transitionDelay: "800ms" }}
          >
            <div
              className="w-[166px] h-full bg-left bg-no-repeat bg-contain transition-all duration-800 max-md:w-[80px]"
              style={{
                backgroundImage: "url(/Assets/media_elem.png)",
              }}
            />
          </div>

          {/* Decorative Element 2 - Gold rectangle */}
          <div
            className={`flex justify-end items-end w-[173px] h-[58px] absolute bottom-0 right-[355px] rotate-45 max-lg:inset-auto max-lg:top-0 max-lg:right-0 max-md:w-[50px] max-md:h-[16px] max-md:top-[379px] max-md:-rotate-45 max-xs:top-[305px] max-xs:right-[-10px] transition-all duration-800 ${isTextRevealed ? "opacity-100" : "opacity-0"
              }`}
            style={{ transitionDelay: "1000ms" }}
          >
            <div className="bg-[#ffc75a] w-full h-full transition-all duration-800" />
          </div>
        </div>
      </div>
    </section>
  );
}
