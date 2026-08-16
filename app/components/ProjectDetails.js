"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import Magnetic from "./Magnetic";
import RollingText from "./RollingText";

// Matrix scramble constants
const CHARS = "!<>-_\\/[]{}—=+*^?#_";

// Staggered kinetic character heading — chars are targeted by GSAP via .char-roll class
function KineticHeading({ title = "", headingRef }) {
  return (
    <h2
      ref={headingRef}
      id="modal-project-title"
      className="text-6xl sm:text-7xl md:text-8xl font-medium tracking-tighter text-[#f4efe9] leading-none uppercase select-none overflow-hidden inline-flex flex-wrap mix-blend-screen"
      aria-label={title}
    >
      {title.split("").map((char, index) => {
        if (char === " ") {
          return <span key={index} className="inline-block">&nbsp;</span>;
        }
        return (
          <span
            key={`${title}_${index}`}
            className="relative inline-block overflow-hidden h-[1.12em] leading-[1.12em]"
          >
            <span className="char-roll inline-block will-change-transform">
              {char}
            </span>
          </span>
        );
      })}
    </h2>
  );
}

export default function ProjectDetails({ project, projects = [], onNavigate, onClose }) {
  const containerRef = useRef(null);
  const uiRef = useRef(null);
  const headingRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Small text display state — driven imperatively during navigation
  const [headerText, setHeaderText] = useState("");
  const [roleText, setRoleText] = useState("");

  // Ref to hold the active scramble animation frames so we can cancel them
  const headerFrameRef = useRef(null);
  const roleFrameRef = useRef(null);

  const isNavigatingRef = useRef(false);
  const wheelAccumulatorRef = useRef(0);

  // Compute pagination
  const currentIndex = projects.findIndex((p) => p.id === project?.id);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const totalCount = projects.length || 5;
  const formattedIndex = String(activeIndex + 1).padStart(2, "0");
  const formattedTotal = String(totalCount).padStart(2, "0");

  // ── Imperative scramble helpers ───────────────────────────────────────────
  const cancelScrambles = useCallback(() => {
    if (headerFrameRef.current) cancelAnimationFrame(headerFrameRef.current);
    if (roleFrameRef.current) cancelAnimationFrame(roleFrameRef.current);
  }, []);

  // Scramble a string OUT (real text → matrix chars) then call onDone
  const scrambleOut = useCallback((currentText, setter, frameRef, duration, onDone) => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    let start = null;

    const run = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Characters scramble right-to-left as progress increases
      const keepCount = Math.floor((1 - progress) * currentText.length);
      let result = "";
      for (let i = 0; i < currentText.length; i++) {
        if (currentText[i] === " ") result += " ";
        else if (i < keepCount) result += currentText[i];
        else result += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setter(result);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(run);
      } else if (onDone) {
        onDone();
      }
    };

    frameRef.current = requestAnimationFrame(run);
  }, []);

  // Scramble a new string IN (matrix chars → real text)
  const scrambleIn = useCallback((newText, setter, frameRef, duration) => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    let start = null;

    const run = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const resolveCount = Math.floor(progress * newText.length);
      let result = "";
      for (let i = 0; i < newText.length; i++) {
        if (i < resolveCount || newText[i] === " ") result += newText[i];
        else result += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setter(result);
      if (progress < 1) frameRef.current = requestAnimationFrame(run);
    };

    frameRef.current = requestAnimationFrame(run);
  }, []);

  // ── Roll-IN: letters enter from below (or above) with stagger ────────────
  const triggerRollIn = useCallback((fromDirection) => {
    if (!headingRef.current) return;
    const chars = headingRef.current.querySelectorAll(".char-roll");
    if (!chars.length) return;

    gsap.set(chars, { y: fromDirection > 0 ? "115%" : "-115%", opacity: 0 });
    gsap.to(chars, {
      y: "0%",
      opacity: 1,
      duration: 0.7,
      stagger: { each: 0.028, ease: "power2.inOut" },
      ease: "expo.out",
      overwrite: true,
    });
  }, []);

  // ── 6-STEP NAVIGATION CHOREOGRAPHY ───────────────────────────────────────
  const navigateProject = useCallback(
    (direction) => {
      if (isNavigatingRef.current || !projects.length || !onNavigate) return;
      isNavigatingRef.current = true;

      const nextIndex = (activeIndex + direction + projects.length) % projects.length;
      const nextProj = projects[nextIndex];

      // Snapshot current small text values before anything changes
      const currentHeaderText = `${project.title} // ${project.role} // ${project.sector}`;
      const currentRoleText = `${project.role} (${project.year || project.sector})`;
      const nextHeaderText = `${nextProj.title} // ${nextProj.role} // ${nextProj.sector}`;
      const nextRoleText = `${nextProj.role} (${nextProj.year || nextProj.sector})`;

      // Capture existing heading char nodes before React re-renders them
      const oldChars = Array.from(headingRef.current?.querySelectorAll(".char-roll") || []);

      // ── Step 2: Small texts scramble OUT ─────────────────────────────────
      cancelScrambles();
      scrambleOut(currentHeaderText, setHeaderText, headerFrameRef, 220, null);
      scrambleOut(currentRoleText, setRoleText, roleFrameRef, 220, null);

      // ── Step 3: Heading rolls OUT ─────────────────────────────────────────
      gsap.to(oldChars, {
        y: direction > 0 ? "-115%" : "115%",
        opacity: 0,
        duration: 0.3,
        stagger: { each: 0.016, ease: "power2.in" },
        ease: "power3.in",
        overwrite: true,
        onComplete: () => {
          // ── Step 4: Background image transitions ─────────────────────────
          onNavigate(nextProj);

          // ── Step 5: New heading rolls IN (next paint after React renders new title) ──
          requestAnimationFrame(() => {
            triggerRollIn(direction);
          });

          // ── Step 6: Small texts scramble IN with new data ─────────────────
          setTimeout(() => {
            scrambleIn(nextHeaderText, setHeaderText, headerFrameRef, 700);
            scrambleIn(nextRoleText, setRoleText, roleFrameRef, 600);
          }, 150);

          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 500);
        },
      });
    },
    [activeIndex, projects, project, onNavigate, triggerRollIn, cancelScrambles, scrambleOut, scrambleIn]
  );

  // Smooth exit to landing page
  const handleClose = useCallback(() => {
    cancelScrambles();
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(uiRef.current, { opacity: 0, duration: 0.35, ease: "power2.in" }, 0);
    tl.to(containerRef.current, { backgroundColor: "rgba(10,11,10,0)", duration: 0.45 }, 0.1);
  }, [onClose, cancelScrambles]);

  // Wheel / touch / keyboard event listeners
  useEffect(() => {
    let wheelTimeout = null;

    const handleWheel = (e) => {
      e.preventDefault();
      if (isNavigatingRef.current) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      wheelAccumulatorRef.current += delta;
      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => { wheelAccumulatorRef.current = 0; }, 200);
      if (Math.abs(wheelAccumulatorRef.current) > 35) {
        const dir = wheelAccumulatorRef.current > 0 ? 1 : -1;
        wheelAccumulatorRef.current = 0;
        navigateProject(dir);
      }
    };

    let touchStartY = 0, touchStartX = 0;
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; touchStartX = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
      if (isNavigatingRef.current) return;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dy) > 40 || Math.abs(dx) > 40) {
        navigateProject((Math.abs(dy) > Math.abs(dx) ? dy < 0 : dx < 0) ? 1 : -1);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") navigateProject(1);
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") navigateProject(-1);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [navigateProject, handleClose]);

  // Initial open reveal + scramble-in and roll-in
  useEffect(() => {
    if (closeButtonRef.current) closeButtonRef.current.focus();

    const headerStr = project
      ? `${project.title} // ${project.role} // ${project.sector}`
      : "";
    const roleStr = project
      ? `${project.role} (${project.year || project.sector})`
      : "";

    const ctx = gsap.context(() => {
      gsap.from(uiRef.current, { opacity: 0, duration: 0.8, ease: "power2.out", delay: 0.25 });
      gsap.to(containerRef.current, { backgroundColor: "rgba(10,11,10,0.35)", duration: 0.8, delay: 0.2 });
    }, containerRef);

    // Roll title in and scramble small texts in after fade starts
    const rollTimer = setTimeout(() => triggerRollIn(1), 320);
    const scrambleTimer = setTimeout(() => {
      scrambleIn(headerStr, setHeaderText, headerFrameRef, 900);
      scrambleIn(roleStr, setRoleText, roleFrameRef, 750);
    }, 350);

    return () => {
      ctx.revert();
      clearTimeout(rollTimer);
      clearTimeout(scrambleTimer);
    };
  }, []); // Only fires on mount — navigation is handled imperatively

  if (!project) return null;

  const projectUrl = project.liveUrl || project.githubUrl || "#";

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-40 flex items-center justify-center pointer-events-auto select-none"
      style={{ backgroundColor: "rgba(10,11,10,0)" }}
    >
      {/* Background click to close */}
      <div className="absolute inset-0 z-0 cursor-none" onClick={handleClose} aria-hidden="true" />

      {/* Edge-to-edge UI frame */}
      <div
        ref={uiRef}
        className="relative z-10 w-full h-full p-4 sm:p-4 lg:p-6 pointer-events-none flex flex-col justify-between"
      >
        {/* TOP ROW: header metadata + pagination + escape */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="max-w-md">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono leading-relaxed mb-1">
              {headerText}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              <span className="text-[#f4efe9] font-medium">{formattedIndex}</span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-500">{formattedTotal}</span>
            </div>

            <Magnetic strength={0.4} className="pointer-events-auto">
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                aria-label="Close case study details"
                className="group text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 hover:text-[#f4efe9] border border-neutral-600 hover:border-[#f4efe9] px-3 py-1.5 transition-colors cursor-none focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]"
              >
                <RollingText text="ESCAPE" />
              </button>
            </Magnetic>
          </div>
        </div>

        {/* BOTTOM ROW: role text + kinetic heading + project link */}
        <div className="flex justify-between items-end pointer-events-auto">
          <div className="max-w-[70vw]">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 font-mono mb-2 sm:mb-3">
              {roleText}
            </p>
            <KineticHeading title={project.title} headingRef={headingRef} />
          </div>

          <div className="flex flex-col items-end gap-3 mb-1">
            <span className="hidden sm:block text-[8px] uppercase tracking-widest text-neutral-500 font-mono opacity-60 mix-blend-difference">
              {"[ SCROLL TO NAVIGATE ]"}
            </span>

            {projectUrl !== "#" ? (
              <Magnetic strength={0.35}>
                <a
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View live project for ${project.title}`}
                  className="group inline-block text-[10px] uppercase tracking-widest text-neutral-400 hover:text-[#f4efe9] transition-colors cursor-none focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]"
                >
                  <RollingText text="View Project ↗" />
                </a>
              </Magnetic>
            ) : (
              <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-mono">
                Coming Soon
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
