"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  onOpenModal: () => void;
}

const socialLinks = [
  {
    href: "https://www.facebook.com/halolabteam/",
    icon: "/Assets/ico_facebook-f.svg",
    alt: "Facebook",
  },
  {
    href: "https://www.behance.net/halolab",
    icon: "/Assets/ico_behance.svg",
    alt: "Behance",
  },
  {
    href: "https://www.linkedin.com/company/halolabteam/",
    icon: "/Assets/ico_linkedin.svg",
    alt: "LinkedIn",
  },
  {
    href: "https://www.instagram.com/halolabteam/",
    icon: "/Assets/ico_instagram.svg",
    alt: "Instagram",
  },
  {
    href: "https://dribbble.com/halolab",
    icon: "/Assets/ico_dribbble.svg",
    alt: "Dribbble",
  },
];

const SocialIcons = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-[22px] max-xs:gap-4 ${className}`}>
    {socialLinks.map((link) => (
      <Link
        key={link.alt}
        href={link.href}
        target="_blank"
        className="opacity-50 flex-none flex justify-center items-center hover:opacity-100 transition-opacity duration-200"
      >
        <Image src={link.icon} alt={link.alt} width={20} height={20} />
      </Link>
    ))}
  </div>
);

export default function Footer(props?: FooterProps) {
  void props;
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

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

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <footer
      ref={footerRef}
      className="z-0 relative overflow-hidden pt-24 px-8 max-md:pt-8"
      style={{
        backgroundColor: "#1b1f24",
        backgroundImage: `url(/Assets/Noise.png)`,
        backgroundPosition: "0 0",
        backgroundSize: "auto",
        borderTop: "1px solid rgba(154, 82, 97, 0.3)",
      }}
    >
      <div
        className={`w-full max-w-[1080px] mx-auto relative transition-all duration-700 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-[30px]"
        }`}
      >
        {/* Main Columns */}
        <div className="flex justify-between mb-[54px] max-lg:flex-wrap max-xs:mb-16">
          {/* Column 1: Logo & Description */}
          <div className="flex-1 max-lg:flex-none flex flex-col items-start w-full mb-10 max-md:mb-12">
            <Link href="#" className="inline-block mb-10 max-md:mb-6">
              <Image
                src="/Assets/logo.svg"
                alt="Museum Logo"
                width={72}
                height={40}
                className="max-md:max-w-[52px]"
              />
            </Link>
            <div className="font-grotesque text-[34px] font-light leading-[1.2em] uppercase max-lg:text-[26px] max-md:text-xl">
              . . .<br />
              Enjoy the arts
              <br />
              and greece history
            </div>
          </div>

          {/* Column 2: Nav & Social */}
          <div className="max-md:w-full">
            <nav className="flex flex-col items-start max-md:grid max-md:grid-cols-2 max-md:gap-x-10 max-md:gap-y-4 max-md:max-w-[320px] max-md:mb-10 max-xs:gap-x-6 max-xs:gap-y-5">
              <Link
                href="#virtual-museum"
                data-anim="link"
                className="text-grey tracking-[0.1em] uppercase mb-6 no-underline relative hover:text-white transition-colors duration-200 max-md:mb-0"
              >
                MUSEUM
              </Link>
              <Link
                href="#exposition"
                data-anim="link"
                className="text-grey tracking-[0.1em] uppercase mb-6 no-underline relative hover:text-white transition-colors duration-200 max-md:mb-0"
              >
                EXPOSITION
              </Link>
              <Link
                href="#about"
                data-anim="link"
                className="text-grey tracking-[0.1em] uppercase mb-6 no-underline relative hover:text-white transition-colors duration-200 max-md:mb-0"
              >
                about
              </Link>
            </nav>
            <div className="flex justify-start items-center mt-[30px] max-md:hidden">
              <SocialIcons />
            </div>
          </div>

          {/* Column 3: Newsletter */}
          <div className="ml-[50px] max-lg:ml-0 max-md:w-full">
            <div className="uppercase mb-[60px] leading-[1.5em] max-md:mb-4">
              Be the first to hear
              <br />
              Virtual Smart-museum news
            </div>
            <div className="w-full min-w-[240px] max-w-[300px] mb-0">
              {submitted ? (
                <div
                  className="text-left py-4 px-6 font-bold rounded-lg"
                  style={{
                    backgroundImage:
                      "linear-gradient(146deg, #52f3b0, #3b4afb)",
                  }}
                >
                  Your submission
                  <br />
                  has been received!
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <input
                    type="email"
                    placeholder="E-MAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-[52px] w-full text-white bg-transparent border-0 border-b border-b-white/20 rounded-none mb-6 px-0 transition-all duration-200 focus:border-b-white focus:outline-none max-xs:mb-[30px]"
                  />
                  <div className="border border-white-50 rounded-lg transition-all duration-200 inline-block relative hover:border-white">
                    <button
                      type="submit"
                      className="text-center tracking-[0.1em] uppercase bg-transparent border-0 rounded-lg min-w-[176px] px-[30px] pt-[17px] pb-[14px] font-normal text-white cursor-pointer max-xs:min-w-[150px] max-xs:pt-[14px] max-xs:pb-[12px]"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Social Icons */}
        <div className="hidden max-md:block mt-2 mb-6">
          <SocialIcons className="justify-start max-xs:justify-between" />
        </div>

        {/* Copyright */}
        <Link
          href="https://www.halo-lab.com/"
          target="_blank"
          className="text-white/50 tracking-[0.02em] uppercase items-center -ml-[6px] text-xs no-underline inline-block max-xs:text-center max-xs:mx-auto max-xs:block"
        >
          <Image
            src="/Assets/logo-copyright.svg"
            alt="Halo Lab"
            width={24}
            height={24}
            className="mr-[6px] inline-block align-middle"
          />
          <span className="inline-block relative top-1">
            2021 Halo Lab © All rights reserved
          </span>
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="z-[-1] w-full absolute inset-0 overflow-hidden">
        <Image
          src="/Assets/footer_hand.png"
          alt=""
          width={132}
          height={200}
          className="absolute bottom-[56px] left-0 block max-lg:hidden"
          aria-hidden="true"
        />
        <Image
          src="/Assets/footer_rectangle.png"
          alt=""
          width={200}
          height={200}
          className="absolute bottom-[-20px] right-[-90px] block max-lg:hidden"
          aria-hidden="true"
        />
        {/* Mobile decorative element */}
        <div className="hidden max-lg:block absolute bottom-[56px] right-0 max-xs:bottom-[420px]">
          <Image
            src="/Assets/footer_hand.png"
            alt=""
            width={132}
            height={200}
            className="w-[82px] relative"
            style={{ transform: "rotateY(-180deg)" }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Like & Follow Bar */}
      <div className="bg-dark border-t border-[#29242a] flex justify-center items-center min-h-[56px] mt-16 -mx-8 text-base max-lg:mt-8 max-xs:pt-6 max-xs:pb-6">
        <div className="z-[1] text-white/60 text-center tracking-[0.02em] uppercase text-xs leading-[1.5em] relative max-xs:max-w-[240px] max-xs:items-start max-xs:pl-0">
          <span
            className="z-[-1] inline-block relative top-[-10px] right-[-4px] w-10 h-10 -my-5 -ml-[10px] bg-center bg-no-repeat bg-contain max-xs:top-[-12px] max-xs:right-[-5px]"
            style={{
              backgroundImage: "url(/Assets/follow-heart.svg)",
            }}
          >
            {" "}
          </span>
          <Link
            href="https://webflow.com/website/history-virtual-museum"
            target="_blank"
            className="text-white inline-block no-underline"
          >
            Like
          </Link>{" "}
          <span className="text-white">&amp;</span>{" "}
          <Link
            href="https://webflow.com/halolab"
            target="_blank"
            className="text-white inline-block no-underline"
          >
            Follow
          </Link>{" "}
          from you. New free to use projects from us.
        </div>
      </div>
    </footer>
  );
}
