// Pointer drag for the skills cloud (D18): a small record with methods, shared between the
// island's pointer handlers and the scene's frame loop, no dependency. A press is only a candidate:
// the drag starts once the pointer has moved more than the slop with more horizontal than vertical
// movement, so a vertical pan on touch stays with the page (the canvas has touch-action: pan-y).
// Touch rotates on the horizontal axis only; a mouse rotates on both. All mutation lives behind
// the methods, so the components only call them.

interface DragDelta {
  x: number;
  y: number;
}

type DragPhase = 'idle' | 'pending' | 'dragging';

// What a move did: nothing yet, crossed the slop horizontally (the caller takes pointer capture),
// kept dragging, or crossed it vertically and handed the gesture back to the page.
type MoveResult = 'idle' | 'pending' | 'started' | 'dragging' | 'dismissed';

export interface Drag {
  readonly phase: DragPhase;
  readonly pointerId: number | null;
  press(pointerId: number, x: number, y: number, time: number, horizontalOnly: boolean): void;
  move(x: number, y: number, time: number): MoveResult;
  release(time: number): void;
  // Movement since the last call, in CSS px; resets to zero.
  takePending(): DragDelta;
  // Release velocity in CSS px per ms, then decayed by `factor` for the next frame.
  takeVelocity(factor: number): DragDelta;
}

// Radians of rotation per CSS px of drag: a full turn in about 1,250 px.
export const RADIANS_PER_PX = 0.005;
// Inertia time constant in seconds; the release velocity is under 5% after about a second.
export const INERTIA_SECONDS = 0.33;
// A press becomes a drag only past this distance.
export const SLOP_PX = 8;
// A pointer that rested this long before release carries no inertia.
const REST_MS = 80;
// Below this speed (px per ms) the inertia is over.
const STILL = 0.0001;

export const createDrag = (): Drag => {
  let phase: DragPhase = 'idle';
  let pointerId: number | null = null;
  let horizontalOnly = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let pendingX = 0;
  let pendingY = 0;
  let velocityX = 0;
  let velocityY = 0;
  const track = (x: number, y: number, time: number) => {
    const dx = x - lastX;
    const dy = horizontalOnly ? 0 : y - lastY;
    const dt = Math.max(1, time - lastTime);
    pendingX += dx;
    pendingY += dy;
    // Smoothed so one jittery sample does not set the whole release velocity.
    velocityX = velocityX * 0.5 + (dx / dt) * 0.5;
    velocityY = velocityY * 0.5 + (dy / dt) * 0.5;
    lastX = x;
    lastY = y;
    lastTime = time;
  };
  return {
    get phase() {
      return phase;
    },
    get pointerId() {
      return pointerId;
    },
    press(id, x, y, time, onlyHorizontal) {
      phase = 'pending';
      pointerId = id;
      horizontalOnly = onlyHorizontal;
      startX = x;
      startY = y;
      lastX = x;
      lastY = y;
      lastTime = time;
      pendingX = 0;
      pendingY = 0;
      velocityX = 0;
      velocityY = 0;
    },
    move(x, y, time) {
      if (phase === 'idle') return 'idle';
      if (phase === 'dragging') {
        track(x, y, time);
        return 'dragging';
      }
      const dx = x - startX;
      const dy = y - startY;
      if (Math.hypot(dx, dy) <= SLOP_PX) return 'pending';
      if (Math.abs(dx) > Math.abs(dy)) {
        phase = 'dragging';
        // The slop distance counts toward the rotation, so the cloud does not jump at the start.
        lastX = startX;
        lastY = startY;
        track(x, y, time);
        return 'started';
      }
      phase = 'idle';
      pointerId = null;
      return 'dismissed';
    },
    release(time) {
      if (phase !== 'dragging' || time - lastTime > REST_MS) {
        velocityX = 0;
        velocityY = 0;
      }
      phase = 'idle';
      pointerId = null;
    },
    takePending() {
      const delta = { x: pendingX, y: pendingY };
      pendingX = 0;
      pendingY = 0;
      return delta;
    },
    takeVelocity(factor) {
      const velocity = { x: velocityX, y: velocityY };
      velocityX *= factor;
      velocityY *= factor;
      if (Math.abs(velocityX) < STILL) velocityX = 0;
      if (Math.abs(velocityY) < STILL) velocityY = 0;
      return velocity;
    }
  };
};
