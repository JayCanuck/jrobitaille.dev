// get_skills: the five skill groups with their terms, as the Toolbox section lists them.
import type { ProfileData } from '@/lib/webmcp/profile-data';

import { EMPTY_INPUT, success, type ToolDefinition } from './types';

export const getSkills: ToolDefinition = {
  name: 'get_skills',
  description: 'The five skill groups with their terms, as the Toolbox section lists them.',
  inputSchema: EMPTY_INPUT,
  handler: (data: ProfileData) => success({ skills: data.skills })
};
