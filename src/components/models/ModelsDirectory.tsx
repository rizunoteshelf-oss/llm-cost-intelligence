"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PricingModel } from "@/lib/pricing/schema";

interface ModelsDirectoryProps {
  models: PricingModel[];
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

function fmtTokens(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (count >= 1_000) {
    return `${Math.round(count / 1_000)}k`;
  }
  return count.toLocaleString();
}

export function ModelsDirectory({ models }: ModelsDirectoryProps) {
  const [query, setQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");

  const providers = useMemo(() => {
    const list = Array.from(new Set(models.map((m) => m.provider)));
    return ["all", ...list];
  }, [models]);

  const filteredModels = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((m) => {
      const matchesProvider =
        selectedProvider === "all"
          ? true
          : selectedProvider === "open-weight"
            ? m.openWeight
            : m.provider === selectedProvider;

      if (!matchesProvider) return false;
      if (!q) return true;

      return (
        m.displayName.toLowerCase().includes(q) ||
        m.apiModelId.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.modelFamily.toLowerCase().includes(q) ||
        m.hosting.endpointProvider.toLowerCase().includes(q)
      );
    });
  }, [models, query, selectedProvider]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by model name, API ID, or provider..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {providers.map((p) => {
            const label =
              p === "all"
                ? "All Models"
                : p.charAt(0).toUpperCase() + p.slice(1);
            const active = selectedProvider === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedProvider(p)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedProvider("open-weight")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition-colors ${
              selectedProvider === "open-weight"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            Open Weights
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Showing <strong>{filteredModels.length}</strong> of{" "}
        <strong>{models.length}</strong> production models
      </div>

      {/* Models Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredModels.map((model) => {
          const primaryTier = model.pricingTiers[0];
          const hasTiers = model.pricingTiers.length > 1;

          return (
            <div
              key={model.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                      {model.provider}
                    </span>
                    {model.openWeight && (
                      <span className="ml-1.5 inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                        Open-Weight
                      </span>
                    )}
                    <h2 className="text-base font-bold text-slate-900 leading-snug">
                      <Link
                        href={`/models/${model.slug}/`}
                        className="hover:text-emerald-700"
                      >
                        {model.displayName}
                      </Link>
                    </h2>
                    <p className="font-mono text-xs text-slate-500">
                      {model.apiModelId}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-900/5 px-2.5 py-1 text-right text-xs font-semibold text-slate-800">
                    {fmtTokens(model.contextWindowTokens)} ctx
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Input (Standard):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {fmtRate(primaryTier?.inputPer1M)} / 1M
                      {hasTiers ? " *" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Output:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {fmtRate(primaryTier?.outputPer1M)} / 1M
                      {hasTiers ? " *" : ""}
                    </span>
                  </div>
                  {primaryTier?.cachedInputReadPer1M != null && (
                    <div className="flex justify-between items-center text-emerald-800">
                      <span>Cached Read:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {fmtRate(primaryTier.cachedInputReadPer1M)} / 1M
                      </span>
                    </div>
                  )}
                  {model.batchApi.supported && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Batch API:</span>
                      <span className="font-semibold text-indigo-700">
                        {model.batchApi.discountPercent}% Off ({model.batchApi.turnaroundWindow ?? "24h"})
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {model.notes}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Host: {model.hosting.endpointProvider}
                </span>
                <Link
                  href={`/models/${model.slug}/`}
                  className="font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  Rate Card &amp; Rules →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModels.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No models match &ldquo;{query}&rdquo;
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Try searching for another model name, provider, or clear your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedProvider("all");
            }}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
