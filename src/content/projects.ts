// Selected work: five proof-linked cards, all on the home page (D11). Blurbs describe the project as
// a thing, first person like the About; approved 2026-10-04 (D12). Do not polish.
import type { Project } from '@/content/schema';

export const projects: Project[] = [
  {
    slug: 'retailverse-web',
    title: 'RetailVerse Web',
    era: '2025 to 2026',
    blurb:
      'LG’s interactive 3D product viewer, launched on LG.com in Sept 2025. I architected the embeddable React plugin behind it, starting from a solo 3-week prototype.',
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
      'The official build tool for Enact, LG’s React framework for webOS TVs. I created it in 2017 and owned it for four years. Still shipping releases.',
    link: { label: 'GitHub', href: 'https://github.com/enactjs/cli' },
    secondaryLink: { label: 'npm', href: 'https://www.npmjs.com/package/@enact/cli' }
  },
  {
    slug: 'svl-simulator',
    title: 'SVL Simulator cloud platform',
    era: '2020 to 2022',
    blurb:
      'The web platform and public site for LG’s open-source autonomous-driving simulator. I shipped full-stack features there, from sharing to the API token system, and wrote its marketing site.',
    link: { label: 'GitHub', href: 'https://github.com/lgsvl/svlsimulator.com' }
  },
  {
    slug: 'webos-homebrew',
    title: 'webOS homebrew',
    era: '2009 to 2015',
    blurb:
      'Where I started: 18 webOS apps and WebOS Quick Install, the sideloading tool built on a reverse-engineered implementation of Palm’s novacom protocol. Later, webOS.js for LG.',
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
      'What I build when nobody assigns it: a TypeScript toolbox for EmulationStation romsets, and typed definitions for muOS. Both on npm, with tests and CI.',
    link: { label: 'GitHub', href: 'https://github.com/JayCanuck/gamelist-utils' },
    secondaryLink: { label: 'npm', href: 'https://www.npmjs.com/package/gamelist-utils' }
  }
];
