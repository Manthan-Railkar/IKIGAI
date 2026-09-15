"use client";

import { useEffect, useRef } from "react";
import { soundEngine } from "@/lib/audio/soundEngine";

interface AudioWaveformProps {
  isActive: boolean;
  className?: string;
  height?: number;
  barCount?: number;
  accentColor?: string;
  showMirror?: boolean;
}

export default function AudioWaveform({
  isActive,
  className = "",
  height = 56,
  barCount = 36,
  accentColor = "#e5a955",
  showMirror = true,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const analyser = soundEngine.getAnalyser();
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const render = () => {
      phase += 0.05;
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      if (analyser && dataArray && isActive) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barWidth = Math.max(2, (width / barCount) * 0.55);
      const gap = (width - barWidth * barCount) / (barCount - 1);
      const centerY = showMirror ? h / 2 : h;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap);

        let energy = 0;
        if (isActive && dataArray) {
          const dataIdx = Math.floor((i / barCount) * (dataArray.length * 0.45));
          energy = (dataArray[dataIdx] || 0) / 255;
        } else if (isActive) {
          energy = 0.25 + 0.35 * Math.sin(phase + i * 0.3);
        } else {
          // Resting subtle breathing wave
          energy = 0.06 + 0.05 * Math.sin(phase * 0.5 + i * 0.15);
        }

        const barH = Math.max(3, energy * (showMirror ? (h / 2) * 0.88 : h * 0.85));

        // Create warm gold gradient for each bar
        const grad = ctx.createLinearGradient(0, centerY - barH, 0, centerY + (showMirror ? barH : 0));
        grad.addColorStop(0, "rgba(255, 230, 160, 0.95)");
        grad.addColorStop(0.5, accentColor);
        grad.addColorStop(1, "rgba(200, 130, 40, 0.4)");

        ctx.fillStyle = grad;
        ctx.shadowBlur = isActive ? 8 : 2;
        ctx.shadowColor = "rgba(229, 169, 85, 0.6)";

        if (showMirror) {
          // Rounded pill bar centered vertically
          const topY = centerY - barH;
          const totalH = barH * 2;
          ctx.beginPath();
          ctx.roundRect(x, topY, barWidth, totalH, barWidth / 2);
          ctx.fill();
        } else {
          // Anchored to bottom
          ctx.beginPath();
          ctx.roundRect(x, h - barH, barWidth, barH, [barWidth / 2, barWidth / 2, 0, 0]);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive, barCount, accentColor, showMirror]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={360}
        height={height}
        className="w-full h-full max-w-[420px] pointer-events-none"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}
