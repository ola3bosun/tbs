// components/CinematicLoader.js
'use client';

import { useEffect, useState } from 'react';

export default function CinematicLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1); // 1: Counting, 2: Wiping open, 3: Unmounted

  useEffect(() => {
    // 1. Establish the custom easing counter for the telemetry boot sequence
    const duration = 1800; // 1.8 seconds total boot time
    const startTime = performance.now();

    // Exponential ease-out function: Starts fast, slows down sharply at the end
    const easeOutExpo = (x) => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(rawProgress);

      setProgress(Math.floor(easedProgress * 100));

      if (rawProgress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Counter finished -> trigger the Horizon Split
        setTimeout(() => setPhase(2), 150);
        
        // Wait for the wipe animation to finish before destroying the component
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1200); 
      }
    };

    // Kick off the counter
    requestAnimationFrame(updateCounter);
  }, [onComplete]);

  // If the loader is entirely finished, unmount it cleanly
  if (phase === 3) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center font-mono overflow-hidden">
      
      {/* TOP BLAST DOOR PLATE */}
      <div
        className="absolute top-0 left-0 w-full bg-[rgba(0,0,0,0.8)] will-change-[height] transition-all duration-[900ms]"
        style={{
          height: phase === 1 ? '50vh' : '0vh',
          transitionTimingFunction: 'cubic-bezier(0.86, 0, 0.07, 1)', // Snappy, cinematic exit curve
        }}
      />

      {/* BOTTOM BLAST DOOR PLATE */}
      <div
        className="absolute bottom-0 left-0 w-full bg-[rgba(0,0,0,0.8)] will-change-[height] transition-all duration-[900ms]"
        style={{
          height: phase === 1 ? '50vh' : '0vh',
          transitionTimingFunction: 'cubic-bezier(0.86, 0, 0.07, 1)', 
        }}
      />

      {/* THE HORIZON SPLIT LINE */}
      <div
        className="absolute top-1/2 left-0 w-full h-[1px] bg-[#f4efe9]/40 will-change-transform transition-all duration-[900ms]"
        style={{
          transform: phase === 1 ? 'scaleX(0) translateY(-50%)' : 'scaleX(1) translateY(-50%)',
          opacity: phase === 1 ? 0 : 1, // Flashes visible exactly as the doors open
          transitionTimingFunction: 'cubic-bezier(0.86, 0, 0.07, 1)',
        }}
      />

      {/* TELEMETRY DATA COUNTER */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
        style={{
          opacity: phase === 1 ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${1 + (progress / 100) * 0.1})`, // Micro-scaling as it counts
        }}
      >
        <div className="flex items-center gap-3 text-[#f4efe9]">
          <span className="w-2 h-2 bg-[#f4efe9] animate-pulse" />
          <span className="text-sm md:text-base tracking-[0.4em] font-light">
            SYS.BOOT // {progress.toString().padStart(3, '0')}%
          </span>
        </div>
      </div>

    </div>
  );
}