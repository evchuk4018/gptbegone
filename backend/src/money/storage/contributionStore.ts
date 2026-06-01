import { db } from "../../db.js";
import type { ContributionAccountType, ContributionEntry } from "../types.js";
import { createId, nowIso } from "../../utils.js";

type ContributionRow = {
  id: string;
  entry_date: string;
  account_type: ContributionAccountType;
  contribution: number;
  employer_match: number;
  withdrawal: number;
  tax_year: number;
  notes: string;
  created_at: string;
};

function toContribution(row: ContributionRow): ContributionEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    accountType: row.account_type,
    contribution: row.contribution,
    employerMatch: row.employer_match,
    withdrawal: row.withdrawal,
    netContribution: row.contribution + row.employer_match - row.withdrawal,
    taxYear: row.tax_year,
    notes: row.notes,
    createdAt: row.created_at
  };
}

export function listContributions(taxYear?: number): ContributionEntry[] {
  const rows =
    taxYear !== undefined
      ? (db.prepare("SELECT * FROM money_contributions WHERE tax_year = ? ORDER BY entry_date ASC").all(taxYear) as ContributionRow[])
      : (db.prepare("SELECT * FROM money_contributions ORDER BY entry_date ASC").all() as ContributionRow[]);
  return rows.map(toContribution);
}

export function createContribution(input: {
  entryDate: string;
  accountType: ContributionAccountType;
  contribution: number;
  employerMatch?: number;
  withdrawal?: number;
  taxYear: number;
  notes?: string;
}): ContributionEntry {
  const id = createId();
  db.prepare(
    `
    INSERT INTO money_contributions (id, entry_date, account_type, contribution, employer_match, withdrawal, tax_year, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    id,
    input.entryDate,
    input.accountType,
    input.contribution,
    input.employerMatch ?? 0,
    input.withdrawal ?? 0,
    input.taxYear,
    input.notes ?? "",
    nowIso()
  );

  const row = db.prepare("SELECT * FROM money_contributions WHERE id = ?").get(id) as ContributionRow;
  return toContribution(row);
}

export function getContributionTotalsByTaxYear(taxYear: number): Record<ContributionAccountType, number> {
  const rows = db
    .prepare(
      `
      SELECT account_type, SUM(contribution + employer_match - withdrawal) AS net
      FROM money_contributions
      WHERE tax_year = ?
      GROUP BY account_type
    `
    )
    .all(taxYear) as Array<{ account_type: ContributionAccountType; net: number | null }>;

  const totals: Record<ContributionAccountType, number> = {
    roth_ira: 0,
    k401: 0,
    taxable: 0,
    cash: 0
  };

  for (const row of rows) {
    totals[row.account_type] = row.net ?? 0;
  }

  return totals;
}
