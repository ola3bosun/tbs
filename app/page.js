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
        
        // Initial Load Reveal (Landing Page Elements)
        gsap.fromTo(
          ".landing-fade",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );

        // THE MASTER GSAP PIN TIMELINE 
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollTrackRef.current,
            start: "top top",
            end: "+=300%", 
            pin: true,     
            scrub: 1.2,    
          },
        });

        // The Sinking Landing Layer
        tl.to(
          landingRef.current,
          {
            scale: 0.85, 
            opacity: 0,  
            y: "-10vh",  
            ease: "power2.inOut",
            duration: 1,
          },
          0
        );

        // The Spinning Reticle 
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

        // The Mechanical Aperture Opening (About Section)
        tl.fromTo(
          aboutRef.current,
          { 
            clipPath: "circle(0% at 50% 50%)", 
            scale: 1.1, 
          },
          { 
            clipPath: "circle(150% at 50% 50%)", 
            scale: 1,   
            ease: "power3.inOut",
            duration: 1,
          },
          0
        );

        // The HUD Crosshairs
        tl.fromTo(
          ".hud-border",
          { scaleX: 0, scaleY: 0, opacity: 0 },
          { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.4, ease: "power4.out" },
          0.6 
        );

        //  THE NEW EXIT TRANSITION (SYSTEM PURGE)
        tl.to(
          aboutRef.current,
          {
            scale: 2.5,          // Camera flies straight THROUGH the HUD
            opacity: 0,          // Fades into the void
            filter: "blur(12px)", // Optical velocity blur (G-Force)
            ease: "power3.in",
            duration: 1,
          },
          "+=0.8" // CRITICAL: This adds a "dead zone" to the scroll track so the user can read the text before it blasts away!
        );

      }, scrollTrackRef);

      return () => ctx.revert();
    }
  }, [isLoading]);

  return (
    <SmoothScroll>
      <div className="bg-[#000000] text-[#f4efe9] font-sans selection:bg-white selection:text-black relative">
        
        <CinematicLoader onComplete={() => setIsLoading(false)} />
        
        {/* SAFE ZONE: Wrapped Cursor */}
        <div className="pointer-events-none z-50">
          {!isLoading && <CustomCursor isHovered={isHovered} />}
        </div>

        {/* THE GSAP PINNED VIEWPORT */}
        <div ref={scrollTrackRef} className="relative h-screen w-full overflow-hidden bg-black z-10">
            
          {/* THE LANDING CONTENT */}
          <section 
            ref={landingRef} 
            className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-20 z-10 bg-black origin-top"
          >
            <div className="w-full flex justify-between font-mono text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-12 landing-fade">

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

          {/* THE APERTURE RETICLE */}
          <div 
            ref={apertureTargetRef}
            className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-50"
          >
            <div className="w-12 h-12 border border-neutral-700 rounded-full" />
            <div className="w-1 h-1 bg-white rounded-full absolute" />
            <div className="w-[1px] h-16 bg-neutral-700 absolute" />
            <div className="h-[1px] w-16 bg-neutral-700 absolute" />
          </div>

          {/* THE ABOUT HUD: To be moved to a separate component */}
          <section 
            ref={aboutRef} 
            className="absolute inset-0 flex flex-col justify-between px-6 sm:px-12 md:px-20 py-12 z-30 bg-[#0a0a0a] origin-center"
          >
            <div ref={hudLinesRef} className="absolute inset-4 sm:inset-8 border border-neutral-800 hud-border pointer-events-none" />
            
            <div className="relative z-10 w-full flex justify-between font-mono text-[9px] text-neutral-400 uppercase tracking-[0.2em]">
              <div>[01] ABOUT_SECTION</div>
              <div>STATUS: AWAITING_DEV_TBS</div>
            </div>

            {/* ABOUT SECTION CONTENT */}
            <div className="relative z-10 max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-12 font-mono text-xs text-neutral-400 leading-relaxed pt-20">
             
            </div>

            <div className="relative z-10 w-full font-mono text-[10px] text-neutral-600 uppercase tracking-widest text-right mt-auto">
              SYS_QUERY // WHO_IS_TBS?
            </div>
          </section>

        </div>

        {/* THE PROJECTS SECTION: To be moved to a separate component */}
        <div className="relative h-screen w-full bg-[#0a0a0a] z-10 flex flex-col items-center justify-center border-t border-neutral-900">
          {/* <div className="font-mono text-[9px] text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-4 opacity-50">
             <span className="w-1 h-1 bg-neutral-500 rounded-full animate-ping" />
             <span>Awaiting_Next_Node</span>
          </div> */}
          <h1>{'// PROJECTS'}</h1>
        </div>

        <div className="relative z-40 bg-black border-t border-neutral-900">
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