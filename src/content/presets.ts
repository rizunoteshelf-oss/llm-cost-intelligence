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
      "With an 1,800-token static prefix, this preset exceeds OpenAI's 1,024-token minimum, Anthropic's 512-token minimum (5.x models), and Mistral's 64-token block minimum—while falling short of Gemini's 4,096-token implicit/explicit threshold. At an 85% cache hit rate and 12 cold writes/hour (192 writes/day), cache reads drop to 0.02x–0.10x input price depending on provider.",
    batchGuidance:
      "Live user-facing RAG Q&A requires sub-second to few-second latency, so Batch API (up to 24h turnaround) is turned off by default. Use Batch only for offline RAG evaluation suites or overnight knowledge-base indexing QA runs.",
    workedExampleNote:
      "Under default RAG Q&A parameters (1,800 prefix / 3,200 dynamic / 450 output, 2,000 req/day, 85% hit, 12 writes/hr over 16h), Claude Sonnet 5.5 ($2.00 in / $10.00 out / $0.10 read / $2.50 5m write) and GPT-6.1 Sol ($2.00 in / $10.00 out / $0.10 read / $2.50 30m write) both total $23.36/day ($700.76/mo) vs. $870.00/mo uncached—saving $169.24/mo (19.5%). Routing the same traffic to Claude Haiku 5.5 ($0.10 in / $0.50 out / $0.01 read / $0.125 5m write) drops the bill to $1.18/day ($35.50/mo vs. $43.50/mo uncached).",
    pitfallWarning:
      "Do not inflate retrieved chunk counts carelessly: dynamic RAG chunks are uncached on every query and dominate the bill (~64% of input tokens here). Also note Gemini models require at least 4,096 prefix tokens to activate caching, so a 1,800-token RAG system prompt receives zero cache discount on Gemini.",
  },
  "code-generation": {
    slug: "code-generation",
    title: "Code Generation & AI IDE Agent Cost Comparison",
    metaDescription:
      "Model prompt caching, 5m vs 1h write surcharges, and output-token dominance for AI code generation and repository-aware coding workflows.",
    summary:
      "Repository-aware code generation sends a large cacheable project context—repo map, architecture rules, and tool definitions (12,000 tokens)—plus active file diffs (2,500 dynamic tokens) and generates long code + reasoning output (1,600 tokens) at 500 requests/day.",
    tokenAnatomy: [
      "Cacheable Prefix (12,000 tokens): Repository tree, coding standards, type definitions, and MCP/tool schemas shared across edits.",
      "Dynamic Input (2,500 tokens): Currently open files, compiler errors, and user edit instructions.",
      "Completion Output (1,600 tokens): Generated code patches, tests, and reasoning tokens (billed at output rate, which is typically 3x–5x input rate).",
      "Daily Scale: 500 requests/day over 16 active hours/day (15,000 requests/month).",
    ],
    cachingStrategy:
      "Because the 12,000-token repo prefix makes up 82.8% of total input tokens and exceeds every provider's minimum cache threshold (including Gemini's 4,096 tokens), prompt caching is essential. With 80% cache hits and 4 cold writes/hour (64 writes/day), providers with 95%–98% cache-read discounts (GPT-6.1 Sol, Claude Sonnet 5.5, DeepSeek V4.1 Flash) dramatically slash input spend.",
    batchGuidance:
      "Interactive IDE edits cannot wait for 24-hour Batch queues, so Batch API is off by default. Enable Batch only for asynchronous overnight PR test generation, repo-wide lint/migration sweeps, or CI benchmark evaluations.",
    workedExampleNote:
      "At 12,000 prefix / 2,500 dynamic / 1,600 output and 500 req/day (80% hit, 4 writes/hr over 16h), Claude Sonnet 5.5 ($2.00/$10.00, $0.10 read, $2.50 5m write) costs $13.76/day ($412.92/mo) compared to $675.00/mo uncached—saving $262.08/mo (38.8%). Notice that output tokens ($240.00/mo on Sonnet 5.5) still account for 58.1% of the cached bill.",
    pitfallWarning:
      "Watch two hidden multipliers in coding agents: (1) frequent edits to files placed inside the cached prefix trigger repeated 1.25x–2.50x cache writes; keep volatile diffs at the end of the prompt after static instructions; (2) Claude 4.7+ uses a newer tokenizer that produces roughly 30% more tokens for identical text/code compared to older Claude 4.6 tokenizers.",
  },
  "document-summarization": {
    slug: "document-summarization",
    title: "Long-Context Document Summarization & Batch API Cost Guide",
    metaDescription:
      "Estimate long-context PDF and contract summarization costs with Batch API discounts, minimum cache thresholds, and >100K/>200K/>272K context cliffs.",
    summary:
      "Bulk document summarization processes large unique payloads (45,000 dynamic tokens per PDF/contract) with a lightweight instruction header (600 prefix tokens) and structured summaries (1,200 output tokens) at 300 documents/day—making asynchronous Batch API the primary cost lever.",
    tokenAnatomy: [
      "Cacheable Prefix (600 tokens): Short extraction/summarization rubric shared across all documents.",
      "Dynamic Input (45,000 tokens): Unique PDF, legal brief, earnings transcript, or medical record—rarely repeated across requests.",
      "Completion Output (1,200 tokens): Executive summary, key entities, and risk bullets.",
      "Daily Scale: 300 documents/day across 24 hours/day (9,000 documents/month).",
    ],
    cachingStrategy:
      "Cache hit rate defaults to 10% because every document is unique. Furthermore, the 600-token instruction prefix is below OpenAI's 1,024-token and Gemini's 4,096-token minimums, so caching only activates on Anthropic 5.x (512-token min) and Mistral (64-token min). Caching matters here only if you run multiple distinct prompts against the *same* 45,000-token document.",
    batchGuidance:
      "Document pipelines are typically asynchronous, making Batch API ideal. However, verified Batch discounts vary sharply by provider: OpenAI, Anthropic, Mistral, and Gemini offer 50% off (with Gemini 3.1 Pro Preview excluding cache reads/storage from Batch discount), Bedrock gives 25% off on Mistral Large 2 and N/A on Claude 5.x, DeepSeek offers 50% Off-Peak scheduling instead of Batch, and Together AI charges 0% discount (standard rates) for serverless chat models.",
    workedExampleNote:
      "At 600 prefix / 45,000 dynamic / 1,200 output and 300 docs/day with Batch enabled, Claude Haiku 5.5 ($0.10/$0.50 base, 50% Batch stacking with 512-tok caching) costs $0.77/day ($23.20/mo vs. $46.44/mo sync uncached). Mistral Large 4 (50% Batch, caching disabled in Batch) costs $5.17/day ($154.98/mo vs. $309.96/mo). Gemini 3.8 Flash (promotional $0.75/$3.75 through 2026-12-31, 50% Batch, prefix < 4,096 so uncached) costs $5.80/day ($174.15/mo vs. $348.30/mo), jumping 2x on 2027-01-01.",
    pitfallWarning:
      "If documents grow past 100K tokens on Claude Haiku 5.5, total input crosses Haiku's long-context cliff and jumps 5x from $0.10/$0.50 to $0.50/$2.50 per 1M tokens for the entire request. Above 200K (Gemini 3.1 Pro Preview) or 272K (OpenAI GPT-6/6.1), long-context surcharges also apply to the full prompt—whereas Claude Sonnet 5.5, Claude Fable 5.2, and Gemini 3.8 Flash/4 Carbon stay flat up to 1M.",
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
      "Multi-turn agents live or die by prompt caching because Turns 2–5 re-send prior turns verbatim as a growing prefix. At 75% cache hit rate and 12 cold writes/hour across 16 hours, caching cuts monthly costs by ~44%–47%. Watch Gemini 4 Carbon's explicit-cache absence and implicit multi-turn rule: a turn must add at least 2,050 new tokens to extend the cached prefix—otherwise the trailing 2,050 tokens are billed uncached.",
    batchGuidance:
      "Live customer chat requires real-time streaming responses, so Batch API is disabled by default. Batch is only applicable to post-chat QA auditing, sentiment tagging, or CSAT classification.",
    workedExampleNote:
      "For 1,500 5-turn sessions/day (4,600 avg input/turn, 350 output/turn, 75% hit, 12 writes/hr over 16h), Claude Sonnet 5.5 costs $50.77/day ($1,522.97/mo) with caching vs. $2,857.50/mo uncached—saving $1,334.53/mo (46.7%). Switching to a lightweight tier like GPT-6 Luna ($0.10/$0.50, $0.01 read, $0.125 30m write) drops the same 225,000-turn monthly load to $2.66/day ($79.69/mo vs. $142.88/mo uncached).",
    pitfallWarning:
      "Never estimate a 5-turn agent by multiplying single-turn tokens by 5: quadratic history accumulation makes Turn 5 nearly 1.8x larger than Turn 1. On long 15–20 turn sessions, cap or summarize history before crossing model cliffs like Haiku 5.5's >100K 5x jump.",
  },
  extraction: {
    slug: "extraction",
    title: "High-Volume JSON Extraction & ETL LLM Cost Comparison",
    metaDescription:
      "Optimize high-volume structured extraction (10,000 req/day) using 1-hour prompt caching, Batch API discounts, and fast open-weight hosts.",
    summary:
      "Structured ETL and invoice/document extraction pairs a strict JSON schema & few-shot prefix (1,200 tokens) with incoming raw payloads (1,800 dynamic tokens) and compact JSON output (250 tokens) at 10,000 requests/day—maximizing both cache reuse and Batch savings.",
    tokenAnatomy: [
      "Cacheable Prefix (1,200 tokens): JSON Schema, field validation rules, edge-case enum definitions, and 2–3 canonical extraction examples.",
      "Dynamic Input (1,800 tokens): Raw HTML, email body, OCR invoice text, or support ticket payload.",
      "Completion Output (250 tokens): Deterministic structured JSON payload.",
      "Daily Scale: 10,000 requests/day across 24 hours/day (300,000 requests/month).",
    ],
    cachingStrategy:
      "Because all 10,000 daily jobs share the exact same 1,200-token schema prefix, cache hit rate defaults to 90% with 1 cold write/hour (24 writes/day) on a 1h TTL. Even with Anthropic's 2.0x 1-hour write rate ($0.20/1M on Haiku 5.5), 24 daily writes cost pennies while 90% cache reads save substantially on 360M monthly prefix tokens.",
    batchGuidance:
      "ETL pipelines are the textbook Batch API workload: 24-hour turnaround slashes input and output costs by 50% on Anthropic (stacking with 1h caching), OpenAI GPT-5/6.x (stacking with caching), Mistral (50% off without Batch caching), and Amazon Bedrock open-weight models like gpt-oss-120b (50% off without caching). Avoid Together AI for serverless chat Batch if expecting a discount (0% Batch discount), and remember Groq Batch does NOT stack with prompt caching.",
    workedExampleNote:
      "At 10,000 req/day (1,200 prefix / 1,800 dynamic / 250 output, 90% hit, 1 write/hr, 1h TTL, Batch ON), Claude Haiku 5.5 (50% Batch stacking with 1h caching) costs $1.64/day ($49.21/mo vs. $127.50/mo sync uncached—61.4% savings) and GPT-6 Luna stacks 50% Batch with caching for $1.64/day ($49.23/mo). Mistral Small 4 (50% Batch, prompt caching disabled in Batch) costs $3.00/day ($90.00/mo vs. $180.00/mo). By contrast, Together AI's DeepSeek-V4.1-Flash charges standard rates in Batch (0% discount, caching active), landing at $8.82/day ($264.74/mo).",
    pitfallWarning:
      "Check both Batch-discount eligibility and cache-stacking rules before assuming 50% off: Together AI runs serverless chat Batch jobs at standard 100% rates, Amazon Bedrock lists Claude 5.x models as N/A for Batch (and disables caching in Batch for all models), and DeepSeek has no Batch API (requiring scheduling outside Peak UTC hours for 50% Off-Peak rates).",
  },
};
