'use client';
// Why a client component: the Toolbox's view state (D18). The chips are the default view and the
// cloud is opt-in: once JavaScript runs and WebGL is available, this renders the List / Cloud
// control into the heading row, and pressing Cloud is the only thing that loads the cloud chunk.
// Without JavaScript or WebGL there is no control and the chips are the only view. It owns the
// dynamic import because a Server Component cannot hand a loader to the client; the terms and
// labels arrive as props, never from a content import. No effect hook: hydration and the WebGL
// check are observed from a ref callback.
import dynamic from 'next/dynamic';
import { type ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';

import { type SkillsView, ViewToggle, type ViewToggleLabels } from '@/components/cloud/view-toggle';

const SkillsCloud = dynamic(
  () => import('@/components/cloud/skills-cloud').then(module => module.SkillsCloud),
  { ssr: false }
);

export interface ToolboxViewProps {
  terms: string[];
  labels: ViewToggleLabels;
  // Id of the heading-row slot the control renders into.
  toggleSlotId: string;
  className?: string;
  // The server-rendered chips: always in the DOM, the view at first paint and without the cloud.
  children: ReactNode;
}

const hasWebGL = () => {
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
};

export function ToolboxView({
  terms,
  labels,
  toggleSlotId,
  className,
  children
}: ToolboxViewProps) {
  // Set once the component has hydrated, so the portal never renders during server rendering.
  const [ready, setReady] = useState<{ webgl: boolean } | null>(null);
  const [view, setView] = useState<SkillsView>('list');
  // The chunk is requested on the first Cloud press and stays mounted after that.
  const [requested, setRequested] = useState(false);
  const [mounted, setMounted] = useState(false);

  // The control is mono text anchored to the right edge of the heading row, so its width in a
  // fallback face differs from its width in Geist Mono, and a right-anchored element whose width
  // changes at the font swap is a layout shift. It therefore renders once the fonts have settled:
  // at once on a warm cache, at the swap on a slow connection, and after the failure if a font
  // never arrives.
  const arm = (node: HTMLDivElement | null) => {
    if (!node || ready) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) setReady({ webgl: hasWebGL() });
    });
    return () => {
      cancelled = true;
    };
  };

  const change = (next: SkillsView) => {
    setView(next);
    if (next === 'cloud') setRequested(true);
  };

  const slot = ready ? document.getElementById(toggleSlotId) : null;

  return (
    <div ref={arm} data-island="cloud" className={className}>
      {children}
      {requested && (
        <SkillsCloud
          terms={terms}
          view={view}
          onMounted={() => {
            setMounted(true);
          }}
        />
      )}
      {ready?.webgl &&
        slot &&
        createPortal(
          <ViewToggle
            view={view}
            labels={labels}
            busy={view === 'cloud' && !mounted}
            onChange={change}
          />,
          slot
        )}
    </div>
  );
}
