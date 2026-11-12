import { describe, expect, it } from "vitest";
import { buildEstimatesCsv, sanitizeCsvCell } from "./csv";
import { calculateModelCost } from "../pricing/engine";
import { PRESET_BY_ID } from "../pricing/presets";
import type { PricingModel } from "../pricing/schema";

describe("csv sanitizer & export", () => {
  it("neutralizes spreadsheet formula-injection prefixes", () => {
    expect(sanitizeCsvCell("=CMD()")).toBe("'=CMD()");
    expect(sanitizeCsvCell("+1+1")).toBe("'+1+1");
    expect(sanitizeCsvCell("-100")).toBe("'-100");
    expect(sanitizeCsvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(sanitizeCsvCell("\tfoo")).toBe("'\tfoo");
    expect(sanitizeCsvCell("hello, world")).toBe('"hello, world"');
    expect(sanitizeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(sanitizeCsvCell(-12.5)).toBe("-12.5");
  });

  it("builds a complete quote CSV with metadata and rows", () => {
    const model: PricingModel = {
      id: "openai/gpt-6-luna",
      slug: "gpt-6-luna",
      displayName: "GPT-6 Luna",
      apiModelId: "gpt-6-luna",
      provider: "openai",
      modelFamily: "GPT-6",
      openWeight: false,
      contextWindowTokens: 1050000,
      maxInputTokens: 922000,
      maxOutputTokens: 128000,
      reasoningTokensBilledAsOutput: true,
      pricingTiers: [
        {
          label: "Standard (<= 272K)",
          upToTokens: 272000,
          inputPer1M: 0.1,
          outputPer1M: 0.5,
          cachedInputReadPer1M: 0.01,
          cacheWrite5mPer1M: null,
          cacheWrite1hPer1M: null,
          cacheWrite30mPer1M: 0.125,
          cacheWrite12hPer1M: 0.25,
        },
      ],
      promptCaching: {
        supported: true,
        mode: "explicit",
        minCacheableTokens: 1024,
        ttlOptions: ["30m", "12h"],
        storagePer1MPerHour: null,
        notes: "1024 min tokens",
      },
      batchApi: {
        supported: true,
        discountPercent: 50,
        cachingAllowedInBatch: true,
        batchDiscountAppliesToCache: true,
        turnaroundWindow: "24h",
        notes: "50% off all columns",
      },
      hosting: {
        endpointProvider: "OpenAI First-Party",
        endpointType: "first_party",
        hostingNotes: "Global",
      },
      effectiveDate: "2026-11-12",
      promotionalExpiryDate: null,
      lastVerifiedDate: "2026-11-12",
      officialSourceUrl: "https://developers.openai.com/api/docs/pricing",
      notes: "Test",
    };

    const preset = PRESET_BY_ID["rag-qa"];
    const input = { ...preset, useOffPeak: false, referenceDate: "2026-11-12" };
    const est = calculateModelCost(model, input);
    const csv = buildEstimatesCsv([est], input, {
      presetLabel: preset.name,
      registryUpdatedAt: "2026-11-12",
      exportedAtIso: "2026-11-12T10:00:00Z",
    });

    expect(csv).toContain("RAG Q&A");
    expect(csv).toContain("GPT-6 Luna");
    expect(csv).toContain("https://developers.openai.com/api/docs/pricing");
  });
});
