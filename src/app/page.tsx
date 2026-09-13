"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ExpositionSection from "@/components/ExpositionSection";
import MediaSection from "@/components/MediaSection";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import { useState } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const noop = () => {};

  return (
    <>
      <LoadingScreen onLoaded={() => setIsLoaded(true)} duration={3000} />
      <main className="noise-bg relative">
        <Header onOpenModal={noop} isLoaded={isLoaded} />
        <HeroSection onOpenModal={noop} isLoaded={isLoaded} />
        <ExpositionSection onOpenModal={noop} />
        <MediaSection onOpenModal={noop} />
        <Footer onOpenModal={noop} />
      </main>
    </>
  );
}
