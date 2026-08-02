// components/SpiralScene.jsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import SpiralGallery from "./SpiralGallery";
import FluidShader from "./FluidShader";

// FIX: We must receive setActiveProject as a prop here from app/page.js
export default function SpiralScene({ scrollProxy, setActiveProject, inProjectView }) {
  return (
    <div className="fixed inset-0 w-full h-screen z-10 pointer-events-auto">
      <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* GPU Fluid Simulation Layer */}
        <FluidShader />
        
        {/* Spatial Spiral Gallery Layer */}
        <fog attach="fog" args={["#0a0b0a", 5, 25]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <SpiralGallery scrollProxy={scrollProxy} setActiveProject={setActiveProject} inProjectView={inProjectView} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}