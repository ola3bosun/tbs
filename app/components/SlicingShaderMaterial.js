"use client";

import { useMemo, forwardRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

const SlicingShaderMaterial = forwardRef(
  ({ imageUrl, textureUrl, url }, ref) => {
    // Resolve valid image source with fallback
    const src = imageUrl || textureUrl || url || "/proj-1.png";
    const texture = useTexture(src);

    // Memoize shader uniforms so they persist across render cycles
    const uniforms = useMemo(
      () => ({
        uTexture: { value: texture },
        uTextureNext: { value: texture },
        uTransition: { value: 1.0 }, // 0.0 to 1.0 cross-dissolve progress
        uSaturation: { value: 0.0 }, // 0.0 (monochrome) to 1.0 (full color)
        uBrightness: { value: 1.0 }, // 1.0 (normal) to 1.5+ (brightened on hover)
        uOpacity: { value: 1.0 }, // 0.0 to 1.0 transparency
        uCurve: { value: 0.55 }, // 0.0 (flat plane) to 1.0 (bent cylinder)
        uVelocity: { value: 0.0 }, // Drag velocity driving RGB chromatic aberration
        uHover: { value: 0.0 }, // 0.0 to 1.0 hover state for liquid ripples
        uHoverPos: { value: new THREE.Vector2(0.5, 0.5) }, // Normalized cursor UV position on card
        uTime: { value: 0.0 }, // Elapsed time for ripple wave animation
      }),
      [texture]
    );

    // Vertex Shader: Bends the flat plane into a smooth curved cylinder segment
    const vertexShader = `
    uniform float uCurve;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Bend plane along the X-axis into a cylindrical arc
      float radius = 5.0;
      float theta = pos.x / radius;
      
      float curvedX = sin(theta) * radius;
      float curvedZ = (cos(theta) * radius) - radius;

      // Blend smoothly between flat geometry (uCurve = 0.0) and curved geometry (uCurve > 0.0)
      pos.x = mix(pos.x, curvedX, uCurve);
      pos.z = mix(pos.z, curvedZ, uCurve);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

    // Fragment Shader: Liquid ripples, velocity chromatic aberration, and seamless in-place cross-dissolves
    const fragmentShader = `
    uniform sampler2D uTexture;
    uniform sampler2D uTextureNext;
    uniform float uTransition;
    uniform float uSaturation;
    uniform float uBrightness;
    uniform float uOpacity;
    uniform float uVelocity;
    uniform float uHover;
    uniform vec2 uHoverPos;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // 1. Interactive Liquid Ripple around cursor hit point on hover
      vec2 delta = uv - uHoverPos;
      float dist = length(delta);
      float ripple = sin(dist * 20.0 - uTime * 4.5) * exp(-dist * 4.5) * 0.02 * uHover;
      vec2 rippleOffset = (dist > 0.0001) ? normalize(delta) * ripple : vec2(0.0);
      vec2 distortedUv = uv + rippleOffset;

      // 2. Velocity-driven Chromatic Aberration (RGB channel splitting)
      float aberrationStrength = clamp(uVelocity * 0.45, 0.0, 0.035);

      // 3. Liquid Cross-Dissolve during in-place project transitions (X1 -> X2)
      float progress = clamp(uTransition, 0.0, 1.0);
      float transitionDisplacement = sin(uv.y * 10.0 + progress * 6.28) * (1.0 - progress) * progress * 0.05;

      vec2 uvCurr = clamp(distortedUv + vec2(transitionDisplacement, 0.0), 0.0, 1.0);
      vec2 uvNext = clamp(distortedUv - vec2(transitionDisplacement, 0.0), 0.0, 1.0);

      // Sample current and next textures with RGB channel split
      float rCurr = texture2D(uTexture, clamp(uvCurr + vec2(aberrationStrength, 0.0), 0.0, 1.0)).r;
      float gCurr = texture2D(uTexture, uvCurr).g;
      float bCurr = texture2D(uTexture, clamp(uvCurr - vec2(aberrationStrength, 0.0), 0.0, 1.0)).b;
      float aCurr = texture2D(uTexture, uvCurr).a;

      float rNext = texture2D(uTextureNext, clamp(uvNext + vec2(aberrationStrength, 0.0), 0.0, 1.0)).r;
      float gNext = texture2D(uTextureNext, uvNext).g;
      float bNext = texture2D(uTextureNext, clamp(uvNext - vec2(aberrationStrength, 0.0), 0.0, 1.0)).b;
      float aNext = texture2D(uTextureNext, uvNext).a;

      vec3 colorCurr = vec3(rCurr, gCurr, bCurr);
      vec3 colorNext = vec3(rNext, gNext, bNext);

      // Smooth interpolation between textures
      vec3 blendedColor = mix(colorCurr, colorNext, smoothstep(0.0, 1.0, progress));
      float blendedAlpha = mix(aCurr, aNext, progress);

      // 4. Monochrome luminance conversion and saturation mix
      float luminance = dot(blendedColor, vec3(0.299, 0.587, 0.114));
      vec3 monoColor = vec3(luminance);
      vec3 satColor = mix(monoColor, blendedColor, uSaturation);

      // 5. Final color output with brightness and opacity
      vec3 finalColor = satColor * uBrightness;

      gl_FragColor = vec4(finalColor, blendedAlpha * uOpacity);
    }
  `;

    return (
      <shaderMaterial
        ref={ref}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
        transparent={true}
      />
    );
  }
);

SlicingShaderMaterial.displayName = "SlicingShaderMaterial";

export default SlicingShaderMaterial;