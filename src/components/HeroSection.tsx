"use client";

import { useEffect, useRef, useState } from "react";
import HeroElements from "./HeroElements";

interface HeroSectionProps {
  onOpenModal: () => void;
  isLoaded?: boolean;
}

export default function HeroSection({
  onOpenModal,
  isLoaded = true,
}: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setIsVisible(true), 250);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  return (
    <section
      ref={sectionRef}
      id="virtual-museum"
      className="noise-bg relative z-[3] px-20 pt-[240px] pb-[136px] overflow-hidden max-lg:px-8 max-md:pt-[130px] max-md:pb-10"
    >
      <div className="w-full max-w-[1280px] mx-auto relative">
        {/* Hero Elements (right side on desktop, top on mobile) */}
        <div className="z-0 absolute inset-0 left-auto flex flex-row justify-end items-center mr-12 max-lg:-mr-[280px] max-md:relative max-md:justify-start max-md:mb-16 max-md:mx-auto max-md:mr-0 max-xs:justify-center">
          <HeroElements isVisible={isVisible} />
        </div>

        {/* Hero Content */}
        <div className="z-[1] flex flex-col justify-center items-start max-w-[50%] pl-[90px] relative max-lg:pl-0 max-md:max-w-full max-xs:max-w-none">
          {/* Over heading */}
          <div
            className={`text-grey tracking-[0.14em] uppercase mb-8 text-lg max-md:mb-[10px] max-md:text-[13px] transition-all duration-700 ${isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-[200px]"
              }`}
            style={{ transitionDelay: "400ms" }}
          >
            FIND IT. HEAR IT. PLAY IT
          </div>

          {/* Main Heading */}
          <h1 className="font-grotesque font-bold text-[98px] leading-[1em] tracking-[-0.01em] whitespace-nowrap mb-[70px] mt-0 max-md:text-[52px] max-md:mb-10 max-md:whitespace-normal">
            <span
              className={`inline-block relative transition-all duration-700 ${isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-[100px]"
                }`}
              style={{ transitionDelay: "600ms" }}
            >
              Discover
            </span>
            <br />
            <span className="inline-flex items-center">

              <span
                className={`inline-block relative transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"
                  }`}
                style={{ transitionDelay: "900ms" }}
              >
                the sound
              </span>
            </span>
            <br />
            <span
              className={`inline-block relative transition-all duration-700 ${isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-[100px]"
                }`}
              style={{ transitionDelay: "1000ms" }}
            >
              of history
            </span>
          </h1>

          {/* CTA Button */}
          <div
            className={`transition-all duration-700 max-xs:w-full ${isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-[200px]"
              }`}
            style={{ transitionDelay: "1100ms" }}
          >
            <button
              onClick={onOpenModal}
              className="btn-hero-fill text-left text-white tracking-[0.1em] uppercase bg-transparent border border-white-50 rounded-lg min-w-[280px] px-6 py-[25px] font-normal flex justify-between items-center relative overflow-hidden cursor-pointer transition-all duration-200 hover:border-white hover:text-black no-underline max-xs:w-full max-xs:pt-[22px] max-xs:pb-[19px] max-xs:text-[13px]"
            >
              <span>Start Learning</span>
              <span
                className="btn-ico inline-block w-6 h-6 -my-5 bg-center bg-no-repeat transition-all duration-200"
                style={{
                  backgroundImage: "url(/Assets/ico_btn-arrow.svg)",
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
