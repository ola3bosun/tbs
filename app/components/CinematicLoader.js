"use client";

import { useEffect, useState, useRef } from "react";

// ==========================================
// CHANGE THIS TO PREVIEW DIFFERENT LOADERS:
// Options: "classic", "fluid", "zoom", "decryption", "audio"
// ==========================================
const ACTIVE_VARIANT = "decryption";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?/[]{}~^";

export default function CinematicLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1); // 1: Counting, 2: Transitioning, 3: Done
  const [scrambledText, setScrambledText] = useState("");
  
  // Audio variant specific state
  const [bars, setBars] = useState([20, 50, 80, 40, 60]); 
  const audioRafRef = useRef(null);

  useEffect(() => {
    const duration = 1800;
    const startTime = performance.now();

    const easeOutExpo = (x) => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(rawProgress);
      const currentVal = Math.floor(easedProgress * 100);

      setProgress(currentVal);

      // Decryption Logic
      if (ACTIVE_VARIANT === "decryption") {
        const target = "OLATUBOSUN DIYAOLU";
        const lockedCount = Math.floor(rawProgress * target.length);
        const scrambled = target
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < lockedCount) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
        setScrambledText(scrambled);
      }

      if (rawProgress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Time to wait after 100% before starting the opening animation
        const transitionDelay = ACTIVE_VARIANT === "decryption" ? 800 : 150;
        
        // Duration of the opening animation based on the chosen variant
        const animationDurations = {
          decryption: 1200,
          classic: 900,
          fluid: 1500,
          zoom: 1200,
          audio: 900,
        };
        const activeDuration = animationDurations[ACTIVE_VARIANT] || 1000;

        // Phase 1 -> Phase 2: Start opening the loader doors/effects
        const t1 = setTimeout(() => {
          setPhase(2);
        }, transitionDelay);

        // Phase 2 -> Phase 3: Wait for opening animation to fully complete, then finish
        const t2 = setTimeout(() => {
          setPhase(3);
          if (onComplete) {
            onComplete();
          }
        }, transitionDelay + activeDuration + 50);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    };

    requestAnimationFrame(updateCounter);
  }, [onComplete]);

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
        audioRafRef.current = setTimeout(() => requestAnimationFrame(animateBars), 100);
      }
    };
    
    animateBars();
    return () => clearTimeout(audioRafRef.current);
  }, [phase]);


  if (phase === 3) return null;

  // -------------------------------------------------------------
  // VARIANT 1: CLASSIC BLAST DOORS
  // -------------------------------------------------------------
  if (ACTIVE_VARIANT === "classic") {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center font-mono overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full bg-[#0a0a0a] will-change-[height] transition-all duration-[900ms]"
          style={{
            height: phase === 1 ? "50vh" : "0vh",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full bg-[#0a0a0a] will-change-[height] transition-all duration-[900ms]"
          style={{
            height: phase === 1 ? "50vh" : "0vh",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
          style={{
            opacity: phase === 1 ? 1 : 0,
            transform: `translate(-50%, -50%) scale(${1 + (progress / 100) * 0.05})`,
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
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center font-mono overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[#0a0a0a] transition-all duration-[1500ms]"
          style={{
            borderStyle: 'solid',
            borderWidth: '150vmax',
            width: phase === 1 ? '0vmax' : '350vmax',
            height: phase === 1 ? '0vmax' : '350vmax',
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)"
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
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center font-mono overflow-hidden bg-transparent">
        {/* Background that fades out */}
        <div 
          className="absolute inset-0 bg-[#0a0a0a] transition-opacity duration-700" 
          style={{ opacity: phase === 1 ? 1 : 0 }}
        />
        <div
          className="relative transition-all duration-[1200ms] flex items-center justify-center text-[#ecdfcc]"
          style={{
            transform: phase === 1 ? 'scale(1)' : 'scale(150)',
            opacity: phase === 1 ? 1 : 0, // Fades out completely as it swallows the camera
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
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center font-mono overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full bg-[#0a0a0a] transition-all duration-[1200ms]"
          style={{
            height: phase === 1 ? "50vh" : "0vh",
            transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full bg-[#0a0a0a] transition-all duration-[1200ms]"
          style={{
            height: phase === 1 ? "50vh" : "0vh",
            transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
          style={{ opacity: phase === 1 ? 1 : 0 }}
        >
          <span className="text-[12px] sm:text-sm tracking-[0.25em] sm:tracking-[0.4em] text-[#ecdfcc] font-mono whitespace-nowrap">
            [{scrambledText}]
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
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center font-mono overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full bg-[#0a0a0a] transition-all duration-[900ms]"
          style={{
            height: phase === 1 ? "50vh" : "0vh",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full bg-[#0a0a0a] transition-all duration-[900ms]"
          style={{
            height: phase === 1 ? "50vh" : "0vh",
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
                style={{ height: phase === 1 ? `${height}%` : '2px' }}
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
