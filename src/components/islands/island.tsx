'use client';
// Why a client component: the island loader. It owns the dynamic import of each scheduled island
// (a Server Component cannot hand a loader function to the client) and loads it on its trigger, so
// nothing but this file is in the initial JavaScript. Islands receive their data as serialisable
// props from the Server Component that places them; they never import content modules. No effect
// hook: the trigger is armed from a ref callback, which React 19 cleans up on unmount. The skills
// cloud is not scheduled here: it loads only on the Cloud toggle (D18), which the Toolbox view owns.
import dynamic from 'next/dynamic';
import { useRef, useState, type ReactNode } from 'react';

import type { KonamiProps } from '@/components/konami/konami';
import type { ModelContextProviderProps } from '@/components/webmcp/model-context-provider';

type Trigger = 'idle' | 'keydown';

// Every island type names the keyed-trigger props; only a keyed trigger fills them: the keys
// pressed before the island could listen, in order, and a call that tells the loader to stop
// collecting them once the island listens for itself.
interface Keyed {
  replay?: readonly string[] | undefined;
  onArmed?: (() => void) | undefined;
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
  props: Omit<IslandPropsMap[N], keyof Keyed>;
  className?: string;
  // Server-rendered content that stays in place whether or not the island ever loads.
  children?: ReactNode;
}

type Cleanup = () => void;
// A trigger fires with the keys it has collected so far, if it collects any.
type Fire = (keys?: readonly string[]) => void;

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

// Keys on the window, one passive listener attached once: the first fires the trigger, and every
// key is collected until the island reports that it listens for itself, so none pressed while the
// chunk arrives is lost (D14 amendment).
const onKeys = (callback: Fire): Cleanup => {
  const keys: string[] = [];
  const listener = (event: KeyboardEvent) => {
    keys.push(event.key);
    callback([...keys]);
  };
  window.addEventListener('keydown', listener, { passive: true });
  return () => {
    window.removeEventListener('keydown', listener);
  };
};

const armers: Record<Trigger, (node: HTMLElement, callback: Fire) => Cleanup> = {
  idle: (_node, callback) => onIdle(callback),
  keydown: (_node, callback) => onKeys(callback)
};

interface Fired {
  ready: boolean;
  replay?: readonly string[];
}

export function Island<N extends IslandName>({ name, props, className, children }: IslandProps<N>) {
  const [fired, setFired] = useState<Fired>({ ready: false });
  const { trigger, Component } = islands[name];
  // The trigger's cleanup, kept so the island can end key collection before it unmounts.
  const disarm = useRef<Cleanup | null>(null);
  const ref = (node: HTMLElement | null) => {
    if (!node || disarm.current) return;
    disarm.current = armers[trigger](node, keys => {
      setFired({ ready: true, replay: keys });
    });
    return () => {
      disarm.current?.();
      disarm.current = null;
    };
  };
  const onArmed = () => {
    disarm.current?.();
    disarm.current = null;
  };
  const all = { ...props, replay: fired.replay, onArmed } as IslandPropsMap[N];
  return (
    <div ref={ref} data-island={name} className={className}>
      {children}
      {fired.ready && <Component {...all} />}
    </div>
  );
}
