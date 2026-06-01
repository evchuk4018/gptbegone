import { Router } from "express";
import {
  createContributionSchema,
  createHoldingSchema,
  createJobSchema,
  createWorkLogSchema,
  paycheckCheckSchema,
  recommendationPreviewSchema,
  recurringExpenseSchema,
  updateHoldingSchema,
  updateJobSchema,
  updateMoneySettingsSchema,
  updatePriceSchema,
  updateWorkLogSchema,
  upsertBudgetCategoriesSchema
} from "./schemas.js";
import { createContribution, listContributions } from "./storage/contributionStore.js";
import { createHolding, deleteHolding, listHoldings, updateHolding, updatePrices } from "./storage/holdingsStore.js";
import { createJob, deleteJob, listJobs, updateJob } from "./storage/jobsStore.js";
import { getMoneySettings, updateMoneySettings } from "./storage/moneySettingsStore.js";
import { listPaycheckCheckHistory } from "./storage/paycheckCheckStore.js";
import { createWorkLog, deleteWorkLog, listWorkLogs, updateWorkLog } from "./storage/workLogStore.js";
import { getMoneyDashboardSnapshot } from "./services/dashboardService.js";
import { runPaycheckCheck } from "./services/paycheckCheckService.js";
import { previewRecommendation } from "./services/recommendationPreviewService.js";
import {
  createRecurringExpense,
  deleteRecurringExpense,
  listBudgetCategories,
  listRecurringExpenses,
  summarizeBudgetActual,
  upsertBudgetCategories
} from "./storage/budgetStore.js";

export function createMoneyRouter(): Router {
  const router = Router();

  router.get("/settings", (_req, res) => {
    res.json(getMoneySettings());
  });

  router.put("/settings", (req, res) => {
    const parsed = updateMoneySettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.json(updateMoneySettings(parsed.data));
  });

  router.get("/jobs", (_req, res) => {
    res.json(listJobs());
  });

  router.post("/jobs", (req, res) => {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.status(201).json(createJob(parsed.data));
  });

  router.put("/jobs/:id", (req, res) => {
    const parsed = updateJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const updated = updateJob(req.params.id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: "Job not found" });
    }
    return res.json(updated);
  });

  router.delete("/jobs/:id", (req, res) => {
    const ok = deleteJob(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Job not found" });
    }
    return res.status(204).send();
  });

  router.get("/work-logs", (req, res) => {
    const yearLabel = typeof req.query.yearLabel === "string" ? req.query.yearLabel : undefined;
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    return res.json(listWorkLogs({ yearLabel, from, to }));
  });

  router.post("/work-logs", (req, res) => {
    const parsed = createWorkLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      return res.status(201).json(createWorkLog(parsed.data));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create work log";
      return res.status(400).json({ error: message });
    }
  });

  router.put("/work-logs/:id", (req, res) => {
    const parsed = updateWorkLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      const updated = updateWorkLog(req.params.id, parsed.data);
      if (!updated) {
        return res.status(404).json({ error: "Work log not found" });
      }
      return res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update work log";
      return res.status(400).json({ error: message });
    }
  });

  router.delete("/work-logs/:id", (req, res) => {
    const ok = deleteWorkLog(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Work log not found" });
    }
    return res.status(204).send();
  });

  router.post("/paycheck-check", (req, res) => {
    const parsed = paycheckCheckSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.status(201).json(runPaycheckCheck(parsed.data));
  });

  router.get("/paycheck-check/history", (_req, res) => {
    return res.json(listPaycheckCheckHistory());
  });

  router.get("/budget/categories", (req, res) => {
    const month = typeof req.query.month === "string" ? req.query.month : "";
    if (!month) {
      return res.status(400).json({ error: "month query is required (YYYY-MM)" });
    }
    return res.json(listBudgetCategories(month));
  });

  router.put("/budget/categories", (req, res) => {
    const parsed = upsertBudgetCategoriesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.json(upsertBudgetCategories(parsed.data.month, parsed.data.categories));
  });

  router.get("/budget/recurring", (_req, res) => {
    return res.json(listRecurringExpenses());
  });

  router.post("/budget/recurring", (req, res) => {
    const parsed = recurringExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.status(201).json(createRecurringExpense(parsed.data));
  });

  router.delete("/budget/recurring/:id", (req, res) => {
    const ok = deleteRecurringExpense(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Recurring expense not found" });
    }
    return res.status(204).send();
  });

  router.get("/budget/summary", (req, res) => {
    const month = typeof req.query.month === "string" ? req.query.month : "";
    if (!month) {
      return res.status(400).json({ error: "month query is required (YYYY-MM)" });
    }
    return res.json(summarizeBudgetActual(month));
  });

  router.get("/holdings", (_req, res) => {
    return res.json(listHoldings());
  });

  router.post("/holdings", (req, res) => {
    const parsed = createHoldingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.status(201).json(createHolding(parsed.data));
  });

  router.put("/holdings/:id", (req, res) => {
    const parsed = updateHoldingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const updated = updateHolding(req.params.id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: "Holding not found" });
    }
    return res.json(updated);
  });

  router.delete("/holdings/:id", (req, res) => {
    const ok = deleteHolding(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Holding not found" });
    }
    return res.status(204).send();
  });

  router.post("/prices", (req, res) => {
    const parsed = updatePriceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    updatePrices(parsed.data);
    return res.status(202).json({ accepted: true });
  });

  router.get("/contributions", (req, res) => {
    const year = typeof req.query.taxYear === "string" ? Number(req.query.taxYear) : undefined;
    return res.json(listContributions(Number.isFinite(year) ? year : undefined));
  });

  router.post("/contributions", (req, res) => {
    const parsed = createContributionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.status(201).json(createContribution(parsed.data));
  });

  router.post("/recommendations", (req, res) => {
    const parsed = recommendationPreviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.json(previewRecommendation(parsed.data));
  });

  router.get("/dashboard", (_req, res) => {
    return res.json(getMoneyDashboardSnapshot());
  });

  return router;
}
