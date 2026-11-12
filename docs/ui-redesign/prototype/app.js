// ==========================================================================
// FinOps Intelligence Prototype Engine (2026)
// Grounded 20-Model Registry & Parity Engine
// ==========================================================================

const MODELS = [
  {
    id: "openai/gpt-4o",
    displayName: "GPT-4o",
    provider: "OpenAI First-Party",
    lifecycle: "current",
    context: 128000,
    inRate: 2.50,
    outRate: 10.00,
    cachedRead: 1.25,
    cacheWrite: 2.50,
    minCache: 1024,
    batchDisc: 50
  },
  {
    id: "openai/gpt-4o-mini",
    displayName: "GPT-4o mini",
    provider: "OpenAI First-Party",
    lifecycle: "current",
    context: 128000,
    inRate: 0.15,
    outRate: 0.60,
    cachedRead: 0.075,
    cacheWrite: 0.15,
    minCache: 1024,
    batchDisc: 50
  },
  {
    id: "openai/o1",
    displayName: "o1",
    provider: "OpenAI First-Party",
    lifecycle: "current",
    context: 200000,
    inRate: 15.00,
    outRate: 60.00,
    cachedRead: 7.50,
    cacheWrite: 15.00,
    minCache: 1024,
    batchDisc: 50
  },
  {
    id: "openai/o3-mini",
    displayName: "o3-mini",
    provider: "OpenAI First-Party",
    lifecycle: "current",
    context: 200000,
    inRate: 1.10,
    outRate: 4.40,
    cachedRead: 0.55,
    cacheWrite: 1.10,
    minCache: 1024,
    batchDisc: 50
  },
  {
    id: "anthropic/claude-3-5-sonnet",
    displayName: "Claude 3.5 Sonnet",
    provider: "Anthropic First-Party",
    lifecycle: "current",
    context: 200000,
    inRate: 3.00,
    outRate: 15.00,
    cachedRead: 0.30,
    cacheWrite: 3.75, // 1.25x write surcharge
    minCache: 1024,
    batchDisc: 50
  },
  {
    id: "anthropic/claude-3-5-haiku",
    displayName: "Claude 3.5 Haiku",
    provider: "Anthropic First-Party",
    lifecycle: "current",
    context: 200000,
    inRate: 0.80,
    outRate: 4.00,
    cachedRead: 0.08,
    cacheWrite: 1.00,
    minCache: 2048,
    batchDisc: 50
  },
  {
    id: "anthropic/claude-3-opus",
    displayName: "Claude 3 Opus",
    provider: "Anthropic First-Party",
    lifecycle: "legacy",
    context: 200000,
    inRate: 15.00,
    outRate: 75.00,
    cachedRead: 1.50,
    cacheWrite: 18.75,
    minCache: 1024,
    batchDisc: 50
  },
  {
    id: "google/gemini-1-5-pro",
    displayName: "Gemini 1.5 Pro",
    provider: "Google Cloud",
    lifecycle: "legacy",
    context: 2000000,
    inRate: 1.25,
    outRate: 5.00,
    cachedRead: 0.3125,
    cacheWrite: 1.25,
    storagePerHr: 4.50,
    minCache: 32768,
    batchDisc: 50
  },
  {
    id: "google/gemini-1-5-flash",
    displayName: "Gemini 1.5 Flash",
    provider: "Google Cloud",
    lifecycle: "legacy",
    context: 1000000,
    inRate: 0.075,
    outRate: 0.30,
    cachedRead: 0.01875,
    cacheWrite: 0.075,
    storagePerHr: 1.00,
    minCache: 32768,
    batchDisc: 50
  },
  {
    id: "google/gemini-2-0-flash",
    displayName: "Gemini 2.0 Flash",
    provider: "Google Cloud",
    lifecycle: "current",
    context: 1000000,
    inRate: 0.10,
    outRate: 0.40,
    cachedRead: 0.025,
    cacheWrite: 0.10,
    storagePerHr: 1.00,
    minCache: 32768,
    batchDisc: 50
  },
  {
    id: "deepseek/deepseek-chat",
    displayName: "DeepSeek-V3",
    provider: "DeepSeek First-Party",
    lifecycle: "current",
    context: 64000,
    inRate: 0.27,
    outRate: 1.10,
    cachedRead: 0.07,
    cacheWrite: 0.27,
    minCache: 64,
    batchDisc: 0,
    offPeakDisc: 50
  },
  {
    id: "deepseek/deepseek-reasoner",
    displayName: "DeepSeek-R1",
    provider: "DeepSeek First-Party",
    lifecycle: "current",
    context: 64000,
    inRate: 0.55,
    outRate: 2.19,
    cachedRead: 0.14,
    cacheWrite: 0.55,
    minCache: 64,
    batchDisc: 0,
    offPeakDisc: 50
  },
  {
    id: "groq/llama-3-3-70b",
    displayName: "Llama 3.3 70B (Groq)",
    provider: "Groq LPU Cloud",
    lifecycle: "current",
    context: 128000,
    inRate: 0.59,
    outRate: 0.79,
    cachedRead: null,
    cacheWrite: null,
    minCache: null,
    batchDisc: 0
  },
  {
    id: "together/llama-3-3-70b",
    displayName: "Llama 3.3 70B Turbo",
    provider: "Together AI",
    lifecycle: "current",
    context: 128000,
    inRate: 0.88,
    outRate: 0.88,
    cachedRead: null,
    cacheWrite: null,
    minCache: null,
    batchDisc: 0
  },
  {
    id: "together/llama-3-1-405b",
    displayName: "Llama 3.1 405B Turbo",
    provider: "Together AI",
    lifecycle: "current",
    context: 128000,
    inRate: 3.50,
    outRate: 3.50,
    cachedRead: null,
    cacheWrite: null,
    minCache: null,
    batchDisc: 0
  },
  {
    id: "bedrock/llama-3-1-405b",
    displayName: "Llama 3.1 405B (Bedrock)",
    provider: "Amazon Bedrock",
    lifecycle: "cloud",
    context: 128000,
    inRate: 5.32,
    outRate: 16.00,
    cachedRead: null,
    cacheWrite: null,
    minCache: null,
    batchDisc: 50
  },
  {
    id: "mistral/mistral-large-2",
    displayName: "Mistral Large 2 (2411)",
    provider: "Mistral First-Party",
    lifecycle: "current",
    context: 128000,
    inRate: 2.00,
    outRate: 6.00,
    cachedRead: null,
    cacheWrite: null,
    minCache: null,
    batchDisc: 50
  },
  {
    id: "mistral/mistral-small",
    displayName: "Mistral Small (2409)",
    provider: "Mistral First-Party",
    lifecycle: "current",
    context: 128000,
    inRate: 0.20,
    outRate: 0.60,
    cachedRead: null,
    cacheWrite: null,
    minCache: null,
    batchDisc: 50
  },
  {
    id: "groq/llama-3-1-8b",
    displayName: "Llama 3.1 8B Instant",
    provider: "Groq LPU Cloud",
    lifecycle: "legacy",
    context: 128000,
    inRate: 0.05,
    outRate: 0.08,
    cachedRead: null,
    cacheWrite: null,
    minCache: null,
    batchDisc: 0
  },
  {
    id: "bedrock/claude-3-5-sonnet",
    displayName: "Claude 3.5 Sonnet (Bedrock)",
    provider: "Amazon Bedrock",
    lifecycle: "cloud",
    context: 200000,
    inRate: 3.00,
    outRate: 15.00,
    cachedRead: 0.30,
    cacheWrite: 3.75,
    minCache: 1024,
    batchDisc: 50
  }
];

