// Content mirrors the current master resume and public profile text; update both together.
// Every bullet per era is kept for the agent-facing data (D12); the page renders only highlights.
// The employer's payroll entity, lab and city stay out (content.md). Descriptors for the earlier
// roles are the public profile text.
import type { EarlierRole, Employer } from '@/content/schema';

export const employer: Employer = {
  name: 'LG Electronics',
  dates: 'June 2015 to Sept 2026',
  years: '2015 to 2026',
  titles: [
    {
      title: 'Staff Software Engineer',
      rail: 'Staff Software Engineer',
      dates: 'Feb 2020 to Sept 2026',
      eras: [
        {
          id: 'RV',
          name: 'RetailVerse Web and Configurator',
          years: '2025 to 2026',
          desc: '3D e-commerce product experience on LG.com',
          line: 'RetailVerse Web and Configurator, LG’s 3D e-commerce product experience for LG.com and its content authoring tool, 2025 to 2026.',
          bullets: [
            'Architected and authored the 3D product viewer, an embeddable React plugin built for Google model-viewer with an iframe-based distribution, launched Sept 2025 on LG.com with 40 appliances and counting.',
            'Prototyped RetailVerse Web solo in under 3 weeks for the KBIS 2025 event, and its plugin architecture became the production viewer.',
            'Built out the Configurator web app with its interactive 3D editor, co-designing the data models and REST APIs, so marketers could author product hotspots, cameras and animations for web and in-store kiosks.',
            'Held review authority across the team’s 15 web projects, merging hundreds of teammates’ submissions against enforced formatting rules, and mentored a teammate new to React web development through paired sessions.',
            'Partnered with the department’s UX designer from Figma layout through to sprint demos, breaking down feature designs into engineering tasks and pushing back where technical limitations or web standards came into play.',
            'Hardened the viewer embed for third-party sites and added a zero-network offline bundle mode in collaboration with the syndication partner, so it ran unmodified across partner retailer pages.'
          ],
          highlights: [
            'Architected the embeddable React 3D viewer plugin behind RetailVerse Web, from solo KBIS 2025 prototype to LG.com launch.',
            'Built the Configurator’s 3D editor and co-designed its data models and APIs. Review authority across the team’s 15 web projects.'
          ],
          link: {
            label: 'LG press release',
            href: 'https://www.lg.com/us/newsroom/home-appliance/lg-electronics-unveils-retailverse-tranforming-e-commerce-with-immersive-ai-enabled-3d-product-experiences'
          }
        },
        {
          id: 'SM',
          name: '3D asset platform',
          years: '2022 to 2026',
          desc: 'Full-stack overhaul of LG’s internal 3D model catalogue and pipeline',
          line: '3D asset platform, an internal LG system that catalogued LG product 3D models and optimized them for use across kiosk clients, later the asset source behind RetailVerse, 2022 to 2026.',
          bullets: [
            'Engineered the platform’s diagnostic 3D model viewer using Three.js and React Three Fiber, released as a standalone library the graphics engineers used to validate pipeline output.',
            'Replaced the in-house 3D viewer library with Google model-viewer after weighing maintenance cost against an emerging standard, and helped unify the asset pipeline for glb output across client types.',
            'Rebuilt the platform’s web app on React and TypeScript piece by piece over two product generations as its sole frontend engineer, and contributed to its APIs and backend services.',
            'Automated 3D metadata and preview capture with a headless-Chrome service created and solely maintained for 3 years, invoked through Tekton tasks in the asset pipeline.'
          ],
          highlights: [
            'Rebuilt the platform’s web app on React and TypeScript as sole frontend engineer, with feature work across its NestJS APIs.',
            'Built the Three.js diagnostic model viewer, later replaced with Google model-viewer as the standard matured.'
          ]
        },
        {
          id: 'SW',
          name: 'SVL Simulator',
          years: '2020 to 2022',
          desc: 'Cloud platform for LG’s open-source driving simulator, 2.4k GitHub stars',
          line: 'SVL Simulator, the cloud platform and public site for LG’s autonomous-driving simulator, an open-source 2.4k-star GitHub project with a Tier IV cloud-simulation partnership, 2020 to 2022.',
          bullets: [
            'Drove the full-stack implementation of sharing on the simulator’s cloud platform, including private asset and simulation sharing, shipped in the public 2021.1 release.',
            'Implemented the platform’s API token system, from hashed scoped token authentication to the account settings UI, giving users programmatic access to the platform.'
          ],
          highlights: [
            'Drove full-stack sharing of private assets and simulations, shipped in the public 2021.1 release.',
            'Implemented the API token system, from hashed scoped tokens to the account settings UI.'
          ],
          link: { label: 'SVL Simulator on GitHub', href: 'https://github.com/lgsvl/simulator' }
        }
      ]
    },
    {
      title: 'Senior Software Engineer',
      rail: 'Senior Software Engineer',
      dates: 'Jan 2017 to Feb 2020',
      eras: [
        {
          id: 'SR',
          name: 'Enact framework',
          years: '2017 to 2020',
          desc: 'Open-source React framework for webOS, shipped on millions of LG TVs',
          line: 'Enact framework, Open-source React framework for webOS, shipped on millions of LG TVs worldwide, 2017 to 2020.',
          bullets: [
            'Created @enact/cli, the Enact framework’s official SDK tool for app developers, and owned it for four years, covering project templates and the webpack, Babel and Jest build configurations, still in production a decade later.',
            'Built and operated the release path for the Enact framework into webOS’s OpenEmbedded build system for five years, cutting every major framework release across nine public repos and six product lines.',
            'Accelerated the framework’s app startup path on webOS, prerendering apps to HTML at build time and capturing V8 heap snapshots, so TV apps reached first paint and interaction without parsing.',
            'Automated the team’s nightly builds, release process, docs and performance test runs on Jenkins, so versioned builds were shared and the team got results and failures in Slack.'
          ],
          highlights: [
            'Created @enact/cli, the framework’s official SDK tool, and owned it for four years. Still in production.',
            'Owned release engineering end to end, Jenkins nightlies through the OpenEmbedded path into webOS.'
          ],
          link: { label: 'Enact on GitHub', href: 'https://github.com/enactjs' }
        }
      ]
    },
    {
      title: 'Software Engineer',
      rail: 'Software Engineer',
      dates: 'June 2015 to Jan 2017',
      eras: [
        {
          id: 'SE',
          name: 'Enyo framework',
          years: '2015 to 2017',
          desc: 'Earlier webOS JavaScript framework and Enact’s predecessor',
          line: 'Enyo framework, LG’s earlier open-source JavaScript framework for webOS TVs and the predecessor to Enact, 2015 to 2017. Tooling, webOS integration and framework component updates.',
          bullets: [
            'Shipped final Enyo library releases across eleven public repos through 2016 and retired the enyo-dev webapp bundling tool once the team migrated to Enact.',
            'Designed the framework recipes and app bbclass for modular Enyo 2.6 on webOS’s Yocto build system, so developers declared a source and version and got device-ready packages with locked libraries.'
          ],
          highlights: [
            'Shipped Enyo’s final releases across eleven repos while the Enyo and Enact release trains ran in parallel.',
            'Designed the Yocto recipes and app bbclass that produced device-ready webOS packages.'
          ],
          link: { label: 'Enyo on GitHub', href: 'https://github.com/enyojs' }
        }
      ]
    }
  ]
};

