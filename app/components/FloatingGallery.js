"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import SlicingShaderMaterial from "./SlicingShaderMaterial";

// Generate 20 projects based on the original data
const baseProjects = [
  { id: "01", title: "Transcend Projects", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1024&auto=format&fit=crop" },
  { id: "02", title: "TNS_OS", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1024&auto=format&fit=crop" },
  { id: "03", title: "The Nuanced Studio", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1024&auto=format&fit=crop" },
  { id: "04", title: "ProjectHelix", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1024&auto=format&fit=crop" },
  { id: "05", title: "Trimly", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1024&auto=format&fit=crop" }
];

const galleryItems = Array.from({ length: 20 }).map((_, i) => {
  const base = baseProjects[i % baseProjects.length];
  
  // Cylindrical Spiral Layout
  const radius = 5.0;
  const theta = i * (Math.PI * 2 / 6); // 6 items per full circle
  const z = -i * 1.5; // Space them out along the Z axis
  
  // Base parameters for dynamic calculation in useFrame
  const rotOffsetX = (Math.random() - 0.5) * 0.2;
  const rotOffsetY = (Math.random() - 0.5) * 0.2;
  const rotOffsetZ = (Math.random() - 0.5) * 0.2;
  
  // Random scale variation
  const scale = 0.8 + Math.random() * 0.4;

  return {
    ...base,
    uid: `proj_${i}`,
    baseTheta: theta,
    baseZ: z,
    rotOffset: new THREE.Euler(rotOffsetX, rotOffsetY, rotOffsetZ),
    baseScale: scale,
    floatSpeed: 0.2 + Math.random() * 0.8,
    floatOffset: Math.random() * Math.PI * 2,
  };
});

export default function FloatingGallery({ setActiveProject, inProjectView }) {
  const groupRef = useRef();
  const meshesRef = useRef([]);
  const materialsRef = useRef([]);
  const shadowRefs = useRef([]);
  
  const { viewport, camera } = useThree();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Custom easing function for smooth lerping
  const lerp = (start, end, factor) => start + (end - start) * factor;

  // Handle pointer out globally if leaving the canvas area
  useEffect(() => {
    const handlePointerMissed = () => {
      setHoveredIndex(null);
    };
    window.addEventListener('closeProjectDetails', handlePointerMissed);
    return () => window.removeEventListener('closeProjectDetails', handlePointerMissed);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Map cursor to world space at Z=0 roughly
    const cursor = new THREE.Vector3(
      (state.pointer.x * viewport.width) / 2,
      (state.pointer.y * viewport.height) / 2,
      0
    );

    galleryItems.forEach((item, i) => {
      const mesh = meshesRef.current[i];
      const mat = materialsRef.current[i];
      const shadow = shadowRefs.current[i];
      if (!mesh) return;

      const isHovered = hoveredIndex === i;
      const hasHovered = hoveredIndex !== null;

      // 1. Calculate dynamic barrel roll position
      const radius = 5.0;
      const currentTheta = item.baseTheta + time * 0.15; // Barrel roll speed
      
      const baseX = Math.cos(currentTheta) * radius;
      const baseY = Math.sin(currentTheta) * radius;
      
      // Calculate dynamic rotation to face inward
      const dummy = new THREE.Object3D();
      dummy.position.set(baseX, baseY, item.baseZ);
      dummy.up.set(0, 0, 1);
      dummy.lookAt(0, 0, item.baseZ);
      dummy.rotateY(Math.PI);
      
      const basePos = new THREE.Vector3(baseX, baseY, item.baseZ);
      const baseRot = dummy.rotation.clone();
      baseRot.x += item.rotOffset.x;
      baseRot.y += item.rotOffset.y;
      baseRot.z += item.rotOffset.z;

      // 2. Calculate ambient floating offsets
      const floatY = Math.sin(time * item.floatSpeed + item.floatOffset) * 0.3;
      const floatX = Math.cos(time * item.floatSpeed * 0.7 + item.floatOffset) * 0.15;
      const floatRotX = Math.sin(time * item.floatSpeed * 0.5 + item.floatOffset) * 0.05;
      const floatRotY = Math.cos(time * item.floatSpeed * 0.4 + item.floatOffset) * 0.05;

      // Target vectors
      const targetPos = basePos.clone().add(new THREE.Vector3(floatX, floatY, 0));
      const targetRot = baseRot.clone();
      targetRot.x += floatRotX;
      targetRot.y += floatRotY;
      
      let targetScale = item.baseScale;
      let targetOpacity = 0.8; // Default opacity
      let targetCurve = 1.0; // Default curved

      if (isHovered) {
        // Hero Card Logic
        // Ease toward center, brought forward
        targetPos.set(cursor.x * 0.1, cursor.y * 0.1, 3);
        
        // Straighten out
        targetRot.set(0, 0, 0);
        
        // Scale up
        targetScale = item.baseScale * 1.1; // Scale up to 110%
        targetOpacity = 1.0;
        targetCurve = 0.0; // Flatten the card completely
        
      } else if (hasHovered) {
        // Background Cards Logic (Repulsion & Dimming)
        const heroPos = meshesRef.current[hoveredIndex].position;
        const dist = targetPos.distanceTo(heroPos);
        
        if (dist < 4.0) {
          // Push away
          const repelDir = targetPos.clone().sub(heroPos).normalize();
          const repelForce = (4.0 - dist) * 0.5;
          targetPos.add(repelDir.multiplyScalar(repelForce));
        }
        
        targetScale = item.baseScale * 0.95; // Shrink slightly
        targetOpacity = 0.3;
      } else {
        // Default ambient state
        // Magnetic attraction to cursor
        const distToCursor = targetPos.distanceTo(cursor);
        if (distToCursor < 6.0) {
          const attractDir = cursor.clone().sub(targetPos).normalize();
          const attractForce = (6.0 - distToCursor) * 0.05;
          targetPos.add(attractDir.multiplyScalar(attractForce));
          
          // Subtle rotation towards cursor
          targetRot.x -= attractDir.y * 0.1;
          targetRot.y += attractDir.x * 0.1;
        }
      }

      // Smooth interpolation (inertia)
      // Use dt-independent lerp: 1 - exp(-decay * dt)
      const lerpFactor = 1 - Math.exp(-4.0 * delta); // Adjust 4.0 for stiffness

      mesh.position.lerp(targetPos, lerpFactor);

      // Slerp rotation
      const currentQuat = new THREE.Quaternion().setFromEuler(mesh.rotation);
      const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);
      currentQuat.slerp(targetQuat, lerpFactor);
      mesh.rotation.setFromQuaternion(currentQuat);

      // Lerp scale
      mesh.scale.setScalar(lerp(mesh.scale.x, targetScale, lerpFactor));

      // Lerp shader uniforms (Opacity, Saturation, Brightness, Curve)
      if (mat && mat.uniforms) {
        let targetSaturation = 0.0;
        let targetBrightness = 1.0;
        
        if (isHovered) {
          targetSaturation = 0.25; // slightly increased saturation
          targetBrightness = 1.2; // increased brightness
        } else if (hasHovered) {
          targetBrightness = 0.8; // darkened background
        }
        
        mat.uniforms.uOpacity.value = lerp(mat.uniforms.uOpacity.value, targetOpacity, lerpFactor);
        mat.uniforms.uSaturation.value = lerp(mat.uniforms.uSaturation.value, targetSaturation, lerpFactor);
        mat.uniforms.uBrightness.value = lerp(mat.uniforms.uBrightness.value, targetBrightness, lerpFactor);
        if (mat.uniforms.uCurve) {
          mat.uniforms.uCurve.value = lerp(mat.uniforms.uCurve.value, targetCurve, lerpFactor);
        }
      }

      // Handle shadow depth
      if (shadow) {
        // Shadow moves further down/back when scale is larger (hero)
        const shadowDist = isHovered ? -0.5 : -0.1;
        const targetShadowZ = shadowDist * targetScale;
        shadow.position.z = lerp(shadow.position.z, targetShadowZ, lerpFactor);

        // Shadow opacity
        shadow.material.opacity = lerp(shadow.material.opacity, isHovered ? 0.6 : 0.3, lerpFactor);
      }
    });
  });

  const handlePointerOver = (e, index) => {
    e.stopPropagation();
    setHoveredIndex(index);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHoveredIndex(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e, item) => {
    e.stopPropagation();
    setActiveProject(item);
  };

  return (
    <group ref={groupRef} onPointerMissed={() => setHoveredIndex(null)}>
      {galleryItems.map((item, i) => (
        <group key={item.uid}>

          <mesh
            ref={(el) => (meshesRef.current[i] = el)}
            onPointerOver={(e) => handlePointerOver(e, i)}
            onPointerOut={handlePointerOut}
            onClick={(e) => handleClick(e, item)}
          >
            <planeGeometry args={[3.2, 2.4, 32, 32]} />
            <SlicingShaderMaterial
              ref={(el) => (materialsRef.current[i] = el)}
              imageUrl={item.url}
              transparent={true}
            />

            {/* Deep Z-space drop shadow attached as child to scale/rotate with it */}
            <mesh
              ref={(el) => (shadowRefs.current[i] = el)}
              position={[0, -0.2, -0.1]}
            >
              <planeGeometry args={[3.5, 2.7]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.3} />
            </mesh>
          </mesh>

        </group>
      ))}
    </group>
  );
}
