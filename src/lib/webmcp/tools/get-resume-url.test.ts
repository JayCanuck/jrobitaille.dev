// get_resume_url: the absolute URL of the current resume PDF, from the shared profile data.
import { describe, expect, it } from 'vitest';

import { getResumeUrl } from '@/lib/webmcp/tools/get-resume-url';
import { buildProfileData } from '@/lib/webmcp/profile-data';

const data = buildProfileData();

describe('get_resume_url', () => {
  it('declares its name, description and an empty input schema', () => {
    expect(getResumeUrl.name).toBe('get_resume_url');
    expect(getResumeUrl.description).toBe('The absolute URL of the current resume PDF.');
    expect(getResumeUrl.inputSchema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false
    });
  });

  it('returns exactly the resume URL from the profile data', () => {
    const result = getResumeUrl.handler(data, {});
    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toEqual({ resumeUrl: data.resumeUrl });
    expect(result.structuredContent?.resumeUrl).toMatch(/^https:\/\/.+\.pdf$/);
  });

  it('puts the JSON of the structured content in the text', () => {
    const result = getResumeUrl.handler(data, {});
    expect(result.content[0].text).toBe(JSON.stringify(result.structuredContent));
  });

  it('does not mutate the profile data', () => {
    const before = JSON.stringify(data);
    getResumeUrl.handler(data, {});
    expect(JSON.stringify(data)).toBe(before);
  });
});
