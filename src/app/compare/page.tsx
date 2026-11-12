import type { Metadata } from "next";
import Link from "next/link";
import { PRESET_EDITORIAL } from "@/content/presets";
import { AdSlot } from "@/components/ads/AdSlot";
import { WORKLOAD_PRESETS } from "@/lib/pricing/presets";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

export const metadata: Metadata = {
  title: "LLM Workload Cost Comparisons & Benchmarks 2026",
  description:
    "Compare production LLM API costs across RAG Q&A, code generation, document summarization, multi-turn support agents, and structured JSON extraction. Verified prompt caching and Batch API modeling.",
  alternates: {
    canonical: "/compare/",
  },
  openGraph: {
    title: "LLM Workload Cost Comparisons & Benchmarks 2026",
    description:
      "Explore workload-first cost models and provider comparisons for RAG, coding agents, summarization, support bots, and batch extraction.",
    url: `${SITE_URL}/compare/`,
  },
};

export default function CompareDirectoryPage() {
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
        name: "Workload Comparisons",
        item: `${SITE_URL}/compare/`,
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
        / <span className="font-semibold text-slate-800">Workload Comparisons</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 font-semibold text-white">
            5 Standard Workload Benchmarks
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-mono text-slate-600">
            Real-World Token Profiles
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Workload-First LLM Cost Comparisons
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Synthetic token calculators lie because they ignore prefix caching,
          conversation accumulation, and turnaround SLAs. Compare real-world
          monthly API bills across 5 representative production workloads.
        </p>
      </header>

      {/* Preset Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {WORKLOAD_PRESETS.map((preset) => {
          const editorial = PRESET_EDITORIAL[preset.id];

          return (
            <article
              key={preset.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                    {preset.shortLabel}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {preset.requestsPerDay.toLocaleString("en-US")} req/day
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 hover:text-emerald-700">
                    <Link href={`/compare/${preset.slug}/`}>
                      {preset.name}
                    </Link>
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {editorial ? editorial.summary : preset.description}
                  </p>
                </div>

                {/* Token Specs */}
                <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Cacheable Prefix:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {preset.prefixTokens.toLocaleString("en-US")} tokens
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Dynamic Input:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {preset.dynamicInputTokens.toLocaleString("en-US")} tokens
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Output Length:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {preset.outputTokens.toLocaleString("en-US")} tokens
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cache Hit Rate:</span>
                    <span className="font-semibold text-emerald-700">
                      {Math.round(preset.cacheHitRate * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Batch Mode:</span>
                    <span className="font-semibold text-slate-800">
                      {preset.useBatch ? "50% Discount (ON)" : "Off (Interactive)"}
                    </span>
                  </div>
                  {preset.turnsPerSession > 1 && (
                    <div className="flex justify-between text-indigo-700 font-semibold">
                      <span>Multi-Turn Loop:</span>
                      <span>{preset.turnsPerSession} turns / session</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <Link
                  href={`/compare/${preset.slug}/`}
                  className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  Full Cost Breakdown →
                </Link>
                <Link
                  href={`/?preset=${preset.slug}`}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                >
                  Load in Calc
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <AdSlot slotId="compare-directory-bottom" />
    </div>
  );
}
