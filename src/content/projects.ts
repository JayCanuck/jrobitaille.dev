// Selected work: six proof-linked cards, all on the home page (D11). Each card renders a one-line
// blurb sized for the page (D13); the longer description is kept for the agent-facing data.
// Approved resume content. Do not polish.
import { images } from '@/content/images';
import type { Project } from '@/content/schema';

export const projects: Project[] = [
  {
    slug: 'retailverse-web',
    title: 'RetailVerse Web',
    era: '2025 to 2026',
    blurb:
      'LG’s interactive 3D product viewer. I architected the embeddable React plugin behind it.',
    description:
      'LG’s interactive 3D product viewer, launched on LG.com in Sept 2025. I architected the embeddable React plugin behind it, starting from a solo 3-week prototype.',
    image: images['retailverse-web'],
    link: {
      label: 'Press release',
      href: 'https://www.lg.com/us/newsroom/home-appliance/lg-electronics-unveils-retailverse-tranforming-e-commerce-with-immersive-ai-enabled-3d-product-experiences'
    },
    secondaryLink: {
      label: 'Live demo',
      href: 'https://web.retailverse3d.com/?model=WM4000HBA&region=US&language=en&analytics=false'
    }
  },
  {
    slug: 'enact-cli',
    title: 'Enact framework',
    era: '2017 to 2020',
    blurb:
      'LG’s open-source React framework for webOS TVs. I created its official CLI and owned it four years.',
    description:
      'The official build tool for Enact, LG’s React framework for webOS TVs. I created it in 2017 and owned it for four years. Still shipping releases.',
    image: images['enact-cli'],
    link: { label: 'GitHub', href: 'https://github.com/enactjs' },
    secondaryLink: { label: '@enact/cli', href: 'https://github.com/enactjs/cli' }
  },
  {
    slug: 'enyo',
    title: 'Enyo framework',
    era: '2013 to 2017',
    blurb: 'LG’s earlier webOS app framework. I shipped its final releases and wrote webOS.js.',
    description:
      'LG’s earlier open-source JavaScript framework for webOS TVs and the predecessor to Enact. I shipped its final releases across eleven public repos through 2016 and wrote webOS.js, the standalone library giving partner apps webOS integration outside Enyo.',
    image: images.enyo,
    link: { label: 'GitHub', href: 'https://github.com/enyojs' },
    secondaryLink: { label: 'enyo-webos', href: 'https://github.com/enyojs/enyo-webos' }
  },
  {
    slug: 'svl-simulator',
    title: 'SVL Simulator',
    era: '2020 to 2022',
    blurb:
      'LG’s open-source autonomous-driving simulator. I built its cloud platform and public site.',
    description:
      'The web platform and public site for LG’s open-source autonomous-driving simulator. I shipped full-stack features there, from sharing to the API token system, and wrote its marketing site.',
    image: images['svl-simulator'],
    link: { label: 'GitHub', href: 'https://github.com/lgsvl' },
    secondaryLink: { label: 'Website source', href: 'https://github.com/lgsvl/svlsimulator.com' }
  },
  {
    slug: 'webos-homebrew',
    title: 'webOS homebrew',
    era: '2009 to 2015',
    blurb:
      '18 webOS apps and WebOS Quick Install, the sideloading tool built on a reverse-engineered novacom.',
    description:
      'Where I started: 18 webOS apps and WebOS Quick Install, the sideloading tool built on a reverse-engineered implementation of Palm’s novacom protocol. Later, webOS.js for LG.',
    image: images['webos-homebrew'],
    link: { label: 'GitHub', href: 'https://github.com/JayCanuck/legacy-webos' },
    secondaryLink: {
      label: 'WebOS Quick Install',
      href: 'https://github.com/JayCanuck/webos-quick-install'
    }
  },
  {
    slug: 'gamelist-utils-muos',
    title: 'gamelist-utils and muos.js',
    era: '2021 to present',
    blurb:
      'TypeScript tooling for retro handhelds: EmulationStation romset toolbox and typed muOS definitions.',
    description:
      'What I build when nobody assigns it: a TypeScript toolbox for EmulationStation romsets, and typed definitions for muOS. Both on npm, with tests and CI.',
    image: images['gamelist-utils-muos'],
    link: { label: 'GitHub', href: 'https://github.com/JayCanuck/gamelist-utils' },
    secondaryLink: { label: 'npm', href: 'https://www.npmjs.com/package/gamelist-utils' }
  }
];
