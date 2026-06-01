import { db } from "../../db.js";
import { createId, nowIso } from "../../utils.js";
import { getWorkoutExercise } from "./exerciseStore.js";
import { getWorkoutTemplate } from "./templateStore.js";
import type { WorkoutSession, WorkoutSessionItem, WorkoutSessionSet } from "../types.js";

type WorkoutSessionRow = {
  id: string;
  workout_date: string;
  title: string;
  template_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

type WorkoutSessionItemRow = {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  notes: string;
};

type WorkoutSessionSetRow = {
  id: string;
  session_item_id: string;
  set_index: number;
  reps: number | null;
  weight: number | null;
  duration_seconds: number | null;
  distance: number | null;
  pace: number | null;
  intensity: number | null;
  heart_rate: number | null;
  notes: string;
};

function toWorkoutSessionSet(row: WorkoutSessionSetRow): WorkoutSessionSet {
  return {
    id: row.id,
    sessionItemId: row.session_item_id,
    setIndex: row.set_index,
    reps: row.reps,
    weight: row.weight,
    durationSeconds: row.duration_seconds,
    distance: row.distance,
    pace: row.pace,
    intensity: row.intensity,
    heartRate: row.heart_rate,
    notes: row.notes
  };
}

function toWorkoutSessionItem(row: WorkoutSessionItemRow, sets: WorkoutSessionSet[]): WorkoutSessionItem {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    orderIndex: row.order_index,
    notes: row.notes,
    sets
  };
}

function toWorkoutSession(row: WorkoutSessionRow, items: WorkoutSessionItem[]): WorkoutSession {
  return {
    id: row.id,
    workoutDate: row.workout_date,
    title: row.title,
    templateId: row.template_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items
  };
}

function listItemsBySessionIds(sessionIds: string[]): Map<string, WorkoutSessionItem[]> {
  if (sessionIds.length === 0) {
    return new Map();
  }
  const placeholders = sessionIds.map(() => "?").join(",");
  const itemRows = db
    .prepare(
      `
      SELECT *
      FROM workout_session_items
      WHERE session_id IN (${placeholders})
      ORDER BY order_index ASC, id ASC
    `
    )
    .all(...sessionIds) as WorkoutSessionItemRow[];

  const itemIds = itemRows.map((item) => item.id);
  const setsByItemId = listSetsByItemIds(itemIds);
  const map = new Map<string, WorkoutSessionItem[]>();

  for (const itemRow of itemRows) {
    const list = map.get(itemRow.session_id) ?? [];
    list.push(toWorkoutSessionItem(itemRow, setsByItemId.get(itemRow.id) ?? []));
    map.set(itemRow.session_id, list);
  }
  return map;
}

function listSetsByItemIds(itemIds: string[]): Map<string, WorkoutSessionSet[]> {
  if (itemIds.length === 0) {
    return new Map();
  }
  const placeholders = itemIds.map(() => "?").join(",");
  const setRows = db
    .prepare(
      `
      SELECT *
      FROM workout_session_sets
      WHERE session_item_id IN (${placeholders})
      ORDER BY set_index ASC, id ASC
    `
    )
    .all(...itemIds) as WorkoutSessionSetRow[];

  const map = new Map<string, WorkoutSessionSet[]>();
  for (const setRow of setRows) {
    const list = map.get(setRow.session_item_id) ?? [];
    list.push(toWorkoutSessionSet(setRow));
    map.set(setRow.session_item_id, list);
  }
  return map;
}

