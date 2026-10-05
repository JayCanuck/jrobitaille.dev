// Experience timeline, newest first. Each bullet is a resume-data.js sentence (ID kept) or a locked
// LinkedIn line; descriptors come from the same sources. Rail labels are the title ladder.
import type { Era } from '@/content/schema';

const LG = 'LG Electronics';

export const experience: Era[] = [
  {
    id: 'RV',
    name: 'RetailVerse Web and Configurator',
    start: 2025,
    end: 2026,
    rail: 'Staff Software Engineer',
    employer: LG,
    descriptor: '3D e-commerce product experience on LG.com',
    bullets: [
      {
        id: 'RV-1',
        text: 'Architected and authored the 3D product viewer, an embeddable React plugin built for Google model-viewer with an iframe-based distribution, launched Sept 2025 on LG.com with 40 appliances and counting.'
      },
      {
        id: 'RV-2',
        text: 'Prototyped RetailVerse Web solo in under 3 weeks for the KBIS 2025 event, and its plugin architecture became the production viewer.'
      }
    ],
    link: {
      label: 'LG press release',
      href: 'https://www.lg.com/us/newsroom/home-appliance/lg-electronics-unveils-retailverse-tranforming-e-commerce-with-immersive-ai-enabled-3d-product-experiences'
    }
  },
  {
    id: 'SM',
    name: '3D asset platform',
    start: 2022,
    end: 2026,
    rail: 'Staff Software Engineer',
    employer: LG,
    descriptor: 'Full-stack overhaul of LG’s internal 3D model catalogue and pipeline',
    bullets: [
      {
        id: 'SM-3',
        text: 'Rebuilt the platform’s web app on React and TypeScript piece by piece over two product generations as its sole frontend engineer, and contributed to its APIs and backend services.'
      },
      {
        id: 'SM-1',
        text: 'Engineered the platform’s diagnostic 3D model viewer using Three.js and React Three Fiber, released as a standalone library the graphics engineers used to validate pipeline output.'
      }
    ]
  },
  {
    id: 'SW',
    name: 'SVL Simulator',
    start: 2020,
    end: 2022,
    rail: 'Staff Software Engineer',
    employer: LG,
    descriptor: 'Cloud platform for LG’s open-source driving simulator, 2.4k GitHub stars',
    bullets: [
      {
        id: 'SW-1',
        text: 'Drove the full-stack implementation of sharing on the simulator’s cloud platform, including private asset and simulation sharing, shipped in the public 2021.1 release.'
      },
      {
        id: 'SW-5',
        text: 'Implemented the platform’s API token system, from hashed scoped token authentication to the account settings UI, giving users programmatic access to the platform.'
      }
    ],
    link: { label: 'SVL Simulator on GitHub', href: 'https://github.com/lgsvl/simulator' }
  },
  {
    id: 'SR',
    name: 'Enact framework',
    start: 2017,
    end: 2020,
    rail: 'Senior Software Engineer',
    employer: LG,
    descriptor: 'Open-source React framework for webOS, shipped on millions of LG TVs',
    bullets: [
      {
        id: 'SR-2',
        text: 'Created @enact/cli, the Enact framework’s official SDK tool for app developers, and owned it for four years, covering project templates and the webpack, Babel and Jest build configurations, still in production a decade later.'
      },
      {
        id: 'SR-1',
        text: 'Built and operated the release path for the Enact framework into webOS’s OpenEmbedded build system for five years, cutting every major framework release across nine public repos and six product lines.'
      }
    ],
    link: { label: 'Enact on GitHub', href: 'https://github.com/enactjs' }
  },
  {
    id: 'SE',
    name: 'Enyo framework',
    start: 2015,
    end: 2017,
    rail: 'Software Engineer',
    employer: LG,
    descriptor: 'Earlier webOS JavaScript framework and Enact’s predecessor',
    bullets: [
      {
        id: 'SE-1',
        text: 'Shipped final Enyo library releases across eleven public repos through 2016 and retired the enyo-dev webapp bundling tool once the team migrated to Enact.'
      },
      {
        id: 'SE-2',
        text: 'Designed the framework recipes and app bbclass for modular Enyo 2.6 on webOS’s Yocto build system, so developers declared a source and version and got device-ready packages with locked libraries.'
      }
    ],
    link: { label: 'Enyo on GitHub', href: 'https://github.com/enyojs' }
  },
  {
    id: 'EXP',
    name: 'Experis IT',
    start: 2013,
    end: 2015,
    rail: 'Software Engineer (contract at LG)',
    employer: 'Experis IT',
    descriptor:
      'Two-year remote contract with LG Silicon Valley Lab’s Enyo framework team, hired out of the webOS homebrew community.',
    bullets: [
      {
        id: 'PRE-EXP',
        text: 'Wrote webOS.js, the standalone library giving partner apps webOS integration outside Enyo, still documented as compatible by LG’s webOSTV.js SDK, and published generator-enyo, a Yeoman generator for scaffolding Enyo apps.'
      }
    ]
  },
  {
    id: 'CC',
    name: 'Canuck Coding',
    start: 2009,
    end: 2013,
    rail: 'Software Developer (self-employed)',
    employer: 'Canuck Coding',
    descriptor: 'Ran a webOS homebrew development practice while finishing my CS degree.',
    bullets: [
      {
        id: 'PRE-1',
        text: 'Released WebOS Quick Install, the desktop webOS homebrew installer, on a reverse-engineered Java implementation of Palm’s novacom USB protocol, and published 18 apps including the Internalz file manager.'
      }
    ],
    link: {
      label: 'WebOS Quick Install on GitHub',
      href: 'https://github.com/JayCanuck/webos-quick-install'
    }
  }
];
