'use client';
// Why a client component: the island loader. It owns the dynamic import of each scheduled island
// (a Server Component cannot hand a loader function to the client) and loads it on its trigger, so
// nothing but this file is in the initial JavaScript. Islands receive their data as serialisable
// props from the Server Component that places them; they never import content modules. No effect
// hook: the trigger is armed from a ref callback, which React 19 cleans up on unmount. The skills
// cloud is not scheduled here: it loads only on the Cloud toggle (D18), which the Toolbox view owns.
import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';

import type { ModelContextProviderProps } from '@/components/webmcp/model-context-provider';

type Trigger = 'idle';

interface IslandPropsMap {
  webmcp: ModelContextProviderProps;
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

const armers: Record<Trigger, (node: HTMLElement, callback: () => void) => Cleanup> = {
  idle: (_node, callback) => onIdle(callback)
};

export function Island<N extends IslandName>({ name, props, className, children }: IslandProps<N>) {
  const [ready, setReady] = useState(false);
  const { trigger, Component } = islands[name];
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
