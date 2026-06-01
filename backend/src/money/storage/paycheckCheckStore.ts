import { db } from "../../db.js";
import { createId, nowIso } from "../../utils.js";
import type { PaycheckCheckResult } from "../types.js";

type PaycheckRow = {
  id: string;
  year_label: string;
  start_date: string;
  end_date: string;
  job_id: string | null;
  gross_received: number;
  tolerance: number;
  expected_gross: number;
  difference: number;
  total_hours: number;
  average_rate: number;
  missing_hours: number;
  status: "looks_ok" | "possible_missing_pay_or_hours" | "received_more_than_logged";
  created_at: string;
};

function toResult(row: PaycheckRow): PaycheckCheckResult {
  return {
    id: row.id,
    yearLabel: row.year_label,
    startDate: row.start_date,
    endDate: row.end_date,
    jobId: row.job_id ?? "all",
    grossReceived: row.gross_received,
    tolerance: row.tolerance,
    expectedGross: row.expected_gross,
    difference: row.difference,
    totalHours: row.total_hours,
    averageRate: row.average_rate,
    missingHours: row.missing_hours,
    status: row.status,
    createdAt: row.created_at
  };
}

export function createPaycheckCheckRecord(input: Omit<PaycheckCheckResult, "id" | "createdAt">): PaycheckCheckResult {
  const id = createId();
  const createdAt = nowIso();

  db.prepare(
    `
    INSERT INTO money_paycheck_checks (
      id,
      year_label,
      start_date,
      end_date,
      job_id,
      gross_received,
      tolerance,
      expected_gross,
      difference,
      total_hours,
      average_rate,
      missing_hours,
      status,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    id,
    input.yearLabel,
    input.startDate,
    input.endDate,
    input.jobId === "all" ? null : input.jobId,
    input.grossReceived,
    input.tolerance,
    input.expectedGross,
    input.difference,
    input.totalHours,
    input.averageRate,
    input.missingHours,
    input.status,
    createdAt
  );

  const row = db.prepare("SELECT * FROM money_paycheck_checks WHERE id = ?").get(id) as PaycheckRow;
  return toResult(row);
}

export function listPaycheckCheckHistory(limit = 20): PaycheckCheckResult[] {
  const rows = db
    .prepare("SELECT * FROM money_paycheck_checks ORDER BY created_at DESC LIMIT ?")
    .all(limit) as PaycheckRow[];
  return rows.map(toResult);
}
