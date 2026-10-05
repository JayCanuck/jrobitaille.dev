// Identity, About and skills. Hero lines are locked in docs/SPEC.md §2; About is the LinkedIn text
// verbatim (D5); skills are the resume's five groups. Wording is locked upstream, do not polish.
import type { Profile, SkillGroup } from '@/content/schema';

export const profile: Profile = {
  name: 'Jason Robitaille',
  title: 'Staff Software Engineer',
  headline: 'Full-Stack, Platform & Developer Tooling · 15+ yrs shipping web products',
  location: 'Mountain View, CA · remote or Bay Area',
  availability: 'Open to full-stack, platform or developer tooling roles',
  email: 'jason.aj.robitaille@gmail.com',
  links: {
    resume: '/resume.pdf',
    linkedin: 'https://linkedin.com/in/jasonrobitaille',
    github: 'https://github.com/JayCanuck',
    npm: 'https://www.npmjs.com/~jaycanuck'
  },
  about: [
    'I started out in the Palm webOS homebrew community, patching system apps and building webapps the platform didn’t have yet, and that pull toward web and cloud tech has carried me through 15+ years in the industry. Most of that was at LG, shipping full-stack web products and the platform work underneath them.',
    'That ranged from the Enact React framework for webOS TVs and its build tooling, to the cloud platform for the SVL autonomous-driving simulator, to the 3D product experience now live on LG.com (a site with millions of monthly visitors, per LG).',
    'I enjoy the process of making, bringing an idea into being from the “what” and “why” through to the “how”, and building it alongside people who come at it from different skillsets than mine.',
    'My team was eliminated in LG’s 2026 restructuring, so I’m actively looking for full-stack, platform or developer tooling roles, remote or in the SF Bay Area.'
  ]
};

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
