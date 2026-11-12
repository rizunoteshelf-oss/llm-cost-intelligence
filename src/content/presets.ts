import type { WorkloadPresetId } from "../lib/pricing/presets";

export type PresetId = WorkloadPresetId;

export interface PresetEditorial {
  slug: PresetId;
  title: string;
  metaDescription: string;
  summary: string;
  tokenAnatomy: string[];
  cachingStrategy: string;
  batchGuidance: string;
  workedExampleNote: string;
  pitfallWarning: string;
}

export const PRESET_EDITORIAL: Record<PresetId, PresetEditorial> = {
  "rag-qa": {
    slug: "rag-qa",
    title: "RAG Q&A LLM Cost Breakdown & Model Comparison",
    metaDescription:
      "Compare real monthly API costs for Retrieval-Augmented Generation (RAG Q&A) across OpenAI, Anthropic, Google Gemini, DeepSeek, Mistral, and open-weight hosts.",
    summary:
      "Production RAG Q&A pairs a stable system, citation, and tool-schema prefix (1,800 tokens) with per-query retrieved chunks and user questions (3,200 dynamic tokens) to produce concise grounded answers (450 output tokens) at 2,000 requests/day.",
    tokenAnatomy: [
      "Cacheable Prefix (1,800 tokens): System instructions, grounding/citation rules, JSON output guidelines, and fixed few-shot examples.",
      "Dynamic Input (3,200 tokens): Top-k vector/hybrid retrieved document chunks plus the user's raw query—changes on every request and cannot be cached across distinct questions.",
      "Completion Output (450 tokens): Grounded answer with inline source citations (plus thinking tokens on reasoning-enabled models).",
      "Daily Scale: 2,000 requests/day across 16 active hours/day (60,000 requests/month on a 30-day basis).",
    ],
    cachingStrategy:
      "With an 1,800-token static prefix, this preset exceeds OpenAI's 1,024-token minimum, Anthropic's 1,024-token minimum (Claude 3.5 Sonnet), and DeepSeek's 64-token block minimum—while falling short of Gemini's 32,768-token explicit threshold. At an 85% cache hit rate and 12 cold writes/hour (192 writes/day), cache reads drop by 50% to 90% depending on provider.",
    batchGuidance:
      "Live user-facing RAG Q&A requires sub-second to few-second latency, so Batch API (up to 24h turnaround) is turned off by default. Use Batch only for offline RAG evaluation suites or overnight knowledge-base indexing QA runs.",
    workedExampleNote:
      "Under default RAG Q&A parameters (1,800 prefix / 3,200 dynamic / 450 output, 2,000 req/day, 85% hit, 12 writes/hr over 16h), Claude 3.5 Sonnet ($3.00 in / $15.00 out / $0.30 read / $3.75 5m write) and GPT-4o ($2.50 in / $10.00 out / $1.25 read / free write) show substantial savings vs uncached traffic. Routing high-volume traffic to Claude 3.5 Haiku ($0.80 in / $4.00 out / $0.08 read) or DeepSeek-V3 ($0.14 in / $0.28 out / $0.014 read) drops monthly bills by over 80%.",
    pitfallWarning:
      "Do not inflate retrieved chunk counts carelessly: dynamic RAG chunks are uncached on every query and dominate the bill (~64% of input tokens here). Also note Gemini models require at least 32,768 prefix tokens to activate context caching, so a 1,800-token RAG system prompt receives zero cache discount on Gemini.",
  },
  "code-generation": {
    slug: "code-generation",
    title: "Code Generation & AI IDE Agent Cost Comparison",
    metaDescription:
      "Model prompt caching, 5m write surcharges, and output-token dominance for AI code generation and repository-aware coding workflows.",
    summary:
      "Repository-aware code generation sends a large cacheable project context—repo map, architecture rules, and tool definitions (12,000 tokens)—plus active file diffs (2,500 dynamic tokens) and generates long code + reasoning output (1,600 tokens) at 500 requests/day.",
    tokenAnatomy: [
      "Cacheable Prefix (12,000 tokens): Repository tree, coding standards, type definitions, and MCP/tool schemas shared across edits.",
      "Dynamic Input (2,500 tokens): Currently open files, compiler errors, and user edit instructions.",
      "Completion Output (1,600 tokens): Generated code patches, tests, and reasoning tokens (billed at output rate, which is typically 3x–5x input rate).",
      "Daily Scale: 500 requests/day over 16 active hours/day (15,000 requests/month).",
    ],
    cachingStrategy:
      "Because the 12,000-token repo prefix makes up 82.8% of total input tokens and exceeds OpenAI, Anthropic, and DeepSeek cache minimums, prompt caching is essential. With 80% cache hits and 4 cold writes/hour (64 writes/day), providers with 90% cache-read discounts (Claude 3.5 Sonnet, DeepSeek-V3) dramatically slash input spend.",
    batchGuidance:
      "Interactive IDE edits cannot wait for 24-hour Batch queues, so Batch API is off by default. Enable Batch only for asynchronous overnight PR test generation, repo-wide lint/migration sweeps, or CI benchmark evaluations.",
    workedExampleNote:
      "At 12,000 prefix / 2,500 dynamic / 1,600 output and 500 req/day (80% hit, 4 writes/hr over 16h), Claude 3.5 Sonnet ($3.00/$15.00, $0.30 read, $3.75 5m write) saves over 35% compared to uncached queries. Notice that output tokens ($15.00/1M on Sonnet) account for the majority of the cached bill.",
    pitfallWarning:
      "Watch two hidden multipliers in coding agents: (1) frequent edits to files placed inside the cached prefix trigger repeated cache writes; keep volatile diffs at the end of the prompt after static instructions; (2) reasoning models (like o1 and DeepSeek-R1) bill internal thinking tokens at the higher output rate.",
  },
  "document-summarization": {
    slug: "document-summarization",
    title: "Long-Context Document Summarization & Batch API Cost Guide",
    metaDescription:
      "Estimate long-context PDF and contract summarization costs with Batch API discounts, minimum cache thresholds, and tiered context cliffs.",
    summary:
      "Bulk document summarization processes large unique payloads (45,000 dynamic tokens per PDF/contract) with a lightweight instruction header (600 prefix tokens) and structured summaries (1,200 output tokens) at 300 documents/day—making asynchronous Batch API the primary cost lever.",
    tokenAnatomy: [
      "Cacheable Prefix (600 tokens): Short extraction/summarization rubric shared across all documents.",
      "Dynamic Input (45,000 tokens): Unique PDF, legal brief, earnings transcript, or medical record—rarely repeated across requests.",
      "Completion Output (1,200 tokens): Executive summary, key entities, and risk bullets.",
      "Daily Scale: 300 documents/day across 24 hours/day (9,000 documents/month).",
    ],
    cachingStrategy:
      "Cache hit rate defaults to 10% because every document is unique. Furthermore, the 600-token instruction prefix is below OpenAI's 1,024-token and Gemini's 32k-token minimums. Caching matters here only if you run multiple distinct prompts against the *same* 45,000-token document.",
    batchGuidance:
      "Document pipelines are typically asynchronous, making Batch API ideal. OpenAI, Anthropic, Mistral, and Gemini offer 50% off with 24-hour turnaround, while DeepSeek offers 50% Off-Peak scheduling (16:30 - 00:30 UTC daily) instead of Batch.",
    workedExampleNote:
      "At 600 prefix / 45,000 dynamic / 1,200 output and 300 docs/day with Batch enabled (50% discount), Gemini 1.5 Flash ($0.075/$0.30 base) costs under $0.50/day ($15/mo), while GPT-4o-mini ($0.15/$0.60 base) costs ~$1.20/day ($36/mo).",
    pitfallWarning:
      "Check whether your provider charges higher rates for long context: Gemini 1.5 Pro doubles its input rate from $1.25 to $2.50 per 1M for prompts exceeding 128,000 tokens.",
  },
  "support-agent": {
    slug: "support-agent",
    title: "Multi-Turn Support Agent LLM Cost Calculator",
    metaDescription:
      "Calculate quadratic multi-turn token growth, prefix caching, and session scaling for live AI customer support agents.",
    summary:
      "A 5-turn live support conversation re-sends the system/policy prefix (2,500 tokens) plus accumulating chat history (800 Turn-1 query, growing by 300 user follow-up + 350 assistant reply = 650 tokens/turn) across 1,500 sessions/day (7,500 total turns/day).",
    tokenAnatomy: [
      "Static Prefix (2,500 tokens): Brand tone policy, refund rules, escalation guardrails, and support tool schemas.",
      "Turn-by-Turn Input Growth: Turn 1 sends 3,300 input tokens (2,500 + 800); Turn 2 sends 3,950; Turn 3 sends 4,600; Turn 4 sends 5,250; Turn 5 sends 5,900—totaling 23,000 input tokens per session (4,600 average input tokens/turn).",
      "Output Per Turn (350 tokens): Helpful support response and/or tool-call arguments (1,750 output tokens across 5 turns).",
      "Daily Scale: 1,500 sessions/day × 5 turns = 7,500 API turns/day over 16 active hours/day (225,000 turns/month).",
    ],
    cachingStrategy:
      "Multi-turn agents live or die by prompt caching because Turns 2–5 re-send prior turns verbatim as a growing prefix. At 75% cache hit rate and 12 cold writes/hour across 16 hours, caching cuts monthly costs by ~40%–50%.",
    batchGuidance:
      "Live customer chat requires real-time streaming responses, so Batch API is disabled by default. Batch is only applicable to post-chat QA auditing, sentiment tagging, or CSAT classification.",
    workedExampleNote:
      "For 1,500 5-turn sessions/day (4,600 avg input/turn, 350 output/turn, 75% hit, 12 writes/hr over 16h), Claude 3.5 Haiku ($0.80/$4.00, $0.08 read) or GPT-4o-mini ($0.15/$0.60, $0.075 read) keeps total monthly spend under $150/mo, whereas uncached frontier models easily exceed $2,500/mo.",
    pitfallWarning:
      "Never estimate a 5-turn agent by multiplying single-turn tokens by 5: quadratic history accumulation makes Turn 5 nearly 1.8x larger than Turn 1. On long 15–20 turn sessions, cap or summarize history to avoid ballooning token costs.",
  },
  extraction: {
    slug: "extraction",
    title: "High-Volume JSON Extraction & ETL LLM Cost Comparison",
    metaDescription:
      "Optimize high-volume structured extraction (10,000 req/day) using prompt caching, Batch API discounts, and fast open-weight hosts.",
    summary:
      "Structured ETL and invoice/document extraction pairs a strict JSON schema & few-shot prefix (1,200 tokens) with incoming raw payloads (1,800 dynamic tokens) and compact JSON output (250 tokens) at 10,000 requests/day—maximizing both cache reuse and Batch savings.",
    tokenAnatomy: [
      "Cacheable Prefix (1,200 tokens): JSON Schema, field validation rules, edge-case enum definitions, and 2–3 canonical extraction examples.",
      "Dynamic Input (1,800 tokens): Raw HTML, email body, OCR invoice text, or support ticket payload.",
      "Completion Output (250 tokens): Deterministic structured JSON payload.",
      "Daily Scale: 10,000 requests/day across 24 hours/day (300,000 requests/month).",
    ],
    cachingStrategy:
      "Because all 10,000 daily jobs share the exact same 1,200-token schema prefix, cache hit rate defaults to 90% with 1 cold write/hour on a persistent cache. 90% cache reads save substantially on 360M monthly prefix tokens.",
    batchGuidance:
      "ETL pipelines are the textbook Batch API workload: 24-hour turnaround slashes input and output costs by 50% on Anthropic (stacking with caching), OpenAI (stacking with caching), and Mistral.",
    workedExampleNote:
      "At 10,000 req/day (1,200 prefix / 1,800 dynamic / 250 output, 90% hit, 1 write/hr, Batch ON), Claude 3.5 Haiku (50% Batch stacking with caching) costs ~$1.70/day (~$50/mo vs. $130/mo sync uncached—over 60% savings), and GPT-4o-mini delivers comparable sub-$50/month pricing.",
    pitfallWarning:
      "Check both Batch-discount eligibility and cache-stacking rules before assuming 50% off: Together AI runs serverless chat at standard rates (0% Batch discount), and DeepSeek has no Batch API (requiring scheduling outside Peak UTC hours for 50% Off-Peak rates).",
  },
};
