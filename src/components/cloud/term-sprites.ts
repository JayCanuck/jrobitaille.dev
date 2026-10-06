// Sprites for the skills cloud (D18): one canvas texture per term, drawn in the page's mono font
// in white so the material colour can tint it by depth every frame, plus the token readers that
// turn the page's oklch tokens into three.js colours. Browser-only helpers for the island.
import * as THREE from 'three';

import { depthMix, depthSize, spherePoints } from '@/lib/cloud/layout';

export interface TermSprite {
  sprite: THREE.Sprite;
  // Width over height of the drawn label, so the sprite scale keeps the glyphs' proportions.
  aspect: number;
}

export interface CloudColors {
  front: THREE.Color;
  back: THREE.Color;
}

const TEXTURE_FONT_PX = 32;
const TEXTURE_PADDING = 8;

// A CSS colour (oklch on this site) to a three.js colour, through the 2D canvas, which resolves
// any colour syntax the browser knows. No hex in components: the values come from the tokens.
const cssColor = (value: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Color(1, 1, 1);
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r = 255, g = 255, b = 255] = context.getImageData(0, 0, 1, 1).data;
  return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
};

// Front and back colours from the page tokens: foreground at the front, muted-foreground behind.
export const readCloudColors = (): CloudColors => {
  const style = getComputedStyle(document.documentElement);
  return {
    front: cssColor(style.getPropertyValue('--foreground').trim()),
    back: cssColor(style.getPropertyValue('--muted-foreground').trim())
  };
};

// The exact mono family the chips render in (next/font names it), read from a chip.
const monoFamily = (sample: Element | null) =>
  sample ? getComputedStyle(sample).fontFamily : 'ui-monospace, monospace';

const labelTexture = (term: string, family: string) => {
  const probe = document.createElement('canvas').getContext('2d');
  const font = `500 ${String(TEXTURE_FONT_PX)}px ${family}`;
  if (probe) probe.font = font;
  const width = Math.ceil((probe?.measureText(term).width ?? term.length * 20) + TEXTURE_PADDING);
  const height = Math.ceil(TEXTURE_FONT_PX * 1.3);
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  if (context) {
    context.scale(scale, scale);
    context.font = font;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    // White ink; the material colour tints it from the tokens (no hex under src/).
    context.fillStyle = 'rgb(255 255 255)';
    context.fillText(term, width / 2, height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  return { texture, aspect: width / height };
};

// Builds the sprites on the unit sphere scaled to `radius` CSS px; the caller adds them to a group.
export const buildSprites = (
  terms: readonly string[],
  radius: number,
  fontSample: Element | null
) => {
  const family = monoFamily(fontSample);
  return spherePoints(terms).map((point, index) => {
    const term = terms[index] ?? '';
    const { texture, aspect } = labelTexture(term, family);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(point.x * radius, point.y * radius, point.z * radius);
    return { sprite, aspect };
  });
};

// Per frame: colour and size from the sprite's depth in world space. Sizes are CSS px because the
// camera is orthographic with world units equal to pixels.
const worldPosition = new THREE.Vector3();
export const applyDepth = (sprites: TermSprite[], radius: number, colors: CloudColors) => {
  for (const { sprite, aspect } of sprites) {
    sprite.getWorldPosition(worldPosition);
    const z = radius === 0 ? 0 : worldPosition.z / radius;
    const height = depthSize(z) * 1.3;
    sprite.scale.set(height * aspect, height, 1);
    sprite.material.color.copy(colors.back).lerp(colors.front, depthMix(z));
  }
};

export const disposeCloud = (sprites: TermSprite[]) => {
  for (const { sprite } of sprites) {
    const material = sprite.material;
    material.map?.dispose();
    material.dispose();
  }
};
