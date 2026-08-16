"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
}) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    // Only enable magnetic effects on fine pointer devices (mouse/trackpad)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const handleMouseMove = (e) => {
      // Calculate distance relative to the stationary outer wrapper
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      // Smoothly translate the inner content towards the cursor
      gsap.to(content, {
        x: distX * strength,
        y: distY * strength,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () => {
      // Elastic spring-back animation on mouse exit
      gsap.to(content, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1.2, 0.4)",
        overwrite: "auto",
      });
    };

    wrapper.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      wrapper.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block cursor-none ${className}`}
    >
      <div ref={contentRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
