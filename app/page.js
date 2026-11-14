"use client";

import { useEffect, useState, useRef } from "react";
import SmoothScroll from "./components/SmoothScroll";
import FloatingScene from "./components/FloatingScene";
import SpotifyWidget from "./components/SpotifyWidget";
import CinematicLoader from "./components/CinematicLoader";
import SystemMatrix from "./components/SystemMatrix";
import ProjectDetails from "./components/ProjectDetails";
import CustomCursor from "./components/CustomCursor";
import Magnetic from "./components/Magnetic";
import RollingText from "./components/RollingText";
import { projects } from "./data/projects";

export default function Home() {
  const [loaderRevealing, setLoaderRevealing] = useState(false);
  const [loaderFinished, setLoaderFinished] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [track, setTrack] = useState({ isPlaying: false });
  const [inProjectView, setInProjectView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const bgTextRef = useRef(null);

  // Detect mobile screen size on mount and window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Poll Spotify endpoint every 5 seconds when tab is active
  useEffect(() => {
    let isMounted = true;

    async function updateTrack() {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/spotify");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) setTrack(data);
      } catch (error) {
        // Silently catch network errors during offline / disconnected states
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

  // Subtle, smooth ambient parallax on the entire background name
  useEffect(() => {
    if (inProjectView) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frameId = null;

    const handleMouseMove = (e) => {
      const px = (e.clientX / window.innerWidth) * 2 - 1;
      const py = (e.clientY / window.innerHeight) * 2 - 1;
      // Gentle, subtle drift for the full background name
      targetX = px * 1.5;
      targetY = py * 1.5;
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      if (bgTextRef.current) {
        bgTextRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      frameId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    frameId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [inProjectView]);

  return (
    <SmoothScroll>
      {/* Custom hardware-accelerated cursor */}
      <CustomCursor isHovered={!!activeHover} />

      {/* Cinematic boot loader */}
      {!loaderFinished && (
        <CinematicLoader
          onRevealStart={() => setLoaderRevealing(true)}
          onComplete={() => setLoaderFinished(true)}
        />
      )}

      {/* Case study detail modal with scroll navigation between projects */}
      {inProjectView && activeProject && (
        <ProjectDetails
          project={activeProject}
          projects={projects}
          onNavigate={(nextProject) => {
            // Only update which project is shown — never close the view during navigation
            setActiveProject(nextProject);
          }}
          onClose={() => {
            setInProjectView(false);
            setActiveProject(null);
            window.dispatchEvent(new Event("closeProjectDetails"));
          }}
        />
      )}

      {/* Background typography branding layer */}
      <div
        className="fixed bottom-[-3vw] left-0 w-full z-0 flex justify-center items-end pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="flex items-center justify-center transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: loaderRevealing
              ? "translate3d(0, 15%, 0)"
              : "translate3d(0, 48%, 0)",
            opacity: loaderRevealing ? 1 : 0,
          }}
        >
          <div
            ref={bgTextRef}
            className="text-[26vw] sm:text-[23vw] font-medium tracking-tight lowercase leading-[0.6] font-sans text-[#393E46] whitespace-nowrap opacity-50 select-none flex items-center justify-center will-change-transform"
          >
            <span className="inline-block mr-[-0.04em]">olatub</span>
            <span
              className="font-expressive-script normal-case tracking-normal text-[#ecdfcc] inline-block"
              style={{
                lineHeight: 1,
                transform: "translateY(0.04em)",
              }}
            >
              O
            </span>
            <span className="inline-block ml-[-0.08em]">sun</span>
          </div>
        </div>
      </div>

      {/* Interactive 3D project gallery */}
      <section aria-label="Interactive 3D Project Gallery">
        <h2 className="sr-only">Selected Works & 3D Interactive Gallery</h2>
        <noscript>
          <ul>
            <li><a href="#projects">View Projects</a></li>
            <li><a href="#about">About Me</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </noscript>
        <FloatingScene
          activeProject={activeProject}
          setActiveProject={(project) => {
            setActiveProject(project);
            if (project) {
              setInProjectView(true);
            }
          }}
          inProjectView={inProjectView}
          groupOffsetX={isMobile ? 0 : 2.8}
          isRevealed={loaderRevealing}
        />
      </section>

      {/* Foreground HUD interface */}
      <div
        className={`fixed inset-0 pointer-events-none z-20 p-6 sm:p-12 transition-opacity duration-700 ease-in-out ${
          inProjectView || !loaderRevealing ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Top left header, navigation, and system status matrix */}
        <div
          className="absolute top-6 left-6 sm:top-12 sm:left-12 pointer-events-auto flex flex-col gap-5 transition-transform duration-[1100ms] delay-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: loaderRevealing
              ? "translate3d(0, 0, 0)"
              : "translate3d(0, 14px, 0)",
          }}
        >
          <nav className="space-y-3" aria-label="Social links">
            <span className="block text-[9px] uppercase tracking-widest text-neutral-500 font-mono">
              {"// SOCIALS"}
            </span>
            <div className="flex gap-2 items-center">
              <Magnetic strength={0.35} radius={40}>
                <a
                  href="https://x.com/ola2bosun__"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]"
                  onMouseEnter={() => setActiveHover("Social: X")}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <RollingText
                    text="X,"
                    className="text-sm font-medium text-[#ecdfcc] group-hover:text-white"
                  />
                </a>
              </Magnetic>

              <Magnetic strength={0.35} radius={40}>
                <a
                  href="https://github.com/ola3bosun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]"
                  onMouseEnter={() => setActiveHover("Social: GH")}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <RollingText
                    text="GH,"
                    className="text-sm font-medium text-[#ecdfcc] group-hover:text-white"
                  />
                </a>
              </Magnetic>

              <Magnetic strength={0.35} radius={40}>
                <a
                  href="https://instagram.com/ola2bosun_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]"
                  onMouseEnter={() => setActiveHover("Social: IG")}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <RollingText
                    text="IG"
                    className="text-sm font-medium text-[#ecdfcc] group-hover:text-white"
                  />
                </a>
              </Magnetic>
            </div>
          </nav>

          <main>
            <h1 className="font-mono text-sm text-[#ecdfcc] mix-blend-difference leading-loose">
              Frontend developer crafting immersive digital experiences <br />{" "}
              through motion, typography, and thoughtful engineering.
            </h1>
          </main>

          <SystemMatrix track={track} activeHover={activeHover} />
        </div>

        {/* Top center Spotify live music status with magnetic pull */}
        <div
          className="absolute top-6 sm:top-12 left-1/2 -translate-x-1/2 pointer-events-auto transition-transform duration-[1100ms] delay-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: loaderRevealing
              ? "translate3d(0, 0, 0)"
              : "translate3d(0, -14px, 0)",
          }}
        >
          <Magnetic strength={0.25} radius={60}>
            <SpotifyWidget track={track} />
          </Magnetic>
        </div>
      </div>
    </SmoothScroll>
  );
}