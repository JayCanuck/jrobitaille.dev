'use client';
// Why a client component: the skills cloud island (D18) needs WebGL, resize and visibility
// observers, pointer drag and the colour scheme in the browser. Mounted by the Toolbox view on the
// first Cloud press, it overlays the server-rendered chips inside the same reserved box: the chips
// fade to opacity 0 but stay in the DOM and the accessibility tree, the canvas is aria-hidden, and
// the box never changes size. Every failure path renders nothing, which leaves the chips. Under
// prefers-reduced-motion the cloud does not turn on its own; drag still works. The terms arrive as
// props: islands never import content modules. No effect hook: observers are armed from a ref
// callback.
import { useRef, useState } from 'react';

import { CloudBoundary } from '@/components/cloud/cloud-boundary';
import { CloudScene } from '@/components/cloud/cloud-scene';
import { type CloudColors, readCloudColors } from '@/components/cloud/term-sprites';
import type { SkillsView } from '@/components/cloud/view-toggle';
import { createDrag } from '@/lib/cloud/drag';

export interface SkillsCloudProps {
  terms: string[];
  view: SkillsView;
  // Called once the WebGL context exists and the cloud can show.
  onMounted: () => void;
}

// Sphere radius as a share of the slot's shorter side, leaving room for the front labels.
const RADIUS_SHARE = 0.4;

interface Size {
  width: number;
  height: number;
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function SkillsCloud({ terms, view, onMounted }: SkillsCloudProps) {
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible');
  const [autoRotate, setAutoRotate] = useState(() => !reducedMotion());
  const [dragging, setDragging] = useState(false);
  const [colors, setColors] = useState<CloudColors>(() => readCloudColors());
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  // Shared with the frame loop; written by the pointer handlers only, never read during render.
  const drag = useRef(createDrag());

  // Observers live for the island's life: size (the box is 4:3 or taller), the viewport, the
  // page's visibility, the colour scheme and the motion preference. React 19 runs the returned
  // cleanup on unmount.
  const arm = (node: HTMLDivElement | null) => {
    if (!node) return;
    const resize = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect) setSize({ width: rect.width, height: rect.height });
    });
    resize.observe(node);
    const intersection = new IntersectionObserver(entries => {
      setInView(entries.some(entry => entry.isIntersecting));
    });
    intersection.observe(node);
    const onVisibility = () => {
      setPageVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', onVisibility);
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => {
      setColors(readCloudColors());
    };
    scheme.addEventListener('change', onScheme);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => {
      setAutoRotate(!motion.matches);
    };
    motion.addEventListener('change', onMotion);
    return () => {
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      scheme.removeEventListener('change', onScheme);
      motion.removeEventListener('change', onMotion);
    };
  };

  // A press is only a candidate: pointer capture is taken once the pointer has moved more than the
  // slop with more horizontal than vertical movement, and released on up, cancel or lost capture.
  // The overlay has touch-action: pan-y, so a vertical pan on touch scrolls the page natively and
  // never becomes a drag; touch rotates on the horizontal axis only, a mouse on both. Hovering
  // alone never pauses the idle rotation.
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    drag.current.press(
      event.pointerId,
      event.clientX,
      event.clientY,
      event.timeStamp,
      event.pointerType === 'touch'
    );
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    if (drag.current.move(event.clientX, event.clientY, event.timeStamp) === 'started') {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
  };
  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    // A child's lost capture bubbles here too (touch gives the canvas implicit capture, which it
    // loses the moment the overlay takes it); only the overlay's own loss ends the drag.
    if (event.type === 'lostpointercapture' && event.target !== event.currentTarget) return;
    drag.current.release(event.timeStamp);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  const radius = Math.min(size.width, size.height) * RADIUS_SHARE;
  const showing = mounted && view === 'cloud';
  // Frames run while the cloud shows on screen (drag and inertia need them); the idle turn runs on
  // top of that only where motion is welcome.
  const active = showing && inView && pageVisible;
  const running = active && autoRotate;

  return (
    <div
      ref={arm}
      aria-hidden="true"
      data-cloud-view={mounted ? view : undefined}
      data-cloud-state={running ? 'running' : 'paused'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
      className={`absolute inset-0 touch-pan-y transition-opacity duration-300 select-none motion-reduce:transition-none ${showing ? 'opacity-100' : 'pointer-events-none opacity-0'} ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {radius > 0 && (
        <CloudBoundary>
          <CloudScene
            terms={terms}
            radius={radius}
            colors={colors}
            active={active}
            rotate={running}
            drag={drag}
            fontSample={document.querySelector('#skills li')}
            onCreated={() => {
              setMounted(true);
              onMounted();
            }}
          />
        </CloudBoundary>
      )}
    </div>
  );
}
