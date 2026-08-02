// components/SlicingShaderMaterial.jsx
"use client";

import { useMemo, forwardRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

const SlicingShaderMaterial = forwardRef(({ imageUrl }, ref) => {
  // Load the project texture
  const texture = useTexture(imageUrl);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uProgress: { value: 0.0 }, // GSAP will animate this from 0 (flat) to 1 (fractured)
      uRings: { value: 8.0 },    // Number of concentric slices
      uSaturation: { value: 0.0 }, // 0.0 (monochrome) to 1.0 (full color)
      uBrightness: { value: 1.0 }, // 1.0 (normal) to 1.5+ (brightened)
      uOpacity: { value: 1.0 },    // 0.0 to 1.0
      uCurve: { value: 1.0 },      // 0.0 (flat) to 1.0 (curved)
    }),
    [texture]
  );

  const vertexShader = `
    uniform float uProgress;
    uniform float uCurve;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Bend the plane into a cylinder segment
      // The radius of our cylinder in FloatingGallery is around 5.
      // So the curvature is 1.0 / Radius = 0.2
      // We map the X coordinate to an angle, and use cos/sin to offset Z and X.
      
      float radius = 5.0;
      float theta = pos.x / radius;
      
      // Calculate bent positions
      float curvedX = sin(theta) * radius;
      float curvedZ = (cos(theta) * radius) - radius; // offset so center remains at z=0

      // Mix between flat and curved based on uCurve
      pos.x = mix(pos.x, curvedX, uCurve);
      pos.z = mix(pos.z, curvedZ, uCurve);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uSaturation;
    uniform float uBrightness;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);

      // Convert to monochrome (luminance)
      float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      vec3 monoColor = vec3(luminance);
      
      // Interpolate between monochrome and original color based on uSaturation
      vec3 satColor = mix(monoColor, texColor.rgb, uSaturation);
      
      // Apply brightness
      vec3 finalColor = satColor * uBrightness;

      gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
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
});

SlicingShaderMaterial.displayName = "SlicingShaderMaterial";

export default SlicingShaderMaterial;