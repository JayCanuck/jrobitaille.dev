'use client';
// Why a client component: the skills cloud island (D18) needs WebGL, resize and visibility
// observers and the view state in the browser. It overlays the server-rendered chips inside the
// same reserved box: the chips fade to opacity 0 but stay in the DOM and the accessibility tree,
// the canvas is aria-hidden, and the box never changes size. Every failure path renders nothing,
// which leaves the chips as the view. The terms and the control labels arrive as props from the
// Server Component: islands never import content modules. No effect hook: observers are armed
// from a ref callback.
import { useState } from 'react';
import { createPortal } from 'react-dom';

import { CloudBoundary } from '@/components/cloud/cloud-boundary';
import { CloudScene } from '@/components/cloud/cloud-scene';
import { type CloudColors, readCloudColors } from '@/components/cloud/term-sprites';
import { type SkillsView, ViewToggle, type ViewToggleLabels } from '@/components/cloud/view-toggle';

export interface SkillsCloudProps {
  terms: string[];
  labels: ViewToggleLabels;
  // Id of the heading-row slot the List/Cloud control renders into.
  toggleSlotId: string;
}

// Sphere radius as a share of the slot's shorter side, leaving room for the front labels.
const RADIUS_SHARE = 0.4;

interface Size {
  width: number;
  height: number;
}

export function SkillsCloud({ terms, labels, toggleSlotId }: SkillsCloudProps) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<SkillsView>('cloud');
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible');
  const [hovered, setHovered] = useState(false);
  const [colors, setColors] = useState<CloudColors>(() => readCloudColors());
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  // Observers live for the island's life: size (the box is square or taller), the viewport,
  // the page's visibility and the colour scheme. React 19 runs the returned cleanup on unmount.
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
    return () => {
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      scheme.removeEventListener('change', onScheme);
    };
  };

  const radius = Math.min(size.width, size.height) * RADIUS_SHARE;
  const showing = mounted && view === 'cloud';
  const running = showing && inView && pageVisible && !hovered;
  const toggleSlot = document.getElementById(toggleSlotId);

  return (
    <>
      <div
        ref={arm}
        aria-hidden="true"
        data-cloud-view={mounted ? view : undefined}
        data-cloud-state={running ? 'running' : 'paused'}
        onPointerEnter={() => {
          setHovered(true);
        }}
        onPointerLeave={() => {
          setHovered(false);
        }}
        className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${showing ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        {radius > 0 && (
          <CloudBoundary>
            <CloudScene
              terms={terms}
              radius={radius}
              colors={colors}
              running={running}
              fontSample={document.querySelector('#skills li')}
              onCreated={() => {
                setMounted(true);
              }}
            />
          </CloudBoundary>
        )}
      </div>
      {/* Outside the overlay on purpose: React synthetic pointer events bubble through the React
          tree, so a control portalled inside the overlay would read as hovering the cloud. */}
      {mounted &&
        toggleSlot &&
        createPortal(<ViewToggle view={view} labels={labels} onChange={setView} />, toggleSlot)}
    </>
  );
}
