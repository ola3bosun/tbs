"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import FloatingGallery from "./FloatingGallery";
import FluidShader from "./FluidShader";

export default function FloatingScene({ setActiveProject, inProjectView }) {
  return (
    <div className="fixed inset-0 w-full h-screen z-10 pointer-events-auto">
      <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 8], fov: 45 }}>
        {/* GPU Fluid Simulation Layer */}
        <FluidShader />
        
        <fog attach="fog" args={["#0a0b0a", 5, 30]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <FloatingGallery setActiveProject={setActiveProject} inProjectView={inProjectView} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
