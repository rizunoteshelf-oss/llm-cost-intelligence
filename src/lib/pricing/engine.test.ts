import { describe, expect, it } from "vitest";
import {
  calculateAllModels,
  calculateModelCost,
  resolveContextTier,
} from "./engine";
import { PRESET_BY_ID, WORKLOAD_PRESETS } from "./presets";
import { validateRegistry, type PricingModel } from "./schema";

const anthropicSonnet55: PricingModel = {
  id: "anthropic/claude-sonnet-5-5",
  slug: "claude-sonnet-5-5",
  displayName: "Claude Sonnet 5.5",
  apiModelId: "claude-sonnet-5-5",
  provider: "anthropic",
  modelFamily: "Claude 5.5",
  openWeight: false,
  contextWindowTokens: 1000000,
  maxOutputTokens: 128000,
  reasoningTokensBilledAsOutput: true,
  featuredDetailPage: true,
  pricingTiers: [
    {
      label: "Standard (<= 1M)",
      upToTokens: null,
      inputPer1M: 2.0,
      outputPer1M: 10.0,
      cachedInputReadPer1M: 0.1,
      cacheWrite5mPer1M: 2.5,
      cacheWrite1hPer1M: 4.0,
      batchInputPer1M: 1.0,
      batchOutputPer1M: 5.0,
    },
  ],
  promptCaching: {
    supported: true,
    mode: "explicit",
    minCacheableTokens: 512,
    ttlOptions: ["5m", "1h"],
    storagePer1MPerHour: null,
    notes: "5m = 1.25x, 1h = 2.0x, read = 0.05x",
  },
  batchApi: {
    supported: true,
    discountPercent: 50,
    cachingAllowedInBatch: true,
    batchDiscountAppliesToCache: true,
    turnaroundWindow: "Up to 24h",
    notes: "50% off; stacks with caching",
  },
  hosting: {
    endpointProvider: "Anthropic First-Party",
    endpointType: "first_party",
    regionMultipliers: [
      { regionLabel: "Global Dynamic", multiplier: 1.0 },
      { regionLabel: "US-Only", multiplier: 1.1 },
    ],
    hostingNotes: "US-Only adds 1.1x",
  },
  effectiveDate: "2026-11-12",
  promotionalExpiryDate: null,
  lastVerifiedDate: "2026-11-12",
  officialSourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing",
  notes: "Test fixture",
};

const anthropicHaiku55: PricingModel = {
  id: "anthropic/claude-haiku-5-5",
  slug: "claude-haiku-5-5",
  displayName: "Claude Haiku 5.5",
  apiModelId: "claude-haiku-5-5",
  provider: "anthropic",
  modelFamily: "Claude 5.5",
  openWeight: false,
  contextWindowTokens: 1000000,
  maxOutputTokens: 128000,
  reasoningTokensBilledAsOutput: true,
  pricingTiers: [
    {
      label: "Standard (<= 100K)",
      upToTokens: 100000,
      inputPer1M: 0.1,
      outputPer1M: 0.5,
      cachedInputReadPer1M: 0.01,
      cacheWrite5mPer1M: 0.125,
      cacheWrite1hPer1M: 0.2,
    },
    {
      label: "Long Context (> 100K)",
      upToTokens: null,
      inputPer1M: 0.5,
      outputPer1M: 2.5,
      cachedInputReadPer1M: 0.05,
      cacheWrite5mPer1M: 0.625,
      cacheWrite1hPer1M: 1.0,
    },
  ],
  promptCaching: {
    supported: true,
    mode: "explicit",
    minCacheableTokens: 512,
    ttlOptions: ["5m", "1h"],
    storagePer1MPerHour: null,
    notes: "5x cliff >100K total input",
  },
  batchApi: {
    supported: true,
    discountPercent: 50,
    cachingAllowedInBatch: true,
    batchDiscountAppliesToCache: true,
    turnaroundWindow: "Up to 24h",
    notes: "Stacks with caching and tier",
  },
  hosting: {
    endpointProvider: "Anthropic First-Party",
    endpointType: "first_party",
    hostingNotes: "Global",
  },
  effectiveDate: "2026-11-12",
  promotionalExpiryDate: null,
  lastVerifiedDate: "2026-11-12",
  officialSourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing",
  notes: "Test fixture",
};

