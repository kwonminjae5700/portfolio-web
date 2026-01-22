import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.kwon5700.kr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/register", "/profile", "/write", "/edit/", "/categories"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
