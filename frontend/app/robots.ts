import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.tradetrackerpro.in";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/auth/login", "/auth/sign-up"],
      disallow: [
        "/api/",
        "/admin/",
        "/ai-report/",
        "/calendar/",
        "/consistency-calculator/",
        "/dashboard/",
        "/help/",
        "/market/",
        "/pl-calculator/",
        "/settings/",
        "/verification-pending/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