const PRESETS = {
  "rag-qa": {
    name: "RAG Q&A",
    desc: "Grounded retrieval Q&A with shared system citation prefix (1.8K tok) and dynamic retrieved chunks (3.2K tok).",
    prefix: 1800,
    dynamic: 3200,
    output: 450,
    requests: 2000,
    hitRate: 85,
    writes: 12,
    ttl: "5m",
    caching: true,
    batch: false,
    turns: 1,
    followUp: 0
  },
  "code-generation": {
    name: "Code Generation",
    desc: "IDE / AI agent coding with large repository map (12K tok), active diff (2.5K tok), and code output (1.6K tok).",
    prefix: 12000,
    dynamic: 2500,
    output: 1600,
    requests: 500,
    hitRate: 80,
    writes: 4,
    ttl: "5m",
    caching: true,
    batch: false,
    turns: 1,
    followUp: 0
  },
  "document-summarization": {
    name: "Document Summarization",
    desc: "Long-context PDF/contract summarization (45K tok dynamic) with low cache reuse across unique docs and high Batch API eligibility.",
    prefix: 600,
    dynamic: 45000,
    output: 1200,
    requests: 300,
    hitRate: 10,
    writes: 1,
    ttl: "5m",
    caching: true,
    batch: true,
    turns: 1,
    followUp: 0
  },
  "support-agent": {
    name: "Support Agent (Multi-Turn)",
    desc: "Multi-turn customer support agent (5 turns/session) accumulating conversation context across turns.",
    prefix: 1500,
    dynamic: 800,
    output: 350,
    requests: 1500,
    hitRate: 75,
    writes: 6,
    ttl: "5m",
    caching: true,
    batch: false,
    turns: 5,
    followUp: 300
  },
  "extraction": {
    name: "Extraction (JSON / ETL)",
    desc: "High-volume schema-guided structured extraction (10K req/d) with shared JSON schema prefix (2.5K tok).",
    prefix: 2500,
    dynamic: 500,
    output: 250,
    requests: 10000,
    hitRate: 90,
    writes: 2,
    ttl: "5m",
    caching: true,
    batch: false,
    turns: 1,
    followUp: 0
  }
};

