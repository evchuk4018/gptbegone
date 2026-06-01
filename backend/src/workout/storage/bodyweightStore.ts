import { db } from "../../db.js";
import { createId, nowIso } from "../../utils.js";
import type { BodyweightEntry } from "../types.js";

type BodyweightEntryRow = {
  id: string;
  entry_date: string;
  weight: number;
  notes: string;
  created_at: string;
};

function toBodyweightEntry(row: BodyweightEntryRow): BodyweightEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    weight: row.weight,
    notes: row.notes,
    createdAt: row.created_at
  };
}

export function listBodyweightEntries(filter?: { from?: string; to?: string }): BodyweightEntry[] {
  const clauses: string[] = [];
  const args: string[] = [];
  if (filter?.from) {
    clauses.push("entry_date >= ?");
    args.push(filter.from);
  }
  if (filter?.to) {
    clauses.push("entry_date <= ?");
    args.push(filter.to);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM workout_bodyweight_entries ${where} ORDER BY entry_date DESC, created_at DESC`)
    .all(...args) as BodyweightEntryRow[];
  return rows.map(toBodyweightEntry);
}

export function createBodyweightEntry(input: { entryDate: string; weight: number; notes?: string }): BodyweightEntry {
  const id = createId();
  const now = nowIso();
  db.prepare(
    `
    INSERT INTO workout_bodyweight_entries (id, entry_date, weight, notes, created_at)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(id, input.entryDate, input.weight, input.notes ?? "", now);

  const row = db.prepare("SELECT * FROM workout_bodyweight_entries WHERE id = ?").get(id) as BodyweightEntryRow;
  return toBodyweightEntry(row);
}
