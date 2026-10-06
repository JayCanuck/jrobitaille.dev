'use client';
// Why a client component: the Konami egg (D14 amendment) listens for keys in the browser. It loads
// on the first keydown through the island loader, which replays that key, so nothing is requested
// before a key is pressed. The payoff is a fixed, aria-hidden, pointer-events-none layer with no
// anchor and nothing focusable, so it changes no layout. The toast copy and the drawing's address
// arrive as props; nothing is imported from the content. No effect hook: the listener is armed
// from a ref callback, which React 19 cleans up on unmount.
import { useRef, useState } from 'react';

import { advance, isComplete } from '@/lib/konami';

export interface KonamiProps {
  // The key that loaded the island, replayed into the detector once.
  firstKey?: string;
  toast: string;
  image: { src: string; width: number; height: number };
}

export function Konami({ firstKey, toast, image }: KonamiProps) {
  const [showing, setShowing] = useState(false);
  // Detector state lives outside render; the handlers are the only writers.
  const progress = useRef(0);
  const visible = useRef(false);
  const replayed = useRef(false);

  const arm = (node: HTMLElement | null) => {
    if (!node) return;
    const onKey = (key: string) => {
      // Repeating the sequence while the payoff shows does nothing until it has left.
      if (visible.current) return;
      progress.current = advance(progress.current, key);
      if (!isComplete(progress.current)) return;
      progress.current = 0;
      visible.current = true;
      setShowing(true);
    };
    if (firstKey !== undefined && !replayed.current) {
      replayed.current = true;
      onKey(firstKey);
    }
    const listener = (event: KeyboardEvent) => {
      onKey(event.key);
    };
    window.addEventListener('keydown', listener, { passive: true });
    return () => {
      window.removeEventListener('keydown', listener);
    };
  };

  return (
    <>
      {/* The listener's anchor: rendered empty so the ref callback has a node to arm from. */}
      <span ref={arm} hidden data-konami="armed" />
      {showing && (
        <div
          aria-hidden="true"
          data-konami="showing"
          onAnimationEnd={event => {
            if (event.target !== event.currentTarget) return;
            visible.current = false;
            setShowing(false);
          }}
          className="cow-visit pointer-events-none fixed right-4 bottom-4 z-50 flex items-end gap-3 select-none"
        >
          <p className="rounded-md border bg-card px-3 py-1.5 font-mono text-label text-foreground shadow-md">
            {toast}
          </p>
          {/* The 404's drawing as a plain image: an SVG, requested only now. The float keyframe
              carries its own centring translate, so the static form under reduced motion gets the
              same offset from a utility. */}
          <picture className="float relative left-1/2 block w-40 motion-reduce:-translate-x-1/2 sm:w-56">
            <img
              src={image.src}
              width={image.width}
              height={image.height}
              alt=""
              decoding="async"
              className="h-auto w-full"
            />
          </picture>
        </div>
      )}
    </>
  );
}
