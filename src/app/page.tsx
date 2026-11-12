import Link from "next/link";
import rawRegistry from "@/data/models.json";
import { AdSlot } from "@/components/ads/AdSlot";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import type { PricingRegistry } from "@/lib/pricing/schema";

const registry = rawRegistry as unknown as PricingRegistry;

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

      <section className="no-print space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 font-semibold text-emerald-400">
            20 Verified Models · 8 Providers
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-medium text-slate-600">
            Pricing Verified {registry.registryUpdatedAt}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Workload-First LLM API Cost Calculator
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Compare monthly production costs across OpenAI, Anthropic, Google
          Gemini, DeepSeek, Mistral, Groq, Together AI, and Amazon Bedrock.
          Models real-world{" "}
          <strong>cache writes &amp; reads, Batch API stacking rules</strong>,{" "}
          <strong>long-context price cliffs</strong>, and{" "}
          <strong>multi-turn agent growth</strong>—100% locally in your browser.
        </p>
      </section>

      <CalculatorShell
        models={registry.models}
        registryUpdatedAt={registry.registryUpdatedAt}
        initialPresetId="rag-qa"
      />

      <section className="no-print grid gap-6 border-t border-slate-200 pt-10 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">
            Why Workload-First Beats Flat Rate Tables
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Static $/1M token tables miss silent 512–4,096 token cache minimums,
            Anthropic vs. OpenAI write multipliers, Together AI&apos;s 0% chat
            batch discount, and Gemini&apos;s model-specific batch-caching
            exceptions.
          </p>
          <Link
            href="/methodology/"
            className="mt-3 inline-block text-xs font-semibold text-emerald-700 hover:underline"
          >
            Read exact pricing formulas →
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">
            Deep-Dive Workload Benchmarks
          </h2>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
            <li>
              <Link
                href="/compare/rag-qa/"
                className="font-medium text-slate-800 hover:text-emerald-700 hover:underline"
              >
                RAG Q&amp;A Cost Breakdown →
              </Link>
            </li>
            <li>
              <Link
                href="/compare/code-generation/"
                className="font-medium text-slate-800 hover:text-emerald-700 hover:underline"
              >
                Code Generation &amp; Repo Caching →
              </Link>
            </li>
            <li>
              <Link
                href="/compare/support-agent/"
                className="font-medium text-slate-800 hover:text-emerald-700 hover:underline"
              >
                Multi-Turn Support Agent Scaling →
              </Link>
            </li>
            <li>
              <Link
                href="/compare/document-summarization/"
                className="font-medium text-slate-800 hover:text-emerald-700 hover:underline"
              >
                Long-Context Document Summarization →
              </Link>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">
            Featured Model Rate Cards
          </h2>
          <ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs text-slate-600">
            {featuredModels.slice(0, 6).map((m) => (
              <li key={m.id}>
                <Link
                  href={`/models/${m.slug}/`}
                  className="font-medium text-slate-800 hover:text-emerald-700 hover:underline"
                >
                  {m.displayName} ({m.hosting.endpointProvider}) →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AdSlot slotId="home-bottom-editorial" />
    </div>
  );
}
