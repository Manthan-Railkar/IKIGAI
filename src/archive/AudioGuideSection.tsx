"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface AudioItem {
  icon: string;
  iconAlt: string;
  type: string;
  image: string;
  imageWidth: number;
  title: string;
  titleSpan?: string;
  description: string;
  year: string;
  time: string;
}

const audioItems: AudioItem[] = [
  {
    icon: "/Assets/ico_pillar.svg",
    iconAlt: "Building icon",
    type: "Building",
    image: "/Assets/audio_01.png",
    imageWidth: 236,
    title: "Acropolis",
    titleSpan: "of Athens",
    description:
      "The Acropolis has been traditionally considered a national and cultural symbol of Greece, but in 1995 a cultural heritage organisation filed a lawsuit in an attempt to have the whole monument classified.",
    year: "Year: 5 BC",
    time: "time: 10 min",
  },
  {
    icon: "/Assets/ico_jug.svg",
    iconAlt: "Sculpture icon",
    type: "Sculpture",
    image: "/Assets/audio_02.png",
    imageWidth: 242,
    title: "Athenian Vase Painting",
    description:
      "In Greek pottery, simple shapes and design motifs convey formalised ideas of harmony and purity. Many mythological and religious symbols appear on pots, usually with particular emphasis on the heads, feet.",
    year: "Year: 530 BC",
    time: "time: 22 min",
  },
  {
    icon: "/Assets/ico_book.svg",
    iconAlt: "Philosophy icon",
    type: "philosophy",
    image: "/Assets/audio_03.png",
    imageWidth: 246,
    title: "Socrates: Life",
    titleSpan: "& Philosophy",
    description:
      "Socrates appeared as a character in a number of literary works, ranging from humorous satires, to tragedies and historical romances. The character most closely resembling the Socrates of ancient Athens.",
    year: "Year: 470–399 BC",
    time: "time: 15 min",
  },
];

interface AudioGuideSectionProps {
  onOpenModal: () => void;
}

