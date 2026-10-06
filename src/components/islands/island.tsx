'use client';
// Why a client component: the island loader. It owns the dynamic import of each scheduled island
// (a Server Component cannot hand a loader function to the client) and loads it on its trigger, so
// nothing but this file is in the initial JavaScript. Islands receive their data as serialisable
// props from the Server Component that places them; they never import content modules. No effect
// hook: the trigger is armed from a ref callback, which React 19 cleans up on unmount. The skills
// cloud is not scheduled here: it loads only on the Cloud toggle (D18), which the Toolbox view owns.
import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';

import type { KonamiProps } from '@/components/konami/konami';
import type { ModelContextProviderProps } from '@/components/webmcp/model-context-provider';

type Trigger = 'idle' | 'keydown';

// Every island type names the key that fired a keyed trigger; only such a trigger fills it.
interface Keyed {
  firstKey?: string | undefined;
}

interface IslandPropsMap {
  webmcp: ModelContextProviderProps & Keyed;
  konami: KonamiProps;
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
  konami: {
    trigger: 'keydown',
    Component: dynamic(() => import('@/components/konami/konami').then(module => module.Konami), {
      ssr: false
    })
  }
};

interface IslandProps<N extends IslandName> {
  name: N;
  props: Omit<IslandPropsMap[N], 'firstKey'>;
  className?: string;
  // Server-rendered content that stays in place whether or not the island ever loads.
  children?: ReactNode;
}

type Cleanup = () => void;
// A trigger may carry a detail for the island: the key that fired it.
type Fire = (detail?: string) => void;

// After the load event, then in the first idle period (or within 2 s on a busy main thread).
const onIdle = (callback: Fire): Cleanup => {
  let handle: number | undefined;
  const fire = () => {
    callback();
  };
  const schedule = () => {
    handle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(fire, { timeout: 2000 })
        : window.setTimeout(fire, 200);
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

// The first keydown on the window, attached once and passive; the key travels with the trigger
// so the island can replay it (D14 amendment).
const onFirstKeydown = (callback: Fire): Cleanup => {
  const listener = (event: KeyboardEvent) => {
    callback(event.key);
  };
  window.addEventListener('keydown', listener, { once: true, passive: true });
  return () => {
    window.removeEventListener('keydown', listener);
  };
};

const armers: Record<Trigger, (node: HTMLElement, callback: Fire) => Cleanup> = {
  idle: (_node, callback) => onIdle(callback),
  keydown: (_node, callback) => onFirstKeydown(callback)
};

interface Fired {
  ready: boolean;
  detail?: string;
}

export function Island<N extends IslandName>({ name, props, className, children }: IslandProps<N>) {
  const [fired, setFired] = useState<Fired>({ ready: false });
  const { trigger, Component } = islands[name];
  const ref = (node: HTMLElement | null) => {
    if (!node || fired.ready) return;
    return armers[trigger](node, detail => {
      setFired({ ready: true, detail });
    });
  };
  // The detail rides along as `firstKey`.
  const all = { ...props, firstKey: fired.detail } as IslandPropsMap[N];
  return (
    <div ref={ref} data-island={name} className={className}>
      {children}
      {fired.ready && <Component {...all} />}
    </div>
  );
}