export const earlier: EarlierRole[] = [
  {
    id: 'EXP',
    org: 'Experis IT',
    role: 'Software Engineer (contract at LG)',
    rail: 'Software Engineer (contract at LG)',
    dates: 'May 2013 to April 2015',
    years: '2013 to 2015',
    desc: 'Two-year remote contract with LG Silicon Valley Lab’s Enyo framework team, hired out of the webOS homebrew community.',
    bullets: [
      {
        text: 'Wrote webOS.js, the standalone library giving partner apps webOS integration outside Enyo, still documented as compatible by LG’s webOSTV.js SDK, and published generator-enyo, a Yeoman generator for scaffolding Enyo apps.',
        reference: 'https://webostv.developer.lge.com/develop/references/webostvjs-webos'
      }
    ],
    highlights: [
      'Wrote webOS.js, still documented as compatible by LG’s webOSTV.js SDK, and published generator-enyo.'
    ]
  },
  {
    id: 'CC',
    org: 'Canuck Coding',
    role: 'Founder, Winnipeg',
    rail: 'Software Developer (self-employed)',
    dates: 'Dec 2009 to May 2013',
    years: '2009 to 2013',
    desc: 'Ran a webOS homebrew development practice while finishing my CS degree.',
    bullets: [
      'Released WebOS Quick Install, the desktop webOS homebrew installer, on a reverse-engineered Java implementation of Palm’s novacom USB protocol, and published 18 apps including the Internalz file manager.'
    ],
    highlights: [
      'Released WebOS Quick Install on a reverse-engineered novacom implementation, and 18 webOS apps including Internalz.'
    ]
  }
];
