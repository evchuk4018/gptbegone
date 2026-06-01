import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type {
  BodyweightEntry,
  CardioProgressPoint,
  StrengthProgressPoint,
  WorkoutCalendarDay,
  WorkoutExercise,
  WorkoutPR,
  WorkoutSession,
  WorkoutTemplate
} from "../types";

const monthFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit"
});

function defaultMonth(): string {
  return monthFormatter.format(new Date()).slice(0, 7);
}

type WorkoutSessionForm = {
  workoutDate: string;
  title: string;
  templateId: string;
  notes: string;
  exerciseId: string;
  setReps: string;
  setWeight: string;
  setDurationSeconds: string;
  setDistance: string;
  setPace: string;
  setIntensity: string;
  setHeartRate: string;
  setNotes: string;
};

export type WorkoutSnapshot = {
  exercises: WorkoutExercise[];
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  calendarDays: WorkoutCalendarDay[];
  strengthProgress: StrengthProgressPoint[];
  cardioProgress: CardioProgressPoint[];
  prs: WorkoutPR[];
  bodyweightEntries: BodyweightEntry[];
};

export async function loadWorkoutSnapshot(month: string): Promise<WorkoutSnapshot> {
  const [exercises, templates, sessions, calendarDays, strengthProgress, cardioProgress, prs, bodyweightEntries] =
    await Promise.all([
      api.listWorkoutExercises(),
      api.listWorkoutTemplates(),
      api.listWorkoutSessions(),
      api.getWorkoutCalendar(month),
      api.getStrengthProgress(),
      api.getCardioProgress(),
      api.getWorkoutPrs(),
      api.listBodyweightEntries()
    ]);

  return {
    exercises,
    templates,
    sessions,
    calendarDays,
    strengthProgress,
    cardioProgress,
    prs,
    bodyweightEntries
  };
}

export function buildCreateSessionPayload(sessionForm: WorkoutSessionForm) {
  return {
    workoutDate: sessionForm.workoutDate,
    title: sessionForm.title,
    templateId: sessionForm.templateId || null,
    notes: sessionForm.notes,
    items: [
      {
        exerciseId: sessionForm.exerciseId,
        sets: [
          {
            setIndex: 1,
            reps: sessionForm.setReps ? Number(sessionForm.setReps) : null,
            weight: sessionForm.setWeight ? Number(sessionForm.setWeight) : null,
            durationSeconds: sessionForm.setDurationSeconds ? Number(sessionForm.setDurationSeconds) : null,
            distance: sessionForm.setDistance ? Number(sessionForm.setDistance) : null,
            pace: sessionForm.setPace ? Number(sessionForm.setPace) : null,
            intensity: sessionForm.setIntensity ? Number(sessionForm.setIntensity) : null,
            heartRate: sessionForm.setHeartRate ? Number(sessionForm.setHeartRate) : null,
            notes: sessionForm.setNotes
          }
        ],
        notes: sessionForm.notes
      }
    ]
  };
}

export function computeWorkoutOverview(
  sessions: WorkoutSession[],
  calendarDays: WorkoutCalendarDay[],
  bodyweightEntries: BodyweightEntry[]
) {
  const latestWeight = bodyweightEntries[0]?.weight ?? null;
  const priorWeight = bodyweightEntries[1]?.weight ?? null;
  return {
    totalSessions: sessions.length,
    restDays: calendarDays.filter((day) => day.isRestDay).length,
    latestWeight,
    weightDelta: latestWeight !== null && priorWeight !== null ? latestWeight - priorWeight : null
  };
}

