"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html, useTexture } from "@react-three/drei";
import SlicingShaderMaterial from "./SlicingShaderMaterial";
import { projects } from "../data/projects";

// ── Ring geometry constants ─────────────────────────────────────────────────
const CARD_COUNT = projects.length;
const RING_RADIUS = 2.6;

// Pre-compute stable card positions once outside the component
const ringItems = projects.map((proj, i) => ({
  ...proj,
  uid: `ring_${i}`,
  baseTheta: (i / CARD_COUNT) * Math.PI * 2,
  floatSpeed: 0.12 + (i % 4) * 0.03,
  floatOffset: (i * Math.PI * 2) / CARD_COUNT,
}));

// Reusable Three.js math objects to prevent garbage collection pauses
const _dummy = new THREE.Object3D();
const _targetPos = new THREE.Vector3();
const _outward = new THREE.Vector3();
const _currentQuat = new THREE.Quaternion();
const _targetQuat = new THREE.Quaternion();
const _camFocusPoint = new THREE.Vector3(0, 0, 4.3);

export default function FloatingGallery({
  activeProject,
  setActiveProject,
  inProjectView,
  isRevealed = false,
}) {
  const groupRef = useRef();
  const meshesRef = useRef([]);
  const materialsRef = useRef([]);
  const entryProgressRef = useRef(0);

  // Preload project textures for instantaneous transitions in full-screen mode
  const preloadedTextures = useTexture([
    "/proj-1.png",
    "/proj-2.png",
    "/proj-3.png",
  ]);

  const textureMap = useMemo(
    () => ({
      "/proj-1.png": preloadedTextures[0],
      "/proj-2.png": preloadedTextures[1],
      "/proj-3.png": preloadedTextures[2],
    }),
    [preloadedTextures]
  );

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const activeMeshIndexRef = useRef(0);
  const prevProjectUrlRef = useRef(null);

  // Drag inertia tracking
  const dragAngleRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const smoothVelocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  const lerp = (a, b, t) => a + (b - a) * t;

  // Track initial entry mesh index when opening project view (Y -> X)
  useEffect(() => {
    if (inProjectView && activeProject) {
      const idx = ringItems.findIndex((p) => p.id === activeProject.id);
      if (idx !== -1) {
        activeMeshIndexRef.current = idx;
      }
    }
  }, [inProjectView]);

  // Handle in-place full-screen texture transitions (X1 -> X2)
  useEffect(() => {
    if (!inProjectView || !activeProject) {
      prevProjectUrlRef.current = activeProject?.url || null;
      return;
    }

    const activeMeshIdx = activeMeshIndexRef.current;
    const mat = materialsRef.current[activeMeshIdx];
    if (!mat?.uniforms) return;

    const nextUrl = activeProject.url || "/proj-1.png";
    const prevUrl = prevProjectUrlRef.current || nextUrl;

    if (prevUrl !== nextUrl) {
      const prevTex = textureMap[prevUrl] || preloadedTextures[0];
      const nextTex = textureMap[nextUrl] || preloadedTextures[0];

      mat.uniforms.uTexture.value = prevTex;
      mat.uniforms.uTextureNext.value = nextTex;
      mat.uniforms.uTransition.value = 0.0;
    }

    prevProjectUrlRef.current = nextUrl;
  }, [activeProject, inProjectView, textureMap, preloadedTextures]);

  useEffect(() => {
    const onDown = (e) => {
      if (inProjectView) return;
      isDraggingRef.current = true;
      startXRef.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    };

    const onMove = (e) => {
      if (!isDraggingRef.current || inProjectView) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const dx = cx - startXRef.current;
      startXRef.current = cx;
      const dA = (dx / window.innerWidth) * Math.PI * 1.4;
      dragAngleRef.current += dA;
      dragVelocityRef.current = dA;
    };

    const onUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      if (inProjectView) return;
      // Convert wheel or trackpad scroll delta into smooth rotation in carousel view
      const primaryDelta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const scrollSpeed = (primaryDelta / window.innerWidth) * Math.PI * 0.9;
      dragAngleRef.current += scrollSpeed;
      dragVelocityRef.current = scrollSpeed;
    };

    const onClose = () => setHoveredIndex(null);

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("closeProjectDetails", onClose);

    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("closeProjectDetails", onClose);
    };
  }, [inProjectView]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Choreographed Act II reveal progression (0 -> 1 as blast doors part)
    const targetEntry = isRevealed ? 1.0 : 0.0;
    entryProgressRef.current = THREE.MathUtils.lerp(
      entryProgressRef.current,
      targetEntry,
      1 - Math.exp(-3.2 * delta)
    );
    const entry = entryProgressRef.current;
    const entrySpinOffset = (1 - entry) * Math.PI * 0.65;
    const activeRadius = RING_RADIUS * (0.55 + 0.45 * entry);
    const entryYOffset = (1 - entry) * -0.55;

    // Apply drag inertia decay when not actively dragging
    if (!isDraggingRef.current) {
      dragAngleRef.current += dragVelocityRef.current;
      dragVelocityRef.current *= 0.9;
    }

    const drag = dragAngleRef.current;

    // Smooth instantaneous drag speed for chromatic aberration
    const currentSpeed = Math.abs(dragVelocityRef.current) + (1 - entry) * 0.04;
    smoothVelocityRef.current = THREE.MathUtils.lerp(
      smoothVelocityRef.current,
      currentSpeed,
      0.15
    );

    const activeMeshIdx = activeMeshIndexRef.current;

    ringItems.forEach((item, i) => {
      const mesh = meshesRef.current[i];
      const mat = materialsRef.current[i];
      if (!mesh) return;

      const isHovered = hoveredIndex === i && !inProjectView;
      const hasHovered = hoveredIndex !== null && !inProjectView;
      const isActiveMesh = inProjectView && activeMeshIdx === i;

      // ── Continuous smooth wave positioning in carousel ─────────────────────
      const autoSpin = inProjectView ? 0 : time * 0.05;
      const theta = item.baseTheta + autoSpin + drag + entrySpinOffset;

      // Calculate circular ring coordinates (X and Z)
      const rx = Math.sin(theta) * activeRadius;
      const rz = Math.cos(theta) * activeRadius;

      // Smooth continuous vertical wave based on angle
      const waveY = Math.sin(theta) * 0.35;
      const floatAmt =
        Math.sin(time * item.floatSpeed + item.floatOffset) * 0.08;

      const baseX = rx;
      const baseY = waveY + floatAmt + entryYOffset;
      const baseZ = rz;

      // ── Card rotation: face outwards from cylinder center ──────────────────
      _dummy.position.set(baseX, baseY, baseZ);
      _dummy.lookAt(0, baseY, 0);
      _dummy.rotateY(Math.PI);
      _targetQuat.copy(_dummy.quaternion);

      // ── State overrides for active / hovered / normal states ───────────────
      _targetPos.set(baseX, baseY, baseZ);
      let targetScale = 0.86 + 0.14 * entry;
      let targetOpacity = 0.85 * entry;
      let targetCurve = 0.55;

      if (isActiveMesh) {
        // 1. ACTIVE FULL-SCREEN CARD (View X):
        // Flies forward from carousel ring, unbends to flat plane, and scales up to cover viewport
        const activeViewport = state.viewport.getCurrentViewport(
          state.camera,
          _camFocusPoint
        );
        const scaleX = activeViewport.width / 2.4;
        const scaleY = activeViewport.height / 1.35;
        const fitScale = Math.max(scaleX, scaleY) * 1.05;

        _targetPos.set(0, 0, 4.3);
        _targetQuat.set(0, 0, 0, 1);
        targetScale = fitScale;
        targetOpacity = 1.0;
        targetCurve = 0.0;
      } else if (inProjectView) {
        // 2. OTHER CARDS IN EXPANDED VIEW: smoothly push back and fade out
        _targetPos.set(baseX * 1.5, baseY, baseZ - 6.0);
        targetScale = 0.5;
        targetOpacity = 0.0;
      } else if (isHovered) {
        // 3. HOVERED IN CAROUSEL: step forward slightly
        _outward.set(baseX, baseY, baseZ).normalize();
        _targetPos.addScaledVector(_outward, 0.45);
        targetScale = 1.08;
        targetOpacity = 1.0;
        targetCurve = 0.25;
      } else if (hasHovered) {
        // 4. NON-HOVERED IN CAROUSEL: dim slightly
        targetScale = 0.96;
        targetOpacity = 0.25;
      }

      // ── Smooth frame interpolation ─────────────────────────────────────────
      const lerpF = 1 - Math.exp(-5.5 * delta);
      mesh.position.lerp(_targetPos, lerpF);

      _currentQuat.copy(mesh.quaternion);
      _currentQuat.slerp(_targetQuat, lerpF);
      mesh.quaternion.copy(_currentQuat);

      mesh.scale.setScalar(lerp(mesh.scale.x, targetScale, lerpF));

      // ── Update shader uniforms smoothly ───────────────────────────────────
      if (mat?.uniforms) {
        let tSat = 0.0;
        let tBright = 1.0;
        if (isActiveMesh) {
          tSat = 0.0;
          tBright = 1.0;
        } else if (isHovered) {
          tSat = 0.3;
          tBright = 1.25;
        } else if (hasHovered) {
          tSat = 0.0;
          tBright = 0.5;
        }

        if (mat.uniforms.uSaturation) {
          mat.uniforms.uSaturation.value = lerp(
            mat.uniforms.uSaturation.value,
            tSat,
            0.08
          );
        }
        if (mat.uniforms.uBrightness) {
          mat.uniforms.uBrightness.value = lerp(
            mat.uniforms.uBrightness.value,
            tBright,
            0.08
          );
        }
        if (mat.uniforms.uCurve) {
          mat.uniforms.uCurve.value = lerp(
            mat.uniforms.uCurve.value,
            targetCurve,
            lerpF
          );
        }
        if (mat.uniforms.uOpacity) {
          mat.uniforms.uOpacity.value = lerp(
            mat.uniforms.uOpacity.value,
            targetOpacity,
            lerpF
          );
        }

        // Animate in-place liquid transition progress towards 1.0
        if (mat.uniforms.uTransition && mat.uniforms.uTransition.value < 1.0) {
          mat.uniforms.uTransition.value = THREE.MathUtils.lerp(
            mat.uniforms.uTransition.value,
            1.0,
            1 - Math.exp(-6.5 * delta)
          );
          if (mat.uniforms.uTransition.value > 0.998) {
            mat.uniforms.uTransition.value = 1.0;
            mat.uniforms.uTexture.value = mat.uniforms.uTextureNext.value;
          }
        }

        // Update liquid refraction and velocity uniforms
        if (mat.uniforms.uVelocity) {
          mat.uniforms.uVelocity.value = lerp(
            mat.uniforms.uVelocity.value,
            smoothVelocityRef.current,
            0.1
          );
        }
        if (mat.uniforms.uHover) {
          mat.uniforms.uHover.value = lerp(
            mat.uniforms.uHover.value,
            isHovered ? 1.0 : 0.0,
            0.1
          );
        }
        if (mat.uniforms.uTime) {
          mat.uniforms.uTime.value = time;
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {ringItems.map((item, index) => {
        const isHovered = hoveredIndex === index && !inProjectView;

        return (
          <mesh
            key={item.uid}
            ref={(el) => (meshesRef.current[index] = el)}
            onPointerOver={(e) => {
              if (inProjectView) return;
              e.stopPropagation();
              setHoveredIndex(index);
            }}
            onPointerOut={(e) => {
              if (inProjectView) return;
              e.stopPropagation();
              setHoveredIndex(null);
            }}
            onPointerMove={(e) => {
              if (inProjectView) return;
              if (e.uv && materialsRef.current[index]?.uniforms?.uHoverPos) {
                materialsRef.current[index].uniforms.uHoverPos.value.set(
                  e.uv.x,
                  e.uv.y
                );
              }
            }}
            onClick={(e) => {
              if (inProjectView) return;
              e.stopPropagation();
              activeMeshIndexRef.current = index;
              setActiveProject(item);
            }}
          >
            {/* Native 16:9 landscape card geometry */}
            <planeGeometry args={[2.4, 1.35, 32, 32]} />

            {/* Custom Slicing and Liquid Refraction Shader */}
            <SlicingShaderMaterial
              ref={(el) => (materialsRef.current[index] = el)}
              imageUrl={item.url || "/proj-1.png"}
            />

            {/* HTML label badge when hovered in carousel mode */}
            {isHovered && !inProjectView && (
              <Html position={[0, -0.95, 0]} center distanceFactor={8}>
                <div className="pointer-events-none text-center whitespace-nowrap">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#ecdfcc] bg-[#0a0a0a]/80 px-2 py-0.5 rounded border border-neutral-700">
                    {item.title} {" // "} {item.year}
                  </span>
                </div>
              </Html>
            )}
          </mesh>
        );
      })}
    </group>
  );
}
