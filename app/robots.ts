import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n/config";
import { getRobotsDisallowPaths } from "@/lib/seo/private-paths";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: getRobotsDisallowPaths(),
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
