import { ImageResponse } from 'next/og';

import { profile } from '@/content/resume';

// Open Graph image generated at build from name, title and headline (spec §5, D14). Static export:
// the file convention wires it into metadata; no runtime work.
export const dynamic = 'force-static';
export const alt = `${profile.name}, ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Slate-950 background, slate-100 text, the Ultraviolet brand rule (hex equivalents of the oklch tokens).
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 72,
        background: '#101321',
        color: '#f1f3f8',
        fontFamily: 'sans-serif'
      }}
    >
      <div
        style={{ width: 120, height: 8, borderRadius: 4, background: '#8b5cf6', marginBottom: 36 }}
      />
      <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>{profile.name}</div>
      <div style={{ fontSize: 38, color: '#c4b5fd', marginTop: 8 }}>{profile.title}</div>
      <div style={{ fontSize: 30, color: '#a3acc2', marginTop: 20 }}>{profile.headline}</div>
    </div>,
    { ...size }
  );
}
