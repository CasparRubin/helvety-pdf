import type { MetadataRoute } from "next";

/** Generate the sitemap for the PDF app. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://pdf.helvety.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
