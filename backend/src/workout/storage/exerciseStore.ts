import { db } from "../../db.js";
import { createId, nowIso } from "../../utils.js";
import type { WorkoutExercise, WorkoutExerciseType } from "../types.js";

type WorkoutExerciseRow = {
  id: string;
  name: string;
  exercise_type: WorkoutExerciseType;
  muscle_group: string;
  equipment: string;
  is_custom: number;
  active: number;
  created_at: string;
  updated_at: string;
};

function toWorkoutExercise(row: WorkoutExerciseRow): WorkoutExercise {
  return {
    id: row.id,
    name: row.name,
    exerciseType: row.exercise_type,
    muscleGroup: row.muscle_group,
    equipment: row.equipment,
    isCustom: row.is_custom === 1,
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function listWorkoutExercises(): WorkoutExercise[] {
  const rows = db
    .prepare("SELECT * FROM workout_exercises WHERE active = 1 ORDER BY is_custom ASC, name ASC")
    .all() as WorkoutExerciseRow[];
  return rows.map(toWorkoutExercise);
}

export function getWorkoutExercise(exerciseId: string): WorkoutExercise | null {
  const row = db.prepare("SELECT * FROM workout_exercises WHERE id = ?").get(exerciseId) as WorkoutExerciseRow | undefined;
  return row ? toWorkoutExercise(row) : null;
}

export function createWorkoutExercise(input: {
  name: string;
  exerciseType: WorkoutExerciseType;
  muscleGroup?: string;
  equipment?: string;
  active?: boolean;
  isCustom?: boolean;
}): WorkoutExercise {
  const id = createId();
  const now = nowIso();
  db.prepare(
    `
    INSERT INTO workout_exercises (
      id,
      name,
      exercise_type,
      muscle_group,
      equipment,
      is_custom,
      active,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    id,
    input.name.trim(),
    input.exerciseType,
    input.muscleGroup?.trim() ?? "",
    input.equipment?.trim() ?? "",
    input.isCustom === false ? 0 : 1,
    input.active === false ? 0 : 1,
    now,
    now
  );

  const row = db.prepare("SELECT * FROM workout_exercises WHERE id = ?").get(id) as WorkoutExerciseRow;
  return toWorkoutExercise(row);
}
