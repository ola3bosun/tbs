// app/page.js
"use client";

import { useEffect, useState, useRef } from "react";
// import { getNowPlaying } from "./actions/spotify";
import CustomCursor from "./components/CustomCursor";
import SystemMatrix from "./components/SystemMatrix";
import ParticleCanvas from "./components/ParticleCanvas";
import CinematicLoader from "./components/CinematicLoader";

export default function Portfolio() {
  const [track, setTrack] = useState({ isPlaying: false });
  const [displayTrack, setDisplayTrack] = useState({ isPlaying: false });
  const [songAnimState, setSongAnimState] = useState("active");
  const [isHovered, setIsHovered] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialMount = useRef(true);

useEffect(() => {
  async function updateTrack() {
    try {
      // Hits the static API router channel directly
      const res = await fetch("/api/spotify");
      if (!res.ok) throw new Error("Network response mismatch");
      const data = await res.json();
      setTrack(data);
    } catch (error) {
      console.error("Failed to fetch track info via API route:", error);
    }
  }

  updateTrack();
  const interval = setInterval(updateTrack, 15000);
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    if (initialMount.current) {
      setDisplayTrack(track);
      initialMount.current = false;
      return;
    }

    if (track.title !== displayTrack.title) {
      setSongAnimState("exit");
      const timeout = setTimeout(() => {
        setDisplayTrack(track);
        setSongAnimState("enter");
        requestAnimationFrame(() => {
          setSongAnimState("active");
        });
      }, 400);
      return () => clearTimeout(timeout);
    } else {
      setDisplayTrack(track);
    }
  }, [track, displayTrack.title]);

  const projects = [
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
    {
      name: "Olaoluwa Diyaolu",
      role: "Frontend Engineering",
      year: "In Progress",
      link: "#",
    },
  ];

  return (
    <main className="relative h-dvh w-full bg-transparent text-[#f4efe9] p-6 sm:p-8 md:p-16 flex flex-col justify-between overflow-hidden font-sans select-none md:cursor-none gap-8 md:gap-12">
      {/* 1. CINEMATIC HANDSHAKE ENGINE */}
      <CinematicLoader onComplete={() => setIsLoading(false)} />

      {/* 2. BACKGROUND PROCESSING LAYER */}
      <ParticleCanvas />
      {!isLoading && <CustomCursor isHovered={isHovered} />}

      {/* BACKGROUND VECTOR ORBITS: Adjusted layout rendering boundaries for smaller mobile devices */}
      <div
        className="absolute inset-0 z-0 opacity-10 sm:opacity-20 pointer-events-none kinetic-reveal"
        style={{ animationDelay: "2000ms" }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="90%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="#f4efe9"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            className="hidden sm:block"
          />
          <circle
            cx="50%"
            cy="50%"
            r="65%"
            fill="none"
            stroke="#f4efe9"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="block sm:hidden"
          />
          <circle
            cx="90%"
            cy="50%"
            r="60%"
            fill="none"
            stroke="#f4efe9"
            strokeWidth="1"
            className="hidden sm:block"
          />
        </svg>
      </div>

      {/* TOP LAYER: Navigation and Real-time Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 w-full items-start z-10">
        <nav className="lg:col-span-2 max-w-xs space-y-3 md:space-y-4">
          <span
            className="block text-[9px] md:text-[10px] uppercase tracking-widest text-neutral-500 font-mono kinetic-reveal"
            style={{ animationDelay: "2100ms" }}
          >
            {"// selected work"}
          </span>
          <div className="flex flex-col space-y-0.5 md:space-y-1">
            {projects.map((project, idx) => (
              <a
                key={idx}
                href={project.link}
                className="group w-fit block py-2 md:py-1.5 kinetic-reveal"
                style={{ animationDelay: `${2200 + idx * 100}ms` }}
                onMouseEnter={() => {
                  if (!isLoading) {
                    setIsHovered(true);
                    setActiveHover(
                      `Focus shifted to index item: "${project.name}"`,
                    );
                  }
                }}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setActiveHover(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline-block opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] text-neutral-400">
                    ■
                  </span>
                  <h3 className="text-sm font-medium text-neutral-300 group-hover:text-[#f4efe9] transition-colors duration-300">
                    {project.name}
                  </h3>
                </div>
                <p className="text-[9px] md:text-[10px] text-neutral-500 font-mono mt-0.5 md:pl-4 uppercase tracking-wider">
                  {project.role} &mdash; {project.year}
                </p>
              </a>
            ))}
          </div>
        </nav>

        {/* Activity terminal log block */}
        <div
          className="kinetic-reveal mt-2 lg:mt-0"
          style={{ animationDelay: "2500ms" }}
        >
          <SystemMatrix track={track} activeHover={activeHover} />
        </div>
      </div>

      {/* CENTER RETICLE - Hidden cleanly on small smartphone displays to prevent overlapping text */}
      <div
        className="absolute left-[35%] top-[50%] -translate-y-1/2 pointer-events-none opacity-40 hidden lg:block kinetic-reveal"
        style={{ animationDelay: "2600ms" }}
      >
        <span className="text-xl font-light font-mono text-[#f4efe9]">+</span>
      </div>

      {/* BOTTOM LAYER WRAPPER: Responsive Description & Typography */}
      <div className="w-full space-y-6 md:space-y-8 z-10 mt-auto">
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-end max-w-4xl kinetic-reveal"
          style={{ animationDelay: "2700ms" }}
        >
          <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-light max-w-md tracking-wide">
            Building highly tactile web architectures that give interfaces the
            nuance they need to respond, adapt, and stay balanced in a changing
            digital world. Music is a big part of my craft.
          </p>

          {/* DYNAMIC SONG WIDGET */}
          <div
            className="border-l border-neutral-800 pl-4 py-1 overflow-hidden min-h-[48px] md:min-h-[52px]"
            onMouseEnter={() => !isLoading && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className={`space-y-1 transition-all duration-[400ms] ${
                songAnimState === "exit"
                  ? "song-flip-exit"
                  : songAnimState === "enter"
                    ? "song-flip-enter"
                    : "song-flip-active"
              }`}
            >
              {displayTrack.isPlaying ? (
                <a
                  href={displayTrack.songUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-neutral-400 font-mono">
                      Live
                    </span>
                    <span className="w-1 h-1 bg-[#f4efe9] animate-ping rounded-full" />
                  </div>
                  <p className="text-xs font-medium text-neutral-200 truncate group-hover:text-neutral-400 transition-colors">
                    {displayTrack.title}{" "}
                    <span className="text-neutral-500 font-light">
                      — {displayTrack.artist}
                    </span>
                  </p>
                  <p className="text-[8px] md:text-[9px] text-neutral-500 font-mono truncate group-hover:text-neutral-400 transition-colors">
                    {displayTrack.album}
                  </p>
                </a>
              ) : (
                <div className="text-neutral-600 space-y-1">
                  <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-mono">
                    {"// Playback"}
                  </span>
                  <p className="text-xs font-light tracking-wide">Offline</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM LAYER BRAND SIGNATURE: Dynamic view scaling prevents text wrapping breaks on small viewports */}
        <div
          className="pt-4 border-t border-neutral-800/40 group/hero relative top-4 md:top-10 w-full kinetic-reveal"
          style={{ animationDelay: "2800ms" }}
          onMouseEnter={() => !isLoading && setActiveHover("That's My Name!")}
          onMouseLeave={() => setActiveHover(null)}
        >
          <h1 className="text-[14vw] sm:text-[12vw] font-medium tracking-[-0.05em] lowercase leading-[0.8] font-sans text-[#f4efe9]">
            <span className="inline-block mr-[-0.04em]">olatub</span>
            <span
              className="font-expressive-script normal-case tracking-normal text-[#393E46] inline-block transition-transform duration-700 ease-out md:group-hover/hero:rotate-6"
              style={{
                verticalAlign: "middle",
                lineHeight: 1,
                transform: "translateY(0.04em)",
              }}
            >
              O
            </span>
            <span className="inline-block ml-[-0.08em]">sun</span>
          </h1>
        </div>
      </div>
    </main>
  );
}
