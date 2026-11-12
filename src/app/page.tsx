import Link from "next/link";
import rawRegistry from "@/data/models.json";
import { AdSlot } from "@/components/ads/AdSlot";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { DataProvenanceBar } from "@/components/layout/DataProvenanceBar";
import type { PricingRegistry } from "@/lib/pricing/schema";

const registry = rawRegistry as unknown as PricingRegistry;
const providerCount = new Set(registry.models.map((m) => m.provider)).size;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

export default function HomePage() {
  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LLM Cost Intelligence",
    url: `${SITE_URL}/`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (Browser)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Workload-first LLM API pricing calculator modeling prompt caching writes & reads, Batch API stacking, long-context cliffs, and multi-turn conversation scaling locally in browser memory.",
  };

  const featuredModels = registry.models.filter((m) => m.featuredDetailPage);

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      {/* Hero Header & Provenance Bar */}
      <section className="no-print space-y-4">
        <DataProvenanceBar
          modelCount={registry.models.length}
          providerCount={providerCount}
          registryUpdatedAt={registry.registryUpdatedAt}
        />

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl font-sans">
            LLM API Cost &amp; FinOps Intelligence
          </h1>
          <p className="max-w-4xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            Workload-first cost simulation across OpenAI, Anthropic, Google Gemini,
            DeepSeek, Mistral, Groq, Together AI, and Amazon Bedrock. Accurately
            models{" "}
            <strong className="text-slate-900 dark:text-white">
              prompt cache break-even rates, 50% Batch API stacking
            </strong>
            ,{" "}
            <strong className="text-slate-900 dark:text-white">
              long-context cliffs
            </strong>
            , and{" "}
            <strong className="text-slate-900 dark:text-white">
              multi-turn agent conversation growth
            </strong>
            —100% locally in browser memory.
          </p>
        </div>
      </section>

      {/* Live Split-Screen Calculator */}
      <CalculatorShell
        models={registry.models}
        registryUpdatedAt={registry.registryUpdatedAt}
        initialPresetId="rag-qa"
      />

      {/* Institutional Explanatory Grid */}
      <section className="no-print grid gap-6 border-t border-slate-200 dark:border-white/10 pt-10 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-6 shadow-xs transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Why Workload-First Beats Flat Rate Tables
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Static $/1M token rate cards ignore silent 512–4,096 token cache
            minimums, Anthropic vs. OpenAI write surcharges, Together AI&apos;s 0%
            batch chat discount, and Gemini&apos;s model-specific batch-caching
            exceptions.
          </p>
          <Link
            href="/methodology/"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Read exact pricing formulas</span>
            <span>→</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-6 shadow-xs transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Deep-Dive Workload Benchmarks
          </h2>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <Link
                href="/compare/rag-qa/"
                className="font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
              >
                RAG Q&amp;A Cost Breakdown →
              </Link>
            </li>
            <li>
              <Link
                href="/compare/code-generation/"
                className="font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
              >
                Code Generation &amp; AI Agents →
              </Link>
            </li>
            <li>
              <Link
                href="/compare/document-summarization/"
                className="font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
              >
                Document Summarization &amp; Batch →
              </Link>
            </li>
            <li>
              <Link
                href="/compare/support-agent/"
                className="font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
              >
                Multi-Turn Support Agent Growth →
              </Link>
            </li>
            <li>
              <Link
                href="/compare/extraction/"
                className="font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
              >
                High-Volume JSON ETL Extraction →
              </Link>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-6 shadow-xs transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Featured Rate Card Deep Dives
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {featuredModels.map((m) => (
              <Link
                key={m.id}
                href={`/models/${m.slug}/`}
                className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {m.displayName}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AdSense editorial slot (kept gated off via NEXT_PUBLIC_ENABLE_ADSENSE=false) */}
      <AdSlot slotId="home-calculator-bottom" />
    </div>
  );
}
