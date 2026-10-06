'use client';
// Why a client component: the WebGL scene of the skills cloud (D18), rendered by React Three
// Fiber inside the island. Plain WebGL renderer, device pixel ratio capped at 1.5, no
// postprocessing; an orthographic camera so world units are CSS pixels and the 13 px floor holds.
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import {
  applyDepth,
  buildSprites,
  type CloudColors,
  disposeCloud,
  type TermSprite
} from '@/components/cloud/term-sprites';

// Fiber 9 renders only the three classes it has been told about.
extend({ Group: THREE.Group });

interface CloudSceneProps {
  terms: readonly string[];
  // Radius of the sphere in CSS px, from the slot's size.
  radius: number;
  colors: CloudColors;
  running: boolean;
  fontSample: Element | null;
  onCreated: () => void;
}

const ROTATION_PER_SECOND = 0.12;
const TILT = 0.18;

interface RotatingCloudProps {
  terms: readonly string[];
  radius: number;
  colors: CloudColors;
  running: boolean;
  fontSample: Element | null;
}

function RotatingCloud({ terms, radius, colors, running, fontSample }: RotatingCloudProps) {
  // The scene objects are not React state: the group's ref callback builds the sprites into it
  // (and disposes them on cleanup), and the frame loop reaches them through refs only.
  const groupRef = useRef<THREE.Group | null>(null);
  const spritesRef = useRef<TermSprite[]>([]);
  const attach = (group: THREE.Group | null) => {
    if (!group) return;
    const sprites = buildSprites(terms, radius, fontSample);
    for (const { sprite } of sprites) group.add(sprite);
    group.rotation.x = TILT;
    groupRef.current = group;
    spritesRef.current = sprites;
    return () => {
      disposeCloud(sprites);
      group.clear();
      groupRef.current = null;
      spritesRef.current = [];
    };
  };
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (running) group.rotation.y += delta * ROTATION_PER_SECOND;
    applyDepth(spritesRef.current, radius, colors);
  });
  return <group ref={attach} />;
}

export function CloudScene({
  terms,
  radius,
  colors,
  running,
  fontSample,
  onCreated
}: CloudSceneProps) {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      frameloop={running ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 1000], near: 1, far: 2000, zoom: 1 }}
      onCreated={onCreated}
      className="absolute inset-0"
    >
      <RotatingCloud
        terms={terms}
        radius={radius}
        colors={colors}
        running={running}
        fontSample={fontSample}
      />
    </Canvas>
  );
}
