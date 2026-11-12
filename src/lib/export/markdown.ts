import type { CalculatorInput, ModelCostEstimate } from "../pricing/engine";

export interface MarkdownExportMetadata {
  presetLabel: string;
  registryUpdatedAt: string;
  exportedAtIso: string;
}

function fmtUsd(val: number): string {
  return `$${val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function buildEstimatesMarkdown(
  estimates: readonly ModelCostEstimate[],
  input: CalculatorInput,
  meta: MarkdownExportMetadata,
): string {
  const lines: string[] = [];

  lines.push(`# LLM Cost Intelligence — FinOps Spend Analysis`);
  lines.push(`> Generated at: ${meta.exportedAtIso} | Registry Verified: ${meta.registryUpdatedAt}`);
  lines.push(`> Workload Scenario: **${meta.presetLabel}**`);
  lines.push(``);
  lines.push(`## Workload Parameters`);
  lines.push(`- **Cacheable Prefix Tokens:** ${input.prefixTokens.toLocaleString("en-US")} tok`);
  lines.push(`- **Dynamic Input Tokens:** ${input.dynamicInputTokens.toLocaleString("en-US")} tok`);
  lines.push(`- **Output Tokens / Turn:** ${input.outputTokens.toLocaleString("en-US")} tok`);
  lines.push(`- **Requests / Day:** ${input.requestsPerDay.toLocaleString("en-US")}`);
  lines.push(`- **Turns / Session:** ${input.turnsPerSession}`);
  lines.push(`- **Cache Hit Rate:** ${(input.cacheHitRate * 100).toFixed(0)}%`);
  lines.push(`- **Batch API (24h):** ${input.useBatch ? "Enabled (-50%)" : "Disabled (Sync)"}`);
  lines.push(`- **Prompt Caching:** ${input.useCaching ? "Enabled" : "Disabled"}`);
  lines.push(``);
  lines.push(`## Model Cost Comparison Leaderboard`);
  lines.push(
    `| Rank | Model | Provider | Monthly Spend (30d) | Daily Spend | Cost / 1K Turns | Savings vs Sync | Tier |`,
  );
  lines.push(
    `| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |`,
  );

  estimates.forEach((est, idx) => {
    const rank = idx + 1;
    const modelName = est.model.displayName;
    const provider = est.model.hosting.endpointProvider;
    const monthly = est.status === "VALID" ? fmtUsd(est.monthlyCostUsd) : "N/A";
    const daily = est.status === "VALID" ? fmtUsd(est.dailyCostUsd) : "N/A";
    const per1k = est.status === "VALID" ? `$${est.costPer1kTurnsUsd.toFixed(3)}` : "N/A";
    const savings =
      est.status === "VALID" && est.savingsPercent > 0.1
        ? `-${est.savingsPercent.toFixed(1)}%`
        : "0.0%";
    const tier = est.status === "VALID" ? est.tierLabel : "EXCEEDS CONTEXT";

    lines.push(
      `| ${rank} | ${modelName} | ${provider} | **${monthly}** | ${daily} | ${per1k} | ${savings} | ${tier} |`,
    );
  });

  lines.push(``);
  lines.push(`---`);
  lines.push(
    `*All calculations computed locally via [LLM Cost Intelligence](https://llm.everydaypdf.me). Official rates verified ${meta.registryUpdatedAt}.*`,
  );

  return lines.join("\n");
}
