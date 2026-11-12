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

      <nav aria-label="Breadcrumb" className="no-print text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          Calculator
        </Link>{" "}
        / <span className="font-semibold text-slate-800 dark:text-slate-200">Workload Comparisons</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
            5 Standard Workload Benchmarks
          </span>
          <span className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] px-2.5 py-0.5 font-mono text-slate-600 dark:text-slate-300">
            Real-World Token Profiles
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-sans">
          Workload-First LLM Cost Comparisons
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
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
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-6 shadow-xs transition-all hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {preset.shortLabel}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {preset.requestsPerDay.toLocaleString("en-US")} req/day
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    <Link href={`/compare/${preset.slug}/`}>
                      {preset.name}
                    </Link>
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                    {editorial ? editorial.summary : preset.description}
                  </p>
                </div>

                {/* Token Specs */}
                <div className="space-y-2 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-[#161F30] p-3 text-xs font-mono">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-sans">Cacheable Prefix:</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {preset.prefixTokens.toLocaleString("en-US")} tok
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-sans">Dynamic Input:</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {preset.dynamicInputTokens.toLocaleString("en-US")} tok
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-sans">Output Length:</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                      {preset.outputTokens.toLocaleString("en-US")} tok
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-sans">Cache Hit Rate:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {Math.round(preset.cacheHitRate * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-sans">Batch Mode:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {preset.useBatch ? "50% Discount (ON)" : "Off (Interactive)"}
                    </span>
                  </div>
                  {preset.turnsPerSession > 1 && (
                    <div className="flex justify-between text-violet-600 dark:text-violet-400 font-semibold">
                      <span className="font-sans">Multi-Turn Loop:</span>
                      <span>{preset.turnsPerSession} turns / session</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4 text-xs">
                <Link
                  href={`/compare/${preset.slug}/`}
                  className="font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  Full Cost Breakdown →
                </Link>
                <Link
                  href={`/?preset=${preset.slug}`}
                  className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
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
