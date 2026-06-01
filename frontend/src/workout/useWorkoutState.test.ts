import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/client";
import { buildCreateSessionPayload, computeWorkoutOverview, loadWorkoutSnapshot } from "./useWorkoutState";

vi.mock("../api/client", () => ({
  api: {
    listWorkoutExercises: vi.fn(),
    listWorkoutTemplates: vi.fn(),
    listWorkoutSessions: vi.fn(),
    getWorkoutCalendar: vi.fn(),
    getStrengthProgress: vi.fn(),
    getCardioProgress: vi.fn(),
    getWorkoutPrs: vi.fn(),
    listBodyweightEntries: vi.fn()
  }
}));

describe("workout state helpers", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loads workout snapshot from all endpoints", async () => {
    vi.mocked(api.listWorkoutExercises).mockResolvedValue([]);
    vi.mocked(api.listWorkoutTemplates).mockResolvedValue([]);
    vi.mocked(api.listWorkoutSessions).mockResolvedValue([]);
    vi.mocked(api.getWorkoutCalendar).mockResolvedValue([]);
    vi.mocked(api.getStrengthProgress).mockResolvedValue([]);
    vi.mocked(api.getCardioProgress).mockResolvedValue([]);
    vi.mocked(api.getWorkoutPrs).mockResolvedValue([]);
    vi.mocked(api.listBodyweightEntries).mockResolvedValue([]);

    const snapshot = await loadWorkoutSnapshot("2026-06");
    expect(snapshot.exercises).toHaveLength(0);
    expect(api.getWorkoutCalendar).toHaveBeenCalledWith("2026-06");
  });

  it("propagates API errors during snapshot load", async () => {
    vi.mocked(api.listWorkoutExercises).mockRejectedValue(new Error("boom"));
    vi.mocked(api.listWorkoutTemplates).mockResolvedValue([]);
    vi.mocked(api.listWorkoutSessions).mockResolvedValue([]);
    vi.mocked(api.getWorkoutCalendar).mockResolvedValue([]);
    vi.mocked(api.getStrengthProgress).mockResolvedValue([]);
    vi.mocked(api.getCardioProgress).mockResolvedValue([]);
    vi.mocked(api.getWorkoutPrs).mockResolvedValue([]);
    vi.mocked(api.listBodyweightEntries).mockResolvedValue([]);

    await expect(loadWorkoutSnapshot("2026-06")).rejects.toThrow("boom");
  });

  it("builds a mixed workout session payload from form data", () => {
    const payload = buildCreateSessionPayload({
      workoutDate: "2026-06-01",
      title: "Test Session",
      templateId: "",
      notes: "steady",
      exerciseId: "ex-running",
      setReps: "",
      setWeight: "",
      setDurationSeconds: "900",
      setDistance: "3.5",
      setPace: "4.2",
      setIntensity: "7",
      setHeartRate: "154",
      setNotes: "felt solid"
    });

    expect(payload.items[0].sets[0].durationSeconds).toBe(900);
    expect(payload.items[0].sets[0].distance).toBe(3.5);
    expect(payload.items[0].sets[0].reps).toBeNull();
  });

  it("computes overview metrics from sessions, rest days, and bodyweight", () => {
    const overview = computeWorkoutOverview(
      [
        {
          id: "s1",
          workoutDate: "2026-06-01",
          title: "A",
          templateId: null,
          notes: "",
          createdAt: "",
          updatedAt: "",
          items: []
        }
      ],
      [
        { date: "2026-06-01", sessionCount: 1, isRestDay: false, notes: "" },
        { date: "2026-06-02", sessionCount: 0, isRestDay: true, notes: "" }
      ],
      [
        { id: "bw2", entryDate: "2026-06-02", weight: 179, notes: "", createdAt: "" },
        { id: "bw1", entryDate: "2026-06-01", weight: 180, notes: "", createdAt: "" }
      ]
    );

    expect(overview.totalSessions).toBe(1);
    expect(overview.restDays).toBe(1);
    expect(overview.weightDelta).toBe(-1);
  });
});
