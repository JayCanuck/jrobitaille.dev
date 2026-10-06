'use client';
// Why a client component: the WebGL scene of the skills cloud (D18), rendered by React Three
// Fiber inside the island. Plain WebGL renderer, device pixel ratio capped at 1.5, no
// postprocessing; an orthographic camera so world units are CSS pixels and the 13 px floor holds.
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { type RefObject, useRef } from 'react';
import * as THREE from 'three';

import {
  applyDepth,
  buildSprites,
  type CloudColors,
  disposeCloud,
  type TermSprite
} from '@/components/cloud/term-sprites';
import { type Drag, INERTIA_SECONDS, RADIANS_PER_PX } from '@/lib/cloud/drag';

// Fiber 9 renders only the three classes it has been told about.
extend({ Group: THREE.Group });

interface CloudSceneProps {
  terms: readonly string[];
  // Radius of the sphere in CSS px, from the slot's size.
  radius: number;
  colors: CloudColors;
  running: boolean;
  drag: RefObject<Drag>;
  fontSample: Element | null;
  onCreated: () => void;
}

const ROTATION_PER_SECOND = 0.12;
const TILT = 0.18;
// The tilt stays within a readable band however far a drag goes.
const MAX_TILT = 0.9;

type RotatingCloudProps = Omit<CloudSceneProps, 'onCreated'>;

function RotatingCloud({
  terms,
  radius,
  colors,
  running,
  drag: dragRef,
  fontSample
}: RotatingCloudProps) {
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
  useFrame((frame, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const drag = dragRef.current;
    if (drag.phase === 'dragging') {
      // The drag drives the rotation directly; the idle turn waits.
      const pending = drag.takePending();
      group.rotation.y += pending.x * RADIANS_PER_PX;
      group.rotation.x += pending.y * RADIANS_PER_PX;
    } else {
      // Inertia from the release decays over about a second while the idle turn resumes.
      const velocity = drag.takeVelocity(Math.exp(-delta / INERTIA_SECONDS));
      group.rotation.y += velocity.x * 1000 * RADIANS_PER_PX * delta;
      group.rotation.x += velocity.y * 1000 * RADIANS_PER_PX * delta;
      if (running) group.rotation.y += delta * ROTATION_PER_SECOND;
    }
    group.rotation.x = Math.max(-MAX_TILT, Math.min(MAX_TILT, group.rotation.x));
    applyDepth(spritesRef.current, radius, colors);
    // The current rotation, readable from outside (the e2e samples it); a cheap attribute write.
    frame.gl.domElement.dataset.rotation = `${group.rotation.y.toFixed(4)} ${group.rotation.x.toFixed(4)}`;
  });
  return <group ref={attach} />;
}

export function CloudScene({ onCreated, ...cloud }: CloudSceneProps) {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      frameloop={cloud.running ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 1000], near: 1, far: 2000, zoom: 1 }}
      onCreated={onCreated}
      className="absolute inset-0"
    >
      <RotatingCloud {...cloud} />
    </Canvas>
  );
}
