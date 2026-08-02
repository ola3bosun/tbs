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

  // Poll Spotify Status
  useEffect(() => {
    let isMounted = true;
    async function updateTrack() {
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
    return () => { isMounted = false; clearInterval(interval); };
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
      <div className="fixed bottom-0 left-0 w-full z-0 flex justify-center items-end pointer-events-none pb-0 overflow-hidden">
        <h1 className="text-[18vw] sm:text-[20vw] font-medium tracking-[-0.05em] lowercase leading-[0.75] font-sans text-[#393E46] whitespace-nowrap opacity-50 select-none flex items-center justify-center">
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
        </h1>
      </div>

      {/* 3D FLOATING GALLERY (Z-10) */}
      <FloatingScene setActiveProject={(project) => {
        setActiveProject(project);
        if (project) {
          setInProjectView(true);
        }
      }} inProjectView={inProjectView} />

      {/* FOREGROUND UI (Z-20) */}
      <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-12">

        <div className="flex justify-between items-start w-full pointer-events-auto">

          <nav className="space-y-3">
            <span className="block text-[9px] uppercase tracking-widest text-neutral-500 font-mono">
              {"// SOCIALS"}
            </span>
            <div className="flex gap-2">
              <a href="#" className="group" onMouseEnter={() => setActiveHover("Social: X")} onMouseLeave={() => setActiveHover(null)}>
                <h3 className="text-sm font-medium text-[#ecdfcc]">X,</h3>
              </a>
              <a href="#" className="group" onMouseEnter={() => setActiveHover("Social: IG")} onMouseLeave={() => setActiveHover(null)}>
                <h3 className="text-sm font-medium text-[#ecdfcc]">IG,</h3>
              </a>
              <a href="#" className="group" onMouseEnter={() => setActiveHover("Social: GH")} onMouseLeave={() => setActiveHover(null)}>
                <h3 className="text-sm font-medium text-[#ecdfcc]">GH</h3>
              </a>
            </div>
          </nav>

          <SpotifyWidget track={track} />

        </div>

        <main className="absolute bottom-6 left-6 sm:bottom-12 sm:left-12 max-w-xs pointer-events-auto">
          <p className="font-mono text-sm text-[#ecdfcc] mix-blend-difference mb-8">
            Frontend developer crafting immersive digital experiences through motion, typography, and thoughtful engineering.
          </p>
          <SystemMatrix track={track} activeHover={activeHover} />
        </main>
      </div>

      {/* THE SCROLL TRACK */}
      <div ref={scrollTrackRef} className="relative w-full h-[500vh] z-30 opacity-0 pointer-events-none" />

    </SmoothScroll>
  );
}