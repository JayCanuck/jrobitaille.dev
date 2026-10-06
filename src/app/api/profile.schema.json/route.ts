import { profileJsonSchema } from '@/lib/webmcp/profile-schema';

// JSON Schema of /api/profile.json, converted from the zod schema at build time (D17), so an
// agent can validate what it fetched. Static under output: "export".
export const dynamic = 'force-static';

export function GET() {
  return Response.json(profileJsonSchema);
}
