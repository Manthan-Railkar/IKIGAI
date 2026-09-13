"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ExpositionSectionProps {
  onOpenModal: () => void;
}

interface MuseumItem {
  id: number;
  name: string;
  location: string;
  image: string;
}

const museums: MuseumItem[] = [
  {
    id: 1,
    name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
    location: "Mumbai",
    image: "/Assets/csmvs_mumbai.png",
  },
  {
    id: 2,
    name: "Raja Dinkar Kelkar Museum",
    location: "Pune",
    image: "/Assets/kelkar_museum_pune.png",
  },
  {
    id: 3,
    name: "Dr. Bhau Daji Lad Mumbai City Museum",
    location: "Mumbai",
    image: "/Assets/bhau_daji_lad_mumbai.jpg",
  },
  {
    id: 4,
    name: "Nagpur Central Museum",
    location: "Nagpur",
    image: "/Assets/nagpur_central_museum.jpg",
  },
  {
    id: 5,
    name: "Mahatma Phule Museum",
    location: "Pune",
    image: "/Assets/mahatma_phule_museum.jpg",
  },
  {
    id: 6,
    name: "Aga Khan Palace Museum",
    location: "Pune",
    image: "/Assets/aga_khan_palace_museum.jpg",
  },
];

export default function ExpositionSection({
  onOpenModal,
}: ExpositionSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [active, setActive] = useState<number>(-1);
  const [stageScale, setStageScale] = useState(1);

  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Responsive stage scaling: smoothly adapts the 1200px stage to any screen width
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

  // Section entrance observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="exposition"
      className="noise-bg relative px-4 sm:px-8 lg:px-16 py-24 max-md:py-16 overflow-hidden select-none"
    >
      <div className="w-full max-w-[1340px] mx-auto relative z-10">
        {/* Header with single-line heading */}
        <header
          className={`text-center max-w-4xl mx-auto mb-14 sm:mb-20 max-md:mb-10 transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[30px]"
          }`}
        >
          <div className="text-[#d8786f] tracking-[4px] uppercase text-xs sm:text-sm font-bold mb-3">
            INTERACTIVE EXPLORATION
          </div>
          <h2 className="font-grotesque font-extrabold text-[22px] sm:text-[32px] md:text-[42px] lg:text-[50px] xl:text-[58px] leading-tight tracking-[-0.02em] text-white mt-0 mb-3 whitespace-nowrap text-center">
            Which museum will you explore?
          </h2>
          <div className="text-[#a8adb5] font-grotesque text-sm sm:text-base md:text-[18px] font-normal max-w-xl mx-auto">
            Choose a museum to begin your discovery.
          </div>
        </header>

        {/* 3D Coverflow Stage Wrapper */}
        <div
          ref={wrapperRef}
          className="w-full flex justify-center items-center overflow-visible my-2"
          style={{ height: `${Math.max(260, Math.round(570 * stageScale))}px` }}
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
            onMouseLeave={() => setActive(-1)}
          >
            {museums.map((museum, i) => {
              // Exact layout math from user's specification
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
                  onClick={() => {
                    if (active === i) {
                      onOpenModal();
                    } else {
                      setActive(i);
                    }
                  }}
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
                      ? "1px solid rgba(255,255,255,0.7)"
                      : "1px solid rgba(255,255,255,0.28)",
                    transformStyle: "preserve-3d",
                    transform: `translate(-50%, -50%) translateX(${x}px) translateY(${y}px) translateZ(${z}px) rotateY(${rot}deg) scale(${scale})`,
                    zIndex: zIndex,
                    filter: isActive ? "brightness(1.08)" : "brightness(0.92)",
                    boxShadow: isActive
                      ? "0 35px 90px rgba(0,0,0,0.85), 0 0 40px rgba(193,24,34,0.4)"
                      : "0 18px 45px rgba(0,0,0,0.5)",
                    transition:
                      "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s, box-shadow 0.6s, border-color 0.6s",
                  }}
                >
                  {/* Museum Image */}
                  <Image
                    src={museum.image}
                    alt={museum.name}
                    fill
                    sizes="250px"
                    className="object-cover pointer-events-none select-none"
                    priority={i === 2}
                  />

                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.05) 100%)",
                    }}
                  />

                  {/* Arrow Button */}
                  <div
                    className="absolute top-[18px] right-[18px] z-10 w-[44px] h-[44px] rounded-full flex items-center justify-center pointer-events-none"
                    style={{
                      border: "1px solid rgba(255,255,255,0.45)",
                      background: "rgba(255,255,255,0.12)",
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

                  {/* Content (Location & Museum Name) */}
                  <div className="absolute left-[20px] right-[18px] bottom-[22px] z-10 pointer-events-none">
                    <div className="text-[11px] tracking-[2.5px] font-bold text-[#d5d5d5] uppercase mb-1.5 drop-shadow">
                      {museum.location}
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

        {/* Carousel indicators */}
        <div className="flex justify-center items-center gap-2.5 mt-8 max-md:mt-4">
          {museums.map((_, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setActive(idx)}
              onClick={() => setActive(idx)}
              aria-label={`Go to museum ${idx + 1}`}
              className={`h-[3px] rounded-full transition-all duration-300 border-0 p-0 cursor-pointer ${
                active === idx
                  ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  : "w-2.5 bg-white/20 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Atmospheric Background Shines */}
      <div className="z-[-1] absolute top-[-300px] left-0 right-0 w-full h-[1200px] flex justify-end items-center overflow-hidden pointer-events-none opacity-70">
        <Image
          src="/Assets/bg_shine-01.png"
          alt=""
          width={1306}
          height={1300}
          className="max-h-full relative right-[-450px]"
          aria-hidden="true"
        />
      </div>
      <div className="z-[-1] absolute -bottom-40 -left-40 w-96 h-96 pointer-events-none opacity-40">
        <Image
          src="/Assets/bg_shine-02.png"
          alt=""
          width={400}
          height={400}
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
