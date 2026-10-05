import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

// Metadata routes must opt into static rendering under output: "export".
export const dynamic = "force-static";

// Permissive robots.txt, AI crawlers included: the site wants to be found (spec §6).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
