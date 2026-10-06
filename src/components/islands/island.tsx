'use client';
// Why a client component: this is the one hydrated file on the page. It owns the dynamic imports
// of every island (a Server Component cannot hand a loader function to the client) and schedules
// each one on its trigger, so nothing but this file is in the initial JavaScript. Islands receive
// their data as serialisable props from the Server Component that places them; they never import
// content modules. No effect hook: the trigger is armed from a ref callback, which React 19
// cleans up on unmount.
import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';

import type { SkillsCloudProps } from '@/components/cloud/skills-cloud';
import type { ModelContextProviderProps } from '@/components/webmcp/model-context-provider';

type Trigger = 'idle' | 'cloud';

interface IslandPropsMap {
  webmcp: ModelContextProviderProps;
  cloud: SkillsCloudProps;
}

type IslandName = keyof IslandPropsMap;

// Each entry is loaded only when its trigger fires; `ssr: false` keeps it out of the export.
const islands: {
  [N in IslandName]: { trigger: Trigger; Component: React.ComponentType<IslandPropsMap[N]> };
} = {
  webmcp: {
    trigger: 'idle',
    Component: dynamic(
      () =>
        import('@/components/webmcp/model-context-provider').then(
          module => module.ModelContextProvider
        ),
      { ssr: false }
    )
  },
  cloud: {
    trigger: 'cloud',
    Component: dynamic(
      () => import('@/components/cloud/skills-cloud').then(module => module.SkillsCloud),
      { ssr: false }
    )
  }
};

interface IslandProps<N extends IslandName> {
  name: N;
  props: IslandPropsMap[N];
  className?: string;
  // Server-rendered content that stays in place whether or not the island ever loads.
  children?: ReactNode;
}

type Cleanup = () => void;

// After the load event, then in the first idle period (or within 2 s on a busy main thread).
const onIdle = (callback: () => void): Cleanup => {
  let handle: number | undefined;
  const schedule = () => {
    handle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(callback, { timeout: 2000 })
        : window.setTimeout(callback, 200);
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  return () => {
    window.removeEventListener('load', schedule);
    if (handle === undefined) return;
    if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
};

// Intent means an input event, never a scroll event: hash arrivals, scroll restoration and anchor
// navigation all dispatch `scroll` without the visitor doing anything (D18).
const INTENT_EVENTS = [
  'wheel',
  'touchstart',
  'touchmove',
  'keydown',
  'pointerdown',
  'pointermove'
] as const;

// Never load the cloud for a visitor who asked for less motion or less data, or without WebGL.
const cloudAllowed = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return false;
  const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
};

// The cloud loads only when all three hold (D18): the page went idle after load, the slot is within
// 200 px of the viewport, and the visitor gave one input event after load (wheel, touch, key or pointer; never a scroll). Being in
// view at first paint is not enough on its own.
const onCloudTrigger = (node: HTMLElement, callback: () => void): Cleanup => {
  if (!cloudAllowed()) return () => undefined;
  let idle = false;
  let near = false;
  let interacted = false;
  let done = false;
  const check = () => {
    if (done || !idle || !near || !interacted) return;
    done = true;
    cleanup();
    callback();
  };
  const onInteraction = () => {
    if (document.readyState !== 'complete') return;
    interacted = true;
    check();
  };
  for (const type of INTENT_EVENTS) {
    window.addEventListener(type, onInteraction, { passive: true });
  }
  const observer = new IntersectionObserver(
    entries => {
      near = entries.some(entry => entry.isIntersecting);
      check();
    },
    { rootMargin: '200px' }
  );
  observer.observe(node);
  const cancelIdle = onIdle(() => {
    idle = true;
    check();
  });
  const cleanup = () => {
    for (const type of INTENT_EVENTS) window.removeEventListener(type, onInteraction);
    observer.disconnect();
    cancelIdle();
  };
  return cleanup;
};

const armers: Record<Trigger, (node: HTMLElement, callback: () => void) => Cleanup> = {
  idle: (_node, callback) => onIdle(callback),
  cloud: onCloudTrigger
};

export function Island<N extends IslandName>({ name, props, className, children }: IslandProps<N>) {
  const [ready, setReady] = useState(false);
  const { trigger, Component } = islands[name] as {
    trigger: Trigger;
    Component: React.ComponentType<IslandPropsMap[N]>;
  };
  const ref = (node: HTMLElement | null) => {
    if (!node || ready) return;
    return armers[trigger](node, () => {
      setReady(true);
    });
  };
  return (
    <div ref={ref} data-island={name} className={className}>
      {children}
      {ready && <Component {...props} />}
    </div>
  );
}
