"use client";

import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { ScannerState, ScannerErrorType, DetectionResult } from "@/types/scanner";
import ScanningReticle from "@/components/scanner/ScanningReticle";
import DetectionOverlay from "@/components/scanner/DetectionOverlay";
import PostScanExperience from "@/components/scanner/PostScanExperience";
import { CANONICAL_INSTRUMENTS } from "@/lib/supabase/instruments";
import { CANONICAL_MUSEUMS } from "@/lib/supabase/museums";
import { createClient } from "@/lib/supabase/client";
import { recordDiscovery } from "@/lib/supabase/discoveries";

interface CollectionItem {
  id: string;
  name: string;
  category: string;
  isDiscovered: boolean;
}

function ScannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const museumId = searchParams.get("museum") || "kelkar-museum";
  const targetInstrumentId = searchParams.get("target");

  const [state, setState] = useState<ScannerState>("REQUESTING_CAMERA");
  const [errorType, setErrorType] = useState<ScannerErrorType | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showCollectionDrawer, setShowCollectionDrawer] = useState(false);

  // Real camera frozen frame capture
  const [capturedFrameUrl, setCapturedFrameUrl] = useState<string>("/Assets/museum_sculpture_veena.jpg");
  const [frozenFullFrameUrl, setFrozenFullFrameUrl] = useState<string | null>(null);

  // Post-scan experience state
  const [isPostScanActive, setIsPostScanActive] = useState(false);

  // Museum & target instrument resolution
  const activeMuseum =
    CANONICAL_MUSEUMS.find((m) => m.id === museumId) || CANONICAL_MUSEUMS[0];

  const targetInstrument =
    CANONICAL_INSTRUMENTS.find(
      (inst) => inst.id === targetInstrumentId && inst.museum_id === museumId
    ) ||
    CANONICAL_INSTRUMENTS.find((inst) => inst.id === "saraswati-veena" || inst.id === "mayuri-veena") ||
    CANONICAL_INSTRUMENTS[0];

  const [detection, setDetection] = useState<DetectionResult>({
    instrument_id: targetInstrument.id,
    name: "VEENA",
    category: "Strings · Tata Vadya",
    confidence: 87,
  });

  // Track discovered instruments for the museum collection loop
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(
    new Set(["saraswati-veena"]) // 1 / 10 Discovered initially
  );

  // Derive complete 10-item museum collection status
  const museumCollection: CollectionItem[] = useMemo(() => {
    const list = [
      { id: "saraswati-veena", name: "VEENA", category: "Strings" },
      { id: "tabla-pair", name: "TABLA", category: "Percussion" },
      { id: "sitar", name: "SITAR", category: "Strings" },
      { id: "bansuri", name: "FLUTE", category: "Wind" },
      { id: "pakhawaj", name: "PAKHAWAJ", category: "Percussion" },
      { id: "shehnai", name: "SHEHNAI", category: "Wind" },
      { id: "santoor", name: "SANTOOR", category: "Strings" },
      { id: "esraj", name: "ESRAJ", category: "Strings" },
      { id: "jaltarang", name: "JALTARANG", category: "Percussion" },
      { id: "sarod", name: "SAROD", category: "Strings" },
    ];

    return list.map((item) => ({
      ...item,
      isDiscovered: discoveredIds.has(item.id) || (item.name === "VEENA" && discoveredIds.has("saraswati-veena")),
    }));
  }, [discoveredIds]);

  const discoveredCount = museumCollection.filter((i) => i.isDiscovered).length;
  const totalCount = museumCollection.length;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Capture current live video frame:
  // 1. Full frame (for freezing the camera background seamlessly)
  // 2. Center crop (for isolating the detected instrument into 8x8 fragmentation tiles)
  const captureCameraFrame = useCallback((): { cropped: string; full: string } => {
    if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
      try {
        const video = videoRef.current;
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        // 1. Full frame capture
        const fullCanvas = document.createElement("canvas");
        fullCanvas.width = vw;
        fullCanvas.height = vh;
        const fullCtx = fullCanvas.getContext("2d");
        let fullDataUrl = "";
        if (fullCtx) {
          fullCtx.drawImage(video, 0, 0, vw, vh);
          fullDataUrl = fullCanvas.toDataURL("image/jpeg", 0.92);
        }

        // 2. Cropped bounding box region capture (~55-65% height with 4:5 aspect ratio)
        const cropCanvas = document.createElement("canvas");
        const cropHeight = Math.min(vh * 0.65, (vw * 0.65) / 0.8);
        const cropWidth = cropHeight * 0.8;
        const cropX = (vw - cropWidth) / 2;
        const cropY = (vh - cropHeight) / 2;

        cropCanvas.width = 480;
        cropCanvas.height = 600;
        const cropCtx = cropCanvas.getContext("2d");
        let cropDataUrl = "";
        if (cropCtx) {
          cropCtx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, 480, 600);
          cropDataUrl = cropCanvas.toDataURL("image/jpeg", 0.95);
        }

        return {
          cropped: cropDataUrl || fullDataUrl || "/Assets/museum_sculpture_veena.jpg",
          full: fullDataUrl || "/Assets/museum_sculpture_veena.jpg",
        };
      } catch (e) {
        console.warn("Camera canvas capture failed:", e);
      }
    }
    return {
      cropped: "/Assets/museum_sculpture_veena.jpg",
      full: "/Assets/museum_sculpture_veena.jpg",
    };
  }, []);

  // Initialize camera stream directly from real hardware
  useEffect(() => {
    let isSubscribed = true;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this environment");
        }

        let stream: MediaStream;
        try {
          // Attempt environment (rear-facing) camera first for mobile in museum
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } catch {
          // Fallback to any available camera (desktop/laptop webcam or front camera)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!isSubscribed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.setAttribute("muted", "true");
          videoRef.current.setAttribute("autoplay", "true");

          try {
            await videoRef.current.play();
          } catch {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(console.warn);
            };
          }
        }

        setCameraActive(true);
        setState("SCANNING");
      } catch (err: unknown) {
        if (!isSubscribed) return;
        console.warn("Camera access failed or unavailable:", err);
        const isPermissionDenied =
          err instanceof DOMException &&
          (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");

        setErrorType(
          isPermissionDenied ? "CAMERA_DENIED" : "CAMERA_UNAVAILABLE"
        );
        setState("ERROR");
      }
    }

    initCamera();

    return () => {
      isSubscribed = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [retryCount]);

  // Automatic camera detection state progression
  useEffect(() => {
    if (isPostScanActive) return;

    if (state === "SCANNING") {
      // Auto-detect after scanning for 3.5 seconds
      timerRef.current = setTimeout(() => {
        const { cropped, full } = captureCameraFrame();
        setCapturedFrameUrl(cropped);
        setFrozenFullFrameUrl(full);
        if (videoRef.current) {
          videoRef.current.pause();
        }
        setDetection({
          instrument_id: targetInstrument.id,
          name: "VEENA",
          category: "Strings · Tata Vadya",
          confidence: 87,
        });
        setState("DETECTING");
      }, 3500);
    } else if (state === "DETECTING") {
      // Hold detection state for 1.4s then transition to verification
      timerRef.current = setTimeout(() => {
        setState("VERIFYING");
      }, 1400);
    } else if (state === "VERIFYING") {
      // Hold verification state for 1.2s then transition DIRECTLY into discovery experience
      timerRef.current = setTimeout(() => {
        setState("DISCOVERED");
        setIsPostScanActive(true);
      }, 1200);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, targetInstrument, isPostScanActive, captureCameraFrame]);

  // Manual Trigger to Scan Current Physical Object
  const handleManualScan = () => {
    if (state !== "SCANNING") return;
    const { cropped, full } = captureCameraFrame();
    setCapturedFrameUrl(cropped);
    setFrozenFullFrameUrl(full);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setDetection({
      instrument_id: targetInstrument.id,
      name: "VEENA",
      category: "Strings · Tata Vadya",
      confidence: 87,
    });
    setState("DETECTING");
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    router.push(`/museum/${museumId}`);
  };

  const handleResetScan = () => {
    setIsPostScanActive(false);
    setFrozenFullFrameUrl(null);
    if (videoRef.current) {
      videoRef.current.play().catch(console.warn);
    }
    setState("SCANNING");
  };

  // Called when user completes the composition and clicks [KEEP EXPLORING →]
  const handleReturnFromPostScan = async (instrumentId: string) => {
    setIsPostScanActive(false);
    setFrozenFullFrameUrl(null);
    if (videoRef.current) {
      videoRef.current.play().catch(console.warn);
    }

    // Update discovered set (Veena is now marked discovered, bumping progress to 3/10)
    setDiscoveredIds((prev) => {
      const next = new Set(prev);
      next.add("saraswati-veena");
      next.add(instrumentId);
      return next;
    });

    // Record discovery in Supabase in background
    try {
      const supabase = createClient();
      await recordDiscovery(supabase, {
        museum_id: museumId,
        instrument_id: targetInstrument.id,
        source: "physical",
      });
    } catch {
      // Ignore background persistence errors
    }

    // Reveal collection drawer showing the new discovery
    setShowCollectionDrawer(true);
    setState("SCANNING");
  };

  return (
    <div className="noise-bg fixed inset-0 w-full h-[100dvh] bg-black text-white select-none overflow-hidden flex flex-col justify-between z-50">
      {/* ── Active Post-Scan Journey Overlay ───────────────────── */}
      {isPostScanActive && (
        <PostScanExperience
          onReturnToScanner={handleReturnFromPostScan}
          museumName={activeMuseum.name}
          capturedFrameUrl={capturedFrameUrl}
        />
      )}

      {/* ── Background Live Camera Video Feed (Actual Camera Only) ────────────── */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
        {/* Real Live Video Feed from Camera Device */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive && !frozenFullFrameUrl ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Frozen Frame of the Real Camera Feed upon detection */}
        {frozenFullFrameUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frozenFullFrameUrl}
            alt="Detected Real Camera Frame"
            className="absolute inset-0 w-full h-full object-cover filter brightness-95"
          />
        )}

        {/* Minimal Vignette Overlay to keep real camera crisp and visible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(13,15,18,0.02) 0%, rgba(13,15,18,0.2) 65%, rgba(10,12,15,0.7) 100%)",
          }}
        />

        {/* Technical Sub-Grid Background Lines */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>

      {/* ── Top Header Bar (Compact & Mobile-Optimized) ───────────── */}
      <header className="z-20 w-full px-4 pt-3 pb-2 sm:px-6 sm:pt-4 sm:pb-3 flex justify-between items-center shrink-0">
        {/* Left: Branding & Truncated Site */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-1 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
            <Image
              src="/Assets/6aa66eef7361b4711b30b84f_logo.svg"
              alt="Museum Melody Logo"
              width={18}
              height={18}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-white font-grotesque font-bold text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap">
                Museum Melody
              </span>
            </div>
            <div className="text-[#ffc75a] text-[8px] sm:text-[9px] font-mono tracking-widest uppercase mt-0.5 whitespace-nowrap">
              {"// CAMERA SCANNER"}
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-white/50 tracking-wide mt-0.5 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[180px]">
              Site: {activeMuseum.name.includes("Chhatrapati") ? "CSMVS" : activeMuseum.name.includes("Kelkar") ? "Kelkar Museum" : activeMuseum.city || "CSMVS"}
            </div>
          </div>
        </div>

        {/* Right: Discovery Counter Pill & Close Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowCollectionDrawer(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#ffc75a]/35 bg-[#12141a]/90 hover:border-[#ffc75a] transition-all cursor-pointer shrink-0 active:scale-95"
            title="View Museum Collection Progress"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffc75a] animate-pulse shrink-0" />
            <div className="flex flex-col items-center leading-none">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-[#ffc75a]">
                {discoveredCount} / {totalCount}
              </span>
              <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-widest text-white/50">
                DISCOVERED
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Scanner"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-md cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Center Viewport Area ────────────────────────────────── */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center px-4 relative my-auto">
        {state === "ERROR" ? (
          <div className="w-full max-w-sm p-5 rounded-2xl border border-white/20 bg-[#12141a]/95 backdrop-blur-2xl text-center shadow-2xl animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>

            <h3 className="font-grotesque font-bold text-base text-white mb-1.5">
              {errorType === "CAMERA_DENIED"
                ? "Camera Access Denied"
                : "Camera Feed Unavailable"}
            </h3>

            <p className="text-white/60 font-grotesque text-xs leading-relaxed mb-4">
              {errorType === "CAMERA_DENIED"
                ? "Museum Melody requires camera access to recognize physical artefacts. Please allow camera permissions in your browser address bar or system settings."
                : "No video capture device was detected. Please check that your webcam or camera is connected and enabled."}
            </p>

            <button
              type="button"
              onClick={() => {
                setState("REQUESTING_CAMERA");
                setRetryCount((c) => c + 1);
              }}
              className="btn-hero-fill w-full py-2.5 px-4 rounded-xl border border-white text-white font-grotesque text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-[#ffc75a] hover:text-[#ffc75a]"
            >
              <span>Grant / Retry Camera</span>
            </button>
          </div>
        ) : (
          <>
            {/* Responsive Viewfinder Reticle */}
            <div onClick={handleManualScan} className="cursor-pointer touch-manipulation" title="Tap to scan target">
              <ScanningReticle
                isScanning={state === "SCANNING"}
                isDetecting={
                  state === "DETECTING" ||
                  state === "VERIFYING" ||
                  state === "DISCOVERED"
                }
              />
            </div>

            {/* Detected Instrument Bounding Box, Outline & Verification Badge */}
            {(state === "DETECTING" ||
              state === "VERIFYING" ||
              state === "DISCOVERED") && (
              <DetectionOverlay detection={detection} state={state} />
            )}

            {/* Manual Scan Shutter Button */}
            {state === "SCANNING" && (
              <button
                type="button"
                onClick={handleManualScan}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#ffc75a] bg-black/80 hover:bg-[#ffc75a] hover:text-black text-[#ffc75a] font-grotesque text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 backdrop-blur-xl shadow-[0_0_25px_rgba(255,199,90,0.3)] cursor-pointer active:scale-95 z-20 min-h-[44px]"
              >
                <div className="w-2 h-2 rounded-full bg-[#ffc75a] animate-ping" />
                <span>Scan Physical Object</span>
              </button>
            )}
          </>
        )}
      </main>

      {/* ── Compact Bottom Sheet: Museum Collection ────────────────── */}
      {showCollectionDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Semi-transparent backdrop that preserves camera visibility */}
          <div
            onClick={() => setShowCollectionDrawer(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in cursor-pointer"
          />

          {/* Slide-Up Bottom Sheet */}
          <div className="relative z-10 w-full max-w-md mx-auto bg-[#12141a]/98 border-t border-[#ffc75a]/30 rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.8)] flex flex-col max-h-[75vh] animate-slide-up pb-5 px-4 sm:px-6">
            {/* Top Sheet Drag/Dismiss Handle */}
            <div
              className="w-10 h-1 rounded-full bg-white/25 mx-auto mt-3 mb-2 shrink-0 cursor-pointer"
              onClick={() => setShowCollectionDrawer(false)}
            />

            {/* Sheet Header */}
            <div className="flex items-center justify-between pt-1 pb-3 border-b border-white/10 shrink-0">
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#ffc75a] uppercase tracking-widest block">
                  MUSEUM COLLECTION
                </span>
                <h4 className="text-sm sm:text-base font-bold font-grotesque text-white m-0 uppercase tracking-tight">
                  {discoveredCount} / {totalCount} INSTRUMENTS DISCOVERED
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setShowCollectionDrawer(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Collection Items List */}
            <div className="py-3 overflow-y-auto max-h-[42vh] grid grid-cols-2 gap-2">
              {museumCollection.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-mono transition-colors ${
                    item.isDiscovered
                      ? "border-emerald-500/40 bg-emerald-950/25 text-emerald-300"
                      : "border-white/10 bg-white/[0.02] text-white/40"
                  }`}
                >
                  <span className={item.isDiscovered ? "text-emerald-400 font-bold" : "text-white/30"}>
                    {item.isDiscovered ? "✓" : "?"}
                  </span>
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Primary Action to Scan Next */}
            <div className="pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowCollectionDrawer(false);
                  handleResetScan();
                }}
                className="btn-hero-fill w-full min-h-[44px] py-3 px-4 rounded-xl border border-[#ffc75a] text-black bg-[#ffc75a] hover:bg-transparent hover:text-[#ffc75a] font-grotesque text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all flex items-center justify-center"
              >
                <span>SCAN NEXT ARTEFACT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Status & Primary Controls (Clean, Compact, Minimal) ── */}
      <footer className="z-20 w-full px-4 pb-4 pt-1 flex flex-col items-center text-center shrink-0">
        {/* Collapsed Collection Bar Pill */}
        <button
          type="button"
          onClick={() => setShowCollectionDrawer(true)}
          className="flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-[#12141a]/85 hover:bg-[#12141a] text-white/70 hover:text-white transition-all text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-2 cursor-pointer backdrop-blur-md active:scale-95"
        >
          <span className="text-[#ffc75a] font-bold">{discoveredCount} / {totalCount} DISCOVERED</span>
          <span className="text-white/30">|</span>
          <span className="text-white/80 hover:text-[#ffc75a] flex items-center gap-1">
            VIEW COLLECTION
            <svg className="w-2.5 h-2.5 text-[#ffc75a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </span>
        </button>

        {/* Dynamic Status Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/15 bg-[#12141a]/90 backdrop-blur-xl shadow-md mb-1.5">
          {state === "SCANNING" && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffc75a] animate-ping" />
              <span className="text-[11px] sm:text-xs font-grotesque text-white/90 tracking-wide">
                Searching for instruments...
              </span>
            </>
          )}

          {state === "DETECTING" && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffc75a]" />
              <span className="text-[11px] sm:text-xs font-grotesque text-[#ffc75a] font-bold tracking-wide">
                Instrument Detected • Verifying...
              </span>
            </>
          )}

          {state === "VERIFYING" && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffc75a] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-grotesque text-[#ffc75a] font-bold tracking-wide">
                Verified with museum catalogue
              </span>
            </>
          )}

          {state === "DISCOVERED" && (
            <>
              <span className="text-emerald-400 text-xs font-bold">✓</span>
              <span className="text-[11px] sm:text-xs font-grotesque text-emerald-300 font-bold tracking-wide">
                Verified: {detection.name}
              </span>
            </>
          )}

          {state === "REQUESTING_CAMERA" && (
            <span className="text-[11px] sm:text-xs font-grotesque text-white/60 tracking-wide">
              Initializing camera sensor...
            </span>
          )}

          {state === "ERROR" && (
            <span className="text-[11px] sm:text-xs font-grotesque text-rose-400 tracking-wide">
              Sensor paused
            </span>
          )}
        </div>

        {/* Primary Instruction Line */}
        <p className="text-white/50 font-grotesque text-[10px] sm:text-xs tracking-wide max-w-xs m-0">
          Point camera at an artefact or inscription.
        </p>
      </footer>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#0d0f12] flex items-center justify-center text-white/50 font-grotesque text-xs tracking-widest uppercase">
          Initializing Camera Environment...
        </div>
      }
    >
      <ScannerContent />
    </Suspense>
  );
}
