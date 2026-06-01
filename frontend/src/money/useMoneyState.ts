import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type {
  AllocationRecommendation,
  BudgetActual,
  BudgetCategoryPlan,
  HoldingValuation,
  JobProfile,
  MoneyDashboardSnapshot,
  MoneySettings,
  PaycheckCheckResult,
  RecurringExpense,
  WorkLogEntry
} from "../types";

const monthFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit"
});

function defaultMonth(): string {
  return monthFormatter.format(new Date()).slice(0, 7);
}

type WorkLogForm = {
  workDate: string;
  yearLabel: string;
  jobId: string;
  hours: string;
  rateOverride: string;
  actualSpend: string;
  actualInvestedTransfer: string;
  notes: string;
};

type PaycheckForm = {
  yearLabel: string;
  startDate: string;
  endDate: string;
  jobId: string;
  grossReceived: string;
  tolerance: string;
};

type HoldingForm = {
  holdingDate: string;
  accountName: string;
  ticker: string;
  displayName: string;
  assetType: "stock" | "crypto" | "bond" | "mutual_fund" | "etf" | "cash" | "other";
  units: string;
  costBasisPerUnit: string;
  currentPrice: string;
  sector: string;
  notes: string;
};

type BudgetForm = {
  categoryName: string;
  plannedAmount: string;
  actualAmountOverride: string;
  notes: string;
};

type PriceUpdateForm = {
  ticker: string;
  price: string;
  priceDate: string;
};

type RecommendationForm = {
  netPay: string;
  bankBalanceBefore: string;
  workDate: string;
};

