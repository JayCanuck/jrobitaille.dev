import { buildLlmsText } from '@/lib/llms';

// /llms.txt generated from the content at build (D17), replacing the hand-written public file.
export const dynamic = 'force-static';

export function GET() {
  return new Response(buildLlmsText(), {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}
