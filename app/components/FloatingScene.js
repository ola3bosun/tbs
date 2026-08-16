"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import FloatingGallery from "./FloatingGallery";

export default function FloatingScene({
  activeProject,
  setActiveProject,
  inProjectView,
  groupOffsetX = 0,
}) {
  return (
    <div className="fixed inset-0 w-full h-screen z-10 pointer-events-auto">
      {/* Stable 3D Canvas with static fixed camera position */}
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 8], fov: 45 }}
      >
        <fog attach="fog" args={["#0a0b0a", 5, 30]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <Suspense fallback={null}>
          <FloatingGallery
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            inProjectView={inProjectView}
            groupOffsetX={groupOffsetX}
          />
        </Suspense>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
