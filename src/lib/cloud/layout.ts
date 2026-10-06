// Fibonacci-sphere layout for the skills cloud (D18). Pure: terms in, unit-sphere points out,
// plus the two depth steps the sprites apply. Depth is mostly colour (front foreground, back
// muted-foreground); size stays between the 13 px floor and 16 px so every term reads.

export interface SpherePoint {
  x: number;
  y: number;
  z: number;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export const spherePoints = (terms: readonly string[]): SpherePoint[] => {
  const count = terms.length;
  if (count === 0) return [];
  if (count === 1) return [{ x: 0, y: 0, z: 1 }];
  return terms.map((_, index) => {
    const y = 1 - (index / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const angle = GOLDEN_ANGLE * index;
    return { x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring };
  });
};

// z from -1 (back) to 1 (front) onto 0 to 1, clamped.
export const depthMix = (z: number) => Math.min(1, Math.max(0, (z + 1) / 2));

const MIN_TERM_PX = 13;
const MAX_TERM_PX = 16;

// Term size in CSS px for a depth: never below the 13 px floor, 16 px at the very front.
export const depthSize = (z: number) => MIN_TERM_PX + (MAX_TERM_PX - MIN_TERM_PX) * depthMix(z);
