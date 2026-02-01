'use client';

import { useRef, memo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Group, DirectionalLight } from 'three';
import { MetalFrame, setMobilePlayingState } from './MetalFrame';
import { Staircase } from './Staircase';
import { Effects } from './Effects';
import { AudioVisualizer3D } from './AudioVisualizer3D';

export interface SceneProps {
  autoRotate: boolean;
  quality: 'low' | 'high';
  analyser?: AnalyserNode | null;
  isPlaying?: boolean;
}

// Pre-calculated constants
const CAMERA_SWAY_X_MULT = 0.15;
const CAMERA_SWAY_Y_MULT = 0.1;
const CAMERA_SWAY_X_AMP = 0.08;
const CAMERA_SWAY_Y_AMP = 0.05;
const LIGHT_ROT_MULT = 0.15;

export const Scene = memo(function Scene({ autoRotate, quality, analyser, isPlaying }: SceneProps) {
  const logoGroupRef = useRef<Group>(null);
  const fillLightRef = useRef<DirectionalLight>(null);
  const frameCountRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for frame skipping optimization
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync mobile/playing state to MetalFrame for frame skipping
  useEffect(() => {
    setMobilePlayingState(isMobile, isPlaying ?? false);
  }, [isMobile, isPlaying]);

  useFrame((state) => {
    // On mobile while playing: skip every other frame for camera/light updates
    // This is invisible since glasscard opacity increases during playback
    if (isMobile && isPlaying) {
      frameCountRef.current++;
      if (frameCountRef.current % 2 !== 0) return;
    }

    const t = state.clock.elapsedTime;
    
    // Pre-calculate sin/cos once per frame
    const sinT015 = Math.sin(t * CAMERA_SWAY_X_MULT);
    const cosT01 = Math.cos(t * CAMERA_SWAY_Y_MULT);
    const rotationAngle = t * LIGHT_ROT_MULT;
    
    // Camera sway
    state.camera.position.x = sinT015 * CAMERA_SWAY_X_AMP;
    state.camera.position.y = cosT01 * CAMERA_SWAY_Y_AMP;
    
    // Light position update
    if (fillLightRef.current) {
      fillLightRef.current.position.x = -3 - Math.sin(rotationAngle) * 2;
      fillLightRef.current.position.y = 2 + Math.cos(rotationAngle) * 1.5;
    }
  });

  return (
    <>
      {/* Lighting Setup */}
      <ambientLight intensity={0.35} />
      <directionalLight
        ref={fillLightRef}
        position={[-3, 2, -5]}
        intensity={0.4}
        color="#a0c4ff"
      />
      {/* Front key light for better visibility */}
      <directionalLight
        position={[2, 3, 5]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Environment for realistic reflections */}
      <Environment preset="city" environmentIntensity={0.3} />

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />

      {/* Logo Group with integrated audio visualizer behind stairs */}
      <group ref={logoGroupRef}>
        {/* Audio Visualizer - rendered first (behind) */}
        <AudioVisualizer3D analyser={analyser ?? null} isPlaying={isPlaying ?? false} />
        {/* Metal frames */}
        <MetalFrame />
        {/* Stairs on top */}
        <Staircase />
      </group>

      {/* Post-processing */}
      <Effects quality={quality} />
    </>
  );
});
