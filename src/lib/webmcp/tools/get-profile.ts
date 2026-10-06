// get_profile: identity and summary. Returns name, title, headline, location, site url, summary,
// the About paragraphs and the structured availability, copied from the profile data.
import { EMPTY_INPUT, success, type ToolDefinition } from './types';

export const getProfile: ToolDefinition = {
  name: 'get_profile',
  description:
    'Identity and summary: name, title, headline, location, site url, summary, the About paragraphs and the structured availability.',
  inputSchema: EMPTY_INPUT,
  handler: data =>
    success({
      name: data.name,
      title: data.title,
      headline: data.headline,
      location: data.location,
      url: data.url,
      summary: data.summary,
      about: data.about,
      availability: data.availability
    })
};
