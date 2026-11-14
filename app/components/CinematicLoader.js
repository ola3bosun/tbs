"use client";

import { useEffect, useState, useRef } from "react";
import { useProgress } from "@react-three/drei";

// ==========================================
// CHANGE THIS TO PREVIEW DIFFERENT LOADERS:
// Options: "classic", "fluid", "zoom", "decryption", "audio"
// ==========================================
const ACTIVE_VARIANT = "decryption";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?/[]{}~^";
const TARGET_NAME = "OLATUBOSUN DIYAOLU";
const INITIAL_SCRAMBLE = "X#9K@7M$2P !8Q&4Z%";

export default function CinematicLoader({ onRevealStart, onComplete }) {
  const { active: webglLoading, progress: webglProgress, total } = useProgress();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1); // 1: Counting, 2: Transitioning, 3: Done
  const [scrambledText, setScrambledText] = useState(INITIAL_SCRAMBLE);

  // Refs to read live asset readiness inside the RAF loop without restarting it
  const webglReadyRef = useRef(false);
  const webglProgressRef = useRef(0);
  const callbacksRef = useRef({ onRevealStart, onComplete });

  useEffect(() => {
    callbacksRef.current = { onRevealStart, onComplete };
  }, [onRevealStart, onComplete]);

  useEffect(() => {
    webglProgressRef.current = webglProgress;
    // Mark WebGL ready once drei's DefaultLoadingManager finishes or when all tracked items complete
    if (!webglLoading && (total > 0 ? webglProgress >= 100 : true)) {
      webglReadyRef.current = true;
    }
  }, [webglLoading, webglProgress, total]);

  // Audio variant specific state
  const [bars, setBars] = useState([20, 50, 80, 40, 60]);
  const audioRafRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const minDuration = prefersReducedMotion ? 400 : 1800;
    const maxWaitFallback = 4500;
    const startTime = performance.now();
    let lastScrambleTick = 0;
    let rafId = null;
    let t1 = null;
    let t2 = null;

    const easeOutExpo = (x) => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const timeProgress = Math.min(elapsed / minDuration, 1);
      const easedTime = easeOutExpo(timeProgress);

      // Blend minimum cinematic timer with real Three.js texture/environment progress
      const assetFactor = webglReadyRef.current
        ? 1
        : Math.max(webglProgressRef.current / 100, timeProgress * 0.92);
      const blendedProgress =
        elapsed > maxWaitFallback ? 1 : Math.min(easedTime, assetFactor);

      const isComplete =
        (timeProgress >= 1 && webglReadyRef.current) ||
        elapsed > maxWaitFallback;

      const currentVal = isComplete
        ? 100
        : Math.min(99, Math.floor(blendedProgress * 100));

      setProgress(currentVal);

      // Throttled Decryption Logic (~45ms cadence for tactile mechanical glyph locking)
      if (ACTIVE_VARIANT === "decryption") {
        if (isComplete) {
          setScrambledText(TARGET_NAME);
        } else if (currentTime - lastScrambleTick >= 45) {
          lastScrambleTick = currentTime;
          const lockedCount = Math.floor(blendedProgress * TARGET_NAME.length);
          const scrambled = TARGET_NAME.split("")
            .map((char, i) => {
              if (char === " ") return " ";
              if (i < lockedCount) return char;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("");
          setScrambledText(scrambled);
        }
      }

      if (!isComplete) {
        rafId = requestAnimationFrame(updateCounter);
      } else {
        // Time to hold at 100% / locked cipher before parting the blast doors
        const transitionDelay = prefersReducedMotion
          ? 100
          : ACTIVE_VARIANT === "decryption"
          ? 550
          : 150;

        // Duration of the opening animation based on the chosen variant
        const animationDurations = {
          decryption: 1150,
          classic: 900,
          fluid: 1500,
          zoom: 1200,
          audio: 900,
        };
        const activeDuration = prefersReducedMotion
          ? 300
          : animationDurations[ACTIVE_VARIANT] || 1000;

        // Phase 1 -> Phase 2: Part the loader doors and trigger Act II scene choreography
        t1 = setTimeout(() => {
          setPhase(2);
          if (callbacksRef.current.onRevealStart) {
            callbacksRef.current.onRevealStart();
          }
        }, transitionDelay);

        // Phase 2 -> Phase 3: Unmount once shutters finish parting
        t2 = setTimeout(() => {
          setPhase(3);
          if (callbacksRef.current.onComplete) {
            callbacksRef.current.onComplete();
          }
        }, transitionDelay + activeDuration + 50);
      }
    };

    rafId = requestAnimationFrame(updateCounter);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, []);

  // Audio bars randomizer
  useEffect(() => {
    if (ACTIVE_VARIANT !== "audio") return;

    const animateBars = () => {
      if (phase === 1) {
        setBars([
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
        ]);
        audioRafRef.current = setTimeout(
          () => requestAnimationFrame(animateBars),
          100
        );
      }
    };

    animateBars();
    return () => clearTimeout(audioRafRef.current);
  }, [phase]);

  if (phase === 3) return null;

  // Block pointer interactions during Phase 1 so users don't drag the hidden 3D scene
  const pointerClass =
    phase === 1 ? "pointer-events-auto" : "pointer-events-none";

  // -------------------------------------------------------------
  // VARIANT 1: CLASSIC BLAST DOORS
  // -------------------------------------------------------------
  if (ACTIVE_VARIANT === "classic") {
    return (
      <div
        className={`fixed inset-0 z-50 ${pointerClass} flex items-center justify-center font-mono overflow-hidden`}
      >
        <div
          className="absolute top-0 left-0 w-full h-[50vh] bg-[#0a0a0a] will-change-transform transition-transform duration-[900ms]"
          style={{
            transform:
              phase === 1 ? "translate3d(0, 0%, 0)" : "translate3d(0, -100%, 0)",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-[50vh] bg-[#0a0a0a] will-change-transform transition-transform duration-[900ms]"
          style={{
            transform:
              phase === 1 ? "translate3d(0, 0%, 0)" : "translate3d(0, 100%, 0)",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
          style={{
            opacity: phase === 1 ? 1 : 0,
            transform: `translate(-50%, -50%) scale(${
              1 + (progress / 100) * 0.05
            })`,
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 text-[#f4efe9]">
            <span className="w-1.5 h-1.5 bg-[#f4efe9] animate-pulse rounded-full shrink-0" />
            <span className="text-[9px] sm:text-xs tracking-[0.25em] sm:tracking-[0.4em] font-light uppercase whitespace-nowrap">
              SYS. BOOTING // {progress.toString().padStart(3, "0")}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 2: FLUID DISSOLVE
  // -------------------------------------------------------------
  if (ACTIVE_VARIANT === "fluid") {
    return (
      <div
        className={`fixed inset-0 z-50 ${pointerClass} flex items-center justify-center font-mono overflow-hidden`}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[#0a0a0a] transition-all duration-[1500ms]"
          style={{
            borderStyle: "solid",
            borderWidth: "150vmax",
            width: phase === 1 ? "0vmax" : "350vmax",
            height: phase === 1 ? "0vmax" : "350vmax",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
          style={{ opacity: phase === 1 ? 1 : 0 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 text-[#f4efe9]">
            <span className="w-1.5 h-1.5 bg-[#f4efe9] animate-pulse rounded-full shrink-0 blur-[1px]" />
            <span className="text-[9px] sm:text-xs tracking-[0.25em] sm:tracking-[0.4em] font-light uppercase whitespace-nowrap">
              LIQUID_SYNC // {progress.toString().padStart(3, "0")}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 3: KINETIC ZOOM
  // -------------------------------------------------------------
  if (ACTIVE_VARIANT === "zoom") {
    return (
      <div
        className={`fixed inset-0 z-50 ${pointerClass} flex items-center justify-center font-mono overflow-hidden bg-transparent`}
      >
        {/* Background that fades out */}
        <div
          className="absolute inset-0 bg-[#0a0a0a] transition-opacity duration-700"
          style={{ opacity: phase === 1 ? 1 : 0 }}
        />
        <div
          className="relative transition-all duration-[1200ms] flex items-center justify-center text-[#ecdfcc] will-change-transform"
          style={{
            transform: phase === 1 ? "scale(1)" : "scale(150)",
            opacity: phase === 1 ? 1 : 0,
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        >
          <span className="font-expressive-script text-[20vw] leading-none absolute">
            O
          </span>
        </div>
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
          style={{ opacity: phase === 1 ? 1 : 0 }}
        >
          <span className="text-[9px] sm:text-xs tracking-[0.25em] sm:tracking-[0.4em] font-light uppercase whitespace-nowrap text-[#f4efe9]">
            INITIALIZING // {progress}%
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 4: MATRIX DECRYPTION
  // -------------------------------------------------------------
  if (ACTIVE_VARIANT === "decryption") {
    return (
      <div
        className={`fixed inset-0 z-50 ${pointerClass} flex items-center justify-center font-mono overflow-hidden`}
      >
        {/* Top GPU-composited blast door */}
        <div
          className="absolute top-0 left-0 w-full h-[50vh] bg-[#0a0a0a] border-b border-white/[0.06] will-change-transform transition-transform duration-[1150ms]"
          style={{
            transform:
              phase === 1 ? "translate3d(0, 0%, 0)" : "translate3d(0, -100%, 0)",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        {/* Bottom GPU-composited blast door */}
        <div
          className="absolute bottom-0 left-0 w-full h-[50vh] bg-[#0a0a0a] border-t border-white/[0.06] will-change-transform transition-transform duration-[1150ms]"
          style={{
            transform:
              phase === 1 ? "translate3d(0, 0%, 0)" : "translate3d(0, 100%, 0)",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        {/* Horizon progress hairline */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1px] bg-[#ecdfcc]/25 transition-opacity duration-300"
          style={{
            width: `${progress}%`,
            opacity: phase === 1 ? 1 : 0,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 bg-[#0a0a0a] px-4 py-1 transition-all duration-300"
          style={{
            opacity: phase === 1 ? 1 : 0,
            transform:
              phase === 1
                ? "translate3d(0, 0, 0) scale(1)"
                : "translate3d(0, 0, 0) scale(0.96)",
          }}
        >
          <span className="text-[12px] sm:text-sm tracking-[0.25em] sm:tracking-[0.4em] text-[#ecdfcc] font-mono whitespace-nowrap">
            [{scrambledText}]
          </span>
          <span className="text-[9px] tracking-[0.35em] text-neutral-500 uppercase">
            SYS.INIT // {progress.toString().padStart(3, "0")}%
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 5: AUDIO BOOT
  // -------------------------------------------------------------
  if (ACTIVE_VARIANT === "audio") {
    return (
      <div
        className={`fixed inset-0 z-50 ${pointerClass} flex items-center justify-center font-mono overflow-hidden`}
      >
        <div
          className="absolute top-0 left-0 w-full h-[50vh] bg-[#0a0a0a] will-change-transform transition-transform duration-[900ms]"
          style={{
            transform:
              phase === 1 ? "translate3d(0, 0%, 0)" : "translate3d(0, -100%, 0)",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-[50vh] bg-[#0a0a0a] will-change-transform transition-transform duration-[900ms]"
          style={{
            transform:
              phase === 1 ? "translate3d(0, 0%, 0)" : "translate3d(0, 100%, 0)",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
          style={{ opacity: phase === 1 ? 1 : 0 }}
        >
          <div className="flex items-end gap-1 mb-2 h-6">
            {bars.map((height, i) => (
              <div
                key={i}
                className="w-1 bg-[#ecdfcc] transition-all duration-100 ease-linear"
                style={{ height: phase === 1 ? `${height}%` : "2px" }}
              />
            ))}
          </div>
          <span className="text-[9px] sm:text-xs tracking-[0.25em] sm:tracking-[0.4em] font-light uppercase whitespace-nowrap text-[#555]">
            SYS. AUDIO // {progress.toString().padStart(3, "0")}%
          </span>
        </div>
      </div>
    );
  }

  return null;
}

