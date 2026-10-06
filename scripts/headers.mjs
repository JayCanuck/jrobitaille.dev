// Post-build: write out/_headers for Cloudflare static assets (D14). The CSP allows inline scripts
// only by SHA-256 hash, computed here from every inline <script> in out/**/*.html, so script-src
// never needs 'unsafe-inline'. /api/* is the agent-facing JSON (D17): CORS open so agents can fetch
// it cross-origin, cached an hour since the names are not hashed. Run by `npm run build` after
// `next build`.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';

const htmlFiles = dir =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? htmlFiles(path) : name.endsWith('.html') ? [path] : [];
  });

// Inline scripts that execute: no src attribute and no non-JS type (JSON-LD is data, not code).
const inlineScripts = html =>
  [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attrs]) => !/\bsrc=/.test(attrs))
    .filter(([, attrs]) => {
      const type = /\btype="([^"]*)"/.exec(attrs)?.[1];
      return !type || /javascript|module/.test(type);
    })
    .map(([, , body]) => body);

const hashes = new Set();
for (const file of htmlFiles(OUT)) {
  for (const body of inlineScripts(readFileSync(file, 'utf8'))) {
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')}`.trim(),
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests'
].join('; ');

const headers = `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

/api/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
`;

writeFileSync(join(OUT, '_headers'), headers);
console.log(`out/_headers written with ${String(hashes.size)} inline script hashes`);
