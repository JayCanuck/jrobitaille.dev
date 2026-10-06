// The drag record behind the cloud's pointer rotation (D18): pure, so it is tested here; the
// island's handlers and the frame loop only call its methods.
import { describe, expect, it } from 'vitest';

import { createDrag, INERTIA_SECONDS, RADIANS_PER_PX, SLOP_PX } from '@/lib/cloud/drag';

describe('drag', () => {
  it('starts idle with nothing pending', () => {
    const drag = createDrag();
    expect(drag.phase).toBe('idle');
    expect(drag.pointerId).toBeNull();
    expect(drag.move(10, 10, 16)).toBe('idle');
    expect(drag.takePending()).toEqual({ x: 0, y: 0 });
    expect(drag.takeVelocity(1)).toEqual({ x: 0, y: 0 });
  });

  it('stays pending inside the slop and starts on a horizontal-dominant move past it', () => {
    const drag = createDrag();
    drag.press(1, 100, 100, 0, false);
    expect(drag.phase).toBe('pending');
    expect(drag.move(105, 103, 16)).toBe('pending');
    expect(drag.takePending()).toEqual({ x: 0, y: 0 });
    expect(drag.move(120, 106, 32)).toBe('started');
    expect(drag.phase).toBe('dragging');
    // The slop distance counts, so there is no jump at the start.
    expect(drag.takePending()).toEqual({ x: 20, y: 6 });
    expect(drag.move(150, 110, 48)).toBe('dragging');
    expect(drag.takePending()).toEqual({ x: 30, y: 4 });
  });

  it('dismisses a vertical-dominant move past the slop and goes back to idle', () => {
    const drag = createDrag();
    drag.press(1, 100, 100, 0, true);
    expect(drag.move(103, 130, 16)).toBe('dismissed');
    expect(drag.phase).toBe('idle');
    expect(drag.pointerId).toBeNull();
    expect(drag.takePending()).toEqual({ x: 0, y: 0 });
    expect(drag.move(103, 160, 32)).toBe('idle');
  });

  it('rotates on the horizontal axis only for a touch pointer', () => {
    const drag = createDrag();
    drag.press(2, 0, 0, 0, true);
    expect(drag.move(30, 10, 16)).toBe('started');
    expect(drag.takePending()).toEqual({ x: 30, y: 0 });
    drag.move(60, 40, 32);
    expect(drag.takePending()).toEqual({ x: 30, y: 0 });
    drag.release(40);
    expect(drag.takeVelocity(1).y).toBe(0);
  });

  it('keeps the release velocity after a moving release and decays it on each take', () => {
    const drag = createDrag();
    drag.press(1, 0, 0, 0, false);
    drag.move(40, 0, 16);
    drag.release(20);
    expect(drag.phase).toBe('idle');
    const first = drag.takeVelocity(0.5);
    expect(first.x).toBeGreaterThan(0);
    const second = drag.takeVelocity(0.5);
    expect(second.x).toBeCloseTo(first.x / 2, 6);
    let last = second.x;
    for (let i = 0; i < 40; i++) last = drag.takeVelocity(0.5).x;
    expect(last).toBe(0);
  });

  it('drops the velocity when the pointer rested before release, or never started dragging', () => {
    const rested = createDrag();
    rested.press(1, 0, 0, 0, false);
    rested.move(40, 0, 16);
    rested.release(400);
    expect(rested.takeVelocity(1)).toEqual({ x: 0, y: 0 });

    const tapped = createDrag();
    tapped.press(1, 0, 0, 0, false);
    tapped.release(10);
    expect(tapped.takeVelocity(1)).toEqual({ x: 0, y: 0 });
  });

  it('maps a full turn to about 1,250 px, an 8 px slop, and settles inertia within about a second', () => {
    expect((2 * Math.PI) / RADIANS_PER_PX).toBeCloseTo(1257, 0);
    expect(SLOP_PX).toBe(8);
    expect(Math.exp(-1 / INERTIA_SECONDS)).toBeLessThan(0.05);
  });
});
