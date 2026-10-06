// get_project: returns one project by slug as { project }, with its title, era, blurb, description
// and proof links. An unknown slug fails with the list of valid slugs.
import type { ProfileData } from '@/lib/webmcp/profile-data';

import { failure, success, type ToolDefinition } from './types';

export const getProject: ToolDefinition<{ slug: string }> = {
  name: 'get_project',
  description: 'One project by slug (from list_projects) with its description and proof links.',
  inputSchema: {
    type: 'object',
    properties: {
      slug: { type: 'string', description: 'Project slug, as returned by list_projects.' }
    },
    required: ['slug'],
    additionalProperties: false
  },
  handler: (data: ProfileData, input) => {
    const valid = data.projects.map(project => project.slug).join(', ');
    const slug: unknown = (input as { slug?: unknown } | undefined)?.slug;
    if (typeof slug !== 'string' || slug === '') {
      return failure(`Missing slug. Valid slugs: ${valid}.`);
    }
    const found = data.projects.find(project => project.slug === slug);
    if (!found) return failure(`Unknown project slug "${slug}". Valid slugs: ${valid}.`);
    const { title, era, blurb, description, link } = found;
    const secondaryLink = 'secondaryLink' in found ? found.secondaryLink : undefined;
    return success({
      project: {
        slug,
        title,
        era,
        blurb,
        description,
        link,
        ...(secondaryLink && { secondaryLink })
      }
    });
  }
};
