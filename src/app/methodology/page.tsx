import type { Metadata } from "next";
import Link from "next/link";
import rawRegistry from "@/data/models.json";
import { AdSlot } from "@/components/ads/AdSlot";
import type { PricingRegistry } from "@/lib/pricing/schema";

const registry = rawRegistry as unknown as PricingRegistry;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

export const metadata: Metadata = {
  title: "Methodology, Formulas & Official Source Citations",
  description:
    "Exact mathematical formulas for prompt caching amortization, 3-state batch stacking, long-context cliffs, multi-turn scaling, and official provider documentation sources.",
  alternates: {
    canonical: "/methodology/",
  },
};

export default function MethodologyPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "LLM Cost Intelligence Methodology & Pricing Formulas",
    url: `${SITE_URL}/methodology/`,
    dateModified: registry.registryUpdatedAt,
    author: {
      "@type": "Organization",
      name: "LLM Cost Intelligence",
    },
  };

  return (
    <article className="mx-auto max-w-4xl space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
          Transparent Engineering Methodology
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          How Costs, Caching &amp; Batch Rules Are Calculated
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Every calculation runs deterministically in browser memory against
          versioned USD list rates verified directly from official provider
          documentation on{" "}
          <span className="font-mono font-semibold text-slate-900">
            {registry.registryUpdatedAt}
          </span>
          .
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          1. Context Tier &amp; Long-Context Cliff Resolution
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          Providers such as Google Gemini 1.5 Pro and 1.5 Flash (<code>&gt;128K</code> prompt tokens)
          apply step-function rate jumps to the <strong>entire request</strong> once
          input exceeds the threshold (e.g. Gemini 1.5 Pro input rates double from $1.25 to $2.50/1M).
          Our engine resolves{" "}
          <code>totalTurnInput = prefixTokens + dynamicInputTokens</code>{" "}
          against sorted <code>pricingTiers</code> and flags{" "}
          <code>EXCEEDS_CONTEXT_WINDOW</code> if input exceeds{" "}
          <code>maxInputTokens ?? contextWindowTokens</code>.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          2. Prompt Caching Amortization (Zero Double-Counting)
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          Instead of charging an arbitrary one-request penalty, cold cache
          writes are amortized across daily active hours{" "}
          <code>H_active</code> (16 hrs/day interactive, 24 hrs/day batch):
        </p>
        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100">
{`writeReqs = cacheActive ? min(requestsPerDay, cacheWritesPerHour * H_active) : 0
missReqs  = max(0, requestsPerDay * (1 - cacheHitRate) - writeReqs)
hitReqs   = max(0, requestsPerDay - writeReqs - missReqs)

dailyPrefixCost =
  (hitReqs  * prefixM * r_read) +
  (missReqs * prefixM * r_in) +
  (writeReqs * prefixM * r_write)`}
        </pre>
        <p className="text-xs leading-relaxed text-slate-600">
          If <code>prefixTokens &lt; minCacheableTokens</code> (e.g., 1,024 on
          Claude 3.5 Sonnet / 2,048 on Haiku, 1,024 on OpenAI GPT-4o, 64 on
          DeepSeek, 32,768 on Google Gemini), caching is automatically
          disabled to reflect silent fallback to standard input billing.
          Explicit hourly cache storage (e.g., Gemini{" "}
          <code>storagePer1MPerHour</code>) is added un-discounted across{" "}
          <code>H_active</code>.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          3. Three-State Batch + Caching Rules
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>
            <strong>Stacks with Batch Discount:</strong> Anthropic Message
            Batches, OpenAI Batch API, and Google Gemini Batch API
            discount both standard and cached token reads (typically 50% off).
          </li>
          <li>
            <strong>Batch Without Caching Stacking:</strong> Mistral Batch API
            offers 50% discount on standard rates, but prompt caching does not
            compound inside batch jobs.
          </li>
          <li>
            <strong>Disallowed / 0% Discount:</strong> Groq &amp; Amazon Bedrock
            disable prompt caching in Batch mode; Together AI applies 0% batch
            discount to serverless chat models; DeepSeek has no Batch API
            (offering a 50% Off-Peak UTC window from 16:30 to 00:30 UTC instead).
          </li>
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          4. Multi-Turn Quadratic History Scaling
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          For multi-turn sessions of <code>K</code> turns (such as the{" "}
          <code>support-agent</code> preset with <code>K = 5</code>), turn{" "}
          <code>t</code> re-sends all prior user prompts and assistant replies.
          The engine evaluates each turn <code>t = 1..K</code> individually via:
        </p>
        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100">
{`totalInput(t) = prefixTokens + turn1UserTokens + (t - 1) * (followUpUserTokens + outputTokens)`}
        </pre>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          5. Verified Model Source Citations ({registry.models.length} Entries)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase">
                <th className="py-2 pr-3">Model</th>
                <th className="py-2 pr-3">Host</th>
                <th className="py-2 pr-3">Verified</th>
                <th className="py-2">Official Documentation URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registry.models.map((m) => (
                <tr key={m.id}>
                  <td className="py-2 pr-3 font-semibold text-slate-900">
                    {m.featuredDetailPage ? (
                      <Link
                        href={`/models/${m.slug}/`}
                        className="underline decoration-slate-300 hover:text-emerald-700"
                      >
                        {m.displayName}
                      </Link>
                    ) : (
                      m.displayName
                    )}
                  </td>
                  <td className="py-2 pr-3 text-slate-600">
                    {m.hosting.endpointProvider}
                  </td>
                  <td className="py-2 pr-3 font-mono text-slate-600">
                    {m.lastVerifiedDate}
                  </td>
                  <td className="py-2">
                    <a
                      href={m.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-emerald-700 underline hover:text-emerald-900"
                    >
                      {m.officialSourceUrl}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdSlot slotId="methodology-bottom" />
    </article>
  );
}