// Application State
let state = {
  preset: "rag-qa",
  prefixTokens: 1800,
  dynamicTokens: 3200,
  outputTokens: 450,
  requestsPerDay: 2000,
  hitRate: 85,
  writesPerHour: 12,
  cacheTtl: "5m",
  useCaching: true,
  useBatch: false,
  useOffPeak: false,
  turnsPerSession: 1,
  followUpTokens: 0,
  referenceModelId: "anthropic/claude-3-5-sonnet" // True Frontier Baseline!
};

function fmtUsd(val, decimals = 2) {
  if (val < 0.01 && val > 0) return `$${val.toFixed(4)}`;
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function calculateModelCost(m, s) {
  const turns = Math.max(1, s.turnsPerSession);
  let totalInputTokens = s.prefixTokens + s.dynamicTokens;
  if (turns > 1) {
    totalInputTokens = s.prefixTokens + s.dynamicTokens + (turns - 1) * (s.followUpTokens + s.outputTokens);
  }

  if (totalInputTokens > m.context) {
    return { status: "EXCEEDS_CONTEXT", monthlyCost: 0, dailyCost: 0, savingsPct: 0 };
  }

  const batchFactor = (s.useBatch && m.batchDisc > 0) ? (1 - m.batchDisc / 100) : 1.0;
  let inRate = m.inRate * batchFactor;
  let outRate = m.outRate * batchFactor;

  if (s.useOffPeak && m.offPeakDisc > 0) {
    inRate *= (1 - m.offPeakDisc / 100);
    outRate *= (1 - m.offPeakDisc / 100);
  }

  // Caching
  const canCache = s.useCaching && m.cachedRead !== null && s.prefixTokens >= (m.minCache || 0);
  let readRate = canCache ? m.cachedRead * batchFactor : inRate;
  let writeRate = canCache ? (m.cacheWrite || inRate) * batchFactor : inRate;

  // Uncached synchronous baseline
  const baselineDaily = (s.requestsPerDay * turns) * (
    (totalInputTokens / 1000000) * m.inRate + 
    (s.outputTokens / 1000000) * m.outRate
  );

  let dailyCost = 0;
  if (canCache) {
    const totalWritesDay = s.writesPerHour * 16;
    const writeReqs = Math.min(s.requestsPerDay, totalWritesDay);
    const missReqs = Math.max(0, s.requestsPerDay * (1 - s.hitRate / 100) - writeReqs);
    const hitReqs = Math.max(0, s.requestsPerDay - writeReqs - missReqs);

    const prefixM = s.prefixTokens / 1000000;
    const dynM = s.dynamicTokens / 1000000;
    const outM = s.outputTokens / 1000000;

    dailyCost = (
      (hitReqs * prefixM * readRate) +
      (missReqs * prefixM * inRate) +
      (writeReqs * prefixM * writeRate) +
      (s.requestsPerDay * dynM * inRate) +
      (s.requestsPerDay * outM * outRate)
    );
  } else {
    const inM = totalInputTokens / 1000000;
    const outM = s.outputTokens / 1000000;
    dailyCost = (s.requestsPerDay * turns) * (inM * inRate + outM * outRate);
  }

  // Storage fee for Gemini
  if (canCache && m.storagePerHr) {
    dailyCost += (s.prefixTokens / 1000000) * m.storagePerHr * 16;
  }

  const monthlyCost = dailyCost * 30;
  const uncachedMonthly = baselineDaily * 30;
  const savingsPct = uncachedMonthly > 0 ? Math.max(0, ((uncachedMonthly - monthlyCost) / uncachedMonthly) * 100) : 0;
  const costPer1k = (dailyCost / (s.requestsPerDay * turns)) * 1000;

  return {
    status: "VALID",
    dailyCost,
    monthlyCost,
    savingsPct,
    costPer1k,
    canCache
  };
}

function render() {
  // Calculate all models
  const results = MODELS.map(m => ({
    model: m,
    calc: calculateModelCost(m, state)
  })).filter(r => r.calc.status === "VALID")
    .sort((a, b) => a.calc.monthlyCost - b.calc.monthlyCost);

  const lowest = results[0];
  const baseline = results.find(r => r.model.id === state.referenceModelId) || results[results.length - 1];

  // Best optimization
  const bestSavings = [...results].sort((a, b) => b.calc.savingsPct - a.calc.savingsPct)[0];

  // Update KPI Cards
  document.getElementById("kpi-lowest-val").textContent = fmtUsd(lowest.calc.monthlyCost);
  document.getElementById("kpi-lowest-model").textContent = lowest.model.displayName;
  document.getElementById("kpi-lowest-day").textContent = `${fmtUsd(lowest.calc.dailyCost)}/day`;

  document.getElementById("kpi-baseline-val").textContent = fmtUsd(baseline.calc.monthlyCost);
  document.getElementById("kpi-baseline-model").textContent = baseline.model.displayName;
  const spread = baseline.calc.monthlyCost > lowest.calc.monthlyCost 
    ? `${(baseline.calc.monthlyCost / Math.max(0.01, lowest.calc.monthlyCost)).toFixed(1)}x spread`
    : "Baseline";
  document.getElementById("kpi-baseline-spread").textContent = spread;

  if (bestSavings && bestSavings.calc.savingsPct > 0.1) {
    document.getElementById("kpi-opt-val").textContent = `-${bestSavings.calc.savingsPct.toFixed(1)}%`;
    document.getElementById("kpi-opt-sub").textContent = `Best: ${bestSavings.model.displayName}`;
  } else {
    document.getElementById("kpi-opt-val").textContent = "0.0%";
    document.getElementById("kpi-opt-sub").textContent = "No active discount";
  }

  // Mobile Floating Spend Bar
  document.getElementById("mobile-spend-val").textContent = fmtUsd(lowest.calc.monthlyCost);

  // Render Top Models List
  const topList = document.getElementById("top-models-list");
  topList.innerHTML = "";
  const maxSpend = Math.max(...results.slice(0, 6).map(r => r.calc.monthlyCost), 1);

  results.slice(0, 6).forEach((r, idx) => {
    const isLowest = idx === 0;
    const pctWidth = Math.max(8, Math.round((r.calc.monthlyCost / maxSpend) * 100));
    
    let lifecycleChip = `<span class="lifecycle-chip lifecycle-${r.model.lifecycle}">${r.model.lifecycle}</span>`;

    const item = document.createElement("div");
    item.className = `model-rank-item ${isLowest ? 'lowest-rank' : ''}`;
    item.innerHTML = `
      <div class="rank-row-top">
        <div class="rank-identity">
          <span class="rank-num">#${idx + 1}</span>
          <span class="rank-name">${r.model.displayName}</span>
          ${lifecycleChip}
        </div>
        <div class="rank-spend">
          <div class="rank-spend-month">${fmtUsd(r.calc.monthlyCost)}/mo</div>
          <div class="rank-spend-day">${fmtUsd(r.calc.dailyCost)}/day</div>
        </div>
      </div>
      <div class="rank-bar-bg">
        <div class="rank-bar-fill" style="width: ${pctWidth}%"></div>
      </div>
      <div class="rank-row-bottom">
        <span>${r.model.provider}</span>
        <span>${r.calc.canCache ? `<strong style="color:var(--cyan-500)">CACHE ACTIVE</strong>` : 'STANDARD'} · ${fmtUsd(r.calc.costPer1k)}/1k</span>
      </div>
    `;
    topList.appendChild(item);
  });
}

// Preset Selection
function selectPreset(id) {
  state.preset = id;
  const p = PRESETS[id];
  state.prefixTokens = p.prefix;
  state.dynamicTokens = p.dynamic;
  state.outputTokens = p.output;
  state.requestsPerDay = p.requests;
  state.hitRate = p.hitRate;
  state.writesPerHour = p.writes;
  state.useCaching = p.caching;
  state.useBatch = p.batch;
  state.turnsPerSession = p.turns;
  state.followUpTokens = p.followUp;

  // Update inputs
  document.getElementById("slider-prefix").value = p.prefix;
  document.getElementById("input-prefix").value = p.prefix.toLocaleString();

  document.getElementById("slider-dynamic").value = p.dynamic;
  document.getElementById("input-dynamic").value = p.dynamic.toLocaleString();

  document.getElementById("slider-output").value = p.output;
  document.getElementById("input-output").value = p.output.toLocaleString();

  document.getElementById("slider-requests").value = p.requests;
  document.getElementById("input-requests").value = p.requests.toLocaleString();

  document.getElementById("toggle-cache").classList.toggle("active", p.caching);
  document.getElementById("toggle-batch").classList.toggle("active", p.batch);

  // Update Preset Buttons UI
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.preset === id);
  });

  // Update Inline Contextual Profile Bar (Zero tooltip overlap!)
  document.getElementById("context-desc").textContent = p.desc;
  document.getElementById("context-prefix-tag").textContent = `Prefix: ${p.prefix.toLocaleString()} tok`;
  document.getElementById("context-out-tag").textContent = `Output: ${p.output.toLocaleString()} tok`;

  render();
}

