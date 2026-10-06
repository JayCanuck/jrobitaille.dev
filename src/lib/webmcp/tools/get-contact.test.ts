// get_contact: public contact details only, copied field by field from the profile data.
import { describe, expect, it } from 'vitest';

import { getContact } from '@/lib/webmcp/tools/get-contact';
import { buildProfileData } from '@/lib/webmcp/profile-data';

const data = buildProfileData();

describe('getContact', () => {
  it('is named get_contact with an empty input schema', () => {
    expect(getContact.name).toBe('get_contact');
    expect(getContact.description).toBe(
      'Public contact only: email, LinkedIn, GitHub, npm and the location line.'
    );
    expect(getContact.inputSchema.properties).toEqual({});
    expect(getContact.inputSchema.additionalProperties).toBe(false);
  });

  it('returns exactly the public contact fields', () => {
    const result = getContact.handler(data, {});
    expect(result.isError).toBeUndefined();
    expect(Object.keys(result.structuredContent ?? {})).toEqual(['contact']);
    expect(Object.keys(result.structuredContent?.contact as object).sort()).toEqual(
      ['email', 'github', 'linkedin', 'location', 'npm'].sort()
    );
  });

  it('copies every field from the data without sharing the object', () => {
    const result = getContact.handler(data, {});
    const contact = result.structuredContent?.contact;
    expect(contact).toEqual(data.contact);
    expect(contact).not.toBe(data.contact);
  });

  it('puts the same value in the text as JSON', () => {
    const result = getContact.handler(data, {});
    expect(JSON.parse(result.content[0].text)).toEqual(result.structuredContent);
  });
});
