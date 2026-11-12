import type { CalculatorInput, ModelCostEstimate } from "../pricing/engine";

const FORMULA_INJECTION_PREFIX_RE = /^[=+\-@\t\r]/;

/**
 * RFC 4180 CSV cell formatter with spreadsheet formula-injection neutralization.
 * Prefixes leading =, +, -, @, \t, or \r on string cells with a single quote.
 */
export function sanitizeCsvCell(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  let str = String(value);
  if (FORMULA_INJECTION_PREFIX_RE.test(str)) {
    str = `'${str}`;
  }

  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface CsvExportMetadata {
  presetLabel: string;
  registryUpdatedAt: string;
  exportedAtIso: string;
}

export function buildEstimatesCsv(
  estimates: readonly ModelCostEstimate[],
  input: CalculatorInput,
  meta: CsvExportMetadata,
): string {
  const rows: string[] = [];

  rows.push(
    [
      "Quote Generated At (UTC)",
      "Pricing Registry Verified",
      "Workload",
      "Prefix Tokens",
      "Dynamic Input Tokens",
      "Output Tokens",
      "Requests or Sessions/Day",
      "Turns/Session",
      "Cache Hit Rate",
      "Batch Mode",
      "Off-Peak Mode",
    ]
      .map(sanitizeCsvCell)
      .join(","),
  );

  rows.push(
    [
      meta.exportedAtIso,
      meta.registryUpdatedAt,
      meta.presetLabel,
      input.prefixTokens,
      input.dynamicInputTokens,
      input.outputTokens,
      input.requestsPerDay,
      input.turnsPerSession,
      `${Math.round(input.cacheHitRate * 100)}%`,
      input.useBatch,
      input.useOffPeak,
    ]
      .map(sanitizeCsvCell)
      .join(","),
  );

  rows.push("");

  rows.push(
    [
      "Model",
      "Provider",
      "Host / Endpoint",
      "Status",
      "Context Tier",
      "Cache Active",
      "Batch Active",
      "Eff. Input ($/1M)",
      "Eff. Output ($/1M)",
      "Eff. Cache Read ($/1M)",
      "Daily Cost (USD)",
      "Monthly Cost (USD)",
      "Cost per 1K Turns (USD)",
      "Savings vs Uncached (%)",
      "Last Verified",
      "Official Source URL",
      "Notes / Warnings",
    ]
      .map(sanitizeCsvCell)
      .join(","),
  );

  for (const est of estimates) {
    rows.push(
      [
        est.model.displayName,
        est.model.provider,
        est.model.hosting.endpointProvider,
        est.status,
        est.tierLabel ?? "Exceeds Context Limit",
        est.cacheActive,
        est.batchActive,
        est.effectiveRates ? est.effectiveRates.inputPer1M.toFixed(4) : "N/A",
        est.effectiveRates ? est.effectiveRates.outputPer1M.toFixed(4) : "N/A",
        est.effectiveRates?.cachedReadPer1M != null
          ? est.effectiveRates.cachedReadPer1M.toFixed(4)
          : "N/A",
        est.status === "VALID" ? est.dailyCostUsd.toFixed(4) : "N/A",
        est.status === "VALID" ? est.monthlyCostUsd.toFixed(2) : "N/A",
        est.status === "VALID" ? est.costPer1kTurnsUsd.toFixed(4) : "N/A",
        est.status === "VALID" ? `${est.savingsPercent.toFixed(1)}%` : "N/A",
        est.model.lastVerifiedDate,
        est.model.officialSourceUrl,
        est.warnings.join(" | "),
      ]
        .map(sanitizeCsvCell)
        .join(","),
    );
  }

  return rows.join("\r\n");
}
