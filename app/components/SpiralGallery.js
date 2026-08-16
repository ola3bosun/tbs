"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import SlicingShaderMaterial from "./SlicingShaderMaterial";

// Injected your actual project history for the DOM Overlay
const projects = [
  { 
    id: "01", 
    title: "Transcend Projects",
    role: "Web Architecture",
    sector: "Engineering & Construction",
    description: "Premium startup portfolio and JAMstack web architecture featuring a geometric wireframe logo and stark clinical precision.",
    link: "#",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1024&auto=format&fit=crop" 
  },
  { 
    id: "02", 
    title: "TNS_OS",
    role: "Frontend Eng",
    sector: "Experimental / Web OS",
    description: "A responsive, full-screen web operating system interface concept engineered with React and advanced GSAP sequencing.",
    link: "#",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1024&auto=format&fit=crop" 
  },
  { 
    id: "03", 
    title: "The Nuanced Studio",
    role: "Co-Founder / Engineering",
    sector: "Creative Agency",
    description: "Multidisciplinary digital startup providing highly tactile web development, UX design, and data analysis services.",
    link: "#",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1024&auto=format&fit=crop" 
  },
  { 
    id: "04", 
    title: "ProjectHelix",
    role: "Creative Coding",
    sector: "Spatial UI",
    description: "A 3D interactive web portfolio carousel component utilizing Next.js, GSAP, and ScrollTrigger to manage Z-axis spatial translations.",
    link: "#",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1024&auto=format&fit=crop" 
  },
  { 
    id: "05", 
    title: "Trimly",
    role: "Full-Stack Dev",
    sector: "Booking Platform",
    description: "Single-page application booking platform engineered for top-rated barbers, built ground-up with functionalist design principles.",
    link: "#",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1024&auto=format&fit=crop" 
  },
  {
    id: "06",
    title: "Trimly",
    role: "Full-Stack Dev",
    sector: "Booking Platform",
    description: "Single-page application booking platform engineered for top-rated barbers, built ground-up with functionalist design principles.",
    link: "#",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1024&auto=format&fit=crop" 
  },
  {
    id: "07",
    title: "Trimly",
    role: "Full-Stack Dev",
    sector: "Booking Platform",
    description: "Single-page application booking platform engineered for top-rated barbers, built ground-up with functionalist design principles.",
    link: "#",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1024&auto=format&fit=crop" 
  }
];

