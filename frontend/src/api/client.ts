import type {
  AllocationRecommendation,
  BudgetActual,
  BudgetCategoryPlan,
  ChatDetail,
  ChatMode,
  ChatSummary,
  HoldingValuation,
  InstalledModel,
  JobProfile,
  MoneyDashboardSnapshot,
  MoneySettings,
  PaycheckCheckResult,
  ProviderName,
  RecurringExpense,
  Settings,
  WorkLogEntry
} from "../types";

const API = "http://localhost:3001/api";

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export const api = {
  listChats() {
    return json<ChatSummary[]>("/chats");
  },
  createChat(payload?: Partial<ChatSummary>) {
    return json<ChatSummary>("/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {})
    });
  },
  getChat(chatId: string) {
    return json<ChatDetail>(`/chats/${chatId}`);
  },
  deleteChat(chatId: string) {
    return json<void>(`/chats/${chatId}`, { method: "DELETE" });
  },
  stop(chatId: string) {
    return json<{ stopped: boolean }>(`/chats/${chatId}/stop`, { method: "POST" });
  },
  listInstalledModels() {
    return json<InstalledModel[]>("/models/installed");
  },
  downloadModel(input: { provider: ProviderName; model?: string; hfRepo?: string; fileName?: string }) {
    return json<{ accepted: boolean }>("/models/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  getSettings() {
    return json<Settings>("/settings");
  },
  updateSettings(input: Partial<Settings>) {
    return json<Settings>("/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  async streamMessage(
    chatId: string,
    input: { prompt: string; provider: ProviderName; model: string; mode: ChatMode },
    onChunk: (chunk: string) => void,
    signal: AbortSignal
  ) {
    const res = await fetch(`${API}/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal
    });
    if (!res.ok || !res.body) {
      throw new Error(`Stream failed: ${res.status}`);
    }

    const decoder = new TextDecoder();
    let buffer = "";
    const reader = res.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const event of events) {
        const line = event
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l.startsWith("data: "));
        if (!line) {
          continue;
        }
        const payload = JSON.parse(line.slice(6)) as { chunk?: string; done?: boolean; error?: string };
        if (payload.error) {
          throw new Error(payload.error);
        }
        if (payload.chunk) {
          onChunk(payload.chunk);
        }
        if (payload.done) {
          return;
        }
      }
    }
  },
  getMoneySettings() {
    return json<MoneySettings>("/money/settings");
  },
  updateMoneySettings(input: Partial<MoneySettings>) {
    return json<MoneySettings>("/money/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  listMoneyJobs() {
    return json<JobProfile[]>("/money/jobs");
  },
  createMoneyJob(input: {
    name: string;
    payType: "hourly" | "salary";
    hourlyRate: number;
    annualSalary: number;
    estTaxPct: number;
    notes?: string;
    active?: boolean;
  }) {
    return json<JobProfile>("/money/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  listWorkLogs(filter?: { yearLabel?: string; from?: string; to?: string }) {
    const params = new URLSearchParams();
    if (filter?.yearLabel) {
      params.set("yearLabel", filter.yearLabel);
    }
    if (filter?.from) {
      params.set("from", filter.from);
    }
    if (filter?.to) {
      params.set("to", filter.to);
    }
    const query = params.toString();
    return json<WorkLogEntry[]>(`/money/work-logs${query ? `?${query}` : ""}`);
  },
  createWorkLog(input: {
    workDate: string;
    yearLabel: string;
    jobId: string;
    hours: number;
    rateOverride?: number | null;
    actualSpend?: number;
    actualInvestedTransfer?: number;
    notes?: string;
  }) {
    return json<WorkLogEntry>("/money/work-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  runPaycheckCheck(input: {
    yearLabel: string;
    startDate: string;
    endDate: string;
    jobId: string | "all";
    grossReceived: number;
    tolerance: number;
  }) {
    return json<PaycheckCheckResult>("/money/paycheck-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  getBudgetCategories(month: string) {
    return json<BudgetCategoryPlan[]>(`/money/budget/categories?month=${encodeURIComponent(month)}`);
  },
  upsertBudgetCategories(input: {
    month: string;
    categories: Array<{ categoryName: string; plannedAmount: number; actualAmountOverride?: number | null; notes?: string }>;
  }) {
    return json<BudgetCategoryPlan[]>("/money/budget/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  getBudgetSummary(month: string) {
    return json<BudgetActual[]>(`/money/budget/summary?month=${encodeURIComponent(month)}`);
  },
  listRecurringExpenses() {
    return json<RecurringExpense[]>("/money/budget/recurring");
  },
  createRecurringExpense(input: {
    categoryName: string;
    expenseName: string;
    amount: number;
    startMonth: string;
    endMonth?: string | null;
    dayOfMonth: number;
    notes?: string;
    active?: boolean;
  }) {
    return json<RecurringExpense>("/money/budget/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  listHoldings() {
    return json<HoldingValuation[]>("/money/holdings");
  },
  createHolding(input: {
    holdingDate: string;
    accountName: string;
    ticker: string;
    displayName: string;
    assetType: "stock" | "crypto" | "bond" | "mutual_fund" | "etf" | "cash" | "other";
    units: number;
    costBasisPerUnit: number;
    currentPrice?: number;
    sector?: string;
    notes?: string;
  }) {
    return json<HoldingValuation>("/money/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  updatePrice(input: { ticker: string; price: number; priceDate: string; notes?: string }) {
    return json<{ accepted: boolean }>("/money/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  previewRecommendation(input: {
    netPay: number;
    bankBalanceBefore: number;
    workDate: string;
    spendAmountOverride?: number;
    cashAmountOverride?: number;
    investAmountOverride?: number;
  }) {
    return json<AllocationRecommendation>("/money/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  getMoneyDashboard() {
    return json<MoneyDashboardSnapshot>("/money/dashboard");
  }
};
