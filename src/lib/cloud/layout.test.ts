// Fibonacci-sphere layout for the skills cloud (D18): pure, deterministic, one point per term on
// the unit sphere, and the depth-to-colour and depth-to-size steps the sprites use.
import { describe, expect, it } from 'vitest';

import { depthMix, depthSize, spherePoints } from '@/lib/cloud/layout';

const terms = Array.from({ length: 27 }, (_, i) => `term-${String(i)}`);

describe('spherePoints', () => {
  it('returns one unit-sphere point per term, in order', () => {
    const points = spherePoints(terms);
    expect(points).toHaveLength(terms.length);
    for (const point of points) {
      const radius = Math.hypot(point.x, point.y, point.z);
      expect(radius).toBeCloseTo(1, 6);
    }
  });

  it('is deterministic', () => {
    expect(spherePoints(terms)).toEqual(spherePoints(terms));
  });

  it('spreads points over the whole sphere, not one hemisphere', () => {
    const points = spherePoints(terms);
    expect(points.some(point => point.z > 0.5)).toBe(true);
    expect(points.some(point => point.z < -0.5)).toBe(true);
    expect(points.some(point => point.y > 0.5)).toBe(true);
    expect(points.some(point => point.y < -0.5)).toBe(true);
  });

  it('keeps every pair of points apart', () => {
    const points = spherePoints(terms);
    let nearest = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        if (!a || !b) throw new Error('missing point');
        nearest = Math.min(nearest, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z));
      }
    }
    // 27 points on a unit sphere: the Fibonacci spiral keeps neighbours about 0.5 apart.
    expect(nearest).toBeGreaterThan(0.35);
  });

  it('handles one term and no terms', () => {
    expect(spherePoints([])).toEqual([]);
    expect(spherePoints(['one'])).toHaveLength(1);
  });
});

describe('depthMix', () => {
  it('maps z from the back (-1) to the front (1) onto 0 to 1', () => {
    expect(depthMix(-1)).toBe(0);
    expect(depthMix(0)).toBe(0.5);
    expect(depthMix(1)).toBe(1);
  });

  it('clamps outside the sphere', () => {
    expect(depthMix(-2)).toBe(0);
    expect(depthMix(2)).toBe(1);
  });
});

describe('depthSize', () => {
  it('never renders a term below the 13 px floor and tops out at 16 px', () => {
    expect(depthSize(-1)).toBe(13);
    expect(depthSize(1)).toBe(16);
    for (const z of [-0.9, -0.5, 0, 0.5, 0.9]) {
      expect(depthSize(z)).toBeGreaterThanOrEqual(13);
      expect(depthSize(z)).toBeLessThanOrEqual(16);
    }
  });

  it('grows monotonically toward the front', () => {
    expect(depthSize(-0.5)).toBeLessThan(depthSize(0));
    expect(depthSize(0)).toBeLessThan(depthSize(0.5));
  });
});