export default function AudioGuideSection({
  onOpenModal,
}: AudioGuideSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="audio-guide"
      className="noise-bg relative px-20 py-20 max-lg:px-8 max-md:pt-10 max-md:pb-10"
    >
      <div className="w-full max-w-[1280px] mx-auto relative static">
        {/* Background Shine */}
        <div className="z-[-1] absolute inset-0 flex justify-start items-center max-lg:overflow-hidden max-md:justify-end max-md:h-[500px] max-md:top-[-122px] max-md:overflow-hidden">
          <Image
            src="/Assets/bg_shine-02.png"
            alt=""
            width={900}
            height={900}
            className="relative left-[-300px] max-md:left-auto max-md:right-[-350px] max-md:w-[600px] max-md:max-w-none max-md:rotate-[60deg]"
            aria-hidden="true"
          />
        </div>

        {/* Heading */}
        <div
          className={`flex justify-between items-end mb-[42px] max-md:mb-[34px] transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[30px]"
          }`}
        >
          <h2 className="font-grotesque font-bold text-[50px] leading-[1em] tracking-[-0.02em] mt-0 mb-0 max-md:text-[40px]">
            Audio Guide
          </h2>
          <div className="text-grey tracking-[0.1em] uppercase mb-[5px] max-md:hidden">
            introdUction
          </div>
        </div>

        {/* Audio List */}
        <ul className="pl-0 list-none">
          {audioItems.map((item, index) => (
            <li
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex justify-between py-6 relative text-white/50 max-lg:flex-wrap ${
                index === 0 ? "dash-border-both" : "dash-border-bottom"
              } transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-[30px]"
              }`}
              style={{ transitionDelay: `${(index + 1) * 200}ms` }}
            >
              {/* Column 1: Category & Image */}
              <div className="flex-1 max-w-[260px] relative max-lg:flex-none max-lg:w-full max-lg:max-w-none max-md:flex-none max-md:w-full max-md:max-w-none">
                <div
                  className={`flex justify-start items-center tracking-[0.02em] uppercase transition-all duration-200 max-lg:mb-4 max-md:mb-[10px] max-md:text-[13px] ${
                    hoveredIndex === index
                      ? "text-white/80"
                      : "text-white/30"
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt={item.iconAlt}
                    width={20}
                    height={20}
                    className="mr-[10px]"
                  />
                  <div>{item.type}</div>
                </div>

                {/* Artwork Image (desktop only) */}
                <div
                  className={`items-center mt-[-40px] flex absolute top-0 bottom-0 left-[-20px] transition-all duration-200 max-lg:hidden ${
                    hoveredIndex === index
                      ? "z-[1] opacity-100"
                      : "z-[-1] opacity-0"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={item.imageWidth}
                    height={300}
                    className={`max-w-none transition-transform duration-500 ${
                      hoveredIndex === index ? "scale-100" : "scale-90"
                    }`}
                  />
                </div>
              </div>

              {/* Column 2: Title */}
              <div className="flex-1 max-w-[395px] pl-[50px] pr-16 max-lg:max-w-[260px] max-lg:pl-0 max-md:flex-none max-md:w-full max-md:max-w-none max-md:pr-0">
                <h3 className="font-grotesque font-bold text-[34px] leading-[1em] tracking-[-0.02em] text-[#f1f5fb] mt-0 mb-5 max-md:mb-8 max-md:text-xl">
                  {item.title}{" "}
                  {item.titleSpan && (
                    <span className="whitespace-nowrap">
                      {item.titleSpan}
                    </span>
                  )}
                </h3>
              </div>

              {/* Column 3: Description & Params */}
              <div
                className={`flex-1 mr-14 transition-all duration-200 max-lg:flex-none max-lg:w-full max-lg:mr-0 max-md:flex-none max-md:w-full max-md:mr-0 max-md:pr-0 max-xs:pr-[50px] ${
                  hoveredIndex === index ? "text-white" : ""
                }`}
              >
                <p className="mt-[2px] mb-0 font-grotesque text-base font-thin leading-[1.5em] max-md:text-[15px]">
                  {item.description}
                </p>
                <div className="text-white/40 flex items-center mt-11 uppercase max-md:mt-4 max-xs:text-[13px]">
                  <div className="mr-9 max-xs:mr-4">{item.year}</div>
                  <div className="mr-9 max-xs:mr-4">{item.time}</div>
                </div>
              </div>

              {/* Column 4: Play Button */}
              <div className="flex-none flex justify-center items-center max-md:z-[2] max-md:absolute max-md:top-[25px] max-md:right-0">
                <button
                  onClick={onOpenModal}
                  className={`border rounded-full flex justify-center items-center w-12 h-12 cursor-pointer transition-all duration-200 bg-center bg-no-repeat max-md:w-[45px] max-md:h-[45px] ${
                    hoveredIndex === index
                      ? "border-white bg-white opacity-100 shadow-[0_3px_13px_-4px_rgba(48,13,17,0.8)]"
                      : "border-black opacity-50 invert"
                  }`}
                  style={{
                    backgroundImage: "url(/Assets/ico_rectangle.svg)",
                    backgroundPosition: "55%",
                    backgroundSize: "auto",
                  }}
                  aria-label={`Play ${item.title}`}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Read More */}
        <div className="text-center mt-12 mb-[60px] relative max-md:text-left max-md:mt-10 max-md:mb-10 max-lg:static">
          <button
            onClick={onOpenModal}
            className={`text-center tracking-[0.1em] uppercase bg-transparent border border-white-50 rounded-lg min-w-[176px] px-[30px] pt-[17px] pb-[14px] font-normal text-white cursor-pointer transition-all duration-700 hover:border-white ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-[20px]"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            read more
          </button>

          {/* Decorative footer element */}
          <div className="w-[170px] h-[85px] pt-[1px] absolute bottom-[-211px] left-[366px] overflow-hidden rotate-[150deg] max-lg:bottom-[-70px] max-lg:left-auto max-lg:right-0 max-md:w-[40px] max-md:h-[20px] max-md:bottom-[-15px] max-md:right-5 max-md:rotate-[140deg]">
            <div
              className="w-[170px] h-[170px] absolute bg-[center_top] bg-no-repeat bg-contain rotate-[180deg] max-md:w-[40px] max-md:h-[40px]"
              style={{
                backgroundImage: "url(/Assets/hero_elem-08.svg)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
