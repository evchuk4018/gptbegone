import { db } from "../../db.js";
import { createId, nowIso } from "../../utils.js";
import { getWorkoutExercise } from "./exerciseStore.js";
import type { WorkoutTemplate, WorkoutTemplateItem } from "../types.js";

type WorkoutTemplateRow = {
  id: string;
  name: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type WorkoutTemplateItemRow = {
  id: string;
  template_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number | null;
  target_reps: number | null;
  target_weight: number | null;
  target_duration_seconds: number | null;
  target_distance: number | null;
  target_pace: number | null;
  target_intensity: number | null;
  target_heart_rate: number | null;
  notes: string;
};

function toWorkoutTemplateItem(row: WorkoutTemplateItemRow): WorkoutTemplateItem {
  return {
    id: row.id,
    templateId: row.template_id,
    exerciseId: row.exercise_id,
    orderIndex: row.order_index,
    targetSets: row.target_sets,
    targetReps: row.target_reps,
    targetWeight: row.target_weight,
    targetDurationSeconds: row.target_duration_seconds,
    targetDistance: row.target_distance,
    targetPace: row.target_pace,
    targetIntensity: row.target_intensity,
    targetHeartRate: row.target_heart_rate,
    notes: row.notes
  };
}

function toWorkoutTemplate(row: WorkoutTemplateRow, items: WorkoutTemplateItem[]): WorkoutTemplate {
  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items
  };
}

function listTemplateItemsByTemplateId(templateIds: string[]): Map<string, WorkoutTemplateItem[]> {
  if (templateIds.length === 0) {
    return new Map();
  }

  const placeholders = templateIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `
      SELECT *
      FROM workout_template_items
      WHERE template_id IN (${placeholders})
      ORDER BY order_index ASC, id ASC
    `
    )
    .all(...templateIds) as WorkoutTemplateItemRow[];

  const map = new Map<string, WorkoutTemplateItem[]>();
  for (const row of rows) {
    const list = map.get(row.template_id) ?? [];
    list.push(toWorkoutTemplateItem(row));
    map.set(row.template_id, list);
  }

  return map;
}

function replaceTemplateItems(
  templateId: string,
  items: Array<{
    exerciseId: string;
    orderIndex?: number;
    targetSets?: number | null;
    targetReps?: number | null;
    targetWeight?: number | null;
    targetDurationSeconds?: number | null;
    targetDistance?: number | null;
    targetPace?: number | null;
    targetIntensity?: number | null;
    targetHeartRate?: number | null;
    notes?: string;
  }>
) {
  db.prepare("DELETE FROM workout_template_items WHERE template_id = ?").run(templateId);

  const insert = db.prepare(
    `
    INSERT INTO workout_template_items (
      id,
      template_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight,
      target_duration_seconds,
      target_distance,
      target_pace,
      target_intensity,
      target_heart_rate,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  );

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const exercise = getWorkoutExercise(item.exerciseId);
    if (!exercise) {
      throw new Error("Template references unknown exercise");
    }
    insert.run(
      createId(),
      templateId,
      item.exerciseId,
      item.orderIndex ?? index,
      item.targetSets ?? null,
      item.targetReps ?? null,
      item.targetWeight ?? null,
      item.targetDurationSeconds ?? null,
      item.targetDistance ?? null,
      item.targetPace ?? null,
      item.targetIntensity ?? null,
      item.targetHeartRate ?? null,
      item.notes ?? ""
    );
  }
}

export function listWorkoutTemplates(): WorkoutTemplate[] {
  const templates = db
    .prepare("SELECT * FROM workout_templates ORDER BY created_at DESC")
    .all() as WorkoutTemplateRow[];
  const ids = templates.map((template) => template.id);
  const itemsByTemplate = listTemplateItemsByTemplateId(ids);
  return templates.map((template) => toWorkoutTemplate(template, itemsByTemplate.get(template.id) ?? []));
}

export function getWorkoutTemplate(templateId: string): WorkoutTemplate | null {
  const row = db.prepare("SELECT * FROM workout_templates WHERE id = ?").get(templateId) as WorkoutTemplateRow | undefined;
  if (!row) {
    return null;
  }
  const itemsByTemplate = listTemplateItemsByTemplateId([templateId]);
  return toWorkoutTemplate(row, itemsByTemplate.get(templateId) ?? []);
}

export function createWorkoutTemplate(input: {
  name: string;
  notes?: string;
  items: Array<{
    exerciseId: string;
    orderIndex?: number;
    targetSets?: number | null;
    targetReps?: number | null;
    targetWeight?: number | null;
    targetDurationSeconds?: number | null;
    targetDistance?: number | null;
    targetPace?: number | null;
    targetIntensity?: number | null;
    targetHeartRate?: number | null;
    notes?: string;
  }>;
}): WorkoutTemplate {
  const id = createId();
  const now = nowIso();
  db.prepare(
    `
    INSERT INTO workout_templates (id, name, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(id, input.name.trim(), input.notes?.trim() ?? "", now, now);

  replaceTemplateItems(id, input.items);

  const created = getWorkoutTemplate(id);
  if (!created) {
    throw new Error("Failed to create template");
  }
  return created;
}

export function updateWorkoutTemplate(
  templateId: string,
  input: Partial<{
    name: string;
    notes: string;
    items: Array<{
      exerciseId: string;
      orderIndex?: number;
      targetSets?: number | null;
      targetReps?: number | null;
      targetWeight?: number | null;
      targetDurationSeconds?: number | null;
      targetDistance?: number | null;
      targetPace?: number | null;
      targetIntensity?: number | null;
      targetHeartRate?: number | null;
      notes?: string;
    }>;
  }>
): WorkoutTemplate | null {
  const current = getWorkoutTemplate(templateId);
  if (!current) {
    return null;
  }

  const name = input.name?.trim() ?? current.name;
  const notes = input.notes?.trim() ?? current.notes;

  db.prepare(
    `
    UPDATE workout_templates
    SET name = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `
  ).run(name, notes, nowIso(), templateId);

  if (input.items) {
    replaceTemplateItems(templateId, input.items);
  }

  return getWorkoutTemplate(templateId);
}

export function deleteWorkoutTemplate(templateId: string): boolean {
  const deleted = db.prepare("DELETE FROM workout_templates WHERE id = ?").run(templateId);
  return deleted.changes > 0;
}
