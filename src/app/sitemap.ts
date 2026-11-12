import type { MetadataRoute } from "next";
import rawRegistry from "@/data/models.json";
import { GUIDES } from "@/content/guides";
import { WORKLOAD_PRESETS } from "@/lib/pricing/presets";
import type { PricingRegistry } from "@/lib/pricing/schema";

export const dynamic = "force-static";

const registry = rawRegistry as unknown as PricingRegistry;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date(registry.registryUpdatedAt);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/models/`,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/compare/`,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/methodology/`,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about/`,
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy/`,
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const compareRoutes: MetadataRoute.Sitemap = WORKLOAD_PRESETS.map((p) => ({
    url: `${SITE_URL}/compare/${p.slug}/`,
    lastModified: updated,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const featuredModels = registry.models.filter((m) => m.featuredDetailPage);
  const modelRoutes: MetadataRoute.Sitemap = featuredModels.map((m) => ({
    url: `${SITE_URL}/models/${m.slug}/`,
    lastModified: new Date(m.lastVerifiedDate),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}/`,
    lastModified: new Date(g.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...compareRoutes, ...modelRoutes, ...guideRoutes];
}
