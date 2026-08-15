"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import SlicingShaderMaterial from "./SlicingShaderMaterial";

// ── Project data ────────────────────────────────────────────────────────────
const projects = [
  { id: "01", title: "Olaoluwa Diyaolu", role: "UI Lead",    sector: "Real Estate",    year: "2026", url: "/proj-1.png" },
  { id: "02", title: "Nuanced Studio",  role: "UI Engineer",      sector: "Design Agency",  year: "2025", url: "/proj-2.png" },
  { id: "03", title: "Aproko Doctor",        role: "Creative Dev",     sector: "Health & Media", year: "2025", url: "/proj-3.png" },
  { id: "04", title: "Heat Art Store",       role: "Fullstack Dev",    sector: "E-Commerce",     year: "2026", url: "/proj-1.png" },
  { id: "05", title: "Trimly",               role: "Frontend Dev",     sector: "Artisan",   year: "2025", url: "/proj-2.png" },
  // { id: "06", title: "Transcend 2.0",        role: "WebGL Engineer",   sector: "Real Estate",    year: "2025", url: "/proj-3.png" },

];

// ── Ring geometry constants ─────────────────────────────────────────────────
const CARD_COUNT  = projects.length;          // cards on the single ring
const RING_RADIUS = 2.2;                       // radius of the ring
const RING_TILT   = 0.88;                      // radians — tilt ring toward camera (~50°)
//   At theta=0 (top/front):  z ≈ +R·sin(TILT) → closest to camera (big cards)
//   At theta=π (bottom/back): z ≈ -R·sin(TILT) → furthest from camera (small upside-down cards)

// Pre-compute stable per-card data (outside component, never re-created)
const ringItems = projects.map((proj, i) => ({
  ...proj,
  uid:         `ring_${i}`,
  baseTheta:   (i / CARD_COUNT) * Math.PI * 2,  // evenly spaced around circle
  floatSpeed:  0.12 + (i % 4) * 0.03,
  floatOffset: (i * Math.PI * 2) / CARD_COUNT,
}));

