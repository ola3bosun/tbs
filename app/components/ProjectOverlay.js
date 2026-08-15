// components/ProjectOverlay.jsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function ProjectOverlay({ activeProject, onViewCaseStudy }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (activeProject) {
        // ANIMATE IN
        tl.fromTo(
          ".overlay-text",
          { yPercent: 100, rotateZ: 2, opacity: 0 },
          {
            yPercent: 0,
            rotateZ: 0,
            opacity: 1,
            duration: 1,
            ease: "expo.out",
            stagger: 0.05,
            delay: 0.5, // Wait for the 3D camera to start moving first
          }
        );
      } else {
        // ANIMATE OUT
        tl.to(".overlay-text", {
          yPercent: -100,
          opacity: 0,
          duration: 0.6,
          ease: "power3.in",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeProject]);

  return (
    <div
      ref={containerRef}
      className="fixed top-24 md:top-32 left-6 md:left-12 z-30 pointer-events-none w-full max-w-sm flex flex-col gap-6"
    >
      {/* Title */}
      <div className="overflow-hidden">
        <h2 className="overlay-text text-3xl md:text-5xl font-medium tracking-tighter text-[#f4efe9] leading-none uppercase">
          {activeProject ? activeProject.title : "—"}
        </h2>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-neutral-800 pt-4">
        <div className="overflow-hidden">
          <p className="overlay-text text-[9px] uppercase tracking-widest text-neutral-500 font-mono mb-1">
            Role
          </p>
          <p className="overlay-text text-xs text-neutral-300">
            {activeProject ? activeProject.role : "—"}
          </p>
        </div>
        <div className="overflow-hidden">
          <p className="overlay-text text-[9px] uppercase tracking-widest text-neutral-500 font-mono mb-1">
            Sector
          </p>
          <p className="overlay-text text-xs text-neutral-300">
            {activeProject ? activeProject.sector : "—"}
          </p>
        </div>
      </div>

      {/* Brutalist Description Block */}
      <div className="overflow-hidden">
        <p className="overlay-text text-[11px] leading-relaxed text-neutral-400 font-mono">
          {activeProject ? activeProject.description : ""}
        </p>
      </div>

      {/* Call to Action */}
      <div className="overflow-hidden pt-4">
        <button
          onClick={onViewCaseStudy}
          className="overlay-text inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white border border-neutral-700 px-4 py-2 hover:bg-white hover:text-black transition-colors pointer-events-auto cursor-none"
        >
          View Case Study <span className="text-xs transition-rotate duration-300 hover:rotate-10">↗</span>
        </button>
      </div>
    </div>
  );
}