export function useMoneyState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<MoneyDashboardSnapshot | null>(null);
  const [settings, setSettings] = useState<MoneySettings | null>(null);
  const [jobs, setJobs] = useState<JobProfile[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLogEntry[]>([]);
  const [holdings, setHoldings] = useState<HoldingValuation[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategoryPlan[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetActual[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [paycheckResult, setPaycheckResult] = useState<PaycheckCheckResult | null>(null);
  const [previewRecommendation, setPreviewRecommendation] = useState<AllocationRecommendation | null>(null);
  const [month, setMonth] = useState(defaultMonth());

  const [workLogForm, setWorkLogForm] = useState<WorkLogForm>({
    workDate: new Date().toISOString().slice(0, 10),
    yearLabel: "Year 1 Jobs",
    jobId: "",
    hours: "",
    rateOverride: "",
    actualSpend: "",
    actualInvestedTransfer: "",
    notes: ""
  });

  const [paycheckForm, setPaycheckForm] = useState<PaycheckForm>({
    yearLabel: "Year 1 Jobs",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    jobId: "all",
    grossReceived: "",
    tolerance: "1"
  });

  const [holdingForm, setHoldingForm] = useState<HoldingForm>({
    holdingDate: new Date().toISOString().slice(0, 10),
    accountName: "Brokerage",
    ticker: "",
    displayName: "",
    assetType: "stock",
    units: "",
    costBasisPerUnit: "",
    currentPrice: "",
    sector: "",
    notes: ""
  });

  const [budgetForm, setBudgetForm] = useState<BudgetForm>({
    categoryName: "",
    plannedAmount: "",
    actualAmountOverride: "",
    notes: ""
  });

  const [priceUpdateForm, setPriceUpdateForm] = useState<PriceUpdateForm>({
    ticker: "",
    price: "",
    priceDate: new Date().toISOString().slice(0, 10)
  });

  const [recommendationForm, setRecommendationForm] = useState<RecommendationForm>({
    netPay: "",
    bankBalanceBefore: "",
    workDate: new Date().toISOString().slice(0, 10)
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextDashboard, nextSettings, nextJobs, nextWorkLogs, nextHoldings, nextCategories, nextSummary, nextRecurring] =
        await Promise.all([
          api.getMoneyDashboard(),
          api.getMoneySettings(),
          api.listMoneyJobs(),
          api.listWorkLogs({ yearLabel: "Year 1 Jobs" }),
          api.listHoldings(),
          api.getBudgetCategories(month),
          api.getBudgetSummary(month),
          api.listRecurringExpenses()
        ]);
      setDashboard(nextDashboard);
      setSettings(nextSettings);
      setJobs(nextJobs);
      setWorkLogs(nextWorkLogs);
      setHoldings(nextHoldings);
      setBudgetCategories(nextCategories);
      setBudgetSummary(nextSummary);
      setRecurringExpenses(nextRecurring);
      setWorkLogForm((prev) => ({ ...prev, jobId: prev.jobId || nextJobs[0]?.id || "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load money module");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const submitWorkLog = useCallback(async () => {
    if (!workLogForm.jobId || !workLogForm.hours) {
      return;
    }
    await api.createWorkLog({
      workDate: workLogForm.workDate,
      yearLabel: workLogForm.yearLabel,
      jobId: workLogForm.jobId,
      hours: Number(workLogForm.hours),
      rateOverride: workLogForm.rateOverride ? Number(workLogForm.rateOverride) : undefined,
      actualSpend: workLogForm.actualSpend ? Number(workLogForm.actualSpend) : 0,
      actualInvestedTransfer: workLogForm.actualInvestedTransfer ? Number(workLogForm.actualInvestedTransfer) : 0,
      notes: workLogForm.notes
    });
    await reload();
  }, [reload, workLogForm]);

  const submitPaycheckCheck = useCallback(async () => {
    if (!paycheckForm.grossReceived) {
      return;
    }
    const result = await api.runPaycheckCheck({
      yearLabel: paycheckForm.yearLabel,
      startDate: paycheckForm.startDate,
      endDate: paycheckForm.endDate,
      jobId: paycheckForm.jobId,
      grossReceived: Number(paycheckForm.grossReceived),
      tolerance: Number(paycheckForm.tolerance || "0")
    });
    setPaycheckResult(result);
  }, [paycheckForm]);

  const submitBudgetCategory = useCallback(async () => {
    if (!budgetForm.categoryName || !budgetForm.plannedAmount) {
      return;
    }
    const categories = [
      ...budgetCategories.map((category) => ({
        categoryName: category.categoryName,
        plannedAmount: category.plannedAmount,
        actualAmountOverride: category.actualAmountOverride,
        notes: category.notes
      })),
      {
        categoryName: budgetForm.categoryName,
        plannedAmount: Number(budgetForm.plannedAmount),
        actualAmountOverride: budgetForm.actualAmountOverride ? Number(budgetForm.actualAmountOverride) : null,
        notes: budgetForm.notes
      }
    ];

    await api.upsertBudgetCategories({ month, categories });
    setBudgetForm({ categoryName: "", plannedAmount: "", actualAmountOverride: "", notes: "" });
    await reload();
  }, [budgetCategories, budgetForm, month, reload]);

  const submitHolding = useCallback(async () => {
    if (!holdingForm.ticker || !holdingForm.displayName || !holdingForm.units || !holdingForm.costBasisPerUnit) {
      return;
    }
    await api.createHolding({
      holdingDate: holdingForm.holdingDate,
      accountName: holdingForm.accountName,
      ticker: holdingForm.ticker,
      displayName: holdingForm.displayName,
      assetType: holdingForm.assetType,
      units: Number(holdingForm.units),
      costBasisPerUnit: Number(holdingForm.costBasisPerUnit),
      currentPrice: holdingForm.currentPrice ? Number(holdingForm.currentPrice) : undefined,
      sector: holdingForm.sector,
      notes: holdingForm.notes
    });
    setHoldingForm((prev) => ({ ...prev, ticker: "", displayName: "", units: "", costBasisPerUnit: "", currentPrice: "" }));
    await reload();
  }, [holdingForm, reload]);

  const submitPriceUpdate = useCallback(async () => {
    if (!priceUpdateForm.ticker || !priceUpdateForm.price) {
      return;
    }
    await api.updatePrice({
      ticker: priceUpdateForm.ticker,
      price: Number(priceUpdateForm.price),
      priceDate: priceUpdateForm.priceDate
    });
    setPriceUpdateForm((prev) => ({ ...prev, ticker: "", price: "" }));
    await reload();
  }, [priceUpdateForm, reload]);

  const saveMoneySettings = useCallback(
    async (next: Partial<MoneySettings>) => {
      const updated = await api.updateMoneySettings(next);
      setSettings(updated);
      await reload();
    },
    [reload]
  );

  const generateRecommendationPreview = useCallback(async () => {
    if (!recommendationForm.netPay || !recommendationForm.bankBalanceBefore) {
      return;
    }
    const rec = await api.previewRecommendation({
      netPay: Number(recommendationForm.netPay),
      bankBalanceBefore: Number(recommendationForm.bankBalanceBefore),
      workDate: recommendationForm.workDate
    });
    setPreviewRecommendation(rec);
  }, [recommendationForm]);

  const totals = useMemo(() => {
    const plannedBudget = budgetSummary.reduce((sum, item) => sum + item.plannedAmount, 0);
    const actualBudget = budgetSummary.reduce((sum, item) => sum + item.actualAmount, 0);
    return {
      plannedBudget,
      actualBudget,
      variance: plannedBudget - actualBudget
    };
  }, [budgetSummary]);

  return {
    loading,
    error,
    dashboard,
    settings,
    jobs,
    workLogs,
    holdings,
    budgetCategories,
    budgetSummary,
    recurringExpenses,
    paycheckResult,
    previewRecommendation,
    month,
    totals,
    workLogForm,
    paycheckForm,
    holdingForm,
    budgetForm,
    priceUpdateForm,
    recommendationForm,
    setMonth,
    setWorkLogForm,
    setPaycheckForm,
    setHoldingForm,
    setBudgetForm,
    setPriceUpdateForm,
    setRecommendationForm,
    submitWorkLog,
    submitPaycheckCheck,
    submitBudgetCategory,
    submitHolding,
    submitPriceUpdate,
    saveMoneySettings,
    generateRecommendationPreview,
    reload
  };
}
