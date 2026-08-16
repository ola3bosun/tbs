// components/CustomCursor.js
"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor({ isHovered }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const containerRef = useRef(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Only show custom cursor on devices with a mouse or precision pointer
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mediaQuery.matches);

    const handleMediaChange = (e) => setIsFinePointer(e.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    if (!mediaQuery.matches) {
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let animationFrameId = null;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        if (containerRef.current) {
          containerRef.current.style.opacity = "1";
        }
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      if (containerRef.current) {
        containerRef.current.style.opacity = "0";
      }
    };

    // Continuous 60fps render loop: keeps both elements strictly locked to coordinates
    const renderLoop = () => {
      // Smooth linear interpolation for outer orbit ring
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      // Update dot transform directly on every frame
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      // Update trailing ring transform directly on every frame
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <div
      ref={containerRef}
      className="hidden md:block pointer-events-none fixed inset-0 z-50 transition-opacity duration-300 opacity-0"
    >
      {/* 1. Outer Orbit Ring: expands on hover */}
      <div
        ref={ringRef}
        className="absolute top-0 left-0 rounded-full border border-dashed will-change-transform transition-[width,height,border-color] duration-300 ease-out"
        style={{
          width: isHovered ? "44px" : "26px",
          height: isHovered ? "44px" : "26px",
          borderColor: isHovered
            ? "rgba(244, 239, 233, 0.85)"
            : "rgba(244, 239, 233, 0.35)",
        }}
      />

      {/* 2. Core Target Point: locked to exact mouse position at 60fps */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0 rounded-full bg-[#f4efe9] mix-blend-difference will-change-transform transition-[width,height,opacity] duration-200 ease-out"
        style={{
          width: isHovered ? "5px" : "4px",
          height: isHovered ? "5px" : "4px",
          opacity: isHovered ? 0.9 : 1,
        }}
      />
    </div>
  );
}