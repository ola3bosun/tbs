"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {id: "00", title: "Olaoluwa", role: "DESIGN & DEV", year: "2026", img: "/placeholder-1.jpg" }, 
  { id: "01", title: "Transcend Projects", role: "DESIGN & DEV", year: "2026", img: "/placeholder-1.jpg" },
  { id: "02", title: "The Nuanced Studio", role: "ENGINEERING", year: "2025", img: "/placeholder-2.jpg" },
  { id: "03", title: "Aproko Doctor", role: "DEV", year: "2026", img: "/placeholder-3.jpg" },
];

export default function ProjectHelix() {
  const containerRef = useRef(null);
  const helixRef = useRef(null);
  const angleWrappers = useRef([]);
  const cards = useRef([]);

  useEffect(() => {
    // gsap.context strictly scopes all animations and triggers to this component
    const ctx = gsap.context(() => {
      const totalCards = projects.length;
      const theta = 40;
      const radius = window.innerWidth > 768 ? 700 : 350;
      const yOffset = 200;

      // 1. Set initial rotations and vertical positions
      angleWrappers.current.forEach((wrapper, i) => {
        if (!wrapper) return;
        gsap.set(wrapper, { rotationY: i * theta, y: i * yOffset });
      });

      // 2. Push cards outward from center along their rotated Z-axis
      cards.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { xPercent: -50, yPercent: -50, z: radius });
      });

      gsap.set(helixRef.current, { rotationX: -10 });

      const totalRotation = (totalCards - 1) * theta;
      const totalYDistance = (totalCards - 1) * yOffset;

      // 3. The Helix ScrollTrigger
      gsap.to(helixRef.current, {
        rotationY: -totalRotation,
        y: -totalYDistance,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${(totalCards - 1) * 100}%`,
          pin: true,
          scrub: 1.5,
        },
      });
    }, containerRef); // Pass containerRef to strictly scope the context

    // Cleanup function: Reverts ONLY this component's triggers and styles
    return () => ctx.revert();
  }, []); // Run once on mount

  return (
    // THE STABLE WRAPPER (Prevents the React removeChild error)
    <div className="relative w-full h-full z-10">
      
      <section
        ref={containerRef}
        className="relative h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center"
        style={{ perspective: "2000px" }}
      >
        <div className="absolute inset-8 border border-neutral-900 pointer-events-none z-0 flex justify-between p-4 font-mono text-[9px] text-neutral-600 uppercase">
          <span>// SELECTED WORK</span>
          <span>SYS. ARCHIVE ACTIVE</span>
        </div>

        <div
          ref={helixRef}
          className="relative w-full h-full flex items-center justify-center z-10"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => { angleWrappers.current[i] = el; }}
              className="absolute top-1/2 left-1/2 w-0 h-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                ref={(el) => { cards.current[i] = el; }}
                className="absolute top-0 left-0 w-[80vw] md:w-[45vw] lg:w-[35vw] aspect-video bg-[#111] border border-neutral-800 p-2 flex flex-col justify-between group hover:border-neutral-500 transition-colors duration-500 cursor-pointer"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="relative w-full h-[80%] bg-[#050505] overflow-hidden grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                  <img
                    src={project.img}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>

                <div className="flex justify-between items-end h-[20%] font-mono uppercase text-neutral-400">
                  <div className="flex flex-col gap-1">
                    <span className="text-white text-sm tracking-tight">{project.title}</span>
                    <span className="text-[8px] tracking-[0.2em] text-neutral-600">{project.role}</span>
                  </div>
                  <span className="text-[9px]">{project.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}