// get_contact: the public contact details only (email, LinkedIn, GitHub, npm, location line).
import type { ProfileData } from '@/lib/webmcp/profile-data';

import { EMPTY_INPUT, success, type ToolDefinition } from './types';

export const getContact: ToolDefinition = {
  name: 'get_contact',
  description: 'Public contact only: email, LinkedIn, GitHub, npm and the location line.',
  inputSchema: EMPTY_INPUT,
  handler: (data: ProfileData) => {
    const { email, linkedin, github, npm, location } = data.contact;
    return success({ contact: { email, linkedin, github, npm, location } });
  }
};