// Event Listeners
window.addEventListener("DOMContentLoaded", () => {
  // Preset Clicks
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => selectPreset(btn.dataset.preset));
  });

  // Sliders Sync
  const bindSlider = (sliderId, inputId, stateKey) => {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    slider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      state[stateKey] = val;
      input.value = val.toLocaleString();
      render();
    });
    input.addEventListener("change", (e) => {
      const val = parseInt(e.target.value.replace(/,/g, ""), 10) || 0;
      state[stateKey] = val;
      slider.value = val;
      input.value = val.toLocaleString();
      render();
    });
  };

  bindSlider("slider-prefix", "input-prefix", "prefixTokens");
  bindSlider("slider-dynamic", "input-dynamic", "dynamicTokens");
  bindSlider("slider-output", "input-output", "outputTokens");
  bindSlider("slider-requests", "input-requests", "requestsPerDay");

  // Toggles
  document.getElementById("toggle-cache").addEventListener("click", function() {
    state.useCaching = !state.useCaching;
    this.classList.toggle("active", state.useCaching);
    render();
  });

  document.getElementById("toggle-batch").addEventListener("click", function() {
    state.useBatch = !state.useBatch;
    this.classList.toggle("active", state.useBatch);
    render();
  });

  document.getElementById("toggle-offpeak").addEventListener("click", function() {
    state.useOffPeak = !state.useOffPeak;
    this.classList.toggle("active", state.useOffPeak);
    render();
  });

  // Theme Toggle
  document.getElementById("theme-toggle-btn").addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", next);
    document.getElementById("theme-toggle-btn").textContent = next === "light" ? "☀" : "☾";
  });

  // Accordion
  document.getElementById("accordion-btn").addEventListener("click", () => {
    document.getElementById("advanced-accordion").classList.toggle("open");
  });

  // Initial select
  selectPreset("rag-qa");
});
