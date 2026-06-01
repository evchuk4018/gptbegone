import { db } from "../../db.js";
import type { WorkoutPR, WorkoutExerciseType } from "../types.js";

type PRRow = {
  exercise_id: string;
  exercise_name: string;
  exercise_type: WorkoutExerciseType;
  max_weight: number;
  max_reps: number;
  max_volume: number;
  longest_distance: number;
  fastest_pace: number | null;
};

export function listWorkoutPrs(): WorkoutPR[] {
  const rows = db
    .prepare(
      `
      SELECT
        ex.id AS exercise_id,
        ex.name AS exercise_name,
        ex.exercise_type AS exercise_type,
        COALESCE(MAX(ss.weight), 0) AS max_weight,
        COALESCE(MAX(ss.reps), 0) AS max_reps,
        COALESCE(MAX(COALESCE(ss.weight, 0) * COALESCE(ss.reps, 0)), 0) AS max_volume,
        COALESCE(MAX(ss.distance), 0) AS longest_distance,
        MIN(CASE WHEN ss.pace IS NOT NULL AND ss.pace > 0 THEN ss.pace END) AS fastest_pace
      FROM workout_exercises ex
      LEFT JOIN workout_session_items si ON si.exercise_id = ex.id
      LEFT JOIN workout_session_sets ss ON ss.session_item_id = si.id
      WHERE ex.active = 1
      GROUP BY ex.id, ex.name, ex.exercise_type
      ORDER BY ex.name ASC
    `
    )
    .all() as PRRow[];

  return rows.map((row) => ({
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    exerciseType: row.exercise_type,
    strength:
      row.exercise_type === "strength"
        ? {
            maxWeight: row.max_weight,
            maxReps: row.max_reps,
            maxVolume: row.max_volume
          }
        : null,
    cardio:
      row.exercise_type === "cardio"
        ? {
            longestDistance: row.longest_distance,
            fastestPace: row.fastest_pace
          }
        : null
  }));
}
