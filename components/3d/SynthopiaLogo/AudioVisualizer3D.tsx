'use client';

import { useRef, useState, useEffect, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { Line } from '@react-three/drei';

export interface AudioVisualizer3DProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

// Pseudo-random aber konsistent für natürliche Mischung
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Convert RGB to hex color string
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Calculate plasma bolt color based on intensity
// Default: white-blue, more red with higher intensity (glow effect)
function getPlasmaColor(intensity: number, seed: number): string {
  const randomFactor = 0.9 + seededRandom(seed) * 0.2;
  const effectiveIntensity = Math.min(1, intensity * randomFactor);
  
  // Base: white (255, 255, 255)
  // Blue increases with intensity
  const blueStrength = effectiveIntensity;
  
  let r = 255;
  let g = 255;
  const b = 255;
  
  // Reduce R and G to add blue tint based on intensity
  r = Math.round(255 - blueStrength * 80); // 255 -> 175
  g = Math.round(255 - blueStrength * 40); // 255 -> 215
  
  // Intensity-based red glow: the stronger, the redder
  if (effectiveIntensity > 0.5) {
    const redBoost = (effectiveIntensity - 0.5) * 2; // 0 to 1
    const redValue = Math.round(180 + redBoost * 75); // 180 to 255
    r = Math.min(255, Math.max(r, redValue));
    // Reduce green for warmer glow
    g = Math.round(g * (1 - redBoost * 0.4));
  }
  
  return rgbToHex(r, g, b);
}

// Generate plasma lightning path - organic, chaotic movement like real plasma ball
function generatePlasmaLightning(
  angle: number,
  length: number,
  intensity: number,
  time: number,
  seed: number
): [number, number, number][] {
  const points: [number, number, number][] = [[0, 0, 0]];
  
  // Segments for organic curves - reduced on mobile for performance
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
  const segments = isMobileDevice ? 5 + Math.floor(intensity * 3) : 8 + Math.floor(intensity * 6);
  
  // Plasma bolts wander - angle drifts over time
  const wanderSpeed = 3 + seededRandom(seed) * 2;
  const wanderAmount = 0.15 + intensity * 0.1;
  const angleWander = Math.sin(time * wanderSpeed + seed) * wanderAmount;
  const effectiveAngle = angle + angleWander;
  
  const cosA = Math.cos(effectiveAngle);
  const sinA = Math.sin(effectiveAngle);
  
  // Perpendicular direction for lateral jitter
  const perpX = -sinA;
  const perpY = cosA;
  
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    
    // Base position along the bolt
    const baseX = cosA * length * t;
    const baseY = sinA * length * t;
    
    // Plasma-like erratic, organic movement
    // Multiple overlapping sine waves at different frequencies
    const chaos = seededRandom(seed + i * 7) * 2 - 1;
    
    // Primary wave - slow, large movement
    const wave1 = Math.sin(time * 4 + i * 1.2 + seed * 0.1) * 0.6;
    // Secondary wave - faster, medium movement  
    const wave2 = Math.sin(time * 9 + i * 2.5 + chaos * 3) * 0.3;
    // Tertiary wave - rapid flicker
    const wave3 = Math.sin(time * 18 + i * 4 + seed) * Math.cos(time * 12 + i) * 0.2;
    
    // Combined organic noise
    const noise = (wave1 + wave2 + wave3) * (1 + chaos * 0.3);
    
    // Jitter strongest in middle, tapers at ends (like real plasma)
    const taper = Math.sin(t * Math.PI);
    const jitterScale = taper * (0.08 + intensity * 0.15);
    
    // Random sharp kinks (plasma occasionally branches sharply)
    const kinkChance = seededRandom(seed + i * 13 + Math.floor(time * 5));
    const kink = kinkChance > 0.85 ? (seededRandom(seed + i * 17) - 0.5) * 0.2 : 0;
    
    // Z-depth variation for 3D feel
    const zNoise = Math.cos(time * 7 + i * 1.8 + seed) * Math.sin(time * 5 + i) * jitterScale * 0.5;
    
    const offsetX = perpX * (noise + kink) * jitterScale;
    const offsetY = perpY * (noise + kink) * jitterScale;
    
    points.push([baseX + offsetX, baseY + offsetY, zNoise]);
  }
  
  // End point - slight wobble at the tip
  const tipWobble = Math.sin(time * 10 + seed) * 0.02;
  points.push([
    cosA * length + perpX * tipWobble,
    sinA * length + perpY * tipWobble,
    0
  ]);
  
  return points;
}

