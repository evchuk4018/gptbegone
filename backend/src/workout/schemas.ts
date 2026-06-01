import { z } from "zod";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const isoMonthRegex = /^\d{4}-\d{2}$/;

export const workoutExerciseTypeSchema = z.enum(["strength", "cardio"]);

export const createWorkoutExerciseSchema = z.object({
  name: z.string().min(1),
  exerciseType: workoutExerciseTypeSchema,
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
  active: z.boolean().optional()
});

export const workoutTemplateItemInputSchema = z.object({
  exerciseId: z.string().min(1),
  orderIndex: z.number().int().min(0).optional(),
  targetSets: z.number().int().min(0).nullable().optional(),
  targetReps: z.number().min(0).nullable().optional(),
  targetWeight: z.number().min(0).nullable().optional(),
  targetDurationSeconds: z.number().min(0).nullable().optional(),
  targetDistance: z.number().min(0).nullable().optional(),
  targetPace: z.number().min(0).nullable().optional(),
  targetIntensity: z.number().min(0).nullable().optional(),
  targetHeartRate: z.number().min(0).nullable().optional(),
  notes: z.string().optional()
});

export const createWorkoutTemplateSchema = z.object({
  name: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(workoutTemplateItemInputSchema).min(1)
});

export const updateWorkoutTemplateSchema = createWorkoutTemplateSchema.partial();

export const workoutSessionSetInputSchema = z.object({
  setIndex: z.number().int().min(1).optional(),
  reps: z.number().min(0).nullable().optional(),
  weight: z.number().min(0).nullable().optional(),
  durationSeconds: z.number().min(0).nullable().optional(),
  distance: z.number().min(0).nullable().optional(),
  pace: z.number().min(0).nullable().optional(),
  intensity: z.number().min(0).nullable().optional(),
  heartRate: z.number().min(0).nullable().optional(),
  notes: z.string().optional()
});

export const workoutSessionItemInputSchema = z.object({
  exerciseId: z.string().min(1),
  orderIndex: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  sets: z.array(workoutSessionSetInputSchema).min(1)
});

export const createWorkoutSessionSchema = z.object({
  workoutDate: z.string().regex(isoDateRegex),
  title: z.string().min(1),
  templateId: z.string().min(1).nullable().optional(),
  notes: z.string().optional(),
  items: z.array(workoutSessionItemInputSchema).min(1)
});

export const updateWorkoutSessionSchema = createWorkoutSessionSchema.partial();

export const updateWorkoutDayStatusSchema = z.object({
  isRestDay: z.boolean(),
  notes: z.string().optional()
});

export const workoutMonthQuerySchema = z.object({
  month: z.string().regex(isoMonthRegex)
});

export const createBodyweightEntrySchema = z.object({
  entryDate: z.string().regex(isoDateRegex),
  weight: z.number().min(0),
  notes: z.string().optional()
});
