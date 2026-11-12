"use client";

import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
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
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        No models match the active provider or hosting filter.
      </div>
    );
  }

  return (
    <div
      id="full-comparison-table"
      className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-sm transition-colors"
    >
      <table className="w-full min-w-[880px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            <th className="px-4 py-3.5">Model &amp; Host</th>
            <th className="px-3 py-3.5">Active Tier &amp; Rules</th>
            <th className="px-3 py-3.5 text-right font-mono">Eff. In / Out ($/1M)</th>
            <th className="px-3 py-3.5 text-right font-mono">Cache Read ($/1M)</th>
            <th className="px-3 py-3.5 text-right font-mono">Daily</th>
            <th className="px-3 py-3.5 text-right font-mono">Monthly (30d)</th>
            <th className="px-3 py-3.5 text-right font-mono">$/1K Turns</th>
            <th className="px-4 py-3.5 text-right font-mono">Savings vs Sync</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
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
                      ? "bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-500/[0.04] dark:hover:bg-emerald-500/[0.08]"
                      : "hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                    : "bg-slate-50/50 dark:bg-slate-900/30 opacity-70"
                }
              >
                {/* Model & Host */}
                <td className="px-4 py-3.5 align-top font-sans">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isValid && index === 0 && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        <Sparkles className="h-2.5 w-2.5" />
                        LOWEST
                      </span>
                    )}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {model.featuredDetailPage ? (
                        <Link
                          href={`/models/${model.slug}/`}
                          className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline decoration-emerald-500/50 underline-offset-2 transition-colors"
                        >
                          {model.displayName}
                        </Link>
                      ) : (
                        model.displayName
                      )}
                    </span>
                    {model.openWeight && (
                      <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                        Open-Weight
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
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
                      K max
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Verified {model.lastVerifiedDate}</span>
                    <span>·</span>
                    <a
                      href={model.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:underline"
                    >
                      <span>Docs</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </td>

                {/* Active Tier & Rules */}
                <td className="px-3 py-3.5 align-top font-sans">
                  {isValid ? (
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                        {est.cacheActive && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                            Cache On
                          </span>
                        )}
                        {est.batchActive && (
                          <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-semibold text-cyan-600 dark:text-cyan-400">
                            Batch{" "}
                            {model.batchApi.discountPercent != null
                              ? `-${model.batchApi.discountPercent}%`
                              : ""}
                          </span>
                        )}
                        {est.offPeakActive && (
                          <span className="rounded bg-violet-500/10 px-1.5 py-0.5 font-semibold text-violet-600 dark:text-violet-400">
                            Off-Peak
                          </span>
                        )}
                        {est.regionMultiplier > 1 && (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                            US {est.regionMultiplier}x
                          </span>
                        )}
                        {isLongTier && (
                          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                            Long-Context Cliff
                          </span>
                        )}
                        {model.promotionalExpiryDate && (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                            Promo ends {model.promotionalExpiryDate}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        {est.tierLabel}
                      </div>
                    </div>
                  ) : (
                    <span className="inline-block rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      EXCEEDS CONTEXT WINDOW
                    </span>
                  )}

                  {est.warnings.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-[10px] leading-snug text-amber-600 dark:text-amber-400">
                      {est.warnings.map((w, wIdx) => (
                        <li key={wIdx}>• {w}</li>
                      ))}
                    </ul>
                  )}
                </td>

                {/* Rates */}
                <td className="px-3 py-3.5 text-right align-top tabular-nums text-slate-700 dark:text-slate-300">
                  {est.effectiveRates ? (
                    <>
                      <div>{fmtUsd(est.effectiveRates.inputPer1M, 3)}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {fmtUsd(est.effectiveRates.outputPer1M, 3)}
                      </div>
                    </>
                  ) : (
                    "—"
                  )}
                </td>

                {/* Cached Read */}
                <td className="px-3 py-3.5 text-right align-top tabular-nums text-slate-700 dark:text-slate-300">
                  {est.effectiveRates?.cachedReadPer1M != null
                    ? fmtUsd(est.effectiveRates.cachedReadPer1M, 4)
                    : "—"}
                </td>

                {/* Daily Cost */}
                <td className="px-3 py-3.5 text-right align-top tabular-nums text-slate-700 dark:text-slate-300">
                  {isValid ? fmtUsd(est.dailyCostUsd, 2) : "—"}
                </td>

                {/* Monthly Cost */}
                <td className="px-3 py-3.5 text-right align-top font-bold text-sm tabular-nums text-slate-900 dark:text-white">
                  {isValid ? fmtUsd(est.monthlyCostUsd, 2) : "—"}
                </td>

                {/* Cost per 1K turns */}
                <td className="px-3 py-3.5 text-right align-top tabular-nums text-slate-700 dark:text-slate-300">
                  {isValid ? fmtUsd(est.costPer1kTurnsUsd, 3) : "—"}
                </td>

                {/* Savings vs Sync */}
                <td className="px-4 py-3.5 text-right align-top tabular-nums">
                  {isValid && est.savingsPercent > 0.1 ? (
                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        -{est.savingsPercent.toFixed(1)}%
                      </span>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {fmtUsd(est.monthlySavingsUsd, 0)}/mo saved
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">0.0%</span>
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