const gemini38Flash: PricingModel = {
  id: "google/gemini-3-8-flash",
  slug: "gemini-3-8-flash",
  displayName: "Gemini 3.8 Flash",
  apiModelId: "gemini-3.8-flash",
  provider: "google",
  modelFamily: "Gemini 3.8",
  openWeight: false,
  contextWindowTokens: 1048576,
  maxOutputTokens: 65536,
  reasoningTokensBilledAsOutput: true,
  pricingTiers: [
    {
      label: "Intro Promo (<= 1M)",
      upToTokens: null,
      inputPer1M: 0.75,
      outputPer1M: 3.75,
      cachedInputReadPer1M: 0.075,
      cacheWrite5mPer1M: 0.75,
      cacheWrite1hPer1M: null,
      batchInputPer1M: 0.375,
      batchOutputPer1M: 1.875,
    },
  ],
  promptCaching: {
    supported: true,
    mode: "explicit",
    minCacheableTokens: 4096,
    ttlOptions: ["custom_hourly"],
    storagePer1MPerHour: 0.5,
    notes: "4096 min tokens; $0.50/1M/hr storage thru 2026-12-31",
  },
  batchApi: {
    supported: true,
    discountPercent: 50,
    cachingAllowedInBatch: true,
    batchDiscountAppliesToCache: true,
    turnaroundWindow: "Up to 24h",
    notes: "50% off cache read; storage stays $0.50/hr",
  },
  hosting: {
    endpointProvider: "Google AI Studio",
    endpointType: "first_party",
    hostingNotes: "Paid tier",
  },
  effectiveDate: "2026-11-12",
  promotionalExpiryDate: "2026-12-31",
  lastVerifiedDate: "2026-11-12",
  officialSourceUrl: "https://aistudio.google.com/docs/pricing",
  notes: "Test fixture",
};

const gemini31Pro: PricingModel = {
  id: "google/gemini-3-1-pro-preview",
  slug: "gemini-3-1-pro-preview",
  displayName: "Gemini 3.1 Pro Preview",
  apiModelId: "gemini-3.1-pro-preview",
  provider: "google",
  modelFamily: "Gemini 3.1",
  openWeight: false,
  contextWindowTokens: 1048576,
  maxOutputTokens: 65536,
  reasoningTokensBilledAsOutput: true,
  pricingTiers: [
    {
      label: "Standard (<= 200K)",
      upToTokens: 200000,
      inputPer1M: 2.0,
      outputPer1M: 12.0,
      cachedInputReadPer1M: 0.2,
      cacheWrite5mPer1M: 2.0,
      cacheWrite1hPer1M: null,
      batchInputPer1M: 1.0,
      batchOutputPer1M: 6.0,
    },
    {
      label: "Long Context (> 200K)",
      upToTokens: null,
      inputPer1M: 4.0,
      outputPer1M: 18.0,
      cachedInputReadPer1M: 0.4,
      cacheWrite5mPer1M: 4.0,
      cacheWrite1hPer1M: null,
      batchInputPer1M: 2.0,
      batchOutputPer1M: 9.0,
    },
  ],
  promptCaching: {
    supported: true,
    mode: "explicit",
    minCacheableTokens: 4096,
    ttlOptions: ["custom_hourly"],
    storagePer1MPerHour: 4.5,
    notes: "4096 min tokens; $4.50/1M/hr storage",
  },
  batchApi: {
    supported: true,
    discountPercent: 50,
    cachingAllowedInBatch: true,
    batchDiscountAppliesToCache: false,
    turnaroundWindow: "Up to 24h",
    notes: "Cache read & storage remain Same as Standard in batch",
  },
  hosting: {
    endpointProvider: "Google AI Studio",
    endpointType: "first_party",
    hostingNotes: "Paid tier",
  },
  effectiveDate: "2026-11-12",
  promotionalExpiryDate: null,
  lastVerifiedDate: "2026-11-12",
  officialSourceUrl: "https://aistudio.google.com/docs/pricing",
  notes: "Test fixture",
};

