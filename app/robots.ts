import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Staging/preview (stg.foodpharmer.health, *.vercel.app) must not be
  // crawled — it exposes Draft content and duplicates prod pages.
  if (process.env.VERCEL_ENV !== "production") {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login", "/auth"],
      },
    ],
    sitemap: "https://foodpharmer.health/sitemap.xml",
  };
}
