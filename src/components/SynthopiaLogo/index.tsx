'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { Scene } from './Scene';

export interface SynthopiaLogoProps {
  autoRotate?: boolean;
  quality?: 'low' | 'high';
  className?: string;
  analyser?: AnalyserNode | null;
  isPlaying?: boolean;
}

export default function SynthopiaLogo({
  autoRotate = true,
  quality = 'high',
  className = '',
  analyser = null,
  isPlaying = false,
}: SynthopiaLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use lower quality on mobile for performance
  // Further reduce DPR when playing on mobile (glasscard becomes more opaque anyway)
  const effectiveQuality = isMobile ? 'low' : quality;
  const mobileDpr: [number, number] = isPlaying ? [0.75, 0.75] : [1, 1];

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ background: 'transparent' }}
    >
      <Canvas
        gl={{
          antialias: effectiveQuality === 'high',
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={effectiveQuality === 'high' ? [1, 2] : mobileDpr}
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        style={{ background: 'transparent', touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <Scene
            autoRotate={autoRotate}
            quality={effectiveQuality}
            analyser={analyser}
            isPlaying={isPlaying}
          />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
}
