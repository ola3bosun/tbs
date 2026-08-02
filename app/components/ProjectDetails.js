"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function ProjectDetails({ project, onClose }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Fade in timeline
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        delay: 0.5, // Wait for camera to fly in
      });
      
      gsap.to(containerRef.current, {
        backgroundColor: "rgba(10, 11, 10, 0.8)", // Semi-transparent black to tint the shattered mesh behind it
        duration: 1,
        delay: 0.5,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleClose = () => {
    // Animate out before closing
    gsap.to(contentRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      ease: "power3.in",
      onComplete: onClose,
    });
    gsap.to(containerRef.current, {
      backgroundColor: "rgba(10, 11, 10, 0)",
      duration: 0.5,
    });
  };

  if (!project) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-40 flex items-center justify-center pointer-events-auto overflow-y-auto"
      style={{ backgroundColor: "rgba(10, 11, 10, 0)" }}
    >
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div 
        ref={contentRef}
        className="relative z-10 w-full max-w-4xl p-6 sm:p-12 md:p-24 min-h-screen flex flex-col justify-center"
      >
        <button 
          onClick={handleClose}
          className="absolute top-12 right-12 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-white border border-neutral-800 px-4 py-2 transition-colors cursor-pointer"
        >
          Close [X]
        </button>

        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-4">
          Case Study // {project.id}
        </p>
        
        <h1 className="text-5xl sm:text-7xl font-medium tracking-tighter text-[#f4efe9] leading-none uppercase mb-8">
          {project.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-neutral-800 pt-8 mt-12">
          <div className="col-span-1 space-y-8">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono mb-2">Role</p>
              <p className="text-sm text-neutral-300">{project.role}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono mb-2">Sector</p>
              <p className="text-sm text-neutral-300">{project.sector}</p>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <p className="text-base leading-relaxed text-neutral-400 font-serif">
              This is a detailed case study placeholder for {project.title}. In a full implementation, this section would contain rich typography, extensive project galleries, technical teardowns of the {project.role} architecture, and detailed UX/UI breakdowns.
            </p>
            <br />
            <p className="text-base leading-relaxed text-neutral-400 font-serif">
              The tear-away WebGL transition allows us to bypass standard Next.js routing, keeping the 3D context alive and enabling a seamless, cinematic user experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
