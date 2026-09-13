"use client";

import Image from "next/image";

interface HeroElementsProps {
  isVisible: boolean;
}

export default function HeroElements({ isVisible }: HeroElementsProps) {
  return (
    <div className="w-[484px] h-[532px] relative z-0 max-md:w-[280px] max-md:h-[290px] max-md:mr-0">
      {/* mod--1: Circle element (top-left) */}
      <div className="hero-elem z-0 absolute overflow-hidden w-[200px] h-[199px] top-0 left-0 flex justify-center items-center max-md:w-[110px] max-md:h-[110px]">
        {/* Top half circle */}
        <div className="w-full h-[100px] absolute inset-0 overflow-hidden max-md:h-[55px]">
          <div
            className={`flex-none w-[200px] h-[200px] absolute top-[1px] bottom-auto bg-no-repeat bg-contain bg-[center_top] max-md:w-[110px] max-md:h-[110px] transition-transform duration-1000 ${
              isVisible ? "rotate-[180deg]" : "rotate-0"
            }`}
            style={{
              backgroundImage: "url(/Assets/hero_elem-circle1.svg)",
              right: 0,
              transitionDelay: "500ms",
            }}
          />
        </div>
        {/* Bottom half circle */}
        <div className="w-full h-[100px] absolute inset-0 top-auto overflow-hidden max-md:h-[55px]">
          <div
            className={`flex-none w-[200px] h-[200px] absolute bottom-[1px] bg-no-repeat bg-contain bg-[center_bottom] max-md:w-[110px] max-md:h-[110px] transition-transform duration-1000 ${
              isVisible ? "rotate-[180deg]" : "rotate-0"
            }`}
            style={{
              backgroundImage: "url(/Assets/hero_elem-circle2.svg)",
              right: 0,
              transitionDelay: "600ms",
            }}
          />
        </div>
      </div>

      {/* mod--12: White circle (mid-left area) */}
      <div
        className={`absolute bg-white rounded-full w-[44px] h-[44px] top-[243px] left-[160px] overflow-hidden z-0 transition-transform duration-700 max-md:w-[22px] max-md:h-[22px] max-md:top-[140px] max-md:left-[88px] ${
          isVisible ? "scale-100" : "scale-0"
        }`}
        style={{ transitionDelay: "1200ms" }}
      />

      {/* mod--2: Ancient bust image */}
      <Image
        src="/Assets/hero_elem-01.png"
        alt="Ancient sculpture"
        width={166}
        height={327}
        className={`absolute z-[1] bottom-0 left-[26px] overflow-hidden transition-all duration-700 max-md:max-w-[90px] max-md:left-[12px] ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-[50px]"
        }`}
        style={{ transitionDelay: "700ms" }}
      />

      {/* mod--3: White bar */}
      <div
        className={`absolute bg-white h-[35px] top-[250px] left-0 z-[2] overflow-hidden transition-all duration-700 max-md:h-[17px] max-md:top-[142px]`}
        style={{
          width: isVisible ? "120px" : "0px",
          transitionDelay: "800ms",
        }}
      />

      {/* mod--4: Photo square */}
      <div
        className="absolute z-0 overflow-hidden left-0 bottom-[3px] max-md:w-[110px] max-md:h-[110px]"
        style={{
          backgroundImage: "url(/Assets/hero_elem-03.jpg)",
          backgroundPosition: "0 0",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          width: "204px",
          height: isVisible ? "204px" : "0px",
          transition: "height 0.7s ease",
          transitionDelay: "900ms",
        }}
      />

      {/* mod--5: Decorative arc (top-right) */}
      <div className="absolute z-0 overflow-hidden w-[171px] h-[85px] top-0 right-0 max-md:w-[110px] max-md:h-[55px]">
        <div
          className={`w-full h-[170px] bg-no-repeat bg-contain bg-[center_top] transition-transform duration-1000 max-md:h-[110px] ${
            isVisible ? "rotate-[-180deg]" : "rotate-0"
          }`}
          style={{
            backgroundImage: "url(/Assets/hero_elem-08.svg)",
            transitionDelay: "600ms",
          }}
        />
      </div>

      {/* mod--6: Small white square */}
      <div
        className="absolute bg-white top-[50px] left-[245px] z-0 overflow-hidden max-md:w-[20px] max-md:h-[20px] max-md:top-[35px] max-md:left-[139px]"
        style={{
          width: isVisible ? "35px" : "0px",
          height: "35px",
          transition: "width 0.5s ease",
          transitionDelay: "1000ms",
        }}
      />

      {/* mod--14: White circle (right side) */}
      <div
        className={`absolute bg-white rounded-full w-[44px] h-[44px] top-[190px] right-0 z-0 overflow-hidden transition-transform duration-700 max-md:w-[22px] max-md:h-[22px] max-md:top-[140px] ${
          isVisible ? "scale-100" : "scale-0"
        }`}
        style={{ transitionDelay: "1100ms" }}
      />

      {/* mod--13: Small white square (right) */}
      <div
        className="absolute bg-white top-[120px] right-0 z-0 overflow-hidden max-md:w-[20px] max-md:h-[20px] max-md:top-[68px]"
        style={{
          width: "35px",
          height: isVisible ? "35px" : "0px",
          transition: "height 0.5s ease",
          transitionDelay: "900ms",
        }}
      />

      {/* mod--7: Cube outline */}
      <div
        className="absolute z-0 overflow-hidden top-[120px] left-[245px] max-md:top-[68px] max-md:left-[140px]"
        style={{
          height: isVisible ? "auto" : "0px",
          transition: "height 0.6s ease",
          transitionDelay: "1000ms",
        }}
      >
        <div className="border-[35px] border-white flex-none w-[158px] h-[158px] max-md:border-[20px] max-md:w-[92px] max-md:h-[92px]" />
      </div>

      {/* mod--8: Quarter circle (right-center) */}
      <div className="absolute z-0 overflow-hidden w-[69px] h-[137px] bottom-[70px] right-[169px] max-md:w-[40px] max-md:h-[80px] max-md:bottom-[35px] max-md:right-[100px]">
        <div
          className={`w-[138px] h-full absolute right-0 bg-right bg-no-repeat bg-contain transition-transform duration-1000 max-md:w-[80px] ${
            isVisible ? "rotate-[-180deg]" : "rotate-0"
          }`}
          style={{
            backgroundImage: "url(/Assets/hero_elem-10.svg)",
            transitionDelay: "800ms",
          }}
        />
      </div>

      {/* mod--9: White circle (bottom-center) */}
      <div
        className={`absolute bg-white rounded-full w-[44px] h-[44px] bottom-0 left-[245px] z-0 overflow-hidden transition-transform duration-700 max-md:w-[22px] max-md:h-[22px] max-md:left-[140px] ${
          isVisible ? "scale-100" : "scale-0"
        }`}
        style={{ transitionDelay: "1300ms" }}
      />

      {/* mod--10: Second ancient bust */}
      <Image
        src="/Assets/hero_elem-02.png"
        alt="Ancient sculpture detail"
        width={129}
        height={257}
        className={`absolute z-0 bottom-0 right-[6px] overflow-hidden transition-all duration-700 max-md:max-w-[75px] max-md:right-[13px] ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-[50px]"
        }`}
        style={{ transitionDelay: "900ms" }}
      />

      {/* mod--11: Photo strip (bottom-right) */}
      <div
        className="absolute z-[1] bottom-0 right-0 overflow-hidden max-md:w-[100px] max-md:h-[22px]"
        style={{
          backgroundImage: "url(/Assets/hero_elem-04.jpg)",
          backgroundPosition: "0 0",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          width: isVisible ? "140px" : "0px",
          height: "34px",
          transition: "width 0.7s ease",
          transitionDelay: "1100ms",
        }}
      />
    </div>
  );
}
