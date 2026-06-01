import { db } from "../../db.js";
import type { JobProfile, PayType } from "../types.js";
import { createId, nowIso } from "../../utils.js";

type JobRow = {
  id: string;
  name: string;
  pay_type: PayType;
  hourly_rate: number;
  annual_salary: number;
  est_tax_pct: number;
  notes: string;
  active: number;
  created_at: string;
  updated_at: string;
};

function effectiveHourly(row: Pick<JobRow, "pay_type" | "hourly_rate" | "annual_salary">): number {
  return row.pay_type === "salary" ? row.annual_salary / 2080 : row.hourly_rate;
}

function toJob(row: JobRow): JobProfile {
  return {
    id: row.id,
    name: row.name,
    payType: row.pay_type,
    hourlyRate: row.hourly_rate,
    annualSalary: row.annual_salary,
    effectiveHourly: effectiveHourly(row),
    estTaxPct: row.est_tax_pct,
    notes: row.notes,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function listJobs(): JobProfile[] {
  const rows = db.prepare("SELECT * FROM money_jobs ORDER BY created_at ASC").all() as JobRow[];
  return rows.map(toJob);
}

export function getJob(jobId: string): JobProfile | null {
  const row = db.prepare("SELECT * FROM money_jobs WHERE id = ?").get(jobId) as JobRow | undefined;
  if (!row) {
    return null;
  }
  return toJob(row);
}

export function createJob(input: {
  name: string;
  payType: PayType;
  hourlyRate: number;
  annualSalary: number;
  estTaxPct: number;
  notes?: string;
  active?: boolean;
}): JobProfile {
  const now = nowIso();
  const id = createId();
  db.prepare(
    `
    INSERT INTO money_jobs (id, name, pay_type, hourly_rate, annual_salary, est_tax_pct, notes, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    id,
    input.name,
    input.payType,
    input.hourlyRate,
    input.annualSalary,
    input.estTaxPct,
    input.notes ?? "",
    Number(input.active ?? true),
    now,
    now
  );

  const row = db.prepare("SELECT * FROM money_jobs WHERE id = ?").get(id) as JobRow;
  return toJob(row);
}

export function updateJob(
  jobId: string,
  input: Partial<{
    name: string;
    payType: PayType;
    hourlyRate: number;
    annualSalary: number;
    estTaxPct: number;
    notes: string;
    active: boolean;
  }>
): JobProfile | null {
  const current = db.prepare("SELECT * FROM money_jobs WHERE id = ?").get(jobId) as JobRow | undefined;
  if (!current) {
    return null;
  }
  const next = {
    name: input.name ?? current.name,
    payType: input.payType ?? current.pay_type,
    hourlyRate: input.hourlyRate ?? current.hourly_rate,
    annualSalary: input.annualSalary ?? current.annual_salary,
    estTaxPct: input.estTaxPct ?? current.est_tax_pct,
    notes: input.notes ?? current.notes,
    active: input.active ?? Boolean(current.active)
  };

  db.prepare(
    `
    UPDATE money_jobs
    SET name = ?, pay_type = ?, hourly_rate = ?, annual_salary = ?, est_tax_pct = ?, notes = ?, active = ?, updated_at = ?
    WHERE id = ?
  `
  ).run(
    next.name,
    next.payType,
    next.hourlyRate,
    next.annualSalary,
    next.estTaxPct,
    next.notes,
    Number(next.active),
    nowIso(),
    jobId
  );

  const row = db.prepare("SELECT * FROM money_jobs WHERE id = ?").get(jobId) as JobRow;
  return toJob(row);
}

export function deleteJob(jobId: string): boolean {
  const res = db.prepare("DELETE FROM money_jobs WHERE id = ?").run(jobId);
  return res.changes > 0;
}
