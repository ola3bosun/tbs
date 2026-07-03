// components/ParticleCanvas.js
'use client';

import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let particles = [];
    const mouse = { x: null, y: null, lastX: null, lastY: null, vx: 0, vy: 0, radius: 150 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        // Base ambient drift
        this.baseVx = (Math.random() - 0.5) * 0.15;
        this.baseVy = (Math.random() - 0.5) * 0.15;
        // Current fluid velocity
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.size = Math.random() * 1.5 + 0.5;
        this.friction = 0.95; // How fast the kinetic blast dampens down
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 239, 233, 0.12)';
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
        if (this.x < 0 || this.x > canvas.width) this.x = Math.random() * canvas.width;
        if (this.y < 0 || this.y > canvas.height) this.y = Math.random() * canvas.height;

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
      const density = Math.floor((canvas.width * canvas.height) / 16000); 
      for (let i = 0; i < Math.min(density, 100); i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Gradually decay mouse velocity if mouse stops moving
      mouse.vx *= 0.9;
      mouse.vy *= 0.9;

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      if (mouse.lastX !== null && mouse.lastY !== null) {
        // Calculate velocity based on frame-by-frame coordinate gap
        mouse.vx = e.clientX - mouse.lastX;
        mouse.vy = e.clientY - mouse.lastY;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null; mouse.y = null;
      mouse.lastX = null; mouse.lastY = null;
      mouse.vx = 0; mouse.vy = 0;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-20 pointer-events-none w-full h-full block" />;
}