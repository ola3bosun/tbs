// components/CinematicLoader.js
'use client';

import { useEffect, useState } from 'react';

export default function CinematicLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1); // 1: Counting, 2: Splitting open, 3: Fully Destroyed

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

      setProgress(Math.floor(easedProgress * 100));

      if (rawProgress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // 1. Counter complete -> Strike the line and trigger splitting doors
        setTimeout(() => setPhase(2), 150);
        
        // 2. Clear landing page state blocks to animate code entry layers
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 600);

        // 3. FIXED: Settle the phase loop into state 3 to drop the DOM nodes completely
        setTimeout(() => {
          setPhase(3);
        }, 1100); // Matches the transition duration of the doors
      }
    };

    requestAnimationFrame(updateCounter);
  }, [onComplete]);

  // FIXED: If phase is 3, drop the loader tree entirely so it stops masking elements
  if (phase === 3) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center font-mono overflow-hidden">
      
      {/* TOP BLAST DOOR PLATE */}
      <div
        className="absolute top-0 left-0 w-full bg-[#0a0a0a] will-change-[height] transition-all duration-[900ms]"
        style={{
          height: phase === 1 ? '50vh' : '0vh',
          transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
        }}
      />

      {/* BOTTOM BLAST DOOR PLATE */}
      <div
        className="absolute bottom-0 left-0 w-full bg-[#0a0a0a] will-change-[height] transition-all duration-[900ms]"
        style={{
          height: phase === 1 ? '50vh' : '0vh',
          transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)', 
        }}
      />

      {/* THE HORIZON SPLIT LINE */}
      {/* <div
        className="absolute top-1/2 left-0 w-full h-[1px] bg-[#f4efe9]/20 will-change-transform transition-all duration-[700ms]"
        style={{
          transform: phase === 1 ? 'scaleX(0) translateY(-50%)' : 'scaleX(1) translateY(-50%)',
          opacity: phase === 1 ? 0 : 1,
          transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
        }}
      /> */}

      {/* TELEMETRY DATA COUNTER */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
        style={{
          opacity: phase === 1 ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${1 + (progress / 100) * 0.05})`,
        }}
      >
        <div className="flex items-center gap-3 text-[#f4efe9]">
          <span className="w-1.5 h-1.5 bg-[#f4efe9] animate-pulse rounded-full" />
          <span className="text-xs tracking-[0.4em] font-light uppercase">
            SYS. BOOTING // {progress.toString().padStart(3, '0')}%
          </span>
        </div>
      </div>

    </div>
  );
}