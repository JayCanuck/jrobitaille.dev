import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/site';

// Metadata routes must opt into static rendering under output: "export".
export const dynamic = 'force-static';

// One entry per static route: home only (D11, no /projects).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl}/`, changeFrequency: 'monthly', priority: 1 }];
}
