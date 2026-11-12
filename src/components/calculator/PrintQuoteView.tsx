"use client";

import type { CalculatorInput, ModelCostEstimate } from "@/lib/pricing/engine";

interface PrintQuoteViewProps {
  estimates: readonly ModelCostEstimate[];
  input: CalculatorInput;
  presetLabel: string;
  registryUpdatedAt: string;
}

function fmtUsd(value: number, decimals = 2): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function PrintQuoteView({
  estimates,
  input,
  presetLabel,
  registryUpdatedAt,
}: PrintQuoteViewProps) {
  return (
    <section
      aria-label="Printable Cost Quote"
      className="print-only hidden bg-white text-black"
    >
      <div className="border-b-2 border-slate-900 pb-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">
            LLM Cost Intelligence — Workload Budget Quote
          </h2>
          <span className="font-mono text-xs">
            Registry Verified: {registryUpdatedAt}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-700">
          Generated locally in browser · Zero prompt data transmitted ·
          Currency: USD
        </p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 rounded border border-slate-300 p-2.5 text-xs">
        <div>
          <span className="font-semibold">Workload:</span> {presetLabel}
        </div>
        <div>
          <span className="font-semibold">Prefix / Dynamic / Out:</span>{" "}
          {input.prefixTokens.toLocaleString("en-US")} /{" "}
          {input.dynamicInputTokens.toLocaleString("en-US")} /{" "}
          {input.outputTokens.toLocaleString("en-US")}
        </div>
        <div>
          <span className="font-semibold">Volume:</span>{" "}
          {input.requestsPerDay.toLocaleString("en-US")}/day (
          {input.turnsPerSession} turn{input.turnsPerSession > 1 ? "s" : ""})
        </div>
        <div>
          <span className="font-semibold">Cache / Batch / Off-Peak:</span>{" "}
          {input.useCaching
            ? `${Math.round(input.cacheHitRate * 100)}% (${input.cacheTtl})`
            : "Off"}{" "}
          / {input.useBatch ? "Batch On" : "Sync"} /{" "}
          {input.useOffPeak ? "Off-Peak" : "Peak/Std"}
        </div>
      </div>

      <table className="mt-4 w-full border-collapse text-left text-[10px]">
        <thead>
          <tr className="border-b border-slate-400 bg-slate-100">
            <th className="p-1.5">Model (Host)</th>
            <th className="p-1.5">Tier</th>
            <th className="p-1.5 text-right">In / Out ($/1M)</th>
            <th className="p-1.5 text-right">Cache ($/1M)</th>
            <th className="p-1.5 text-right">Daily</th>
            <th className="p-1.5 text-right">Monthly (30d)</th>
            <th className="p-1.5 text-right">$/1K Turns</th>
            <th className="p-1.5">Verified Source</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((est) => (
            <tr key={est.model.id} className="border-b border-slate-200">
              <td className="p-1.5 font-semibold">
                {est.model.displayName}
                <div className="font-normal text-slate-600">
                  {est.model.hosting.endpointProvider}
                </div>
              </td>
              <td className="p-1.5">
                {est.status === "VALID"
                  ? est.tierLabel
                  : "EXCEEDS CONTEXT WINDOW"}
              </td>
              <td className="p-1.5 text-right font-mono">
                {est.effectiveRates
                  ? `${fmtUsd(est.effectiveRates.inputPer1M, 3)} / ${fmtUsd(est.effectiveRates.outputPer1M, 3)}`
                  : "—"}
              </td>
              <td className="p-1.5 text-right font-mono">
                {est.effectiveRates?.cachedReadPer1M != null
                  ? fmtUsd(est.effectiveRates.cachedReadPer1M, 4)
                  : "—"}
              </td>
              <td className="p-1.5 text-right font-mono">
                {est.status === "VALID" ? fmtUsd(est.dailyCostUsd, 2) : "—"}
              </td>
              <td className="p-1.5 text-right font-mono font-bold">
                {est.status === "VALID" ? fmtUsd(est.monthlyCostUsd, 2) : "—"}
              </td>
              <td className="p-1.5 text-right font-mono">
                {est.status === "VALID" ? fmtUsd(est.costPer1kTurnsUsd, 3) : "—"}
              </td>
              <td className="p-1.5 text-[9px] text-slate-600">
                {est.model.lastVerifiedDate} · {est.model.officialSourceUrl}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-[9px] text-slate-600">
        Disclaimer: Token counts and monthly projections are budgeting estimates
        based on verified official provider rate cards as of{" "}
        {registryUpdatedAt}. Actual invoices depend on exact model tokenizers
        (e.g. Claude 4.7+ ~30% higher token counts, OpenAI o200k_base), hidden
        reasoning tokens, and provider cache eviction behavior.
      </p>
    </section>
  );
}
