// Next.js config: static export for Cloudflare Workers static assets, no image loader, React Compiler on.
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Every route renders to static HTML in ./out at build time (D1).
  output: 'export',
  // Static export has no image optimization server; images are pre-optimized and committed (spec §11).
  images: { unoptimized: true },
  // Automatic memoization; a free re-render guard (D1).
  reactCompiler: true
};

export default nextConfig;
