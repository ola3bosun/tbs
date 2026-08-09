"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "./components/SmoothScroll";
import FloatingScene from "./components/FloatingScene";
import SpotifyWidget from "./components/SpotifyWidget";
import ProjectOverlay from "./components/ProjectOverlay";
import CinematicLoader from "./components/CinematicLoader";
import SystemMatrix from "./components/SystemMatrix";
import ProjectDetails from "./components/ProjectDetails";

// import IsolatedFooter from "./components/IsolatedFooter"; 

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderFinished, setLoaderFinished] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [track, setTrack] = useState({ isPlaying: false });
  const [inProjectView, setInProjectView] = useState(false);

  const [activeProject, setActiveProject] = useState(null);
  const scrollTrackRef = useRef(null);
  const scrollProxy = useRef(0);

  // Kinetic Typography Refs
  const textRef1 = useRef(null);
  const textRef2 = useRef(null);
  const textRef3 = useRef(null);

  // Poll Spotify Status (with Visibility API optimization)
  useEffect(() => {
    let isMounted = true;
    async function updateTrack() {
      if (document.hidden) return; // Pause polling when tab is inactive
      try {
        const res = await fetch("/api/spotify");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) setTrack(data);
      } catch (error) {
        // Silent catch
      }
    }
    updateTrack();
    const interval = setInterval(updateTrack, 5000);
    const handleVisibilityChange = () => {
      if (!document.hidden) updateTrack();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Kinetic Typography Mouse Tracking
  useEffect(() => {
    if (inProjectView) return; // Freeze text if in project view

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;

      // gsap.to(textRef1.current, { x: x * -15, y: y * -5, skewX: x * 5, duration: 0.5, ease: "power2.out" });
      gsap.to(textRef2.current, { x: x * 25, y: y * 15, skewX: x * -10, rotation: x * 5, duration: 0.8, ease: "power2.out" });
      // gsap.to(textRef3.current, { x: x * -10, y: y * -5, skewX: x * 3, duration: 0.6, ease: "power2.out" });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [inProjectView]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.to(scrollProxy, {
        current: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scrollTrackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      {/* PRELOADER */}
      {!loaderFinished && <CinematicLoader onComplete={() => setLoaderFinished(true)} />}

      {inProjectView && <ProjectDetails project={activeProject} onClose={() => {
        setInProjectView(false);
        setActiveProject(null);
        window.dispatchEvent(new Event('closeProjectDetails'));
      }} />}

      {/* BACKGROUND TEXT (Z-0) */}
      <div className="fixed bottom-0 left-0 w-full z-0 flex justify-center items-end pointer-events-none pb-0 overflow-hidden" aria-hidden="true">
        <div className="text-[18vw] sm:text-[20vw] font-medium tracking-[-0.05em] lowercase leading-[0.75] font-sans text-[#393E46] whitespace-nowrap opacity-50 select-none flex items-center justify-center">
          <span ref={textRef1} className="inline-block mr-[-0.04em]">olatub</span>
          <span
            ref={textRef2}
            className="font-expressive-script normal-case tracking-normal text-[#ecdfcc] inline-block"
            style={{
              lineHeight: 1,
              transform: "translateY(0.04em)",
            }}
          >
            O
          </span>
          <span ref={textRef3} className="inline-block ml-[-0.08em]">sun</span>
        </div>
      </div>

      {/* 3D FLOATING GALLERY (Z-10) */}
      <FloatingScene 
        activeProject={activeProject}
        setActiveProject={(project) => {
          setActiveProject(project);
          if (project) {
            setInProjectView(true);
          }
        }} 
        inProjectView={inProjectView}
        groupOffsetX={2.8}
      />

      {/* FOREGROUND UI (Z-20) */}
      <div className="fixed inset-0 pointer-events-none z-20 p-6 sm:p-12">

        {/* TOP LEFT — h1 + socials */}
        <div className="absolute top-6 left-6 sm:top-12 sm:left-12 pointer-events-auto flex flex-col gap-5">
          <nav className="space-y-3" aria-label="Social links">
            <span className="block text-[9px] uppercase tracking-widest text-neutral-500 font-mono">
              {"// SOCIALS"}
            </span>
            <div className="flex gap-2 items-center">
              <a 
                href="https://x.com/ola2bosun__" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]" 
                onMouseEnter={() => setActiveHover("Social: X")} 
                onMouseLeave={() => setActiveHover(null)}
              >
                <span className="text-sm font-medium text-[#ecdfcc] group-hover:text-white transition-colors">X,</span>
              </a>
              <a 
                href="https://github.com/ola3bosun" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]" 
                onMouseEnter={() => setActiveHover("Social: GH")} 
                onMouseLeave={() => setActiveHover(null)}
              >
                <span className="text-sm font-medium text-[#ecdfcc] group-hover:text-white transition-colors">GH,</span>
              </a>
              <a 
                href="https://instagram.com/ola2bosun_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]" 
                onMouseEnter={() => setActiveHover("Social: IG")} 
                onMouseLeave={() => setActiveHover(null)}
              >
                <span className="text-sm font-medium text-[#ecdfcc] group-hover:text-white transition-colors">IG</span>
              </a>
            </div>
          </nav>

          <main>
            <h1 className="font-mono text-sm text-[#ecdfcc] mix-blend-difference leading-loose">
              Frontend developer crafting immersive digital experiences <br /> through motion, typography, and thoughtful engineering.
            </h1>
          </main>

          <SystemMatrix track={track} activeHover={activeHover} />
        </div>

        {/* TOP CENTER — Spotify widget */}
        <div className="absolute top-6 sm:top-12 left-1/2 -translate-x-1/2 pointer-events-auto">
          <SpotifyWidget track={track} />
        </div>

      </div>

    </SmoothScroll>
  );
}