'use client';
// Why a client component: the Konami egg (D14 amendment) listens for keys in the browser. It loads
// on the first keydown through the island loader, which collects the keys pressed while the chunk
// arrives and hands them over for replay, so nothing is requested before a key is pressed and no
// key of a first attempt is lost. The payoff is a fixed, aria-hidden, pointer-events-none layer with
// no anchor and nothing focusable, so it changes no layout. The toast copy and the drawing's address
// arrive as props; nothing is imported from the content. No effect hook: the listener is armed from
// a ref callback, which React 19 cleans up on unmount.
import { useRef, useState } from 'react';

import { advance, isComplete } from '@/lib/konami';

export interface KonamiProps {
  // The keys pressed before this island could listen, in order; replayed once each.
  replay?: readonly string[] | undefined;
  // Tells the loader to stop collecting keys: this island listens for itself from now on.
  onArmed?: (() => void) | undefined;
  toast: string;
  image: { src: string; width: number; height: number };
}

export function Konami({ replay, onArmed, toast, image }: KonamiProps) {
  const [showing, setShowing] = useState(false);
  // Detector state lives outside render; the handlers are the only writers.
  const progress = useRef(0);
  const visible = useRef(false);
  const replayed = useRef(0);

  // Re-armed by React whenever the replay list grows before the loader has been told to stop, so
  // a key that landed between the loader's last render and this mount is replayed too.
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
    for (const key of (replay ?? []).slice(replayed.current)) onKey(key);
    replayed.current = replay?.length ?? 0;
    onArmed?.();
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