export default function FloatingGallery({ activeProject, setActiveProject, inProjectView, groupOffsetX = 0 }) {
  const groupRef    = useRef();
  const meshesRef   = useRef([]);
  const materialsRef = useRef([]);

  const { viewport } = useThree();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Drag inertia
  const dragAngleRef    = useRef(0);
  const dragVelocityRef = useRef(0);
  const isDraggingRef   = useRef(false);
  const startXRef       = useRef(0);

  const lerp = (a, b, t) => a + (b - a) * t;

  useEffect(() => {
    const onDown  = (e) => {
      isDraggingRef.current = true;
      startXRef.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    };
    const onMove  = (e) => {
      if (!isDraggingRef.current) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const dx = cx - startXRef.current;
      startXRef.current = cx;
      const dA = (dx / window.innerWidth) * Math.PI * 1.4;
      dragAngleRef.current    += dA;
      dragVelocityRef.current  = dA;
    };
    const onUp    = () => { isDraggingRef.current = false; };
    const onClose = () => setHoveredIndex(null);

    window.addEventListener("pointerdown",  onDown);
    window.addEventListener("pointermove",  onMove);
    window.addEventListener("pointerup",    onUp);
    window.addEventListener("pointercancel",onUp);
    window.addEventListener("closeProjectDetails", onClose);
    return () => {
      window.removeEventListener("pointerdown",  onDown);
      window.removeEventListener("pointermove",  onMove);
      window.removeEventListener("pointerup",    onUp);
      window.removeEventListener("pointercancel",onUp);
      window.removeEventListener("closeProjectDetails", onClose);
    };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Inertia decay
    if (!isDraggingRef.current) {
      dragAngleRef.current    += dragVelocityRef.current;
      dragVelocityRef.current *= 0.90;
    }

    const drag   = dragAngleRef.current;
    const cursor = new THREE.Vector3(
      (state.pointer.x * viewport.width)  / 2,
      (state.pointer.y * viewport.height) / 2,
      0
    );

    const dummy = new THREE.Object3D();

    ringItems.forEach((item, i) => {
      const mesh = meshesRef.current[i];
      const mat  = materialsRef.current[i];
      if (!mesh) return;

      const isHovered = hoveredIndex === i;
      const hasHovered = hoveredIndex !== null;
      const isActive   = activeProject?.uid === item.uid;

     // ── Compute true Helix position ─────────────────────────────────────────────
const autoSpin = time * 0.05;
const theta    = item.baseTheta + autoSpin + drag;

// 1. Calculate the flat circle (X and Z)
const rx = Math.sin(theta) * RING_RADIUS;
const rz = Math.cos(theta) * RING_RADIUS;

// 2. Helix Y — use only baseTheta + drag (NOT autoSpin) so the ring
//    doesn't climb forever. Wrap to [0, 2π] then center around 0.
const HELIX_PITCH = 0.6;
const thetaForY   = item.baseTheta + drag;
const thetaMod    = ((thetaForY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
const ry          = (thetaMod / (Math.PI * 2) - 0.5) * HELIX_PITCH;

// 3. Gentle float (optional, but keep it local to Y)
const floatAmt = Math.sin(time * item.floatSpeed + item.floatOffset) * 0.08;
const baseX = rx;
const baseY = ry + floatAmt;
const baseZ = rz;


// ── Card rotation: face EXACTLY outward ─────────────────────────
dummy.position.set(baseX, baseY, baseZ);
// Look at the center of the cylinder at this specific card's Y-height
dummy.lookAt(0, baseY, 0); 
dummy.rotateY(Math.PI); // flip to face outward
const targetRot = dummy.rotation.clone();

// (Optional) Tilt the entire group wrapper rather than individual cards
// <group ref={groupRef} rotation={[0.4, 0, 0]}>

      // ── State-based overrides ─────────────────────────────────────────────
      const targetPos = new THREE.Vector3(baseX, baseY, baseZ);
      let targetScale   = 1.0;
      let targetOpacity = 0.85;
      let targetCurve   = 0.55;

      if (isActive) {
        // When active, completely center the card and scale it to fill the screen
        const activeViewport = state.viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 0, 4.2));
        const scaleX = activeViewport.width / 2.8;
        const scaleY = activeViewport.height / 2.1;
        
        targetPos.set(-groupOffsetX, 0, 4.2);
        targetRot.set(0, 0, 0);
        targetScale   = Math.max(scaleX, scaleY) * 1.05; // 5% buffer to guarantee no edge gaps
        targetOpacity = 1.0;
        targetCurve   = 0.0;
      } else if (inProjectView) {
        targetPos.z -= 6.0;
        targetScale   = 0.6;
        targetOpacity = 0.0;
      } else if (isHovered) {
        // Push slightly toward camera along the card's outward direction
        const outward = new THREE.Vector3(baseX, baseY, baseZ).normalize();
        targetPos.addScaledVector(outward, 0.55);
        targetScale   = 1.07;
        targetOpacity = 1.0;
        targetCurve   = 0.22;
      } else if (hasHovered) {
        targetScale   = 0.96;
        targetOpacity = 0.22;
      }

      // ── Smooth interpolation ─────────────────────────────────────────────
      const lerpF = 1 - Math.exp(-4.5 * delta);
      mesh.position.lerp(targetPos, lerpF);

      const cq = new THREE.Quaternion().setFromEuler(mesh.rotation);
      const tq = new THREE.Quaternion().setFromEuler(targetRot);
      cq.slerp(tq, lerpF);
      mesh.rotation.setFromQuaternion(cq);

      mesh.scale.setScalar(lerp(mesh.scale.x, targetScale, lerpF));

      // ── Shader uniforms ──────────────────────────────────────────────────
      if (mat?.uniforms) {
        let tSat    = 0.0;
        let tBright = 1.0;
        if (isHovered)      { tSat = 0.3;  tBright = 1.25; }
        else if (hasHovered) {              tBright = 0.72; }

        mat.uniforms.uOpacity.value    = lerp(mat.uniforms.uOpacity.value,    targetOpacity, lerpF);
        mat.uniforms.uSaturation.value = lerp(mat.uniforms.uSaturation.value, tSat,          lerpF);
        mat.uniforms.uBrightness.value = lerp(mat.uniforms.uBrightness.value, tBright,       lerpF);
        if (mat.uniforms.uCurve) {
          mat.uniforms.uCurve.value = lerp(mat.uniforms.uCurve.value, targetCurve, lerpF);
        }
      }
    });
  });

  const handlePointerOver = (e, i) => { e.stopPropagation(); setHoveredIndex(i); document.body.style.cursor = "pointer"; };
  const handlePointerOut  = (e)    => { e.stopPropagation(); setHoveredIndex(null); document.body.style.cursor = "auto"; };
  const handleClick       = (e, item) => { e.stopPropagation(); setActiveProject(item); };

  return (
    <group ref={groupRef} position={[groupOffsetX, 0, 0]} onPointerMissed={() => setHoveredIndex(null)}>
      {ringItems.map((item, i) => (
        <group key={item.uid}>
          <mesh
            ref={(el) => (meshesRef.current[i] = el)}
            onPointerOver={(e) => handlePointerOver(e, i)}
            onPointerOut={handlePointerOut}
            onClick={(e) => handleClick(e, item)}
          >
            {/* 4:3 Landscape card: 2.8 wide × 2.1 tall */}
            <planeGeometry args={[2.8, 2.1, 28, 28]} />
            <SlicingShaderMaterial
              ref={(el) => (materialsRef.current[i] = el)}
              imageUrl={item.url}
              transparent={true}
            />
            {hoveredIndex === i && activeProject?.uid !== item.uid && (
              <Html center position={[0, -1.6, 0.2]} className="pointer-events-none z-50">
                <div className="bg-[#0a0a0a]/90 text-[#ecdfcc] px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border border-neutral-800 backdrop-blur-md whitespace-nowrap shadow-2xl">
                  {item.title}
                  <span className="text-neutral-500 opacity-50 ml-1.5">// {item.sector}</span>
                </div>
              </Html>
            )}
          </mesh>
        </group>
      ))}
    </group>
  );
}
