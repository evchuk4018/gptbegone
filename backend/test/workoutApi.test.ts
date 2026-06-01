import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { resetForTests } from "../src/db.js";

describe("workout API", () => {
  const app = createApp();

  beforeEach(() => {
    resetForTests();
  });

  it("creates, updates, and deletes workout templates", async () => {
    const exercisesRes = await request(app).get("/api/workout/exercises").expect(200);
    const exerciseId = exercisesRes.body[0].id as string;

    const createRes = await request(app)
      .post("/api/workout/templates")
      .send({
        name: "Push Day A",
        notes: "Upper body focus",
        items: [{ exerciseId, targetSets: 4, targetReps: 8, targetWeight: 135 }]
      })
      .expect(201);

    expect(createRes.body.items).toHaveLength(1);
    const templateId = createRes.body.id as string;

    const updateRes = await request(app)
      .put(`/api/workout/templates/${templateId}`)
      .send({
        name: "Push Day A+",
        items: [{ exerciseId, targetSets: 5, targetReps: 6, targetWeight: 155 }]
      })
      .expect(200);

    expect(updateRes.body.name).toBe("Push Day A+");
    expect(updateRes.body.items[0].targetWeight).toBe(155);

    await request(app).delete(`/api/workout/templates/${templateId}`).expect(204);
  });

  it("tracks sessions, progress, PRs, calendar day status, and bodyweight", async () => {
    const exercisesRes = await request(app).get("/api/workout/exercises").expect(200);
    const squat = exercisesRes.body.find((exercise: { name: string }) => exercise.name === "Back Squat");
    const running = exercisesRes.body.find((exercise: { name: string }) => exercise.name === "Running");

    expect(squat).toBeTruthy();
    expect(running).toBeTruthy();

    const sessionDate = "2026-06-15";

    await request(app)
      .post("/api/workout/sessions")
      .send({
        workoutDate: sessionDate,
        title: "Mixed Session",
        notes: "Form felt stable",
        items: [
          {
            exerciseId: squat.id,
            sets: [
              { setIndex: 1, reps: 5, weight: 225, intensity: 8 },
              { setIndex: 2, reps: 3, weight: 245, intensity: 9 }
            ]
          },
          {
            exerciseId: running.id,
            sets: [{ setIndex: 1, durationSeconds: 1500, distance: 5, pace: 5, heartRate: 160 }]
          }
        ]
      })
      .expect(201);

    const strengthRes = await request(app).get("/api/workout/progress/strength").expect(200);
    const squatPoint = strengthRes.body.find((row: { exerciseId: string }) => row.exerciseId === squat.id);
    expect(squatPoint.maxWeight).toBe(245);
    expect(squatPoint.maxVolume).toBe(1125);

    const cardioRes = await request(app).get("/api/workout/progress/cardio").expect(200);
    const runPoint = cardioRes.body.find((row: { exerciseId: string }) => row.exerciseId === running.id);
    expect(runPoint.totalDistance).toBe(5);
    expect(runPoint.bestPace).toBe(5);

    const prsRes = await request(app).get("/api/workout/prs").expect(200);
    const squatPr = prsRes.body.find((row: { exerciseId: string }) => row.exerciseId === squat.id);
    const runPr = prsRes.body.find((row: { exerciseId: string }) => row.exerciseId === running.id);
    expect(squatPr.strength.maxWeight).toBe(245);
    expect(runPr.cardio.longestDistance).toBe(5);

    await request(app)
      .put(`/api/workout/day-status/${sessionDate}`)
      .send({ isRestDay: true, notes: "Mobility only" })
      .expect(200);

    const calendarRes = await request(app).get("/api/workout/calendar?month=2026-06").expect(200);
    const day = calendarRes.body.find((row: { date: string }) => row.date === sessionDate);
    expect(day.sessionCount).toBe(1);
    expect(day.isRestDay).toBe(true);

    await request(app)
      .post("/api/workout/bodyweight")
      .send({ entryDate: "2026-06-15", weight: 180.4, notes: "Morning" })
      .expect(201);

    const bodyweightRes = await request(app).get("/api/workout/bodyweight").expect(200);
    expect(bodyweightRes.body[0].weight).toBe(180.4);
  });
});
