import { db } from "../../db.js";
import type { BudgetActual, BudgetCategoryPlan, RecurringExpense } from "../types.js";
import { createId, nowIso } from "../../utils.js";

type BudgetCategoryRow = {
  id: string;
  month: string;
  category_name: string;
  planned_amount: number;
  actual_amount_override: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

type RecurringRow = {
  id: string;
  category_name: string;
  expense_name: string;
  amount: number;
  start_month: string;
  end_month: string | null;
  day_of_month: number;
  notes: string;
  active: number;
  created_at: string;
  updated_at: string;
};

function toCategoryPlan(row: BudgetCategoryRow): BudgetCategoryPlan {
  return {
    id: row.id,
    month: row.month,
    categoryName: row.category_name,
    plannedAmount: row.planned_amount,
    actualAmountOverride: row.actual_amount_override,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toRecurringExpense(row: RecurringRow): RecurringExpense {
  return {
    id: row.id,
    categoryName: row.category_name,
    expenseName: row.expense_name,
    amount: row.amount,
    startMonth: row.start_month,
    endMonth: row.end_month,
    dayOfMonth: row.day_of_month,
    notes: row.notes,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function listBudgetCategories(month: string): BudgetCategoryPlan[] {
  const rows = db
    .prepare("SELECT * FROM money_budget_categories WHERE month = ? ORDER BY category_name ASC")
    .all(month) as BudgetCategoryRow[];
  return rows.map(toCategoryPlan);
}

export function upsertBudgetCategories(
  month: string,
  categories: Array<{ categoryName: string; plannedAmount: number; actualAmountOverride?: number | null; notes?: string }>
): BudgetCategoryPlan[] {
  const tx = db.transaction(() => {
    for (const category of categories) {
      const existing = db
        .prepare("SELECT id FROM money_budget_categories WHERE month = ? AND category_name = ?")
        .get(month, category.categoryName) as { id: string } | undefined;

      if (existing) {
        db.prepare(
          `
          UPDATE money_budget_categories
          SET planned_amount = ?, actual_amount_override = ?, notes = ?, updated_at = ?
          WHERE id = ?
        `
        ).run(category.plannedAmount, category.actualAmountOverride ?? null, category.notes ?? "", nowIso(), existing.id);
      } else {
        const now = nowIso();
        db.prepare(
          `
          INSERT INTO money_budget_categories
          (id, month, category_name, planned_amount, actual_amount_override, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
        ).run(
          createId(),
          month,
          category.categoryName,
          category.plannedAmount,
          category.actualAmountOverride ?? null,
          category.notes ?? "",
          now,
          now
        );
      }
    }
  });
  tx();
  return listBudgetCategories(month);
}

export function listRecurringExpenses(): RecurringExpense[] {
  const rows = db.prepare("SELECT * FROM money_recurring_expenses ORDER BY category_name, expense_name").all() as RecurringRow[];
  return rows.map(toRecurringExpense);
}

export function createRecurringExpense(input: {
  categoryName: string;
  expenseName: string;
  amount: number;
  startMonth: string;
  endMonth?: string | null;
  dayOfMonth: number;
  notes?: string;
  active?: boolean;
}): RecurringExpense {
  const id = createId();
  const now = nowIso();
  db.prepare(
    `
    INSERT INTO money_recurring_expenses (
      id,
      category_name,
      expense_name,
      amount,
      start_month,
      end_month,
      day_of_month,
      notes,
      active,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    id,
    input.categoryName,
    input.expenseName,
    input.amount,
    input.startMonth,
    input.endMonth ?? null,
    input.dayOfMonth,
    input.notes ?? "",
    Number(input.active ?? true),
    now,
    now
  );

  const row = db.prepare("SELECT * FROM money_recurring_expenses WHERE id = ?").get(id) as RecurringRow;
  return toRecurringExpense(row);
}

export function deleteRecurringExpense(id: string): boolean {
  const res = db.prepare("DELETE FROM money_recurring_expenses WHERE id = ?").run(id);
  return res.changes > 0;
}

function monthBetweenInclusive(month: string, startMonth: string, endMonth: string | null): boolean {
  if (month < startMonth) {
    return false;
  }
  if (endMonth && month > endMonth) {
    return false;
  }
  return true;
}

export function summarizeBudgetActual(month: string): BudgetActual[] {
  const categories = listBudgetCategories(month);
  const recurring = listRecurringExpenses().filter((item) => item.active && monthBetweenInclusive(month, item.startMonth, item.endMonth));

  const recurringByCategory = new Map<string, number>();
  for (const item of recurring) {
    const current = recurringByCategory.get(item.categoryName) ?? 0;
    recurringByCategory.set(item.categoryName, current + item.amount);
  }

  return categories.map((category) => {
    const recurringAmount = recurringByCategory.get(category.categoryName) ?? 0;
    const actualAmount = category.actualAmountOverride ?? recurringAmount;
    return {
      month,
      categoryName: category.categoryName,
      plannedAmount: category.plannedAmount,
      actualAmount,
      variance: category.plannedAmount - actualAmount
    };
  });
}
