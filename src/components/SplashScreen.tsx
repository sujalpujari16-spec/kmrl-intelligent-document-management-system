import React, { useEffect, useState, useRef } from "react";
import { KmrlLogo } from "./KmrlLogo";
import { MetroScene } from "./MetroScene";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const start = performance.now();
    const duration = 3200; // 3.2s cinematic intro animation
    let raf = 0;
    let finished = false;

    const completeSplash = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      setLeaving(true);
      setTimeout(() => {
        onCompleteRef.current();
      }, 700);
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100 && !finished) {
        raf = requestAnimationFrame(tick);
      } else {
        completeSplash();
      }
    };

    raf = requestAnimationFrame(tick);

    // Guaranteed safety timer
    const fallbackTimer = setTimeout(completeSplash, duration + 400);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#0b1a2b] transition-all duration-700 ${
        leaving ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{ transition: "opacity 0.7s ease, transform 0.8s ease" }}
    >
      {/* 3D metro rail animation */}
      <div className="absolute inset-0">
        <MetroScene />
      </div>

      {/* Top vignette for logo legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#0b1a2b]/85 via-[#0b1a2b]/40 to-transparent" />
      {/* Bottom vignette for progress legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0b1a2b]/90 via-[#0b1a2b]/50 to-transparent" />

      {/* Logo + wordmark */}
      <div
        className="animate-logo-in absolute left-1/2 top-16 z-10 flex -translate-x-1/2 flex-col items-center pointer-events-none"
      >
        <KmrlLogo className="items-center" markClassName="h-16 drop-shadow-[0_4px_24px_rgba(124,199,212,0.5)]" invert />
      </div>

      {/* Caption */}
      <div
        className="animate-fade-up absolute left-1/2 bottom-32 z-10 -translate-x-1/2 text-center pointer-events-none px-4 max-w-lg"
        style={{ animationDelay: "0.6s" }}
      >
        <p className="text-lg font-semibold tracking-tight text-white/95">
          KMRL Intelligent Document Management System
        </p>
        <p className="mt-1 text-xs font-medium tracking-[0.25em] uppercase text-[#7cc7d4]">
          AI-POWERED DOCUMENT INTELLIGENCE
        </p>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-16 left-1/2 z-10 w-72 -translate-x-1/2 pointer-events-none">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4aa8b8] to-[#7cc7d4] shadow-[0_0_12px_rgba(124,199,212,0.8)] transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs font-medium tracking-wider text-white/60">
          <span className="tracking-[0.15em] uppercase text-[10px]">INITIALIZING AI WORKSPACE</span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
