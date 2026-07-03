// components/CustomCursor.js
'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor({ isHovered }) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-50">
      
      {/* 1. OUTSIDE ORBIT RING - Now using GPU-accelerated translate3d for fluid damping */}
      <div
        className={`absolute top-0 left-0 rounded-full border border-dashed border-[#f4efe9]/40 will-change-transform`}
        style={{
          width: isHovered ? '48px' : '28px',
          height: isHovered ? '48px' : '28px',
          borderColor: isHovered ? 'rgba(244, 239, 233, 0.8)' : 'rgba(244, 239, 233, 0.4)',
          // Merged the position and rotation into a single high-performance transform matrix
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) ${isHovered ? 'rotate(360deg)' : 'rotate(0deg)'}`,
          transition: isHovered 
            ? 'transform 12s linear infinite, width 0.3s ease, height 0.3s ease, border-color 0.3s ease'
            : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), width 0.3s ease, height 0.3s ease, border-color 0.3s ease'
        }}
      />

      {/* 2. CORE TARGET POINT - Instant tracking with zero-latency translate3d */}
      <div
        className={`absolute top-0 left-0 rounded-full bg-[#f4efe9] mix-blend-difference will-change-transform
          ${isHovered ? 'scale-[2.5]' : 'scale-100'}`}
        style={{
          width: '4px',
          height: '4px',
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
          transition: 'transform 0s, opacity 0.2s ease', // Target point stays completely attached to hardware mouse
        }}
      />
      
    </div>
  );
}