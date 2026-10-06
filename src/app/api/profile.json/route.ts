import { buildProfileData } from '@/lib/webmcp/profile-data';

// The agent-facing data as a static file (D12, D17): written to out/api/profile.json at build.
// Route handlers must opt into static rendering under output: "export"; CORS is added in
// scripts/headers.mjs so agents can fetch it cross-origin.
export const dynamic = 'force-static';

export function GET() {
  return Response.json(buildProfileData());
}