const groqGptOss: PricingModel = {
  id: "groq/openai-gpt-oss-120b",
  slug: "gpt-oss-120b-groq",
  displayName: "GPT-OSS 120B (Groq)",
  apiModelId: "openai/gpt-oss-120b",
  provider: "groq",
  modelFamily: "GPT-OSS",
  openWeight: true,
  contextWindowTokens: 131072,
  maxOutputTokens: 65536,
  reasoningTokensBilledAsOutput: true,
  pricingTiers: [
    {
      label: "Standard (<= 131K)",
      upToTokens: null,
      inputPer1M: 0.15,
      outputPer1M: 0.6,
      cachedInputReadPer1M: 0.075,
      cacheWrite5mPer1M: 0.15,
      cacheWrite1hPer1M: null,
    },
  ],
  promptCaching: {
    supported: true,
    mode: "automatic",
    minCacheableTokens: null,
    ttlOptions: ["2h"],
    storagePer1MPerHour: null,
    notes: "2h volatile cache",
  },
  batchApi: {
    supported: true,
    discountPercent: 50,
    cachingAllowedInBatch: false,
    batchDiscountAppliesToCache: false,
    turnaroundWindow: "24h-7d",
    notes: "Does NOT stack with prompt caching",
  },
  hosting: {
    endpointProvider: "Groq LPU",
    endpointType: "inference_specialist",
    hostingNotes: "~500 t/s",
  },
  effectiveDate: "2026-11-12",
  promotionalExpiryDate: null,
  lastVerifiedDate: "2026-11-12",
  officialSourceUrl: "https://console.groq.com/docs/models",
  notes: "Test fixture",
};

const deepseekFlash: PricingModel = {
  id: "deepseek/deepseek-flash",
  slug: "deepseek-flash",
  displayName: "DeepSeek Flash",
  apiModelId: "deepseek-flash",
  provider: "deepseek",
  modelFamily: "DeepSeek V4.1",
  openWeight: true,
  contextWindowTokens: 1000000,
  maxOutputTokens: 393216,
  reasoningTokensBilledAsOutput: true,
  pricingTiers: [
    {
      label: "Standard (<= 1M)",
      upToTokens: null,
      inputPer1M: 0.3,
      outputPer1M: 1.2,
      cachedInputReadPer1M: 0.006,
      cacheWrite5mPer1M: 0.3,
      cacheWrite1hPer1M: null,
      offPeakRates: {
        inputPer1M: 0.15,
        outputPer1M: 0.6,
        cachedInputReadPer1M: 0.003,
        windowDescriptionUtc: "Outside Mon-Fri peak UTC windows",
      },
    },
  ],
  promptCaching: {
    supported: true,
    mode: "automatic",
    minCacheableTokens: null,
    ttlOptions: ["automatic"],
    storagePer1MPerHour: null,
    notes: "Automatic KV cache",
  },
  batchApi: {
    supported: false,
    discountPercent: null,
    cachingAllowedInBatch: false,
    batchDiscountAppliesToCache: false,
    turnaroundWindow: null,
    notes: "No Batch API; use Off-Peak hours",
  },
  hosting: {
    endpointProvider: "DeepSeek First-Party",
    endpointType: "first_party",
    hostingNotes: "1P",
  },
  effectiveDate: "2026-10-17",
  promotionalExpiryDate: null,
  lastVerifiedDate: "2026-11-12",
  officialSourceUrl: "https://api-docs.deepseek.com/quick_start/pricing",
  notes: "Test fixture",
};

