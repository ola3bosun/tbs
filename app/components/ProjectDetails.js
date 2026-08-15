"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useScrambleText } from "../hooks/useScrambleText";

export default function ProjectDetails({ project, onClose }) {
  const containerRef = useRef(null);
  const uiRef = useRef(null);
  
  const [scrambleTrigger, setScrambleTrigger] = useState(false);

  // Scramble hooks
  const scrambledRole = useScrambleText(project ? `${project.role} (${project.year || project.sector})` : "", { duration: 1000, delay: 0, trigger: scrambleTrigger });

  useEffect(() => {
    // Reveal Timeline
    const ctx = gsap.context(() => {
      // 1. Fade in the UI container
      gsap.from(uiRef.current, {
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.5, // Wait for 3D camera to zoom
      });
      
      // 2. Subtle background overlay
      gsap.to(containerRef.current, {
        backgroundColor: "rgba(10, 11, 10, 0.4)", // Darken slightly for contrast
        duration: 1,
        delay: 0.3,
      });

      // 3. Trigger Scramble
      setTimeout(() => setScrambleTrigger(true), 600);

    }, containerRef);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      ctx.revert();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project]);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    
    tl.to(uiRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
    }, 0);

    tl.to(containerRef.current, {
      backgroundColor: "rgba(10, 11, 10, 0)",
      duration: 0.5,
    }, 0.1);
  };

  if (!project) return null;

  return (
    <div 
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-40 flex items-center justify-center pointer-events-auto transition-all"
      style={{ backgroundColor: "rgba(10, 11, 10, 0)" }}
    >
      {/* Background click to close */}
      <div className="absolute inset-0 z-0" onClick={handleClose} aria-hidden="true" />

      {/* Edge-to-edge UI Frame */}
      <div 
        ref={uiRef}
        className="relative z-10 w-full h-full p-6 sm:p-12 pointer-events-none flex flex-col justify-between"
      >
        {/* TOP ROW */}
        <div className="flex justify-between items-start pointer-events-auto">
          {/* Top Left: Description */}
          <div className="max-w-md">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono leading-relaxed mb-2">
              {project.title} // {project.role} // {project.sector}
            </p>
          </div>

          {/* Top Right: Close Button */}
          <button 
            onClick={handleClose}
            aria-label="Close case study details"
            className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-[#f4efe9] border border-neutral-600 hover:border-[#f4efe9] px-3 py-1.5 transition-colors cursor-none focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]"
          >
            ESCAPE
          </button>
        </div>

        {/* BOTTOM ROW */}
        <div className="flex justify-between items-end pointer-events-auto">
          {/* Bottom Left: Role (Year) & Title */}
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 font-mono mb-2 sm:mb-4">
              {scrambledRole}
            </p>
            <h2 
              id="modal-project-title" 
              className="text-6xl sm:text-8xl md:text-9xl font-medium tracking-tighter text-[#f4efe9] leading-none uppercase"
            >
              {project.title}
            </h2>
          </div>

          {/* Bottom Right: Link */}
          <a 
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-[#f4efe9] transition-colors cursor-none mb-2"
          >
            View Project ↗
          </a>
        </div>
      </div>
    </div>
  );
}