export function useWorkoutState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(defaultMonth());
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [calendarDays, setCalendarDays] = useState<WorkoutCalendarDay[]>([]);
  const [strengthProgress, setStrengthProgress] = useState<StrengthProgressPoint[]>([]);
  const [cardioProgress, setCardioProgress] = useState<CardioProgressPoint[]>([]);
  const [prs, setPrs] = useState<WorkoutPR[]>([]);
  const [bodyweightEntries, setBodyweightEntries] = useState<BodyweightEntry[]>([]);

  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    exerciseType: "strength" as "strength" | "cardio",
    muscleGroup: "",
    equipment: ""
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    notes: "",
    exerciseId: "",
    targetSets: "",
    targetReps: "",
    targetWeight: "",
    targetDurationSeconds: "",
    targetDistance: "",
    targetPace: "",
    targetIntensity: "",
    targetHeartRate: "",
    itemNotes: ""
  });

  const [sessionForm, setSessionForm] = useState({
    workoutDate: new Date().toISOString().slice(0, 10),
    title: "Workout Session",
    templateId: "",
    notes: "",
    exerciseId: "",
    setReps: "",
    setWeight: "",
    setDurationSeconds: "",
    setDistance: "",
    setPace: "",
    setIntensity: "",
    setHeartRate: "",
    setNotes: ""
  });

  const [dayStatusForm, setDayStatusForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    isRestDay: true,
    notes: ""
  });

  const [bodyweightForm, setBodyweightForm] = useState({
    entryDate: new Date().toISOString().slice(0, 10),
    weight: "",
    notes: ""
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await loadWorkoutSnapshot(month);
      setExercises(snapshot.exercises);
      setTemplates(snapshot.templates);
      setSessions(snapshot.sessions);
      setCalendarDays(snapshot.calendarDays);
      setStrengthProgress(snapshot.strengthProgress);
      setCardioProgress(snapshot.cardioProgress);
      setPrs(snapshot.prs);
      setBodyweightEntries(snapshot.bodyweightEntries);
      setTemplateForm((prev) => ({ ...prev, exerciseId: prev.exerciseId || snapshot.exercises[0]?.id || "" }));
      setSessionForm((prev) => ({ ...prev, exerciseId: prev.exerciseId || snapshot.exercises[0]?.id || "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workout module");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const submitExercise = useCallback(async () => {
    if (!exerciseForm.name.trim()) {
      return;
    }
    await api.createWorkoutExercise(exerciseForm);
    setExerciseForm({ name: "", exerciseType: "strength", muscleGroup: "", equipment: "" });
    await reload();
  }, [exerciseForm, reload]);

  const submitTemplate = useCallback(async () => {
    if (!templateForm.name.trim() || !templateForm.exerciseId) {
      return;
    }
    await api.createWorkoutTemplate({
      name: templateForm.name,
      notes: templateForm.notes,
      items: [
        {
          exerciseId: templateForm.exerciseId,
          orderIndex: 0,
          targetSets: templateForm.targetSets ? Number(templateForm.targetSets) : null,
          targetReps: templateForm.targetReps ? Number(templateForm.targetReps) : null,
          targetWeight: templateForm.targetWeight ? Number(templateForm.targetWeight) : null,
          targetDurationSeconds: templateForm.targetDurationSeconds ? Number(templateForm.targetDurationSeconds) : null,
          targetDistance: templateForm.targetDistance ? Number(templateForm.targetDistance) : null,
          targetPace: templateForm.targetPace ? Number(templateForm.targetPace) : null,
          targetIntensity: templateForm.targetIntensity ? Number(templateForm.targetIntensity) : null,
          targetHeartRate: templateForm.targetHeartRate ? Number(templateForm.targetHeartRate) : null,
          notes: templateForm.itemNotes
        }
      ]
    });
    setTemplateForm((prev) => ({
      ...prev,
      name: "",
      notes: "",
      targetSets: "",
      targetReps: "",
      targetWeight: "",
      targetDurationSeconds: "",
      targetDistance: "",
      targetPace: "",
      targetIntensity: "",
      targetHeartRate: "",
      itemNotes: ""
    }));
    await reload();
  }, [reload, templateForm]);

  const submitSession = useCallback(async () => {
    if (!sessionForm.exerciseId || !sessionForm.workoutDate || !sessionForm.title.trim()) {
      return;
    }
    await api.createWorkoutSession(buildCreateSessionPayload(sessionForm));
    setSessionForm((prev) => ({
      ...prev,
      notes: "",
      setReps: "",
      setWeight: "",
      setDurationSeconds: "",
      setDistance: "",
      setPace: "",
      setIntensity: "",
      setHeartRate: "",
      setNotes: ""
    }));
    await reload();
  }, [reload, sessionForm]);

  const submitDayStatus = useCallback(async () => {
    if (!dayStatusForm.date) {
      return;
    }
    await api.updateWorkoutDayStatus(dayStatusForm.date, {
      isRestDay: dayStatusForm.isRestDay,
      notes: dayStatusForm.notes
    });
    await reload();
  }, [dayStatusForm, reload]);

  const submitBodyweight = useCallback(async () => {
    if (!bodyweightForm.entryDate || !bodyweightForm.weight) {
      return;
    }
    await api.createBodyweightEntry({
      entryDate: bodyweightForm.entryDate,
      weight: Number(bodyweightForm.weight),
      notes: bodyweightForm.notes
    });
    setBodyweightForm((prev) => ({ ...prev, weight: "", notes: "" }));
    await reload();
  }, [bodyweightForm, reload]);

  const overview = useMemo(() => {
    return computeWorkoutOverview(sessions, calendarDays, bodyweightEntries);
  }, [bodyweightEntries, calendarDays, sessions.length]);

  return {
    loading,
    error,
    month,
    exercises,
    templates,
    sessions,
    calendarDays,
    strengthProgress,
    cardioProgress,
    prs,
    bodyweightEntries,
    exerciseForm,
    templateForm,
    sessionForm,
    dayStatusForm,
    bodyweightForm,
    overview,
    setMonth,
    setExerciseForm,
    setTemplateForm,
    setSessionForm,
    setDayStatusForm,
    setBodyweightForm,
    submitExercise,
    submitTemplate,
    submitSession,
    submitDayStatus,
    submitBodyweight,
    reload
  };
}
