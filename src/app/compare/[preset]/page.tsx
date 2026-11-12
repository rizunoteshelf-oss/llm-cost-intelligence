import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import rawRegistry from "@/data/models.json";
import { PRESET_EDITORIAL } from "@/content/presets";
import { AdSlot } from "@/components/ads/AdSlot";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import {
  getPresetById,
  WORKLOAD_PRESETS,
  type WorkloadPresetId,
} from "@/lib/pricing/presets";
import type { PricingRegistry } from "@/lib/pricing/schema";

export const dynamicParams = false;

const registry = rawRegistry as unknown as PricingRegistry;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

export function generateStaticParams(): Array<{ preset: WorkloadPresetId }> {
  return WORKLOAD_PRESETS.map((p) => ({ preset: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ preset: string }>;
}): Promise<Metadata> {
  const { preset } = await params;
  const presetData = getPresetById(preset);
  if (!presetData) {
    return { title: "Workload Comparison" };
  }
  const editorial = PRESET_EDITORIAL[presetData.id];
  return {
    title: editorial.title,
    description: editorial.metaDescription,
    alternates: {
      canonical: `/compare/${presetData.slug}/`,
    },
  };
}

export default async function ComparePresetPage({
  params,
}: {
  params: Promise<{ preset: string }>;
}) {
  const { preset } = await params;
  const presetData = getPresetById(preset);
  if (!presetData) {
    notFound();
  }

  const editorial = PRESET_EDITORIAL[presetData.id];

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
      {
        "@type": "ListItem",
        position: 3,
        name: presetData.name,
        item: `${SITE_URL}/compare/${presetData.slug}/`,
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
        /{" "}
        <Link href="/compare/" className="hover:text-slate-900">
          Workload Comparisons
        </Link>{" "}
        / <span className="font-semibold text-slate-800">{presetData.name}</span>
      </nav>

      <header className="no-print space-y-3">
        <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
          Workload Benchmark &amp; Cost Model
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {editorial.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {editorial.summary}
        </p>
      </header>

      <CalculatorShell
        models={registry.models}
        registryUpdatedAt={registry.registryUpdatedAt}
        initialPresetId={presetData.id}
      />

      <section className="no-print grid gap-6 border-t border-slate-200 pt-8 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">
            Token Anatomy &amp; Scaling Assumptions
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-slate-700 sm:text-sm">
            {editorial.tokenAnatomy.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            <strong>Worked Note:</strong> {editorial.workedExampleNote}
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Caching &amp; Batch Strategy
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-700 sm:text-sm">
              {editorial.cachingStrategy}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
              {editorial.batchGuidance}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <strong>Cost Trap Warning:</strong> {editorial.pitfallWarning}
          </div>
        </div>
      </section>

      <AdSlot slotId={`compare-${presetData.slug}-bottom`} />
    </div>
  );
}
