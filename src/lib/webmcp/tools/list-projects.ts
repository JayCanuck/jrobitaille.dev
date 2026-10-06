// list_projects: returns { projects: [{ slug, title, era, blurb }] } in page order, without the
// descriptions or links. get_project returns the detail for one slug.
import type { ProfileData } from '@/lib/webmcp/profile-data';

import { EMPTY_INPUT, success, type ToolDefinition } from './types';

export const listProjects: ToolDefinition = {
  name: 'list_projects',
  description:
    'The selected projects in page order, without descriptions: slug, title, era, blurb. Use get_project with a slug for the detail and links.',
  inputSchema: EMPTY_INPUT,
  handler: (data: ProfileData) =>
    success({
      projects: data.projects.map(({ slug, title, era, blurb }) => ({ slug, title, era, blurb }))
    })
};
