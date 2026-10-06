'use client';
// Why a client component: this is the one hydrated file on the page. It owns the dynamic imports
// of every island (a Server Component cannot hand a loader function to the client) and schedules
// each one on its trigger, so nothing but this file is in the initial JavaScript. No effect hook:
// the trigger is armed from a ref callback, which React 19 cleans up on unmount.
import dynamic from 'next/dynamic';
import { useState } from 'react';

type Trigger = 'idle';

// Each entry is loaded only when its trigger fires; `ssr: false` keeps it out of the export.
const islands = {
  webmcp: {
    trigger: 'idle' as Trigger,
    Component: dynamic(
      () =>
        import('@/components/webmcp/model-context-provider').then(
          module => module.ModelContextProvider
        ),
      { ssr: false }
    )
  }
};

type IslandName = keyof typeof islands;

interface IslandProps {
  name: IslandName;
  className?: string;
}

// After the load event, then in the first idle period (or within 2 s on a busy main thread).
const onIdle = (callback: () => void): (() => void) => {
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

// One armer per trigger; later islands add theirs here.
const armers: Record<Trigger, (callback: () => void) => () => void> = { idle: onIdle };

export function Island({ name, className }: IslandProps) {
  const [ready, setReady] = useState(false);
  const { trigger, Component } = islands[name];
  const ref = (node: HTMLElement | null) => {
    if (!node || ready) return;
    return armers[trigger](() => {
      setReady(true);
    });
  };
  return (
    <span ref={ref} data-island={name} className={className}>
      {ready && <Component />}
    </span>
  );
}
