import { db } from "../../db.js";
import type { CardioProgressPoint, StrengthProgressPoint } from "../types.js";

type StrengthRow = {
  workout_date: string;
  exercise_id: string;
  max_weight: number;
  max_reps: number;
  max_volume: number;
};

type CardioRow = {
  workout_date: string;
  exercise_id: string;
  total_distance: number;
  best_pace: number | null;
  avg_heart_rate: number | null;
};

export function getStrengthProgress(exerciseId?: string): StrengthProgressPoint[] {
  const args: string[] = [];
  let where = "WHERE ex.exercise_type = 'strength'";
  if (exerciseId) {
    where += " AND si.exercise_id = ?";
    args.push(exerciseId);
  }

  const rows = db
    .prepare(
      `
      SELECT
        s.workout_date,
        si.exercise_id,
        COALESCE(MAX(ss.weight), 0) AS max_weight,
        COALESCE(MAX(ss.reps), 0) AS max_reps,
        COALESCE(MAX(COALESCE(ss.weight, 0) * COALESCE(ss.reps, 0)), 0) AS max_volume
      FROM workout_session_sets ss
      INNER JOIN workout_session_items si ON si.id = ss.session_item_id
      INNER JOIN workout_sessions s ON s.id = si.session_id
      INNER JOIN workout_exercises ex ON ex.id = si.exercise_id
      ${where}
      GROUP BY s.workout_date, si.exercise_id
      ORDER BY s.workout_date ASC
    `
    )
    .all(...args) as StrengthRow[];

  return rows.map((row) => ({
    workoutDate: row.workout_date,
    exerciseId: row.exercise_id,
    maxWeight: row.max_weight,
    maxReps: row.max_reps,
    maxVolume: row.max_volume
  }));
}

export function getCardioProgress(exerciseId?: string): CardioProgressPoint[] {
  const args: string[] = [];
  let where = "WHERE ex.exercise_type = 'cardio'";
  if (exerciseId) {
    where += " AND si.exercise_id = ?";
    args.push(exerciseId);
  }

  const rows = db
    .prepare(
      `
      SELECT
        s.workout_date,
        si.exercise_id,
        COALESCE(SUM(COALESCE(ss.distance, 0)), 0) AS total_distance,
        MIN(CASE WHEN ss.pace IS NOT NULL AND ss.pace > 0 THEN ss.pace END) AS best_pace,
        AVG(CASE WHEN ss.heart_rate IS NOT NULL AND ss.heart_rate > 0 THEN ss.heart_rate END) AS avg_heart_rate
      FROM workout_session_sets ss
      INNER JOIN workout_session_items si ON si.id = ss.session_item_id
      INNER JOIN workout_sessions s ON s.id = si.session_id
      INNER JOIN workout_exercises ex ON ex.id = si.exercise_id
      ${where}
      GROUP BY s.workout_date, si.exercise_id
      ORDER BY s.workout_date ASC
    `
    )
    .all(...args) as CardioRow[];

  return rows.map((row) => ({
    workoutDate: row.workout_date,
    exerciseId: row.exercise_id,
    totalDistance: row.total_distance,
    bestPace: row.best_pace,
    avgHeartRate: row.avg_heart_rate
  }));
}
