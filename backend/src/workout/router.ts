import { Router } from "express";
import {
  createBodyweightEntrySchema,
  createWorkoutExerciseSchema,
  createWorkoutSessionSchema,
  createWorkoutTemplateSchema,
  updateWorkoutDayStatusSchema,
  updateWorkoutSessionSchema,
  updateWorkoutTemplateSchema,
  workoutMonthQuerySchema
} from "./schemas.js";
import { createWorkoutExercise, listWorkoutExercises } from "./storage/exerciseStore.js";
import {
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  listWorkoutTemplates,
  updateWorkoutTemplate
} from "./storage/templateStore.js";
import {
  createWorkoutSession,
  deleteWorkoutSession,
  listWorkoutSessions,
  updateWorkoutSession
} from "./storage/sessionStore.js";
import { listWorkoutCalendar, upsertWorkoutDayStatus } from "./storage/dayStatusStore.js";
import { createBodyweightEntry, listBodyweightEntries } from "./storage/bodyweightStore.js";
import { getCardioProgress, getStrengthProgress } from "./services/progressService.js";
import { listWorkoutPrs } from "./services/prService.js";

export function createWorkoutRouter(): Router {
  const router = Router();

  router.get("/exercises", (_req, res) => {
    return res.json(listWorkoutExercises());
  });

  router.post("/exercises", (req, res) => {
    const parsed = createWorkoutExerciseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    try {
      const created = createWorkoutExercise({
        name: parsed.data.name,
        exerciseType: parsed.data.exerciseType,
        muscleGroup: parsed.data.muscleGroup,
        equipment: parsed.data.equipment,
        active: parsed.data.active
      });
      return res.status(201).json(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create exercise";
      return res.status(400).json({ error: message });
    }
  });

  router.get("/templates", (_req, res) => {
    return res.json(listWorkoutTemplates());
  });

  router.post("/templates", (req, res) => {
    const parsed = createWorkoutTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    try {
      const created = createWorkoutTemplate(parsed.data);
      return res.status(201).json(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create template";
      return res.status(400).json({ error: message });
    }
  });

  router.put("/templates/:id", (req, res) => {
    const parsed = updateWorkoutTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    try {
      const updated = updateWorkoutTemplate(req.params.id, parsed.data);
      if (!updated) {
        return res.status(404).json({ error: "Template not found" });
      }
      return res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update template";
      return res.status(400).json({ error: message });
    }
  });

  router.delete("/templates/:id", (req, res) => {
    const ok = deleteWorkoutTemplate(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Template not found" });
    }
    return res.status(204).send();
  });

  router.get("/sessions", (req, res) => {
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    return res.json(listWorkoutSessions({ from, to }));
  });

  router.post("/sessions", (req, res) => {
    const parsed = createWorkoutSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    try {
      const created = createWorkoutSession(parsed.data);
      return res.status(201).json(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create workout session";
      return res.status(400).json({ error: message });
    }
  });

  router.put("/sessions/:id", (req, res) => {
    const parsed = updateWorkoutSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    try {
      const updated = updateWorkoutSession(req.params.id, parsed.data);
      if (!updated) {
        return res.status(404).json({ error: "Session not found" });
      }
      return res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update workout session";
      return res.status(400).json({ error: message });
    }
  });

  router.delete("/sessions/:id", (req, res) => {
    const ok = deleteWorkoutSession(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Session not found" });
    }
    return res.status(204).send();
  });

  router.put("/day-status/:date", (req, res) => {
    const parsed = updateWorkoutDayStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const date = req.params.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "date param must be YYYY-MM-DD" });
    }
    return res.json(upsertWorkoutDayStatus({ date, isRestDay: parsed.data.isRestDay, notes: parsed.data.notes }));
  });

  router.get("/calendar", (req, res) => {
    const parsed = workoutMonthQuerySchema.safeParse({ month: req.query.month });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.json(listWorkoutCalendar(parsed.data.month));
  });

  router.get("/progress/strength", (req, res) => {
    const exerciseId = typeof req.query.exerciseId === "string" ? req.query.exerciseId : undefined;
    return res.json(getStrengthProgress(exerciseId));
  });

  router.get("/progress/cardio", (req, res) => {
    const exerciseId = typeof req.query.exerciseId === "string" ? req.query.exerciseId : undefined;
    return res.json(getCardioProgress(exerciseId));
  });

  router.get("/prs", (_req, res) => {
    return res.json(listWorkoutPrs());
  });

  router.get("/bodyweight", (req, res) => {
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    return res.json(listBodyweightEntries({ from, to }));
  });

  router.post("/bodyweight", (req, res) => {
    const parsed = createBodyweightEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    return res.status(201).json(createBodyweightEntry(parsed.data));
  });

  return router;
}
