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
  return featured.length > 0 ? featured : registry.models;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getFeaturedModels().map((m) => ({ slug: m.slug }));
}

function fmtRate(v: number | null | undefined): string {
  if (v === null || v === undefined) return "N/A";
  if (v === 0) return "$0.00";
  const formatted = Number(v.toFixed(5)).toString();
  const [intPart, decPart] = formatted.split(".");
  if (!decPart) return `$${intPart}.00`;
  if (decPart.length === 1) return `$${intPart}.${decPart}0`;
  return `$${formatted}`;
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
  const tier = model.pricingTiers[0];
  const rateStr = tier
    ? `${fmtRate(tier.inputPer1M)} in / ${fmtRate(tier.outputPer1M)} out`
    : "";

  return {
    title: `${model.displayName} (${model.hosting.endpointProvider}) API Pricing 2026 - ${rateStr}`,
    description: `Verified ${model.displayName} API pricing on ${model.hosting.endpointProvider}: ${rateStr} per 1M tokens, prompt caching reads/writes, Batch API discounts, and context limits.`,
    alternates: {
      canonical: `/models/${model.slug}/`,
    },
    openGraph: {
      title: `${model.displayName} API Pricing & Prompt Caching Rules`,
      description: `Verified ${model.displayName} rate card: ${rateStr} per 1M tokens with prompt caching break-even analysis.`,
      url: `${SITE_URL}/models/${model.slug}/`,
    },
  };
}

interface ModelFaq {
  question: string;
  answer: string;
}

