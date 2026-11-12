"use client";

import { buildEstimatesCsv } from "@/lib/export/csv";
import type { CalculatorInput, ModelCostEstimate } from "@/lib/pricing/engine";

interface ExportActionsProps {
  estimates: readonly ModelCostEstimate[];
  input: CalculatorInput;
  presetLabel: string;
  registryUpdatedAt: string;
}

export function ExportActions({
  estimates,
  input,
  presetLabel,
  registryUpdatedAt,
}: ExportActionsProps) {
  function handleDownloadCsv() {
    const nowIso = new Date().toISOString();
    const csv = buildEstimatesCsv(estimates, input, {
      presetLabel,
      registryUpdatedAt,
      exportedAtIso: nowIso,
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-cost-quote-${nowIso.slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handlePrintPdf() {
    window.print();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleDownloadCsv}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs transition-colors hover:bg-slate-50"
      >
        Export CSV Quote
      </button>
      <button
        type="button"
        onClick={handlePrintPdf}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800"
      >
        Print / Save PDF Quote
      </button>
    </div>
  );
}
