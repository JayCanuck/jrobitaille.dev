// Site chrome: section headings, the tagline and footer-line slots, and 404 copy (D14). The two slots
// are placeholders until the owner supplies copy; an empty string renders no element.
import type { SiteCopy } from '@/content/schema';

export const siteCopy: SiteCopy = {
  headings: {
    about: 'Hello',
    work: 'Things I’ve built',
    experience: 'Where I’ve been',
    skills: 'Toolbox'
  },
  tagline: '',
  footerLine: '',
  agentTools: {
    badge: 'Agent tools available',
    explain:
      'This page registers eight read-only WebMCP tools, a W3C Community Group draft API, so an agent in a supporting browser can read the profile, experience, projects, skills and contact without scraping. The same data is at /api/profile.json.'
  },
  skillsView: { list: 'List', cloud: 'Cloud' },
  notFound: {
    title: 'Page not found',
    body: 'There is nothing at this address. The cow is fine.',
    home: 'Back to the home page'
  }
};
