// get_experience: one role by id (from list_experience) with every bullet, dates, and the era line
// and public link where they exist. Pure and read-only; a missing or unknown id is a failure,
// never a throw.
import type { ProfileData } from '@/lib/webmcp/profile-data';

import { failure, success, type ToolDefinition } from './types';

export const getExperience: ToolDefinition<{ id: string }> = {
  name: 'get_experience',
  description:
    'One role by id (from list_experience) with every bullet, dates, and the era line and public link where they exist.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Experience id as returned by list_experience.' }
    },
    required: ['id'],
    additionalProperties: false
  },
  handler: (data: ProfileData, input) => {
    const ids = data.experience.map(candidate => candidate.id).join(', ');
    const id: unknown = (input as { id?: unknown } | undefined)?.id;
    if (typeof id !== 'string' || id === '') return failure(`Missing id. Valid ids: ${ids}`);
    const entry = data.experience.find(candidate => candidate.id === id);
    if (!entry) return failure(`Unknown experience id "${id}". Valid ids: ${ids}`);
    return success({ experience: entry });
  }
};
