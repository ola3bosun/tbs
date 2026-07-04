"use client";

import { useEffect, useRef } from "react";

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let particles = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    const mouse = {
      x: null,
      y: null,
      lastX: null,
      lastY: null,
      vx: 0,
      vy: 0,
      radius: 150,
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseVx = (Math.random() - 0.5) * 0.15;
        this.baseVy = (Math.random() - 0.5) * 0.15;
        this.vx = this.baseVx;
        this.vy = this.baseVy;

        this.size = Math.random() * 1.5 + 0.3;
        this.friction = 0.95;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(244, 239, 233, 0.3)";
        ctx.fill();
      }

      update() {
        // Apply inertia and friction
        this.x += this.vx;
        this.y += this.vy;

        // Return slowly back to base ambient speed
        this.vx = this.vx * this.friction + this.baseVx * (1 - this.friction);
        this.vy = this.vy * this.friction + this.baseVy * (1 - this.friction);

        // Screen edge bounds reset
        if (this.x < 0 || this.x > width) this.x = Math.random() * width;
        if (this.y < 0 || this.y > height) this.y = Math.random() * height;

        // Kinetic fluid transfer when mouse swipes nearby
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            // Transfer a portion of the mouse's physical velocity to the particle
            this.vx += mouse.vx * force * 0.2;
            this.vy += mouse.vy * force * 0.2;
          }
        }
      }
    }

    const initParticles = () => {
      particles = [];
      const density = Math.floor((width * height) / 16000);
      for (let i = 0; i < Math.min(density, 100); i++) {
        particles.push(
          new Particle(Math.random() * width, Math.random() * height),
        );
      }
    };

    function animate() {
      ctx.fillStyle = "#0a0a0a"; // Overwrites the viewport frame entirely with your pitch-neutral tone
      ctx.fillRect(0, 0, width, height);

      // Render and project particle dust fields
      particles.forEach((p) => {
        p.update();
        p.draw(); // Make sure draw() uses alpha > 0.3 for visibility!
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    const updatePointer = (x, y) => {
      if (mouse.lastX !== null && mouse.lastY !== null) {
        // Calculate velocity based on frame-by-frame coordinate gap
        mouse.vx = x - mouse.lastX;
        mouse.vy = y - mouse.lastY;
      }
      mouse.x = x;
      mouse.y = y;
      mouse.lastX = x;
      mouse.lastY = y;
    };

    const handleMouseMove = (e) => updatePointer(e.clientX, e.clientY);

    const handleTouchMove = (e) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      updatePointer(touch.clientX, touch.clientY);
    };

    const handlePointerLeave = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.lastX = null;
      mouse.lastY = null;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handlePointerLeave);
    window.addEventListener("touchcancel", handlePointerLeave);

    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handlePointerLeave);
      window.removeEventListener("touchcancel", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 w-full h-full bg-[#0a0a0a] pointer-events-none block"
    />
  );
}
