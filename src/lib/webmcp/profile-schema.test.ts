// The zod schema of the agent-facing data converts to JSON Schema at build time (D17); the tools
// and /api/profile.schema.json read the JSON, never zod.
import { describe, expect, it } from 'vitest';

import { buildProfileData } from '@/lib/webmcp/profile-data';
import { profileDataSchema, profileJsonSchema } from '@/lib/webmcp/profile-schema';

interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
}

const schema = profileJsonSchema as JsonSchema;

describe('profileDataSchema', () => {
  it('accepts the built data', () => {
    const result = profileDataSchema.safeParse(buildProfileData());
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  it('rejects contact details that are not public', () => {
    const data = buildProfileData();
    expect(
      profileDataSchema.safeParse({ ...data, contact: { ...data.contact, phone: '555' } }).success
    ).toBe(false);
  });
});

describe('profileJsonSchema', () => {
  it('is a JSON Schema object with every top-level field required', () => {
    expect(schema.type).toBe('object');
    expect(schema.required?.sort()).toEqual(Object.keys(buildProfileData()).sort());
  });

  it('describes experience entries with their bullets and availability as structured data', () => {
    const experience = schema.properties?.experience;
    expect(experience?.type).toBe('array');
    expect(experience?.items?.required).toEqual(expect.arrayContaining(['id', 'bullets']));
    expect(experience?.items?.properties?.bullets?.items?.properties).toHaveProperty('text');
    expect(schema.properties?.availability?.properties?.open?.type).toBe('boolean');
  });

  it('is plain JSON', () => {
    expect(JSON.parse(JSON.stringify(profileJsonSchema))).toEqual(profileJsonSchema);
  });
});
