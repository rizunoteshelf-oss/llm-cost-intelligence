"use client";

import Link from "next/link";
import type { ModelCostEstimate } from "@/lib/pricing/engine";

interface ComparisonTableProps {
  estimates: readonly ModelCostEstimate[];
}

function fmtUsd(value: number, decimals = 2): string {
  if (value > 0 && value < 0.01 && decimals === 2) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  deepseek: "DeepSeek",
  mistral: "Mistral",
  groq: "Groq",
  together: "Together AI",
  bedrock: "AWS Bedrock",
};

export function ComparisonTable({ estimates }: ComparisonTableProps) {
  if (estimates.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        No models match the active provider or hosting filter.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full min-w-[860px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-600 uppercase">
            <th className="px-4 py-3">Model &amp; Host</th>
            <th className="px-3 py-3">Active Tier &amp; Rules</th>
            <th className="px-3 py-3 text-right">Eff. In / Out ($/1M)</th>
            <th className="px-3 py-3 text-right">Cache Read ($/1M)</th>
            <th className="px-3 py-3 text-right">Daily</th>
            <th className="px-3 py-3 text-right">Monthly (30d)</th>
            <th className="px-3 py-3 text-right">$/1K Turns</th>
            <th className="px-4 py-3 text-right">Savings vs Sync</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {estimates.map((est, index) => {
            const { model } = est;
            const isValid = est.status === "VALID";
            const isLongTier =
              isValid &&
              model.pricingTiers.length > 1 &&
              est.tierLabel !== model.pricingTiers[0]?.label;

            return (
              <tr
                key={model.id}
                className={
                  isValid
                    ? index === 0
                      ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                      : "hover:bg-slate-50/80"
                    : "bg-slate-50/60 opacity-75"
                }
              >
                <td className="px-4 py-3.5 align-top">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isValid && index === 0 && (
                      <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        LOWEST
                      </span>
                    )}
                    <span className="font-semibold text-slate-900">
                      {model.featuredDetailPage ? (
                        <Link
                          href={`/models/${model.slug}/`}
                          className="underline decoration-slate-300 underline-offset-2 hover:text-emerald-700 hover:decoration-emerald-600"
                        >
                          {model.displayName}
                        </Link>
                      ) : (
                        model.displayName
                      )}
                    </span>
                    {model.openWeight && (
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                        Open-Weight
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">
                      {PROVIDER_LABELS[model.provider] ?? model.provider}
                    </span>
                    <span>·</span>
                    <span>{model.hosting.endpointProvider}</span>
                    <span>·</span>
                    <span className="font-mono">
                      {(
                        (model.maxInputTokens ?? model.contextWindowTokens) /
                        1000
                      ).toFixed(0)}
                      K max in
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                    <span>Verified {model.lastVerifiedDate}</span>
                    <a
                      href={model.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-600 underline decoration-slate-300 hover:text-slate-900"
                    >
                      Official Docs ↗
                    </a>
                  </div>
                </td>

                <td className="px-3 py-3.5 align-top">
                  {isValid ? (
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {est.cacheActive && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                            Cache On
                          </span>
                        )}
                        {est.batchActive && (
                          <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800">
                            Batch{" "}
                            {model.batchApi.discountPercent != null
                              ? `-${model.batchApi.discountPercent}%`
                              : ""}
                          </span>
                        )}
                        {est.offPeakActive && (
                          <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-800">
                            Off-Peak
                          </span>
                        )}
                        {est.regionMultiplier > 1 && (
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                            US {est.regionMultiplier}x
                          </span>
                        )}
                        {isLongTier && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                            Long-Context Cliff
                          </span>
                        )}
                        {model.promotionalExpiryDate && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                            Promo ends {model.promotionalExpiryDate}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {est.tierLabel}
                      </div>
                    </div>
                  ) : (
                    <span className="inline-block rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                      EXCEEDS CONTEXT WINDOW
                    </span>
                  )}

                  {est.warnings.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-[10px] leading-snug text-amber-800">
                      {est.warnings.map((w, wIdx) => (
                        <li key={wIdx}>• {w}</li>
                      ))}
                    </ul>
                  )}
                </td>

                <td className="px-3 py-3.5 text-right align-top font-mono tabular-nums text-slate-700">
                  {est.effectiveRates ? (
                    <>
                      <div>{fmtUsd(est.effectiveRates.inputPer1M, 3)}</div>
                      <div className="text-[11px] text-slate-500">
                        {fmtUsd(est.effectiveRates.outputPer1M, 3)}
                      </div>
                    </>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="px-3 py-3.5 text-right align-top font-mono tabular-nums text-slate-700">
                  {est.effectiveRates?.cachedReadPer1M != null
                    ? fmtUsd(est.effectiveRates.cachedReadPer1M, 4)
                    : "—"}
                </td>

                <td className="px-3 py-3.5 text-right align-top font-mono tabular-nums text-slate-700">
                  {isValid ? fmtUsd(est.dailyCostUsd, 2) : "—"}
                </td>

                <td className="px-3 py-3.5 text-right align-top font-mono text-sm font-bold tabular-nums text-slate-900">
                  {isValid ? fmtUsd(est.monthlyCostUsd, 2) : "—"}
                </td>

                <td className="px-3 py-3.5 text-right align-top font-mono tabular-nums text-slate-700">
                  {isValid ? fmtUsd(est.costPer1kTurnsUsd, 3) : "—"}
                </td>

                <td className="px-4 py-3.5 text-right align-top font-mono tabular-nums">
                  {isValid && est.savingsPercent > 0.1 ? (
                    <div>
                      <span className="font-bold text-emerald-700">
                        -{est.savingsPercent.toFixed(1)}%
                      </span>
                      <div className="text-[10px] text-slate-500">
                        {fmtUsd(est.monthlySavingsUsd, 0)}/mo saved
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400">0.0%</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
