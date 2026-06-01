export type WorkoutExerciseType = "strength" | "cardio";

export type WorkoutExercise = {
  id: string;
  name: string;
  exerciseType: WorkoutExerciseType;
  muscleGroup: string;
  equipment: string;
  isCustom: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutTemplateItem = {
  id: string;
  templateId: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number | null;
  targetReps: number | null;
  targetWeight: number | null;
  targetDurationSeconds: number | null;
  targetDistance: number | null;
  targetPace: number | null;
  targetIntensity: number | null;
  targetHeartRate: number | null;
  notes: string;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: WorkoutTemplateItem[];
};

export type WorkoutSessionSet = {
  id: string;
  sessionItemId: string;
  setIndex: number;
  reps: number | null;
  weight: number | null;
  durationSeconds: number | null;
  distance: number | null;
  pace: number | null;
  intensity: number | null;
  heartRate: number | null;
  notes: string;
};

export type WorkoutSessionItem = {
  id: string;
  sessionId: string;
  exerciseId: string;
  orderIndex: number;
  notes: string;
  sets: WorkoutSessionSet[];
};

export type WorkoutSession = {
  id: string;
  workoutDate: string;
  title: string;
  templateId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: WorkoutSessionItem[];
};

export type WorkoutDayStatus = {
  date: string;
  isRestDay: boolean;
  notes: string;
  updatedAt: string;
};

export type WorkoutCalendarDay = {
  date: string;
  sessionCount: number;
  isRestDay: boolean;
  notes: string;
};

export type BodyweightEntry = {
  id: string;
  entryDate: string;
  weight: number;
  notes: string;
  createdAt: string;
};

export type StrengthProgressPoint = {
  workoutDate: string;
  exerciseId: string;
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
};

export type CardioProgressPoint = {
  workoutDate: string;
  exerciseId: string;
  totalDistance: number;
  bestPace: number | null;
  avgHeartRate: number | null;
};

export type WorkoutPR = {
  exerciseId: string;
  exerciseName: string;
  exerciseType: WorkoutExerciseType;
  strength: {
    maxWeight: number;
    maxReps: number;
    maxVolume: number;
  } | null;
  cardio: {
    longestDistance: number;
    fastestPace: number | null;
  } | null;
};
