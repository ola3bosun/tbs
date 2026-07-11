"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SystemMatrix from "./SystemMatrix";
import ParticleCanvas from "./ParticleCanvas";

gsap.registerPlugin(ScrollTrigger);

export default function Footer({ isLoading, setIsHovered, setActiveHover }) {
  const [track, setTrack] = useState({ isPlaying: false });
  const [displayTrack, setDisplayTrack] = useState({ isPlaying: false });
  const [songAnimState, setSongAnimState] = useState("active");

  const initialMount = useRef(true);
  const footerInnerRef = useRef(null); 

  // THE GSAP OSMO PARALLAX RIG
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerInnerRef.current,
        {
          yPercent: -30,  // Pushed slightly up in the shadows
          scale: 0.85,    // Shrunk down
          opacity: 0,     // Darkened
        },
        {
          yPercent: 0,    // Settles exactly into place
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            // Trigger animation based on the massive MAIN curtain we made in page.js
            trigger: "#main-curtain",
            start: "bottom bottom", // Starts exactly when the curtain starts lifting
            end: "bottom top",      // Ends exactly when the curtain is fully off screen
            scrub: true,            // Tied beautifully to the scroll wheel
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  // SPOTIFY FETCH LOGIC
  useEffect(() => {
    let isMounted = true; 

    async function updateTrack() {
      try {
        const res = await fetch("/api/spotify");
        if (!res.ok) throw new Error("Network response mismatch");
        const data = await res.json();
        
        if (isMounted) {
          setTrack(data);
        }
      } catch (error) {
        console.error("Failed to fetch track info via API route:", error);
      }
    }

    updateTrack();
    const interval = setInterval(updateTrack, 15000);
    
    return () => {
      isMounted = false; 
      clearInterval(interval);
    };
  }, []);

  // SPOTIFY ANIMATION LOGIC
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

  const socials = [
    { name: "X", platform: "Network", link: "#" },
    { name: "IG", platform: "Social", link: "#" },
    { name: "LI", platform: "Professional", link: "#" },
  ];

  return (
    /* 
      OUTER CONTAINER: Fixed to the background. 
      Because <main> has z-10 and this has z-0, it hides completely until the margin reveals it. 
    */
    <footer className="fixed bottom-0 left-0 w-full h-screen bg-black z-0 pointer-events-auto overflow-hidden">
      
      {/* INNER CONTAINER: This is the asset GSAP pushes around */}
      <div ref={footerInnerRef} className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 md:p-16 text-[#f4efe9] font-sans select-none z-10">
        
        {/* BACKGROUND PROCESSING LAYER */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <ParticleCanvas />
        </div>

        {/* TOP LAYER: Social Navigation and System Matrix Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 w-full items-start pt-12 md:pt-8 z-10">
          <nav className="lg:col-span-2 max-w-xs space-y-3 md:space-y-4">
            <span className="block text-[9px] md:text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
              {"// channels"}
            </span>
            <div className="flex flex-col md:space-y-0.5">
              {socials.map((social, idx) => (
                <a
                  key={idx}
                  href={social.link}
                  className="group w-fit block py-2 md:py-1.5"
                  onMouseEnter={() => {
                    if (!isLoading) {
                      setIsHovered(true);
                      setActiveHover(`Routing channel to: "${social.name}"`);
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
                      {social.name}
                    </h3>
                  </div>
                  <p className="text-[9px] md:text-[10px] text-neutral-500 font-mono mt-0.5 md:pl-4 uppercase tracking-wider">
                    {social.platform}
                  </p>
                </a>
              ))}
            </div>
          </nav>

          <div className="mt-2 lg:mt-0">
            <SystemMatrix track={track} activeHover={null} />
          </div>
        </div>

        {/* BOTTOM LAYER WRAPPER */}
        <div className="w-full space-y-6 md:space-y-8 mt-auto z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-end max-w-4xl">
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

          {/* BOTTOM LAYER BRAND SIGNATURE */}
          <div
            className="pt-4 border-t border-neutral-800/40 group/hero relative w-full"
            onMouseEnter={() => !isLoading && setActiveHover("Olatubosun")}
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
      </div>
    </footer>
  );
}