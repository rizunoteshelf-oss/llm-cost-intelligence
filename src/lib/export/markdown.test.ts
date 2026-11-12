import { describe, expect, it } from "vitest";
import rawRegistry from "@/data/models.json";
import { calculateModelCost } from "../pricing/engine";
import { PRESET_BY_ID, presetToCalculatorInput } from "../pricing/presets";
import type { PricingRegistry } from "../pricing/schema";
import { buildEstimatesMarkdown } from "./markdown";

const registry = rawRegistry as unknown as PricingRegistry;

describe("buildEstimatesMarkdown", () => {
  it("generates markdown table containing workload parameters and models", () => {
    const input = presetToCalculatorInput(PRESET_BY_ID["rag-qa"]);
    const estimates = registry.models.map((m) => calculateModelCost(m, input));

    const md = buildEstimatesMarkdown(estimates, input, {
      presetLabel: "RAG Q&A",
      registryUpdatedAt: "2026-11-12",
      exportedAtIso: "2026-11-13T00:00:00.000Z",
    });

    expect(md).toContain("# LLM Cost Intelligence — FinOps Spend Analysis");
    expect(md).toContain("Workload Scenario: **RAG Q&A**");
    expect(md).toContain("| Rank | Model | Provider | Monthly Spend (30d)");
    expect(md).toContain("Claude 3.5 Sonnet");
    expect(md).toContain("GPT-4o");
    expect(md).toContain("DeepSeek-V3");
  });
});
