"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uMouse;
  uniform vec2 uPrevMouse;
  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;

  void main() {
    vec2 st = vUv;
    
    // Correct aspect ratio distortion
    vec2 mouse = uMouse;
    vec2 prevMouse = uPrevMouse;
    st.x *= uAspect;
    mouse.x *= uAspect;
    prevMouse.x *= uAspect;

    // Calculate mouse velocity vector
    vec2 vel = mouse - prevMouse;
    float dist = distance(st, mouse);
    
    // Create localized radial force field
    float radius = 0.25;
    float power = smoothstep(radius, 0.0, dist);
    
    // Generate organic ripple noise
    vec2 ripple = vel * power * 3.0;
    
    // Output deep clinical slate tint with velocity distortion
    vec3 baseColor = vec3(0.04, 0.045, 0.04); // #0a0b0a base
    vec3 fluidColor = vec3(0.12, 0.14, 0.13) * length(ripple);
    
    gl_FragColor = vec4(baseColor + fluidColor, 0.7);
  }
`;

export default function FluidShader() {
  const meshRef = useRef();
  const { viewport } = useThree();

  const mouseState = useRef({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
  });

  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPrevMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uAspect: { value: viewport.width / viewport.height },
    }),
    [viewport]
  );

  useFrame((state) => {
    if (!meshRef.current) return;

    const currentX = (state.pointer.x + 1) / 2;
    const currentY = (state.pointer.y + 1) / 2;

    mouseState.current.prevX = THREE.MathUtils.lerp(mouseState.current.prevX, currentX, 0.1);
    mouseState.current.prevY = THREE.MathUtils.lerp(mouseState.current.prevY, currentY, 0.1);

    uniforms.uMouse.value.set(currentX, currentY);
    uniforms.uPrevMouse.value.set(mouseState.current.prevX, mouseState.current.prevY);
    uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}