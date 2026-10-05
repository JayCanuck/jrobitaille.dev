// Selected work: five proof-linked cards, all on the home page (D11). Blurbs are resume-data.js
// sentences; the personal-work card quotes the two repos' own public descriptions.
import type { Project } from '@/content/schema';

export const projects: Project[] = [
  {
    slug: 'retailverse-web',
    title: 'RetailVerse Web',
    era: '2025 to 2026',
    blurb:
      'Architected and authored the 3D product viewer, an embeddable React plugin built for Google model-viewer with an iframe-based distribution, launched Sept 2025 on LG.com with 40 appliances and counting.',
    link: {
      label: 'LG press release',
      href: 'https://www.lg.com/us/newsroom/home-appliance/lg-electronics-unveils-retailverse-tranforming-e-commerce-with-immersive-ai-enabled-3d-product-experiences'
    },
    secondaryLink: {
      label: 'Live viewer example (washer)',
      href: 'https://web.retailverse3d.com/?model=WM4000HBA&region=US&language=en&analytics=false'
    }
  },
  {
    slug: 'enact-cli',
    title: '@enact/cli',
    era: '2017 to 2020',
    blurb:
      'Created @enact/cli, the Enact framework’s official SDK tool for app developers, and owned it for four years, covering project templates and the webpack, Babel and Jest build configurations, still in production a decade later.',
    link: { label: 'GitHub', href: 'https://github.com/enactjs/cli' },
    secondaryLink: { label: 'npm', href: 'https://www.npmjs.com/package/@enact/cli' }
  },
  {
    slug: 'svl-simulator',
    title: 'SVL Simulator cloud platform',
    era: '2020 to 2022',
    blurb:
      'Drove the full-stack implementation of sharing on the simulator’s cloud platform, including private asset and simulation sharing, shipped in the public 2021.1 release.',
    link: { label: 'GitHub', href: 'https://github.com/lgsvl/svlsimulator.com' }
  },
  {
    slug: 'webos-homebrew',
    title: 'webOS homebrew',
    era: '2009 to 2015',
    blurb:
      'Released WebOS Quick Install, the desktop webOS homebrew installer, on a reverse-engineered Java implementation of Palm’s novacom USB protocol, and published 18 apps including the Internalz file manager. Wrote webOS.js, the standalone library giving partner apps webOS integration outside Enyo, still documented as compatible by LG’s webOSTV.js SDK.',
    link: { label: 'GitHub', href: 'https://github.com/JayCanuck/webos-quick-install' },
    secondaryLink: {
      label: 'LG webOSTV.js docs',
      href: 'https://webostv.developer.lge.com/develop/references/webostvjs-webos'
    }
  },
  {
    slug: 'gamelist-utils-muos',
    title: 'gamelist-utils and muos.js',
    era: '2021 to present',
    blurb:
      'gamelist-utils, a toolbox for EmulationStation gamelist.xml romsets, and muos.js, JavaScript definitions and helper functions for muOS.',
    link: { label: 'GitHub', href: 'https://github.com/JayCanuck/gamelist-utils' },
    secondaryLink: { label: 'npm', href: 'https://www.npmjs.com/package/gamelist-utils' }
  }
];
