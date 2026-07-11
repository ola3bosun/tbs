"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: "TRN_01",
    name: "Transcend Projects",
    sector: "Engineering / Construction",
    role: "Web Architecture",
    year: "2026",
    status: "DEPLOYED",
  },
  {
    id: "APK_02",
    name: "Aproko Doctor",
    sector: "Health Education",
    role: "Premium UI/UX",
    year: "2026",
    status: "BETA_LINK",
  },
  {
    id: "TNS_03",
    name: "The Nuanced Studio",
    sector: "Creative Agency",
    role: "Engineering Strategy",
    year: "2025—26",
    status: "ACTIVE",
  },
  {
    id: "OD_04",
    name: "Olaoluwa Diyaolu",
    sector: "Personal Branding",
    role: "Frontend Eng",
    year: "2026",
    status: "IN_PROGRESS",
  },
];

export default function SelectedWork({ setIsHovered, setActiveHover }) {
  const sectionRef = useRef(null);
  const panelsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = panelsRef.current;

      panels.forEach((panel, index) => {
        gsap.set(panel, { zIndex: index }); // Stack them properly
        if (index !== 0) {
          gsap.set(panel, { 
            xPercent: 120, // Pushed far right
            yPercent: 100, // Pushed down
            rotationZ: 6   // Tilted for the oblique entrance
          });
        }
      });

      // 2. THE MASTER TIMELINE
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1.2, // Liquid-smooth scrolling
          anticipatePin: 1, // Prevents jumpy pinning
          end: () => `+=${panels.length * 100}%`, // Gives each card a full screen of scroll time
        },
      });

      // 3. THE PHYSICS ENGINE
      panels.forEach((panel, index) => {
        if (index === 0) return; // Skip the first panel's entrance, it's already there.

        const prevPanel = panels[index - 1];
        const currentWatermark = panel.querySelector(".watermark");

        // THE VERTICAL EXIT: The old panel goes straight UP and sinks backwards
        tl.to(
          prevPanel,
          {
            yPercent: -40,    // Moves straight up (No X-axis drift)
            scale: 0.8,       // Shrinks into the void
            opacity: 0,       // Fades to black
            ease: "none",
          },
          index // Syncs to this specific timeline step
        );

        // THE OBLIQUE ENTRANCE: The new panel sweeps in from the bottom right
        tl.to(
          panel,
          {
            xPercent: 0,      // Centers horizontally
            yPercent: 0,      // Centers vertically
            rotationZ: 0,     // Snaps flat and square
            boxShadow: "-20px -20px 100px rgba(0,0,0,0.9)", // Heavy physical drop shadow
            ease: "none",
          },
          index // Syncs perfectly with the exit of the old panel
        );

        // THE DEEP PARALLAX: The massive number moves independently
        tl.fromTo(
          currentWatermark,
          {
            x: "20vw",
            y: "20vh",
          },
          {
            x: "0vw",
            y: "0vh",
            ease: "none",
          },
          index
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="h-screen w-full bg-[#0a0a0a] text-[#f4efe9] relative overflow-hidden z-20 border-t border-neutral-900"
    >
      {/* STATIC HUD OVERLAYS */}
      <div className="absolute top-8 left-8 right-8 flex justify-between z-50 pointer-events-none font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
        <div>// DATA_PIPELINE</div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-ping" />
          <span>ASSET_SCAN_ACTIVE</span>
        </div>
      </div>

      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-neutral-800 z-50 pointer-events-none mix-blend-difference">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-neutral-500 rounded-full" />
      </div>

      {/* ========================================================= */}
      {/* THE STACKED PROJECT PANELS                                */}
      {/* ========================================================= */}
      <div className="relative w-full h-full">
        {projects.map((project, idx) => (
          <div
            key={project.id}
            ref={(el) => (panelsRef.current[idx] = el)}
            className="absolute inset-0 w-full h-full flex flex-col justify-center items-center px-8 md:px-24 bg-black"
            onMouseEnter={() => {
              setIsHovered(true);
              setActiveHover("VIEW_ASSET");
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setActiveHover(null);
            }}
          >
            {/* MASSIVE INDEPENDENT PARALLAX WATERMARK */}
            <div className="watermark absolute top-1/2 left-12 -translate-y-1/2 text-[30vw] font-bold text-neutral-900/50 select-none pointer-events-none z-0">
              0{idx + 1}
            </div>

            {/* PROJECT CONTENT GRID */}
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10 relative">
              
              {/* LEFT: DATA SPECS */}
              <div className="lg:col-span-5 flex flex-col gap-8 md:gap-16">
                <div>
                  <h3 className="font-mono text-[10px] text-neutral-500 tracking-widest mb-4">
                    [{project.id}]
                  </h3>
                  <h2 className="text-5xl sm:text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] lowercase cursor-pointer group hover:text-white transition-colors duration-300">
                    {project.name.split(" ").map((word, i) => (
                      <span key={i} className="block group-hover:translate-x-2 transition-transform duration-300 ease-out" style={{ transitionDelay: `${i * 50}ms` }}>
                        {word}
                      </span>
                    ))}
                  </h2>
                </div>

                <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Sector</span>
                    <span className="text-white">{project.sector}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Role</span>
                    <span className="text-white">{project.role}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Timeline</span>
                    <span className="text-white">{project.year}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span>Status</span>
                    <span
                      className={
                        project.status === "ACTIVE" || project.status === "IN_PROGRESS"
                          ? "text-white animate-pulse"
                          : "text-neutral-600"
                      }
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: THE VISUAL ASSET FRAME */}
              <div className="lg:col-span-7 w-full aspect-[4/3] lg:aspect-video border border-neutral-800 bg-[#050505] flex flex-col justify-center items-center relative overflow-hidden group cursor-none">
                <span className="absolute top-4 left-4 text-neutral-700 font-mono text-[10px]">+</span>
                <span className="absolute bottom-4 right-4 text-neutral-700 font-mono text-[10px]">+</span>

                <div className="text-center font-mono text-[9px] uppercase tracking-widest text-neutral-600">
                  <p className="group-hover:text-white transition-colors duration-300">// ASSET_AWAITING_UPLOAD</p>
                  <p>Awaiting highly tactile canvas render</p>
                </div>

                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiAvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjMzMzIiAvPgo8L3N2Zz4=')] pointer-events-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}