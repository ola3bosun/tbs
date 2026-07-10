// app/page.js
"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "./components/SmoothScroll";
import CustomCursor from "./components/CustomCursor";
import CinematicLoader from "./components/CinematicLoader";
import Footer from "./components/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // GSAP Refs
  const scrollTrackRef = useRef(null);
  const landingRef = useRef(null);
  const aboutRef = useRef(null);
  const hudLinesRef = useRef(null);
  const apertureTargetRef = useRef(null);

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        
        // 1. Initial Load Reveal (Landing Page Elements)
        gsap.fromTo(
          ".landing-fade",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );

        // 2. THE MASTER GSAP PIN TIMELINE
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollTrackRef.current,
            start: "top top",
            end: "+=200%", // Adds 2 full screens of scroll distance to scrub through
            pin: true,     // GSAP forces the camera to freeze perfectly
            scrub: 1.2,    // Heavy dampening for liquid-smooth physics
          },
        });

        // A. The "Sinking" Landing Layer
        tl.to(
          landingRef.current,
          {
            scale: 0.85, // Shrinks slightly into the void
            opacity: 0,  // Fades to black
            y: "-10vh",  // Drifts upward slightly
            ease: "power2.inOut",
            duration: 1,
          },
          0
        );

        // B. The Spinning Reticle (Dead center of the void)
        tl.to(
          apertureTargetRef.current,
          {
            rotateZ: 90,
            scale: 1.5,
            opacity: 0,
            ease: "power2.inOut",
            duration: 0.8, 
          },
          0
        );

        // C. The Mechanical Aperture Opening (About Section)
        tl.fromTo(
          aboutRef.current,
          { 
            clipPath: "circle(0% at 50% 50%)", // Starts as a closed pinpoint
            scale: 1.1, // Starts slightly pushed forward
          },
          { 
            clipPath: "circle(150% at 50% 50%)", // Expands to cover the whole screen
            scale: 1,   // Snaps to perfect scale
            ease: "power3.inOut",
            duration: 1,
          },
          0
        );

        // D. Slide in the HUD crosshairs and framing once the aperture is wide enough
        tl.fromTo(
          ".hud-border",
          { scaleX: 0, scaleY: 0, opacity: 0 },
          { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.4, ease: "power4.out" },
          0.6 // Triggers at 60% of the scroll timeline
        );

      }, scrollTrackRef);

      return () => ctx.revert();
    }
  }, [isLoading]);

  return (
    <SmoothScroll>
      <div className="bg-[#000000] text-[#f4efe9] font-sans selection:bg-white selection:text-black">
        
        <CinematicLoader onComplete={() => setIsLoading(false)} />
        
        {/* SAFE ZONE: Wrapped Cursor */}
        <div className="pointer-events-none z-50">
          {!isLoading && <CustomCursor isHovered={isHovered} />}
        </div>

        {/* ========================================================= */}
        {/* THE GSAP PINNED VIEWPORT (100vh)                          */}
        {/* ========================================================= */}
        <div ref={scrollTrackRef} className="relative h-screen w-full overflow-hidden bg-black z-10">
            
          {/* ------------------------------------------------ */}
          {/* LAYER 01: THE LANDING (Sinks into background)    */}
          {/* ------------------------------------------------ */}
          <section 
            ref={landingRef} 
            className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-5 z-10 bg-black origin-top"
          >
            <div className="w-full flex justify-between font-mono text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-12 landing-fade">
              <div>// LANDING_PAGE</div>
            </div>

            <div className="max-w-5xl space-y-2 landing-fade">
              <h1 className="text-[12vw] md:text-[8vw] font-light tracking-tighter leading-[0.9]">
                // TBS
              </h1>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-[9px] font-mono text-neutral-600 uppercase tracking-widest landing-fade">
              <span className="w-1.5 h-1.5 border border-neutral-500 animate-ping" />
              <p>Scroll</p>
            </div>
          </section>

          {/* THE APERTURE RETICLE (Sits perfectly in the center as a target) */}
          <div 
            ref={apertureTargetRef}
            className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-50"
          >
            <div className="w-12 h-12 border border-neutral-700 rounded-full" />
            <div className="w-1 h-1 bg-white rounded-full absolute" />
            <div className="w-[1px] h-16 bg-neutral-700 absolute" />
            <div className="h-[1px] w-16 bg-neutral-700 absolute" />
          </div>

          <section 
            ref={aboutRef} 
            className="absolute inset-0 flex flex-col justify-between px-6 sm:px-12 md:px-20 py-12 z-30 bg-[#d3d3d3] origin-center"
          >
            {/* HUD Geometrics (Fades in late) */}
            <div ref={hudLinesRef} className="absolute inset-4 sm:inset-8 border border-neutral-800 hud-border pointer-events-none" />
            
            <div className="relative z-10 w-full flex justify-between font-mono text-[9px] text-neutral-400 uppercase tracking-[0.2em]">
              <div>[01] ABOUT_SECTION</div>
              <div>STATUS: AWAITING_DEV_TBS</div>
            </div>

            <div className="relative z-10 w-full font-mono text-[10px] text-neutral-600 uppercase tracking-widest text-right mt-auto">
              SYS_QUERY // WHO_IS_TBS?
            </div>
          </section>

        </div>

        <div className="relative z-40 bg-black">
          <Footer 
            isLoading={isLoading} 
            setIsHovered={setIsHovered} 
            setActiveHover={setActiveHover} 
          />
        </div>

      </div>
    </SmoothScroll>
  );
}