describe("schema validator", () => {
  it("validates a well-formed registry", () => {
    const res = validateRegistry({
      schemaVersion: "1.0.0",
      registryUpdatedAt: "2026-11-12",
      currency: "USD",
      models: [
        anthropicSonnet55,
        anthropicHaiku55,
        gemini38Flash,
        gemini31Pro,
        groqGptOss,
        deepseekFlash,
      ],
    });
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("rejects duplicate ids and invalid batch caching combinations", () => {
    const broken = {
      ...groqGptOss,
      batchApi: {
        ...groqGptOss.batchApi,
        cachingAllowedInBatch: false,
        batchDiscountAppliesToCache: true,
      },
    };
    const res = validateRegistry({
      schemaVersion: "1.0.0",
      registryUpdatedAt: "2026-11-12",
      currency: "USD",
      models: [broken, broken],
    });
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes("Duplicate model id"))).toBe(true);
    expect(
      res.errors.some((e) => e.includes("batchDiscountAppliesToCache cannot be true")),
    ).toBe(true);
  });
});

describe("presets", () => {
  it("exposes all 5 canonical presets", () => {
    expect(WORKLOAD_PRESETS.map((p) => p.id)).toEqual([
      "rag-qa",
      "code-generation",
      "document-summarization",
      "support-agent",
      "extraction",
    ]);
  });

  it("computes exact 5-turn arithmetic series for support-agent (4,600 avg input/turn)", () => {
    const preset = PRESET_BY_ID["support-agent"];
    const est = calculateModelCost(anthropicSonnet55, {
      ...preset,
      useOffPeak: false,
      referenceDate: "2026-11-12",
    });
    expect(est.peakTurnInputTokens).toBe(5900);
    expect(est.avgInputTokensPerTurn).toBe(4600);
    expect(est.totalTurnsPerDay).toBe(7500);
  });
});

