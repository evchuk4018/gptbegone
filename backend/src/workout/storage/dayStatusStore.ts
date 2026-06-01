import { db } from "../../db.js";
import { nowIso } from "../../utils.js";
import type { WorkoutCalendarDay, WorkoutDayStatus } from "../types.js";

type WorkoutDayStatusRow = {
  status_date: string;
  is_rest_day: number;
  notes: string;
  updated_at: string;
};

function toWorkoutDayStatus(row: WorkoutDayStatusRow): WorkoutDayStatus {
  return {
    date: row.status_date,
    isRestDay: row.is_rest_day === 1,
    notes: row.notes,
    updatedAt: row.updated_at
  };
}

export function upsertWorkoutDayStatus(input: { date: string; isRestDay: boolean; notes?: string }): WorkoutDayStatus {
  const now = nowIso();
  db.prepare(
    `
    INSERT INTO workout_day_status (status_date, is_rest_day, notes, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(status_date)
    DO UPDATE SET is_rest_day = excluded.is_rest_day, notes = excluded.notes, updated_at = excluded.updated_at
  `
  ).run(input.date, input.isRestDay ? 1 : 0, input.notes ?? "", now);

  const row = db
    .prepare("SELECT * FROM workout_day_status WHERE status_date = ?")
    .get(input.date) as WorkoutDayStatusRow;
  return toWorkoutDayStatus(row);
}

export function listWorkoutCalendar(month: string): WorkoutCalendarDay[] {
  const monthPrefix = `${month}%`;
  const sessionRows = db
    .prepare(
      `
      SELECT workout_date AS status_date, COUNT(*) AS session_count
      FROM workout_sessions
      WHERE workout_date LIKE ?
      GROUP BY workout_date
    `
    )
    .all(monthPrefix) as Array<{ status_date: string; session_count: number }>;

  const statusRows = db
    .prepare(
      `
      SELECT *
      FROM workout_day_status
      WHERE status_date LIKE ?
    `
    )
    .all(monthPrefix) as WorkoutDayStatusRow[];

  const map = new Map<string, WorkoutCalendarDay>();
  for (const row of sessionRows) {
    map.set(row.status_date, {
      date: row.status_date,
      sessionCount: row.session_count,
      isRestDay: false,
      notes: ""
    });
  }

  for (const row of statusRows) {
    const existing = map.get(row.status_date) ?? {
      date: row.status_date,
      sessionCount: 0,
      isRestDay: false,
      notes: ""
    };
    existing.isRestDay = row.is_rest_day === 1;
    existing.notes = row.notes;
    map.set(row.status_date, existing);
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
