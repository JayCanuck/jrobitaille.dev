// Content mirrors the current master resume and public profile text; update both together.
// Hero lines are fixed in docs/SPEC.md §2; About is the public profile text verbatim (D5).
// Summary, open source and education are agent-facing data only in Phase 2 (D12).
import type { Availability, Profile, SkillGroup } from '@/content/schema';

export const profile: Profile = {
  name: 'Jason Robitaille',
  title: 'Staff Software Engineer',
  headline: 'Full-Stack, Platform & Developer Tooling · 15+ years shipping web products',
  location: 'Mountain View, CA · remote or Bay Area',
  availability: 'Open to full-stack, platform or developer tooling roles',
  email: 'jason.aj.robitaille@gmail.com',
  links: {
    resume: '/resume.pdf',
    linkedin: 'https://linkedin.com/in/jasonrobitaille',
    github: 'https://github.com/JayCanuck',
    npm: 'https://www.npmjs.com/~jaycanuck'
  },
  metaDescription:
    'Staff software engineer: full-stack, platform and developer tooling, 15+ years shipping web products. Mountain View, CA, open to remote.',
  // Page copy (D13): two of the four public profile paragraphs, verbatim, the origin story and the one
  // about making things; the cards carry the product list and About does not restate the search.
  about: [
    'I started out in the Palm webOS homebrew community, patching system apps and building webapps the platform didn’t have yet, and that pull toward web and cloud tech has carried me through 15+ years in the industry. Most of that was at LG, shipping full-stack web products and the platform work underneath them.',
    'I enjoy the process of making, bringing an idea into being from the “what” and “why” through to the “how”, and building it alongside people who come at it from different skillsets than mine.'
  ],
  aboutLong: [
    'I started out in the Palm webOS homebrew community, patching system apps and building webapps the platform didn’t have yet, and that pull toward web and cloud tech has carried me through 15+ years in the industry. Most of that was at LG, shipping full-stack web products and the platform work underneath them.',
    'That ranged from the Enact React framework for webOS TVs and its build tooling, to the cloud platform for the SVL autonomous-driving simulator, to the 3D product experience now live on LG.com (a site with millions of monthly visitors, per LG).',
    'I enjoy the process of making, bringing an idea into being from the “what” and “why” through to the “how”, and building it alongside people who come at it from different skillsets than mine.',
    'My team was eliminated in LG’s 2026 restructuring, so I’m actively looking for full-stack, platform or developer tooling roles, remote or in the SF Bay Area.'
  ]
};

// Structured form of the availability the About text states (D17); agent-facing data only.
export const availability: Availability = {
  open: true,
  roles: ['full-stack', 'platform', 'developer tooling'],
  location: 'remote or SF Bay Area'
};

export const summary =
  'Staff software engineer with 11 years at LG across five products, from the Enact React framework for webOS and its official CLI to LG.com’s 3D e-commerce experience. Takes full-stack web apps from prototype through to production, and builds the tooling other developers ship on.';

export const skills: SkillGroup[] = [
  { name: 'Languages', terms: ['TypeScript', 'JavaScript', 'Node.js', 'HTML and CSS', 'Python'] },
  {
    name: 'Frontend',
    terms: ['React', 'MUI', 'TanStack Query', 'Storybook', 'Gatsby', 'Three.js']
  },
  {
    name: 'Backend and data',
    terms: ['NestJS', 'Prisma', 'Sequelize', 'REST API design', 'Koa']
  },
  { name: 'Build and tooling', terms: ['Vite', 'webpack', 'Babel', 'Jest', 'ESLint', 'Yocto'] },
  { name: 'CI and cloud', terms: ['Jenkins', 'GitLab CI', 'AWS Amplify', 'S3', 'Puppeteer'] }
];

export const openSource: string[] = [
  'Enact, LG’s open-source React framework for webOS (github.com/enactjs, 346 stars). Created @enact/cli and cut every framework release until 2020.',
  'Enyo (github.com/enyojs). Enact’s predecessor. Cut its final releases, and wrote enyo-ext (github.com/jaycanuck/enyo-ext, 19 stars), a personal extensions library for it.',
  'SVL Simulator site (github.com/lgsvl/svlsimulator.com). The simulator’s static Gatsby marketing site, primary author.',
  'webOS homebrew (github.com/jaycanuck). WebOS Quick Install (55 stars) and java-weboslib, its reverse-engineered device library.'
];

export const education = 'B.Sc. Computer Science, University of Manitoba, 2014';