describe("pricing engine", () => {
  it("selects long-context tier at Haiku 5.5 >100K threshold", () => {
    const lowTier = resolveContextTier(anthropicHaiku55, 100000);
    const highTier = resolveContextTier(anthropicHaiku55, 100001);
    expect(lowTier?.inputPer1M).toBe(0.1);
    expect(highTier?.inputPer1M).toBe(0.5);
  });

  it("warns and disables caching when prefix is below minCacheableTokens", () => {
    const est = calculateModelCost(anthropicSonnet55, {
      prefixTokens: 300, // below 512 min
      dynamicInputTokens: 1000,
      outputTokens: 200,
      requestsPerDay: 1000,
      cacheHitRate: 0.9,
      cacheWritesPerHour: 1,
      cacheTtl: "5m",
      useCaching: true,
      useBatch: false,
      useOffPeak: false,
      turnsPerSession: 1,
      followUpUserTokens: 0,
      activeHoursPerDay: 16,
      referenceDate: "2026-11-12",
    });
    expect(est.cacheActive).toBe(false);
    expect(est.warnings.some((w) => w.includes("below model caching minimum"))).toBe(
      true,
    );
  });

  it("handles 3-state batch + caching rules across Anthropic, Gemini 3.8 Flash, Gemini 3.1 Pro, and Groq", () => {
    const baseInput = {
      prefixTokens: 5000, // >= 4096 min for Gemini
      dynamicInputTokens: 5000,
      outputTokens: 1000,
      requestsPerDay: 1000,
      cacheHitRate: 0.9,
      cacheWritesPerHour: 1,
      cacheTtl: "5m" as const,
      useCaching: true,
      useBatch: true,
      useOffPeak: false,
      turnsPerSession: 1,
      followUpUserTokens: 0,
      activeHoursPerDay: 10,
      referenceDate: "2026-11-12",
    };

    // Anthropic: batch 50% stacks onto cache read ($0.10 * 0.5 = $0.05) and write ($2.50 * 0.5 = $1.25)
    const ant = calculateModelCost(anthropicSonnet55, baseInput);
    expect(ant.cacheActive).toBe(true);
    expect(ant.batchActive).toBe(true);
    expect(ant.effectiveRates?.cachedReadPer1M).toBeCloseTo(0.05, 6);
    expect(ant.effectiveRates?.cacheWritePer1M).toBeCloseTo(1.25, 6);

    // Gemini 3.8 Flash: batch discounts cached read to $0.0375, storage stays un-discounted at $0.50/hr
    const gemFlash = calculateModelCost(gemini38Flash, baseInput);
    expect(gemFlash.cacheActive).toBe(true);
    expect(gemFlash.batchActive).toBe(true);
    expect(gemFlash.effectiveRates?.inputPer1M).toBeCloseTo(0.375, 6);
    expect(gemFlash.effectiveRates?.cachedReadPer1M).toBeCloseTo(0.0375, 6);
    expect(gemFlash.warnings.some((w) => w.includes("2026-12-31"))).toBe(true);

    // Gemini 3.1 Pro Preview: batch allows caching, but cached read stays "Same as Standard" ($0.20)
    const gemPro = calculateModelCost(gemini31Pro, baseInput);
    expect(gemPro.cacheActive).toBe(true);
    expect(gemPro.batchActive).toBe(true);
    expect(gemPro.effectiveRates?.inputPer1M).toBeCloseTo(1.0, 6);
    expect(gemPro.effectiveRates?.cachedReadPer1M).toBeCloseTo(0.2, 6);

    // Groq: batch disables caching
    const groq = calculateModelCost(groqGptOss, baseInput);
    expect(groq.batchActive).toBe(true);
    expect(groq.cacheActive).toBe(false);
    expect(groq.effectiveRates?.cachedReadPer1M).toBeNull();
    expect(groq.warnings.some((w) => w.includes("disabled in Batch mode"))).toBe(
      true,
    );
  });

  it("applies DeepSeek off-peak pricing and ignores unsupported batch", () => {
    const est = calculateModelCost(deepseekFlash, {
      ...PRESET_BY_ID["extraction"],
      useBatch: true,
      useOffPeak: true,
      referenceDate: "2026-11-12",
    });
    expect(est.batchActive).toBe(false);
    expect(est.offPeakActive).toBe(true);
    expect(est.effectiveRates?.inputPer1M).toBeCloseTo(0.15, 6);
    expect(est.effectiveRates?.cachedReadPer1M).toBeCloseTo(0.003, 6);
    expect(est.warnings.some((w) => w.includes("No Batch API"))).toBe(true);
  });

  it("flags EXCEEDS_CONTEXT_WINDOW and sorts invalid models to the bottom", () => {
    const results = calculateAllModels([groqGptOss, anthropicSonnet55], {
      ...PRESET_BY_ID["document-summarization"],
      dynamicInputTokens: 200000, // exceeds Groq 131K, fits Anthropic 1M
      useOffPeak: false,
      referenceDate: "2026-11-12",
    });
    expect(results[0]?.model.id).toBe(anthropicSonnet55.id);
    expect(results[0]?.status).toBe("VALID");
    expect(results[1]?.model.id).toBe(groqGptOss.id);
    expect(results[1]?.status).toBe("EXCEEDS_CONTEXT_WINDOW");
  });

  it("handles Together 0% batch, Bedrock 25% Mistral batch, and OpenAI >272K cliff", () => {
    const togetherDeepSeek: PricingModel = {
      ...deepseekFlash,
      id: "together/deepseek-v4-1-flash",
      slug: "deepseek-v4-1-flash-together",
      provider: "together",
      pricingTiers: [
        {
          label: "Standard (<= 1M)",
          upToTokens: null,
          inputPer1M: 0.3,
          outputPer1M: 1.2,
          cachedInputReadPer1M: 0.006,
          cacheWrite5mPer1M: 0.3,
          cacheWrite1hPer1M: null,
        },
      ],
      batchApi: {
        supported: true,
        discountPercent: 0,
        cachingAllowedInBatch: true,
        batchDiscountAppliesToCache: false,
        turnaroundWindow: "24h",
        notes: "0% discount on serverless chat",
      },
      hosting: {
        endpointProvider: "Together AI",
        endpointType: "inference_specialist",
        regionMultipliers: [
          { regionLabel: "Global", multiplier: 1.0 },
          { regionLabel: "US-Only", multiplier: 1.25 },
        ],
        hostingNotes: "1.25x US-Only",
      },
    };

    const tog = calculateModelCost(togetherDeepSeek, {
      ...PRESET_BY_ID["extraction"],
      useBatch: true,
      useOffPeak: false,
      regionLabel: "US-Only",
      referenceDate: "2026-11-12",
    });
    expect(tog.batchActive).toBe(true);
    expect(tog.effectiveRates?.inputPer1M).toBeCloseTo(0.375, 6);
    expect(tog.warnings.some((w) => w.includes("0% price discount"))).toBe(true);

    const bedrockMistral2: PricingModel = {
      ...groqGptOss,
      id: "bedrock/mistral-large-2",
      slug: "mistral-large-2-bedrock",
      provider: "bedrock",
      pricingTiers: [
        {
          label: "Standard",
          upToTokens: null,
          inputPer1M: 2.0,
          outputPer1M: 6.0,
          cachedInputReadPer1M: null,
          cacheWrite5mPer1M: null,
          cacheWrite1hPer1M: null,
          batchInputPer1M: 1.5,
          batchOutputPer1M: 4.5,
        },
      ],
      promptCaching: {
        supported: false,
        mode: "none",
        minCacheableTokens: null,
        ttlOptions: [],
        storagePer1MPerHour: null,
        notes: "No caching",
      },
      batchApi: {
        supported: true,
        discountPercent: 25,
        cachingAllowedInBatch: false,
        batchDiscountAppliesToCache: false,
        turnaroundWindow: "24h",
        notes: "25% off on Bedrock",
      },
    };
    const bed = calculateModelCost(bedrockMistral2, {
      ...PRESET_BY_ID["extraction"],
      useBatch: true,
      useOffPeak: false,
      referenceDate: "2026-11-12",
    });
    expect(bed.effectiveRates?.inputPer1M).toBeCloseTo(1.5, 6);
    expect(bed.effectiveRates?.outputPer1M).toBeCloseTo(4.5, 6);

    const openaiAstra: PricingModel = {
      ...anthropicSonnet55,
      id: "openai/gpt-6-astra",
      slug: "gpt-6-astra",
      provider: "openai",
      contextWindowTokens: 1050000,
      maxInputTokens: 922000,
      pricingTiers: [
        {
          label: "Standard (<= 272K)",
          upToTokens: 272000,
          inputPer1M: 10.0,
          outputPer1M: 50.0,
          cachedInputReadPer1M: 1.0,
          cacheWrite5mPer1M: null,
          cacheWrite1hPer1M: null,
          cacheWrite30mPer1M: 12.5,
          cacheWrite12hPer1M: 25.0,
        },
        {
          label: "Long Context (> 272K)",
          upToTokens: null,
          inputPer1M: 20.0,
          outputPer1M: 75.0,
          cachedInputReadPer1M: 2.0,
          cacheWrite5mPer1M: null,
          cacheWrite1hPer1M: null,
          cacheWrite30mPer1M: 25.0,
          cacheWrite12hPer1M: 50.0,
        },
      ],
    };
    const longOpenAi = calculateModelCost(openaiAstra, {
      ...PRESET_BY_ID["document-summarization"],
      dynamicInputTokens: 300000,
      useBatch: false,
      useOffPeak: false,
      referenceDate: "2026-11-12",
    });
    expect(longOpenAi.tierLabel).toBe("Long Context (> 272K)");
    expect(longOpenAi.effectiveRates?.inputPer1M).toBeCloseTo(20.0, 6);
    expect(longOpenAi.effectiveRates?.outputPer1M).toBeCloseTo(75.0, 6);
  });
});
