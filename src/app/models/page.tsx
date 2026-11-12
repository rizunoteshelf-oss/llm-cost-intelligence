import type { Metadata } from "next";
import Link from "next/link";
import rawRegistry from "@/data/models.json";
import { AdSlot } from "@/components/ads/AdSlot";
import { ModelsDirectory } from "@/components/models/ModelsDirectory";
import type { PricingRegistry } from "@/lib/pricing/schema";

const registry = rawRegistry as unknown as PricingRegistry;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

export const metadata: Metadata = {
  title: "LLM Model Directory & API Pricing Rate Cards 2026",
  description:
    "Explore verified API token pricing, prompt caching read/write rates, and Batch API discounts across 20 production models including Claude 3.5 Sonnet, GPT-4o, DeepSeek V3, and Gemini 2.0.",
  alternates: {
    canonical: "/models/",
  },
  openGraph: {
    title: "LLM Model Directory & API Pricing Rate Cards 2026",
    description:
      "Explore verified API token pricing, prompt caching read/write rates, and Batch API discounts across 20 production models.",
    url: `${SITE_URL}/models/`,
  },
};

export default function ModelsDirectoryPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Calculator",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Models Directory",
        item: `${SITE_URL}/models/`,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="no-print text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Calculator
        </Link>{" "}
        / <span className="font-semibold text-slate-800">Models Directory</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 font-semibold text-emerald-400">
            {registry.models.length} Production Models Verified
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-mono text-slate-600">
            Updated {registry.registryUpdatedAt}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          LLM Model Pricing Directory
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Browse exact production rate cards, prompt caching break-even
          thresholds, context windows, and Batch API discounts for all supported
          frontier models. Click any model to view its granular cost rules or
          simulate your workload.
        </p>
      </header>

      <ModelsDirectory models={registry.models} />

      <AdSlot slotId="models-directory-bottom" />
    </div>
  );
}
