import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import rawRegistry from "@/data/models.json";
import { AdSlot } from "@/components/ads/AdSlot";
import type { PricingModel, PricingRegistry } from "@/lib/pricing/schema";

export const dynamicParams = false;

const registry = rawRegistry as unknown as PricingRegistry;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

function getFeaturedModels(): PricingModel[] {
  const featured = registry.models.filter((m) => m.featuredDetailPage);
  return featured.length > 0 ? featured : registry.models.slice(0, 10);
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getFeaturedModels().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = getFeaturedModels().find((m) => m.slug === slug);
  if (!model) {
    return { title: "Model Pricing" };
  }
  return {
    title: `${model.displayName} (${model.hosting.endpointProvider}) API Pricing & Caching Rules`,
    description: `Verified ${model.displayName} API token pricing on ${model.hosting.endpointProvider}: standard rates, prompt caching reads/writes, Batch API discounts, and context tiers.`,
    alternates: {
      canonical: `/models/${model.slug}/`,
    },
  };
}

function fmtRate(v: number | null | undefined): string {
  if (v === null || v === undefined) return "N/A";
  return `$${v.toFixed(v < 0.05 && v > 0 ? 4 : 3).replace(/0+$/, "").replace(/\.$/, ".00")}`;
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = getFeaturedModels().find((m) => m.slug === slug);
  if (!model) {
    notFound();
  }

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
        name: model.displayName,
        item: `${SITE_URL}/models/${model.slug}/`,
      },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Calculator
        </Link>{" "}
        /{" "}
        <span className="font-semibold text-slate-800">
          {model.displayName}
        </span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 font-semibold text-white">
            {model.hosting.endpointProvider}
          </span>
          {model.openWeight && (
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 font-semibold text-indigo-800">
              Open-Weight
            </span>
          )}
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-mono text-slate-600">
            Verified {model.lastVerifiedDate}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {model.displayName} API Pricing &amp; Cost Rules
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          API Model ID: <code className="font-mono">{model.apiModelId}</code> ·
          Context Window:{" "}
          <strong>
            {model.contextWindowTokens.toLocaleString("en-US")} tokens
          </strong>{" "}
          {model.maxInputTokens
            ? `(Max Input: ${model.maxInputTokens.toLocaleString("en-US")})`
            : ""}{" "}
          · Max Output:{" "}
          <strong>{model.maxOutputTokens.toLocaleString("en-US")} tokens</strong>
        </p>
      </header>

      {model.promotionalExpiryDate && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
          <strong>Promotional Rate Alert:</strong> Current pricing expires on{" "}
          <span className="font-mono font-bold">
            {model.promotionalExpiryDate}
          </span>
          . Confirm post-promotional rates before locking long-term production
          budgets.
        </div>
      )}

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">
          Context Tiers &amp; Token Rate Card (USD per 1M Tokens)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase">
                <th className="py-2 pr-3">Tier</th>
                <th className="py-2 pr-3 text-right">Std Input</th>
                <th className="py-2 pr-3 text-right">Std Output</th>
                <th className="py-2 pr-3 text-right">Cache Read</th>
                <th className="py-2 pr-3 text-right">Write (Short)</th>
                <th className="py-2 text-right">Write (Long)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {model.pricingTiers.map((tier, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 pr-3 font-sans font-semibold text-slate-900">
                    {tier.label}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {fmtRate(tier.inputPer1M)}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {fmtRate(tier.outputPer1M)}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-emerald-700">
                    {fmtRate(tier.cachedInputReadPer1M)}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {fmtRate(tier.cacheWrite5mPer1M ?? tier.cacheWrite30mPer1M)}
                  </td>
                  <td className="py-2.5 text-right">
                    {fmtRate(tier.cacheWrite1hPer1M ?? tier.cacheWrite12hPer1M)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 text-xs leading-relaxed text-slate-700">
          <h2 className="text-base font-bold text-slate-900">
            Prompt Caching Rules
          </h2>
          <p>
            <strong>Supported:</strong>{" "}
            {model.promptCaching.supported ? "Yes" : "No"} (
            {model.promptCaching.mode})
          </p>
          <p>
            <strong>Minimum Cacheable Prefix:</strong>{" "}
            {model.promptCaching.minCacheableTokens != null
              ? `${model.promptCaching.minCacheableTokens.toLocaleString("en-US")} tokens`
              : "None / Automatic"}
          </p>
          <p>
            <strong>Hourly Cache Storage:</strong>{" "}
            {model.promptCaching.storagePer1MPerHour != null
              ? `$${model.promptCaching.storagePer1MPerHour.toFixed(2)} / 1M tokens / hr`
              : "$0"}
          </p>
          <p className="pt-1 text-slate-600">{model.promptCaching.notes}</p>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 text-xs leading-relaxed text-slate-700">
          <h2 className="text-base font-bold text-slate-900">
            Batch API &amp; Hosting Notes
          </h2>
          <p>
            <strong>Batch Supported:</strong>{" "}
            {model.batchApi.supported
              ? `Yes (${model.batchApi.discountPercent ?? 0}% discount · ${model.batchApi.turnaroundWindow ?? "Async"})`
              : "No"}
          </p>
          <p>
            <strong>Caching in Batch:</strong>{" "}
            {!model.batchApi.cachingAllowedInBatch
              ? "Disabled in Batch mode"
              : model.batchApi.batchDiscountAppliesToCache
                ? "Allowed + Batch discount stacks onto cache reads"
                : "Allowed at standard cache rates (no batch discount on cache)"}
          </p>
          <p className="pt-1 text-slate-600">{model.batchApi.notes}</p>
          <p className="pt-1 text-slate-600">{model.hosting.hostingNotes}</p>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs">
        <a
          href={model.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-700 underline hover:text-emerald-900"
        >
          Verify live rate card on official documentation ↗
        </a>
        <Link
          href="/"
          className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
        >
          Simulate {model.displayName} in Calculator →
        </Link>
      </div>

      <AdSlot slotId={`model-${model.slug}-bottom`} />
    </article>
  );
}