function replaceSessionItems(
  sessionId: string,
  items: Array<{
    exerciseId: string;
    orderIndex?: number;
    notes?: string;
    sets: Array<{
      setIndex?: number;
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
      distance?: number | null;
      pace?: number | null;
      intensity?: number | null;
      heartRate?: number | null;
      notes?: string;
    }>;
  }>
) {
  db.prepare("DELETE FROM workout_session_items WHERE session_id = ?").run(sessionId);

  const insertItem = db.prepare(
    `
    INSERT INTO workout_session_items (
      id,
      session_id,
      exercise_id,
      order_index,
      notes
    ) VALUES (?, ?, ?, ?, ?)
  `
  );

  const insertSet = db.prepare(
    `
    INSERT INTO workout_session_sets (
      id,
      session_item_id,
      set_index,
      reps,
      weight,
      duration_seconds,
      distance,
      pace,
      intensity,
      heart_rate,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  );

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    const item = items[itemIndex];
    const exercise = getWorkoutExercise(item.exerciseId);
    if (!exercise) {
      throw new Error("Session references unknown exercise");
    }

    const sessionItemId = createId();
    insertItem.run(sessionItemId, sessionId, item.exerciseId, item.orderIndex ?? itemIndex, item.notes ?? "");

    for (let setIndex = 0; setIndex < item.sets.length; setIndex += 1) {
      const set = item.sets[setIndex];
      insertSet.run(
        createId(),
        sessionItemId,
        set.setIndex ?? setIndex + 1,
        set.reps ?? null,
        set.weight ?? null,
        set.durationSeconds ?? null,
        set.distance ?? null,
        set.pace ?? null,
        set.intensity ?? null,
        set.heartRate ?? null,
        set.notes ?? ""
      );
    }
  }
}

export function listWorkoutSessions(filter?: { from?: string; to?: string }): WorkoutSession[] {
  const clauses: string[] = [];
  const args: string[] = [];
  if (filter?.from) {
    clauses.push("workout_date >= ?");
    args.push(filter.from);
  }
  if (filter?.to) {
    clauses.push("workout_date <= ?");
    args.push(filter.to);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const sessions = db
    .prepare(`SELECT * FROM workout_sessions ${where} ORDER BY workout_date DESC, created_at DESC`)
    .all(...args) as WorkoutSessionRow[];
  const itemsBySession = listItemsBySessionIds(sessions.map((session) => session.id));
  return sessions.map((session) => toWorkoutSession(session, itemsBySession.get(session.id) ?? []));
}

export function getWorkoutSession(sessionId: string): WorkoutSession | null {
  const row = db.prepare("SELECT * FROM workout_sessions WHERE id = ?").get(sessionId) as WorkoutSessionRow | undefined;
  if (!row) {
    return null;
  }
  const itemsBySession = listItemsBySessionIds([sessionId]);
  return toWorkoutSession(row, itemsBySession.get(sessionId) ?? []);
}

export function createWorkoutSession(input: {
  workoutDate: string;
  title: string;
  templateId?: string | null;
  notes?: string;
  items: Array<{
    exerciseId: string;
    orderIndex?: number;
    notes?: string;
    sets: Array<{
      setIndex?: number;
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
      distance?: number | null;
      pace?: number | null;
      intensity?: number | null;
      heartRate?: number | null;
      notes?: string;
    }>;
  }>;
}): WorkoutSession {
  const id = createId();
  const now = nowIso();
  const templateId = input.templateId ?? null;
  if (templateId && !getWorkoutTemplate(templateId)) {
    throw new Error("Template not found");
  }

  db.prepare(
    `
    INSERT INTO workout_sessions (
      id,
      workout_date,
      title,
      template_id,
      notes,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(id, input.workoutDate, input.title.trim(), templateId, input.notes ?? "", now, now);

  replaceSessionItems(id, input.items);
  const created = getWorkoutSession(id);
  if (!created) {
    throw new Error("Failed to create workout session");
  }
  return created;
}

export function updateWorkoutSession(
  sessionId: string,
  input: Partial<{
    workoutDate: string;
    title: string;
    templateId: string | null;
    notes: string;
    items: Array<{
      exerciseId: string;
      orderIndex?: number;
      notes?: string;
      sets: Array<{
        setIndex?: number;
        reps?: number | null;
        weight?: number | null;
        durationSeconds?: number | null;
        distance?: number | null;
        pace?: number | null;
        intensity?: number | null;
        heartRate?: number | null;
        notes?: string;
      }>;
    }>;
  }>
): WorkoutSession | null {
  const current = getWorkoutSession(sessionId);
  if (!current) {
    return null;
  }

  const nextTemplateId = input.templateId === undefined ? current.templateId : input.templateId;
  if (nextTemplateId && !getWorkoutTemplate(nextTemplateId)) {
    throw new Error("Template not found");
  }

  db.prepare(
    `
    UPDATE workout_sessions
    SET
      workout_date = ?,
      title = ?,
      template_id = ?,
      notes = ?,
      updated_at = ?
    WHERE id = ?
  `
  ).run(
    input.workoutDate ?? current.workoutDate,
    input.title?.trim() ?? current.title,
    nextTemplateId ?? null,
    input.notes ?? current.notes,
    nowIso(),
    sessionId
  );

  if (input.items) {
    replaceSessionItems(sessionId, input.items);
  }

  return getWorkoutSession(sessionId);
}

export function deleteWorkoutSession(sessionId: string): boolean {
  const deleted = db.prepare("DELETE FROM workout_sessions WHERE id = ?").run(sessionId);
  return deleted.changes > 0;
}
