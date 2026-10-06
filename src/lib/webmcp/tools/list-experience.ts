// list_experience: every role newest first without bullets (id, employer, title, name, years,
// desc), so an agent can scan the career and ask get_experience for one role in full.
import type { ProfileData } from '@/lib/webmcp/profile-data';
import { EMPTY_INPUT, success, type ToolDefinition } from './types';

export const listExperience: ToolDefinition = {
  name: 'list_experience',
  description:
    'Every role newest first, without bullets: id, employer, title, name, years, desc. Use get_experience with an id for the full detail.',
  inputSchema: EMPTY_INPUT,
  handler: (data: ProfileData) =>
    success({
      experience: data.experience.map(role => ({
        id: role.id,
        employer: role.employer,
        title: role.title,
        name: role.name,
        years: role.years,
        desc: role.desc
      }))
    })
};
