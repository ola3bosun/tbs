// app/page.js
"use client";

import { useEffect, useState } from "react";
import { getNowPlaying } from "./actions/spotify";
import CustomCursor from "./components/CustomCursor";
import SystemMatrix from "./components/SystemMatrix";
import ParticleCanvas from "./components/ParticleCanvas";
import CinematicLoader from "./components/CinematicLoader";

export default function Portfolio() {
  const [track, setTrack] = useState({ isPlaying: false });
  const [isHovered, setIsHovered] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function updateTrack() {
      try {
        const data = await getNowPlaying();
        setTrack(data);
      } catch (error) {
        console.error("Failed to fetch track info:", error);
      }
    }

    updateTrack();
    const interval = setInterval(updateTrack, 15000);
    return () => clearInterval(interval);
  }, []);

  const projects = [
    // {
    //   name: "Transcend Projects",
    //   role: "Design & Development",
    //   year: "2026",
    //   link: "#",
    // },
    {
      name: "The Nuanced Studio",
      role: "Engineering",
      year: "2025",
      link: "#",
    },
    {
      name: "Aproko Doctor",
      role: "Frontend Engineering",
      year: "2026",
      link: "#",
    },
  ];

  return (
    <main className="relative min-h-screen w-full bg-[rgba(0,0,0,.1)] text-[#f4efe9] p-8 md:p-16 flex flex-col justify-between overflow-hidden font-sans select-none md:cursor-none gap-12">
      
      {/* 1. THE HORIZON SPLIT LOADER */}
      <CinematicLoader onComplete={() => setIsLoading(false)} />

      {/* 2. AMBIENT ENGINES */}
      <ParticleCanvas />
      {!isLoading && <CustomCursor isHovered={isHovered} />}

      {/* BACKGROUND VECTOR ORBITS */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none kinetic-reveal" style={{ animationDelay: '2000ms' }}>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="90%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="#f4efe9"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <circle
            cx="90%"
            cy="50%"
            r="55%"
            fill="none"
            stroke="#f4efe9"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* TOP LAYER: Navigation and Metadata Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full items-start z-10">
        <nav className="lg:col-span-2 max-w-xs space-y-4">
          <span className="block text-[10px] uppercase tracking-widest text-neutral-500 font-mono kinetic-reveal" style={{ animationDelay: '2100ms' }}>
            {"// selected work"}
          </span>
          <div className="flex flex-col space-y-1">
            {projects.map((project, idx) => (
              <a
                key={idx}
                href={project.link}
                className="group w-fit block py-2 kinetic-reveal"
                style={{ animationDelay: `${2200 + idx * 100}ms` }}
                onMouseEnter={() => {
                  if (!isLoading) {
                    setIsHovered(true);
                    setActiveHover(`Focus shifted to index item: "${project.name}"`);
                  }
                }}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setActiveHover(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] text-neutral-400">■</span>
                  <h3 className="text-sm font-medium text-neutral-300 group-hover:text-[#f4efe9] transition-colors duration-300">
                    {project.name}
                  </h3>
                </div>
                <p className="text-[10px] text-neutral-500 font-mono mt-0.5 pl-4 uppercase tracking-wider">
                  {project.role} &mdash; {project.year}
                </p>
              </a>
            ))}
          </div>
        </nav>

        {/* Matrix wrapped in a reveal to drop in after nav */}
        <div className="kinetic-reveal" style={{ animationDelay: '2500ms' }}>
          <SystemMatrix track={track} activeHover={activeHover} />
        </div>
      </div>

      {/* CENTER RETICLE */}
      <div className="absolute left-[35%] top-[50%] -translate-y-1/2 pointer-events-none opacity-40 hidden lg:block kinetic-reveal" style={{ animationDelay: '2600ms' }}>
        <span className="text-xl font-light font-mono text-[#f4efe9]">+</span>
      </div>

      {/* BOTTOM LAYER WRAPPER: Description & Massive Typography */}
      <div className="w-full space-y-8 z-10 mt-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end max-w-4xl kinetic-reveal" style={{ animationDelay: '2700ms' }}>
          <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-light max-w-md tracking-wide">
            Building highly tactile web architectures that give interfaces the
            nuance they need to respond, adapt, and stay balanced in a changing
            digital world. Music is a big part of my craft.
          </p>

          <div
            className="border-l border-neutral-800 pl-4 py-1"
            onMouseEnter={() => !isLoading && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {track.isPlaying ? (
              <a
                href={track.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block space-y-1 group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">
                    Live
                  </span>
                  <span className="w-1 h-1 bg-[#f4efe9] animate-ping rounded-full" />
                </div>
                <p className="text-xs font-medium text-neutral-200 truncate group-hover:text-neutral-400 transition-colors">
                  {track.title}{" "}
                  <span className="text-neutral-500 font-light">
                    — {track.artist}
                  </span>
                </p>
                <p className="text-[9px] text-neutral-500 font-mono truncate group-hover:text-neutral-400 transition-colors">
                  {track.album}
                </p>
              </a>
            ) : (
              <div className="text-neutral-600 space-y-1">
                <span className="text-[9px] uppercase tracking-widest font-mono">
                  {"// Playback"}
                </span>
                <p className="text-xs font-light tracking-wide">Offline</p>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM LAYER: Grounded and Layout-Safe Typography */}
        <div
          className="pt-4 border-t border-neutral-800/40 group/hero relative top-10 w-full kinetic-reveal"
          style={{ animationDelay: '2800ms' }}
          onMouseEnter={() => !isLoading && setActiveHover("That's My Name!")}
          onMouseLeave={() => setActiveHover(null)}
        >
          <h1 className="text-[12vw] font-medium tracking-[-0.05em] lowercase leading-[0.8] font-sans text-[#f4efe9]">
            <span className="inline-block mr-[-0.04em]">olatub</span>
            <span
              className="font-expressive-script normal-case tracking-normal text-[#393E46] inline-block transition-transform duration-700 ease-out group-hover/hero:rotate-6"
              style={{
                verticalAlign: "middle",
                lineHeight: 1,
                transform: "translateY(0.06em)",
              }}
            >
              O
            </span>
            <span className="inline-block ml-[-0.1em]">sun</span>
          </h1>
        </div>
      </div>
    </main>
  );
}