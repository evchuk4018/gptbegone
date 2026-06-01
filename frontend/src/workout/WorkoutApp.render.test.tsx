import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { WorkoutApp } from "./WorkoutApp";

const mockState = {
  loading: false,
  error: null as string | null,
  isOffline: false,
  month: "2026-06",
  exercises: [],
  templates: [{ id: "t1", name: "Template A", notes: "", createdAt: "", updatedAt: "", items: [] }],
  sessions: [{ id: "s1", workoutDate: "2026-06-02", title: "Session 1", templateId: null, notes: "", createdAt: "", updatedAt: "", items: [] }],
  calendarDays: [{ date: "2026-06-02", sessionCount: 1, isRestDay: true, notes: "" }],
  strengthProgress: [],
  cardioProgress: [],
  prs: [],
  bodyweightEntries: [{ id: "bw1", entryDate: "2026-06-02", weight: 180, notes: "", createdAt: "" }],
  exerciseForm: { name: "", exerciseType: "strength", muscleGroup: "", equipment: "" },
  templateForm: {
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
  },
  sessionForm: {
    workoutDate: "2026-06-02",
    title: "",
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
  },
  dayStatusForm: { date: "2026-06-02", isRestDay: true, notes: "" },
  bodyweightForm: { entryDate: "2026-06-02", weight: "", notes: "" },
  overview: { totalSessions: 1, restDays: 1, latestWeight: 180, weightDelta: null },
  setMonth: vi.fn(),
  setExerciseForm: vi.fn(),
  setTemplateForm: vi.fn(),
  setSessionForm: vi.fn(),
  setDayStatusForm: vi.fn(),
  setBodyweightForm: vi.fn(),
  submitExercise: vi.fn(),
  submitTemplate: vi.fn(),
  submitSession: vi.fn(),
  submitDayStatus: vi.fn(),
  submitBodyweight: vi.fn(),
  reload: vi.fn()
};

vi.mock("./useWorkoutState", () => ({
  useWorkoutState: () => mockState
}));

describe("WorkoutApp", () => {
  it("renders mobile navigation and overview values", () => {
    const html = renderToString(
      <MemoryRouter>
        <WorkoutApp />
      </MemoryRouter>
    );

    expect(html).toContain("Workout");
    expect(html).toContain("Overview");
    expect(html).toContain("Log Workout");
    expect(html).toContain("Templates");
    expect(html).toContain("Progress");
    expect(html).toContain("More");
    expect(html).toContain("Total sessions");
    expect(html).toContain("Rest days this month");
  });

  it("renders offline banner when module is offline", () => {
    const html = renderToString(
      <MemoryRouter>
        <WorkoutApp />
      </MemoryRouter>
    );
    expect(html).not.toContain("Offline mode: showing last synced workout data.");

    mockState.isOffline = true;
    const offlineHtml = renderToString(
      <MemoryRouter>
        <WorkoutApp />
      </MemoryRouter>
    );
    expect(offlineHtml).toContain("Offline mode: showing last synced workout data.");
    mockState.isOffline = false;
  });

  it("renders backend error when present", () => {
    mockState.error = "Backend unavailable";
    const html = renderToString(
      <MemoryRouter>
        <WorkoutApp />
      </MemoryRouter>
    );
    expect(html).toContain("Backend unavailable");
    mockState.error = null;
  });
});
