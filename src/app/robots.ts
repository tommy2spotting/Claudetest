import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Fase 1: sito non pubblico, niente indicizzazione. Si apre in Fase 2.
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
