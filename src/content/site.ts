// Site chrome: section headings, the tagline and footer-line slots, and 404 copy (D14). The two slots
// are placeholders until the owner supplies copy; an empty string renders no element.
import type { SiteCopy } from '@/content/schema';

export const siteCopy: SiteCopy = {
  headings: {
    about: 'Hello',
    work: 'Things I’ve shipped',
    experience: 'Where I’ve been',
    skills: 'Toolbox'
  },
  tagline: 'tagline',
  footerLine: 'footer line',
  notFound: {
    title: 'Page not found',
    body: 'There is nothing at this address. The cow is fine.',
    home: 'Back to the home page'
  }
};
