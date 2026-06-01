import { db } from "../../db.js";
import { createId, nowIso } from "../../utils.js";
import { getContributionTotalsByTaxYear } from "./contributionStore.js";
import { getJob } from "./jobsStore.js";
import { getMoneySettings } from "./moneySettingsStore.js";
import type { WorkLogEntry } from "../types.js";
import { buildAllocationRecommendation } from "../services/recommendationService.js";

type WorkLogRow = {
  id: string;
  work_date: string;
  year_label: string;
  job_id: string;
  hours: number;
  rate_override: number | null;
  effective_rate: number;
  gross_pay: number;
  est_tax_pct: number;
  est_net_pay: number;
  rec_spend: number;
  rec_invest: number;
  rec_cash: number;
  actual_spend: number;
  actual_invested_transfer: number;
  bank_balance: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

function toWorkLog(row: WorkLogRow): WorkLogEntry {
  return {
    id: row.id,
    workDate: row.work_date,
    yearLabel: row.year_label,
    jobId: row.job_id,
    hours: row.hours,
    rateOverride: row.rate_override,
    effectiveRate: row.effective_rate,
    grossPay: row.gross_pay,
    estTaxPct: row.est_tax_pct,
    estNetPay: row.est_net_pay,
    recSpend: row.rec_spend,
    recInvest: row.rec_invest,
    recCash: row.rec_cash,
    actualSpend: row.actual_spend,
    actualInvestedTransfer: row.actual_invested_transfer,
    bankBalance: row.bank_balance,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getPriorBankBalance(workDate: string, fallback: number): number {
  const row = db
    .prepare(
      `
      SELECT bank_balance
      FROM money_work_logs
      WHERE work_date < ?
      ORDER BY work_date DESC, created_at DESC
      LIMIT 1
    `
    )
    .get(workDate) as { bank_balance: number } | undefined;

  return row?.bank_balance ?? fallback;
}

function computeWorkLogFields(input: {
  workDate: string;
  jobId: string;
  hours: number;
  rateOverride: number | null;
  actualSpend: number;
  actualInvestedTransfer: number;
  spendAmountOverride?: number;
  cashAmountOverride?: number;
  investAmountOverride?: number;
}) {
  const settings = getMoneySettings();
  const job = getJob(input.jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  const effectiveRate = input.rateOverride ?? job.effectiveHourly;
  const grossPay = input.hours * effectiveRate;
  const estTaxPct = job.estTaxPct;
  const estNetPay = grossPay * (1 - estTaxPct);
  const bankBalanceBefore = getPriorBankBalance(input.workDate, settings.startingBankBalance);
  const taxYear = Number(input.workDate.slice(0, 4));
  const totals = getContributionTotalsByTaxYear(taxYear);
  const recommendation = buildAllocationRecommendation({
    netPay: estNetPay,
    bankBalanceBefore,
    settings,
    contributionTotalsForYear: {
      rothIra: totals.roth_ira,
      k401: totals.k401,
      taxable: totals.taxable
    },
    spendAmountOverride: input.spendAmountOverride,
    cashAmountOverride: input.cashAmountOverride,
    investAmountOverride: input.investAmountOverride
  });

  const bankBalance = bankBalanceBefore + estNetPay - input.actualSpend - input.actualInvestedTransfer;

  return {
    effectiveRate,
    grossPay,
    estTaxPct,
    estNetPay,
    recSpend: recommendation.spendAmount,
    recInvest: recommendation.investAmount,
    recCash: recommendation.cashAmount,
    bankBalance
  };
}

export function listWorkLogs(filter?: { yearLabel?: string; from?: string; to?: string }): WorkLogEntry[] {
  const conditions: string[] = [];
  const args: string[] = [];

  if (filter?.yearLabel) {
    conditions.push("year_label = ?");
    args.push(filter.yearLabel);
  }
  if (filter?.from) {
    conditions.push("work_date >= ?");
    args.push(filter.from);
  }
  if (filter?.to) {
    conditions.push("work_date <= ?");
    args.push(filter.to);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM money_work_logs ${where} ORDER BY work_date ASC, created_at ASC`)
    .all(...args) as WorkLogRow[];
  return rows.map(toWorkLog);
}

export function createWorkLog(input: {
  workDate: string;
  yearLabel: string;
  jobId: string;
  hours: number;
  rateOverride?: number | null;
  actualSpend?: number;
  actualInvestedTransfer?: number;
  notes?: string;
  spendAmountOverride?: number;
  cashAmountOverride?: number;
  investAmountOverride?: number;
}): WorkLogEntry {
  const rateOverride = input.rateOverride ?? null;
  const actualSpend = input.actualSpend ?? 0;
  const actualInvestedTransfer = input.actualInvestedTransfer ?? 0;
  const calc = computeWorkLogFields({
    workDate: input.workDate,
    jobId: input.jobId,
    hours: input.hours,
    rateOverride,
    actualSpend,
    actualInvestedTransfer,
    spendAmountOverride: input.spendAmountOverride,
    cashAmountOverride: input.cashAmountOverride,
    investAmountOverride: input.investAmountOverride
  });

  const now = nowIso();
  const id = createId();
  db.prepare(
    `
    INSERT INTO money_work_logs (
      id,
      work_date,
      year_label,
      job_id,
      hours,
      rate_override,
      effective_rate,
      gross_pay,
      est_tax_pct,
      est_net_pay,
      rec_spend,
      rec_invest,
      rec_cash,
      actual_spend,
      actual_invested_transfer,
      bank_balance,
      notes,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    id,
    input.workDate,
    input.yearLabel,
    input.jobId,
    input.hours,
    rateOverride,
    calc.effectiveRate,
    calc.grossPay,
    calc.estTaxPct,
    calc.estNetPay,
    calc.recSpend,
    calc.recInvest,
    calc.recCash,
    actualSpend,
    actualInvestedTransfer,
    calc.bankBalance,
    input.notes ?? "",
    now,
    now
  );

  const row = db.prepare("SELECT * FROM money_work_logs WHERE id = ?").get(id) as WorkLogRow;
  return toWorkLog(row);
}

export function updateWorkLog(
  id: string,
  input: Partial<{
    workDate: string;
    yearLabel: string;
    jobId: string;
    hours: number;
    rateOverride: number | null;
    actualSpend: number;
    actualInvestedTransfer: number;
    notes: string;
    spendAmountOverride: number;
    cashAmountOverride: number;
    investAmountOverride: number;
  }>
): WorkLogEntry | null {
  const current = db.prepare("SELECT * FROM money_work_logs WHERE id = ?").get(id) as WorkLogRow | undefined;
  if (!current) {
    return null;
  }

  const next = {
    workDate: input.workDate ?? current.work_date,
    yearLabel: input.yearLabel ?? current.year_label,
    jobId: input.jobId ?? current.job_id,
    hours: input.hours ?? current.hours,
    rateOverride: input.rateOverride === undefined ? current.rate_override : input.rateOverride,
    actualSpend: input.actualSpend ?? current.actual_spend,
    actualInvestedTransfer: input.actualInvestedTransfer ?? current.actual_invested_transfer,
    notes: input.notes ?? current.notes,
    spendAmountOverride: input.spendAmountOverride,
    cashAmountOverride: input.cashAmountOverride,
    investAmountOverride: input.investAmountOverride
  };

  const calc = computeWorkLogFields({
    workDate: next.workDate,
    jobId: next.jobId,
    hours: next.hours,
    rateOverride: next.rateOverride,
    actualSpend: next.actualSpend,
    actualInvestedTransfer: next.actualInvestedTransfer,
    spendAmountOverride: next.spendAmountOverride,
    cashAmountOverride: next.cashAmountOverride,
    investAmountOverride: next.investAmountOverride
  });

  db.prepare(
    `
    UPDATE money_work_logs
    SET
      work_date = ?,
      year_label = ?,
      job_id = ?,
      hours = ?,
      rate_override = ?,
      effective_rate = ?,
      gross_pay = ?,
      est_tax_pct = ?,
      est_net_pay = ?,
      rec_spend = ?,
      rec_invest = ?,
      rec_cash = ?,
      actual_spend = ?,
      actual_invested_transfer = ?,
      bank_balance = ?,
      notes = ?,
      updated_at = ?
    WHERE id = ?
  `
  ).run(
    next.workDate,
    next.yearLabel,
    next.jobId,
    next.hours,
    next.rateOverride,
    calc.effectiveRate,
    calc.grossPay,
    calc.estTaxPct,
    calc.estNetPay,
    calc.recSpend,
    calc.recInvest,
    calc.recCash,
    next.actualSpend,
    next.actualInvestedTransfer,
    calc.bankBalance,
    next.notes,
    nowIso(),
    id
  );

  const row = db.prepare("SELECT * FROM money_work_logs WHERE id = ?").get(id) as WorkLogRow;
  return toWorkLog(row);
}

export function deleteWorkLog(id: string): boolean {
  const res = db.prepare("DELETE FROM money_work_logs WHERE id = ?").run(id);
  return res.changes > 0;
}

export function summarizeWorkLogs(): {
  totalGrossPay: number;
  totalNetPay: number;
  totalRecommendedInvesting: number;
  actualInvestedTransfers: number;
  latestBankBalance: number;
} {
  const totals = db
    .prepare(
      `
      SELECT
        COALESCE(SUM(gross_pay), 0) AS gross_pay,
        COALESCE(SUM(est_net_pay), 0) AS net_pay,
        COALESCE(SUM(rec_invest), 0) AS rec_invest,
        COALESCE(SUM(actual_invested_transfer), 0) AS actual_invest
      FROM money_work_logs
    `
    )
    .get() as {
    gross_pay: number;
    net_pay: number;
    rec_invest: number;
    actual_invest: number;
  };

  const last = db
    .prepare("SELECT bank_balance FROM money_work_logs ORDER BY work_date DESC, created_at DESC LIMIT 1")
    .get() as { bank_balance: number } | undefined;

  return {
    totalGrossPay: totals.gross_pay,
    totalNetPay: totals.net_pay,
    totalRecommendedInvesting: totals.rec_invest,
    actualInvestedTransfers: totals.actual_invest,
    latestBankBalance: last?.bank_balance ?? getMoneySettings().startingBankBalance
  };
}