export default function SpiralGallery({ scrollProxy, setActiveProject, inProjectView }) {
  const groupRef = useRef();
  const meshesRef = useRef([]);
  const materialsRef = useRef([]);
  
  // The WebGL Camera
  const { camera } = useThree();

  // Hijack State
  const [focusedIndex, setFocusedIndex] = useState(null);
  const isHijacked = useRef(false);

  // Mathematical constants for the Helix
  const RADIUS = 4.5;      
  const DEPTH = 3;       
  const ROTATION_STEP = Math.PI / 4; // 45-degree steps

  // Pre-calculate positions
  const galleryItems = useMemo(() => {
    return projects.map((proj, i) => {
      const theta = i * ROTATION_STEP;
      const x = RADIUS * Math.cos(theta);
      const y = RADIUS * Math.sin(theta);
      const z = -i * DEPTH;
      
      const rotation = [0, 0, theta]; 
      return { ...proj, position: [x, y, z], rotation };
    });
  }, []);

  useFrame(() => {
    // If we clicked a project, FREEZE the spiral scroll physics
    if (!groupRef.current || isHijacked.current) return;
    
    // Map GSAP proxy (0 to 1) to the total depth and rotation of the tunnel
    const targetZ = scrollProxy.current * (projects.length * DEPTH);
    const targetRotation = scrollProxy.current * (Math.PI * 2);

    // Lerp for buttery smoothness
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetRotation, 0.05);
  });

  // =========================================================
  // THE CAMERA HIJACK & SHADER TRIGGER
  // =========================================================
  const handleMeshClick = (index, e) => {
    e.stopPropagation(); 
    if (focusedIndex === index) return;

    isHijacked.current = true;
    setFocusedIndex(index);

    // Fire the signal to the HTML Overlay layer
    setActiveProject(projects[index]);

    const targetMesh = meshesRef.current[index];
    const targetMat = materialsRef.current[index];

    // 1. Extract absolute World Position and Rotation
    const worldPos = new THREE.Vector3();
    targetMesh.getWorldPosition(worldPos);

    const worldQuat = new THREE.Quaternion();
    targetMesh.getWorldQuaternion(worldQuat);

    // 2. Calculate the "Camera Sweet Spot" (2.5 units directly in front of the mesh)
    const cameraOffset = new THREE.Vector3(0, 0, 2.5).applyQuaternion(worldQuat);
    const targetCameraPos = worldPos.clone().add(cameraOffset);

    // 3. The Cinematic Timeline
    const tl = gsap.timeline();

    // Fly camera position
    tl.to(camera.position, {
      x: targetCameraPos.x,
      y: targetCameraPos.y,
      z: targetCameraPos.z,
      duration: 1.5,
      ease: "power4.inOut",
    }, 0);

    // Fly camera rotation (Using Quaternion SLERP to avoid barrel rolls)
    const proxy = { t: 0 };
    const startQuat = camera.quaternion.clone();
    tl.to(proxy, {
      t: 1,
      duration: 1.5,
      ease: "power4.inOut",
      onUpdate: () => {
        camera.quaternion.slerpQuaternions(startQuat, worldQuat, proxy.t);
      }
    }, 0);

    // 4. Ignite the Slicing Shader (Morph into 2D abstraction) - Removed since we want it flat now
  };

  // =========================================================
  // THE RESET (Clicking the void to close)
  // =========================================================
  const handlePointerMissed = () => {
    if (focusedIndex === null) return;

    const targetMat = materialsRef.current[focusedIndex];
    
    // Clear the HTML overlay text immediately
    setActiveProject(null);
    
    const tl = gsap.timeline({
      onComplete: () => {
        isHijacked.current = false;
        setFocusedIndex(null);
        document.body.style.overflow = "auto"; // Unlock scroll
      }
    });

    // Heal the shader back to a flat plane (Removed)

    // Reset camera position to default origin
    tl.to(camera.position, {
      x: 0,
      y: 0,
      z: 5,
      duration: 1.5,
      ease: "power4.inOut"
    }, 0.2);

    // Reset camera rotation to identity (flat)
    const proxy = { t: 0 };
    const startQuat = camera.quaternion.clone();
    const endQuat = new THREE.Quaternion().identity();
    tl.to(proxy, {
      t: 1,
      duration: 1.5,
      ease: "power4.inOut",
      onUpdate: () => {
        camera.quaternion.slerpQuaternions(startQuat, endQuat, proxy.t);
      }
    }, 0.2);
  };

  useEffect(() => {
    const handleCloseEvent = () => handlePointerMissed();
    window.addEventListener('closeProjectDetails', handleCloseEvent);
    return () => window.removeEventListener('closeProjectDetails', handleCloseEvent);
  }, [focusedIndex]);

  // =========================================================
  // THE TEAR-AWAY TRANSITION
  // =========================================================
  useEffect(() => {
    if (focusedIndex === null) return;
    
    const targetMesh = meshesRef.current[focusedIndex];
    if (!targetMesh) return;
    
    const worldPos = new THREE.Vector3();
    targetMesh.getWorldPosition(worldPos);

    const worldQuat = new THREE.Quaternion();
    targetMesh.getWorldQuaternion(worldQuat);

    // If inProjectView is true, fly to 0.5 units (tearing through). If false, fly back to 2.5 units.
    const distance = inProjectView ? 0.5 : 5.0; // zoom all the way out if not in project view
    const cameraOffset = new THREE.Vector3(0, 0, distance).applyQuaternion(worldQuat);
    const targetCameraPos = worldPos.clone().add(cameraOffset);

    gsap.to(camera.position, {
      x: targetCameraPos.x,
      y: targetCameraPos.y,
      z: targetCameraPos.z,
      duration: 1.2,
      ease: "power4.inOut",
    });
  }, [inProjectView, focusedIndex, camera]);

  return (
    <group ref={groupRef} onPointerMissed={handlePointerMissed}>
      {galleryItems.map((item, i) => (
        <group key={item.id} position={item.position} rotation={item.rotation}>
          
          <mesh 
            ref={(el) => (meshesRef.current[i] = el)} 
            onClick={(e) => handleMeshClick(i, e)}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            {/* Highly segmented plane required for the slice physics */}
            <planeGeometry args={[3.2, 2.4, 128, 128]} />
            <SlicingShaderMaterial 
              ref={(el) => (materialsRef.current[i] = el)} 
              imageUrl={item.url} 
            />
          </mesh>
          
          {/* Deep Z-space drop shadow to ground the meshes in the 3D space */}
          <mesh position={[0, 0, -0.1]}>
             <planeGeometry args={[3.5, 2.7]} />
             <meshBasicMaterial color="#0a0a0a" transparent opacity={0.6} />
          </mesh>

        </group>
      ))}
    </group>
  );
}