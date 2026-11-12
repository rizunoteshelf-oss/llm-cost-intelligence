"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  Check,
  Copy,
  Download,
  FileCode,
  FileSpreadsheet,
  Printer,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import type { CalculatorInput, ModelCostEstimate } from "@/lib/pricing/engine";

interface LiveSpendLeaderboardProps {
  estimates: readonly ModelCostEstimate[];
  calculatorInput: CalculatorInput;
  presetLabel: string;
  registryUpdatedAt: string;
  onCopyShareableUrl: () => void;
  isCopied: boolean;
  onExportCsv: () => void;
  onExportMarkdown: () => void;
  onPrintPdf: () => void;
}

function fmtUsd(val: number, decimals = 2): string {
  if (val > 0 && val < 0.01 && decimals === 2) {
    return `$${val.toFixed(4)}`;
  }
  return `$${val.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function LiveSpendLeaderboard({
  estimates,
  calculatorInput,
  presetLabel,
  onCopyShareableUrl,
  isCopied,
  onExportCsv,
  onExportMarkdown,
  onPrintPdf,
}: LiveSpendLeaderboardProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [baselineTier, setBaselineTier] = useState<"flagship" | "mini">("flagship");

  // Filter valid estimates
  const validEstimates = useMemo(
    () => estimates.filter((e) => e.status === "VALID"),
    [estimates],
  );

  const lowestModel = validEstimates[0];

  // Benchmark model: mapped to Current Production models per owner decision
  const frontierBenchmark = useMemo(() => {
    if (validEstimates.length === 0) return null;

    if (baselineTier === "flagship") {
      // Find current flagship: Claude 3.5 Sonnet, GPT-4o, or o1 (non-legacy)
      const currentFlagships = validEstimates.filter((e) => e.model.lifecycleStatus !== "legacy");
      return (
        currentFlagships.find(
          (e) =>
            e.model.apiModelId === "claude-3-5-sonnet-latest" ||
            e.model.apiModelId === "gpt-4o" ||
            e.model.id.includes("claude-3-5-sonnet") ||
            (e.model.id.includes("gpt-4o") && !e.model.id.includes("mini")),
        ) ||
        currentFlagships.find((e) => e.model.id.includes("o1")) ||
        currentFlagships[currentFlagships.length - 1] ||
        validEstimates[validEstimates.length - 1]
      );
    } else {
      // Find current mini / flash: GPT-4o mini, Gemini 2.0 Flash, Claude 3.5 Haiku
      const currentMinis = validEstimates.filter((e) => e.model.lifecycleStatus !== "legacy");
      return (
        currentMinis.find(
          (e) =>
            e.model.id === "openai/gpt-4o-mini" ||
            e.model.id === "google/gemini-2-0-flash" ||
            e.model.id.includes("haiku"),
        ) ||
        currentMinis[0] ||
        validEstimates[0]
      );
    }
  }, [validEstimates, baselineTier]);

  const baselineLabel =
    baselineTier === "flagship" ? "Frontier Baseline" : "Mini Baseline";

  // Representative optimization metrics across models benefiting from active modifiers
  const optimizationSummary = useMemo(() => {
    const modelsWithSavings = validEstimates.filter(
      (e) => e.savingsPercent > 0.1,
    );

    if (modelsWithSavings.length === 0) {
      return {
        percent: 0,
        monthlyUsd: 0,
        modelName: null,
        modifierLabel: "No active discount",
      };
    }

    // Sort by savings percent descending
    const best = [...modelsWithSavings].sort(
      (a, b) => b.savingsPercent - a.savingsPercent,
    )[0];

    if (!best) {
      return {
        percent: 0,
        monthlyUsd: 0,
        modelName: null,
        modifierLabel: "No active discount",
      };
    }

    let modifier = "Prompt Cache";
    if (best.batchActive && best.cacheActive) modifier = "Cache + Batch";
    else if (best.batchActive) modifier = "Batch API -50%";
    else if (best.offPeakActive) modifier = "Off-Peak -50%";

    return {
      percent: best.savingsPercent,
      monthlyUsd: best.monthlySavingsUsd,
      modelName: best.model.displayName,
      modifierLabel: modifier,
    };
  }, [validEstimates]);

  // Top 6 models for live leaderboard visual
  const topModels = useMemo(() => {
    return validEstimates.slice(0, 6);
  }, [validEstimates]);

  // Max spend among top models for scaling bar width
  const maxSpend = useMemo(() => {
    if (topModels.length === 0) return 1;
    return Math.max(...topModels.map((m) => m.monthlyCostUsd), 1);
  }, [topModels]);

  return (
    <div className="space-y-4" id="live-finops-leaderboard">
      {/* Sticky Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-lg shadow-slate-900/5 dark:shadow-black/40 transition-colors">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Live FinOps Spend Leaderboard
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Scenario: <strong className="text-slate-700 dark:text-slate-200">{presetLabel}</strong> · Updates in real time
            </p>
          </div>

          <button
            type="button"
            onClick={onCopyShareableUrl}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              isCopied
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
            }`}
            title="Copy URL with current slider & toggle parameters"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Share Scenario</span>
              </>
            )}
          </button>
        </div>

        {/* Spend Metrics Grid (3 equal columns) */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Lowest Cost Callout */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                <span>Lowest Cost</span>
              </div>
              <div className="mt-1 font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {lowestModel ? fmtUsd(lowestModel.monthlyCostUsd) : "—"}
                <span className="text-xs font-normal text-emerald-600/70 dark:text-emerald-400/70">
                  /mo
                </span>
              </div>
              <div
                className="mt-1 text-[11px] font-medium leading-snug text-slate-700 dark:text-slate-300 line-clamp-2 min-h-[30px]"
                title={lowestModel?.model.displayName}
              >
                {lowestModel?.model.displayName ?? "No matching model"}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 border-t border-emerald-500/10 pt-1">
              {lowestModel ? `${fmtUsd(lowestModel.dailyCostUsd)}/day` : ""}
            </div>
          </div>

          {/* Reference / Frontier Baseline with Segmented Toggle */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#161F30] p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  {baselineLabel}
                </span>
                <div className="inline-flex rounded-md bg-slate-200/60 dark:bg-white/10 p-0.5 text-[9px] font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => setBaselineTier("flagship")}
                    className={`px-1.5 py-0.5 rounded transition-all ${
                      baselineTier === "flagship"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Flagship
                  </button>
                  <button
                    type="button"
                    onClick={() => setBaselineTier("mini")}
                    className={`px-1.5 py-0.5 rounded transition-all ${
                      baselineTier === "mini"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Mini
                  </button>
                </div>
              </div>
              <div className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {frontierBenchmark ? fmtUsd(frontierBenchmark.monthlyCostUsd) : "—"}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  /mo
                </span>
              </div>
              <div
                className="mt-1 text-[11px] font-medium leading-snug text-slate-700 dark:text-slate-200 line-clamp-2 min-h-[30px]"
                title={frontierBenchmark?.model.displayName}
              >
                {frontierBenchmark?.model.displayName ?? "—"}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 border-t border-slate-200 dark:border-white/5 pt-1">
              {lowestModel &&
              frontierBenchmark &&
              frontierBenchmark.monthlyCostUsd > lowestModel.monthlyCostUsd
                ? `${(
                    frontierBenchmark.monthlyCostUsd /
                    Math.max(0.01, lowestModel.monthlyCostUsd)
                  ).toFixed(1)}x spread`
                : "Baseline"}
            </div>
          </div>

          {/* Cache & Batch Savings Callout */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                <TrendingDown className="h-3 w-3" />
                <span>Optimization</span>
              </div>
              <div className="mt-1 font-mono text-xl font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                {optimizationSummary.percent > 0.1
                  ? `-${optimizationSummary.percent.toFixed(1)}%`
                  : "0.0%"}
              </div>
              <div
                className="mt-1 text-[11px] font-medium leading-snug text-slate-700 dark:text-slate-200 line-clamp-2 min-h-[30px]"
                title={
                  optimizationSummary.modelName
                    ? `${fmtUsd(optimizationSummary.monthlyUsd, 0)}/mo saved on ${optimizationSummary.modelName}`
                    : "No active discount"
                }
              >
                {optimizationSummary.percent > 0.1 && optimizationSummary.modelName
                  ? `Best: ${optimizationSummary.modelName}`
                  : "No active discount"}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 border-t border-cyan-500/10 pt-1">
              {optimizationSummary.percent > 0.1
                ? `${optimizationSummary.modifierLabel} active`
                : calculatorInput.useBatch && calculatorInput.useCaching
                  ? "Cache + Batch stacked"
                  : calculatorInput.useBatch
                    ? "Batch -50% discount"
                    : calculatorInput.useCaching
                      ? `${Math.round(calculatorInput.cacheHitRate * 100)}% cache hit active`
                      : calculatorInput.useOffPeak
                        ? "Off-Peak -50% discount"
                        : "Sync standard rates"}
            </div>
          </div>
        </div>

        {/* Real-Time Spend Bars Leaderboard */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Model Spend Comparison (Top 6)</span>
            <span className="font-mono text-[11px]">Monthly (30d)</span>
          </div>

          <div className="space-y-2.5">
            {topModels.map((est, idx) => {
              const widthPct = Math.max(
                4,
                Math.min(100, (est.monthlyCostUsd / maxSpend) * 100),
              );
              const isFirst = idx === 0;

              return (
                <div
                  key={est.model.id}
                  className="group relative rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-2.5 transition-all hover:border-slate-200 dark:hover:border-white/10"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-mono font-bold ${
                          isFirst
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="truncate font-semibold text-slate-900 dark:text-white"
                        title={est.model.displayName}
                      >
                        {est.model.displayName}
                      </span>
                      {est.model.lifecycleStatus === "legacy" ? (
                        <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                          LEGACY
                        </span>
                      ) : est.model.hosting.endpointType !== "first_party" ? (
                        <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-1 py-0.2 text-[8px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                          CLOUD
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="text-right font-mono tabular-nums">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {fmtUsd(est.monthlyCostUsd)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {fmtUsd(est.dailyCostUsd)}/d
                      </div>
                    </div>
                  </div>

                  {/* Animated Cost Bar */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ease-out ${
                        isFirst
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : idx < 3
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      }`}
                    />
                  </div>

                  {/* Active Modifiers Pills */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                    {est.cacheActive && (
                      <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-emerald-600 dark:text-emerald-400 font-semibold">
                        CACHE HIT
                      </span>
                    )}
                    {est.batchActive && (
                      <span className="rounded bg-cyan-500/10 px-1 py-0.2 text-cyan-600 dark:text-cyan-400 font-semibold">
                        BATCH -{est.model.batchApi.discountPercent ?? 50}%
                      </span>
                    )}
                    {est.savingsPercent > 0.1 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        -{est.savingsPercent.toFixed(1)}% vs sync
                      </span>
                    )}
                    <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500">
                      {fmtUsd(est.costPer1kTurnsUsd)}/1k turns
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls & Export */}
        <div className="mt-5 border-t border-slate-100 dark:border-white/5 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export FinOps Breakdown</span>
              </button>

              {exportMenuOpen && (
                <div className="absolute left-0 bottom-full z-50 mb-2 w-52 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161F30] p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      onExportCsv();
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                    <span>Download CSV Quote</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportMarkdown();
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <FileCode className="h-4 w-4 text-cyan-500" />
                    <span>Download Markdown Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onPrintPdf();
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <Printer className="h-4 w-4 text-slate-400" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              )}
            </div>

            <a
              href="#full-comparison-table"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              <span>Full table ({estimates.length} models)</span>
              <ArrowDown className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
