import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site';

// Metadata routes must opt into static rendering under output: "export".
export const dynamic = 'force-static';

// One entry per static route; /projects joins in Phase 2.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteConfig.url}/`, changeFrequency: 'monthly', priority: 1 }];
}