function getModelFaqs(model: PricingModel): ModelFaq[] {
  const primaryTier = model.pricingTiers[0];
  const inputRate = primaryTier?.inputPer1M ?? 0;
  const outputRate = primaryTier?.outputPer1M ?? 0;
  const cachedReadRate = primaryTier?.cachedInputReadPer1M;

  const faqs: ModelFaq[] = [];

  // FAQ 1: Prompt Caching comparison
  if (model.provider === "anthropic") {
    faqs.push({
      question: `Is ${model.displayName} prompt caching cheaper than OpenAI GPT-4o?`,
      answer: `Yes, for high-frequency workflows. Anthropic charges a 1.25x write surcharge (${fmtRate(inputRate * 1.25)}/1M for a 5-minute TTL) on cache creation, but offers a 90% discount on cache reads (${fmtRate(cachedReadRate ?? inputRate * 0.1)}/1M). In comparison, OpenAI GPT-4o has free automatic cache writes ($2.50/1M) but only a 50% read discount ($1.25/1M). Once a cached prefix is reused more than 1.14 times within its TTL, ${model.displayName} is significantly cheaper per cached read.`,
    });
  } else if (model.provider === "openai") {
    faqs.push({
      question: `How does ${model.displayName} prompt caching work compared to Anthropic Claude?`,
      answer: `OpenAI provides automatic prompt caching for prompts containing 1,024 or more prefix tokens. There is zero cache write surcharge (you pay the standard ${fmtRate(inputRate)}/1M input rate on cache write), and cached reads receive a flat 50% discount (${fmtRate(cachedReadRate ?? inputRate * 0.5)}/1M). Unlike Anthropic which requires explicit cache breakpoint headers and charges 1.25x for writes, OpenAI caching is zero-configuration and zero-surcharge.`,
    });
  } else if (model.provider === "deepseek") {
    faqs.push({
      question: `How much cheaper is ${model.displayName} compared to OpenAI and Anthropic?`,
      answer: `At ${fmtRate(inputRate)}/1M input and ${fmtRate(outputRate)}/1M output (with cache hits at ${fmtRate(cachedReadRate)}/1M), ${model.displayName} is over 15x to 25x cheaper than proprietary Western frontier models. In addition, DeepSeek offers a 50% off-peak discount daily from 16:30 to 00:30 UTC, dropping input rates even further.`,
    });
  } else if (model.provider === "google") {
    faqs.push({
      question: `How does Google Gemini context caching pricing work for ${model.displayName}?`,
      answer: `Google Gemini offers explicit context caching for prompts with at least 32,768 tokens. Cached reads receive a 75% discount off standard input rate (${fmtRate(cachedReadRate)}/1M). Context storage is billed per hour (${fmtRate(model.promptCaching.storagePer1MPerHour)}/1M tokens/hour). For long documents and books reused repeatedly, context caching provides immense ROI.`,
    });
  } else {
    faqs.push({
      question: `How does ${model.displayName} pricing compare to proprietary API models?`,
      answer: model.openWeight
        ? `At ${fmtRate(inputRate)}/1M input and ${fmtRate(outputRate)}/1M output on ${model.hosting.endpointProvider}, ${model.displayName} delivers open-weights economics with zero proprietary lock-in, customizable inference parameters, and dedicated throughput.`
        : `At ${fmtRate(inputRate)}/1M input and ${fmtRate(outputRate)}/1M output on ${model.hosting.endpointProvider}, ${model.displayName} provides enterprise cloud hosting with unified billing, VPC security, and regulatory compliance on ${model.hosting.endpointProvider}.`,
    });
  }

  // FAQ 2: Batch API Stacking
  faqs.push({
    question: `Does ${model.displayName} support Batch API and can it stack with caching?`,
    answer: model.batchApi.supported
      ? `Yes. ${model.displayName} supports asynchronous Batch API requests with a ${model.batchApi.discountPercent}% discount and a ${model.batchApi.turnaroundWindow ?? "24-hour"} turnaround window. ${model.batchApi.cachingAllowedInBatch ? "Prompt caching is also allowed inside Batch API requests, enabling compounded savings." : "Prompt caching is not permitted inside batch mode for this endpoint."}`
      : `${model.displayName} on ${model.hosting.endpointProvider} does not currently offer an asynchronous Batch API. All requests run on synchronous real-time inference endpoints.`,
  });

  // FAQ 3: Context Window & Long-Context Cliffs
  const hasLongContextCliff = model.pricingTiers.length > 1;
  faqs.push({
    question: `What is the context window for ${model.displayName} and are there tiered price cliffs?`,
    answer: hasLongContextCliff
      ? `${model.displayName} features a total context window of ${model.contextWindowTokens.toLocaleString("en-US")} tokens with tiered pricing: ${model.pricingTiers.map((t) => `${t.label}: ${fmtRate(t.inputPer1M)} in / ${fmtRate(t.outputPer1M)} out`).join("; ")}. Prompts exceeding the tier threshold trigger higher per-token rates.`
      : `${model.displayName} supports a flat context window of ${model.contextWindowTokens.toLocaleString("en-US")} tokens (max output: ${model.maxOutputTokens.toLocaleString("en-US")} tokens) with no mid-window price jumps. Standard input (${fmtRate(inputRate)}/1M) and output (${fmtRate(outputRate)}/1M) remain identical regardless of prompt length.`,
  });

  // FAQ 4: Reasoning Tokens Billing
  faqs.push({
    question: `How are reasoning or thinking tokens billed on ${model.displayName}?`,
    answer: model.reasoningTokensBilledAsOutput
      ? `Reasoning and chain-of-thought tokens produced by ${model.displayName} are billed at the standard completion output rate of ${fmtRate(outputRate)} per 1M tokens, exactly like visible user-facing output tokens. Be sure to account for reasoning token overhead in multi-turn or complex STEM benchmarks.`
      : `${model.displayName} does not charge separate reasoning token surcharges. All generated completion tokens are billed at the standard output rate of ${fmtRate(outputRate)} per 1M tokens.`,
  });

  // FAQ 5: Monthly Production Cost Example
  const sampleInputM = 60; // 60M tokens
  const sampleOutputM = 15; // 15M tokens
  const sampleCost = sampleInputM * inputRate + sampleOutputM * outputRate;
  faqs.push({
    question: `What is the estimated monthly cost to run ${model.displayName} in production?`,
    answer: `For an application processing 2,000 requests per day with 1,000 input tokens and 250 output tokens (60M input tokens and 15M output tokens per month), uncached synchronous spend on ${model.displayName} is approximately $${sampleCost.toFixed(2)}/month. Enabling prompt caching and Batch API can reduce this cost by 30% to 70%. Use our interactive calculator above to model your exact parameters.`,
  });

  return faqs;
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

  const faqs = getModelFaqs(model);

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
      {
        "@type": "ListItem",
        position: 3,
        name: model.displayName,
        item: `${SITE_URL}/models/${model.slug}/`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Calculator
        </Link>{" "}
        /{" "}
        <Link href="/models/" className="hover:text-slate-900">
          Models
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

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {model.displayName} API Pricing &amp; Cost Rules
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          API Model ID: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{model.apiModelId}</code> ·
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

      {/* Rate Card Table */}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">
          Context Tiers &amp; Token Rate Card (USD per 1M Tokens)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
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
                  <td className="py-2.5 pr-3 text-right font-bold text-emerald-700">
                    {fmtRate(tier.cachedInputReadPer1M)}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-slate-600">
                    {fmtRate(tier.cacheWrite5mPer1M ?? tier.cacheWrite30mPer1M)}
                  </td>
                  <td className="py-2.5 text-right text-slate-600">
                    {fmtRate(tier.cacheWrite1hPer1M ?? tier.cacheWrite12hPer1M)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {model.pricingTiers[0]?.offPeakRates && (
          <p className="text-[11px] text-emerald-800 bg-emerald-50 rounded-lg p-2.5">
            <strong>Off-Peak Discount Available:</strong>{" "}
            {model.pricingTiers[0].offPeakRates.windowDescriptionUtc} — Standard
            Input:{" "}
            <span className="font-mono font-bold">
              ${model.pricingTiers[0].offPeakRates.inputPer1M.toFixed(4)}/1M
            </span>
            , Output:{" "}
            <span className="font-mono font-bold">
              ${model.pricingTiers[0].offPeakRates.outputPer1M.toFixed(4)}/1M
            </span>
            , Cache Read:{" "}
            <span className="font-mono font-bold">
              ${model.pricingTiers[0].offPeakRates.cachedInputReadPer1M?.toFixed(4)}/1M
            </span>
            .
          </p>
        )}
      </section>

      {/* Caching and Batch Rules Cards */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 text-xs leading-relaxed text-slate-700 shadow-xs">
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

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 text-xs leading-relaxed text-slate-700 shadow-xs">
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

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Frequently Asked Questions: {model.displayName} Costs
          </h2>
          <p className="text-xs text-slate-500">
            Authoritative answers on prompt caching break-even, Batch API
            discounts, and reasoning token billing.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4 space-y-1.5 first:pt-2 last:pb-0">
              <h3 className="text-sm font-semibold text-slate-900">
                {faq.question}
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Actions & Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-xs">
        <a
          href={model.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-700 underline hover:text-emerald-900"
        >
          Verify live rate card on official documentation ↗
        </a>
        <div className="flex items-center gap-2">
          <Link
            href="/models/"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← All Models
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
          >
            Simulate {model.displayName} in Calculator →
          </Link>
        </div>
      </div>

      <AdSlot slotId={`model-${model.slug}-bottom`} />
    </article>
  );
}