export function AudioVisualizer3D({ analyser, isPlaying }: AudioVisualizer3DProps) {
  const groupRef = useRef<Group>(null);
  const timeRef = useRef(0);
  const frequencyDataRef = useRef<number[]>([]);
  const [renderKey, setRenderKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // On mobile: completely disable visualizer for performance
  // StickyPlayer provides visualization instead
  const tendrilCount = isMobile ? 0 : 72;
  const innerRadius = 0.115;
  const maxOuterRadius = 0.99;

  // Initialize frequency data
  useEffect(() => {
    frequencyDataRef.current = new Array(tendrilCount).fill(0);
  }, [tendrilCount]);

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (!isPlaying || !analyser) {
      // Fade out
      let hasValue = false;
      for (let i = 0; i < frequencyDataRef.current.length; i++) {
        frequencyDataRef.current[i] *= 0.9;
        if (frequencyDataRef.current[i] > 0.01) hasValue = true;
      }
      if (!hasValue && frequencyDataRef.current.some(v => v > 0)) {
        setRenderKey(n => n + 1);
      }
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate bin range for 60-500Hz (bass/drums/vocals)
    // Assuming 44100Hz sample rate, frequencyBinCount bins cover 0-22050Hz
    const binResolution = 22050 / dataArray.length;
    const lowBin = Math.floor(60 / binResolution);   // ~60Hz
    const highBin = Math.floor(500 / binResolution); // ~500Hz
    const binRange = highBin - lowBin;

    // Update ref directly - map all tendrils to low frequency range
    for (let i = 0; i < tendrilCount; i++) {
      const binIndex = lowBin + Math.floor((i / tendrilCount) * binRange);
      const rawValue = (dataArray[binIndex] ?? 0) / 255;
      
      // Higher threshold for activation - only react to actual beats
      const threshold = 0.25 + seededRandom(i * 31) * 0.15; // 0.25-0.40
      const value = rawValue > threshold ? (rawValue - threshold) / (1 - threshold) : 0;
      
      // Faster decay for punchier response
      const decay = value > frequencyDataRef.current[i] ? 0.5 : 0.7; // Fast attack, medium decay
      frequencyDataRef.current[i] = frequencyDataRef.current[i] * decay + value * (1 - decay);
    }
    
    // Force re-render for visual update
    setRenderKey(n => n + 1);
  });

  // Generate tendril data
  const tendrils = useMemo(() => {
    return Array.from({ length: tendrilCount }, (_, i) => ({
      angle: (i / tendrilCount) * Math.PI * 2 - Math.PI / 2,
      colorIndex: i,
    }));
  }, [tendrilCount]);

  if (!isPlaying && frequencyDataRef.current.every(v => v < 0.01)) return null;

  return (
    <group ref={groupRef} position={[0, 0, -0.025]}>
      {tendrils.map((t, i) => {
        const intensity = frequencyDataRef.current[i] || 0;
        if (intensity < 0.15) return null; // Higher threshold = less constant bolts
        
        const length = innerRadius + intensity * (maxOuterRadius - innerRadius);
        const color = getPlasmaColor(intensity, i * 137);
        const points = generatePlasmaLightning(t.angle, length, intensity, timeRef.current, i * 137);
        
        return (
          <Line
            key={i}
            points={points}
            color={color}
            lineWidth={0.4 + intensity * 0.3}
          />
        );
      })}
    </group>
  );
}
