"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export default function ProjectStage({ activeProject, inProjectView }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const { viewport } = useThree();

  // Preload project textures for instantaneous full-screen transitions
  const textures = useTexture([
    "/proj-1.png",
    "/proj-2.png",
    "/proj-3.png",
  ]);

  // Map project image URLs to preloaded textures
  const textureMap = useMemo(
    () => ({
      "/proj-1.png": textures[0],
      "/proj-2.png": textures[1],
      "/proj-3.png": textures[2],
    }),
    [textures]
  );

  const currentTexture =
    textureMap[activeProject?.url] || textures[0];

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      uTextureCurrent: { value: currentTexture },
      uTextureNext: { value: currentTexture },
      uTransition: { value: 1.0 }, // 0.0 to 1.0 cross-dissolve progress
      uOpacity: { value: 0.0 }, // Overall stage visibility
      uResolution: {
        value: new THREE.Vector2(viewport.width, viewport.height),
      },
      uImageResolution: { value: new THREE.Vector2(16, 9) },
      uTime: { value: 0.0 },
      uDirection: { value: 1.0 },
    }),
    [currentTexture, viewport]
  );

  // Transition trigger when active project changes
  const prevProjectRef = useRef(activeProject);
  useEffect(() => {
    if (!materialRef.current || !activeProject) return;

    const prevUrl = prevProjectRef.current?.url || activeProject.url;
    const nextUrl = activeProject.url;

    if (prevUrl !== nextUrl) {
      const prevTex = textureMap[prevUrl] || textures[0];
      const nextTex = textureMap[nextUrl] || textures[0];

      materialRef.current.uniforms.uTextureCurrent.value = prevTex;
      materialRef.current.uniforms.uTextureNext.value = nextTex;
      materialRef.current.uniforms.uTransition.value = 0.0;
    }

    prevProjectRef.current = activeProject;
  }, [activeProject, textureMap, textures]);

  // Update viewport resolution in shader
  useEffect(() => {
    if (materialRef.current?.uniforms?.uResolution) {
      materialRef.current.uniforms.uResolution.value.set(
        viewport.width,
        viewport.height
      );
    }
  }, [viewport]);

  // Continuous frame updates
  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const time = state.clock.elapsedTime;
    mat.uniforms.uTime.value = time;

    // Smoothly fade in when inProjectView is true, fade out when false
    const targetOpacity = inProjectView ? 1.0 : 0.0;
    mat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      mat.uniforms.uOpacity.value,
      targetOpacity,
      1 - Math.exp(-6.0 * delta)
    );

    // Smooth transition progress towards 1.0
    if (mat.uniforms.uTransition.value < 1.0) {
      mat.uniforms.uTransition.value = THREE.MathUtils.lerp(
        mat.uniforms.uTransition.value,
        1.0,
        1 - Math.exp(-7.0 * delta)
      );
      if (mat.uniforms.uTransition.value > 0.999) {
        mat.uniforms.uTransition.value = 1.0;
      }
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTextureCurrent;
    uniform sampler2D uTextureNext;
    uniform float uTransition;
    uniform float uOpacity;
    uniform vec2 uResolution;
    uniform vec2 uImageResolution;
    uniform float uTime;
    varying vec2 vUv;

    // Maintain true 16:9 cover aspect ratio without distortion
    vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 imgRes) {
      float screenAspect = screenRes.x / screenRes.y;
      float imgAspect = imgRes.x / imgRes.y;
      vec2 newUv = uv;

      if (screenAspect > imgAspect) {
        float scale = imgAspect / screenAspect;
        newUv.y = (uv.y - 0.5) * scale + 0.5;
      } else {
        float scale = screenAspect / imgAspect;
        newUv.x = (uv.x - 0.5) * scale + 0.5;
      }
      return newUv;
    }

    void main() {
      vec2 coverUv = getCoverUv(vUv, uResolution, uImageResolution);

      // Liquid displacement distortion during project transition
      float progress = clamp(uTransition, 0.0, 1.0);
      float displacement = sin(coverUv.y * 12.0 + progress * 6.28) * (1.0 - progress) * progress * 0.06;
      
      vec2 uv1 = coverUv + vec2(displacement, 0.0);
      vec2 uv2 = coverUv - vec2(displacement, 0.0);

      vec4 color1 = texture2D(uTextureCurrent, uv1);
      vec4 color2 = texture2D(uTextureNext, uv2);

      // Smooth cross-dissolve with chromatic RGB split
      float r = mix(color1.r, color2.r, smoothstep(0.0, 1.0, progress + displacement * 0.5));
      float g = mix(color1.g, color2.g, smoothstep(0.0, 1.0, progress));
      float b = mix(color1.b, color2.b, smoothstep(0.0, 1.0, progress - displacement * 0.5));

      vec3 finalColor = vec3(r, g, b);

      // Subtle vignette and dark gradient at bottom for typography readability
      float vignette = smoothstep(1.2, 0.2, length(vUv - 0.5));
      finalColor *= mix(0.7, 1.0, vignette);

      gl_FragColor = vec4(finalColor, uOpacity);
    }
  `;

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 1.0]}
      visible={inProjectView || (materialRef.current?.uniforms?.uOpacity.value > 0.01)}
    >
      {/* Plane covering full screen */}
      <planeGeometry args={[viewport.width * 1.05, viewport.height * 1.05, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthTest={false}
      />
    </mesh>
  );
}
