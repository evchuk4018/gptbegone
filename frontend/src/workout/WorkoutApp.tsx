import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { WorkoutExerciseType } from "../types";
import { useWorkoutState } from "./useWorkoutState";

type PrimaryTab = "overview" | "log" | "templates" | "progress" | "more";
type MoreTab = "calendar" | "bodyweight";

const primaryTabs: Array<{ id: PrimaryTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "log", label: "Log Workout" },
  { id: "templates", label: "Templates" },
  { id: "progress", label: "Progress" },
  { id: "more", label: "More" }
];

function numberOrDash(value: number | null | undefined): string {
  return value === null || value === undefined ? "--" : value.toFixed(2);
}

function prettyExerciseType(exerciseType: WorkoutExerciseType): string {
  return exerciseType === "strength" ? "Strength" : "Cardio";
}

export function WorkoutApp() {
  const state = useWorkoutState();
  const [activeTab, setActiveTab] = useState<PrimaryTab>("overview");
  const [moreTab, setMoreTab] = useState<MoreTab>("calendar");

  const exercisesById = useMemo(() => {
    return new Map(state.exercises.map((exercise) => [exercise.id, exercise]));
  }, [state.exercises]);

  return (
    <div className="workout-shell">
      <div className="workout-canvas">
        <header className="workout-mobile-header">
          <div>
            <p className="workout-kicker">Training Ledger</p>
            <h1>Workout</h1>
          </div>
          <div className="workout-status">
            {state.isOffline ? <span className="workout-status-pill offline">Offline</span> : null}
            {!state.isOffline ? <span className="workout-status-pill">Online</span> : null}
          </div>
        </header>

        <nav className="workout-top-links">
          <Link to="/">Home</Link>
          <Link to="/ai">AI Chat</Link>
          <Link to="/money">Money</Link>
        </nav>

        {state.loading ? <div className="workout-banner">Syncing workout data...</div> : null}
        {state.error ? <div className="workout-banner error">{state.error}</div> : null}
        {state.isOffline && !state.error ? (
          <div className="workout-banner">Offline mode: showing last synced workout data.</div>
        ) : null}

        <main className="workout-mobile-content">
          {activeTab === "overview" ? (
            <section className="workout-stack">
              <article className="workout-card">
                <h2>Snapshot</h2>
                <div className="workout-stat-grid">
                  <div>
                    <small>Total sessions</small>
                    <strong>{state.overview.totalSessions}</strong>
                  </div>
                  <div>
                    <small>Rest days this month</small>
                    <strong>{state.overview.restDays}</strong>
                  </div>
                  <div>
                    <small>Templates</small>
                    <strong>{state.templates.length}</strong>
                  </div>
                  <div>
                    <small>Latest bodyweight</small>
                    <strong>{state.overview.latestWeight ?? "No entry"}</strong>
                  </div>
                  <div>
                    <small>Delta vs prior</small>
                    <strong>{numberOrDash(state.overview.weightDelta)}</strong>
                  </div>
                </div>
              </article>

              <article className="workout-card">
                <h2>Recent Sessions</h2>
                <div className="workout-list">
                  {state.sessions.slice(0, 12).map((session) => (
                    <div key={session.id} className="workout-list-item">
                      <div className="workout-list-head">
                        <strong>{session.title}</strong>
                        <span>{session.workoutDate}</span>
                      </div>
                      <p>{session.items.length} items</p>
                      <p>{session.notes || "No notes"}</p>
                    </div>
                  ))}
                  {state.sessions.length === 0 ? <p className="workout-empty">No sessions yet.</p> : null}
                </div>
              </article>
            </section>
          ) : null}

          {activeTab === "log" ? (
            <section className="workout-stack">
              <article className="workout-card">
                <h2>Log Workout Session</h2>
                <div className="workout-form-grid">
                  <label>
                    Date
                    <input
                      type="date"
                      value={state.sessionForm.workoutDate}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, workoutDate: event.target.value }))}
                    />
                  </label>
                  <label>
                    Title
                    <input
                      value={state.sessionForm.title}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, title: event.target.value }))}
                    />
                  </label>
                  <label>
                    Template (optional)
                    <select
                      value={state.sessionForm.templateId}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, templateId: event.target.value }))}
                    >
                      <option value="">None</option>
                      {state.templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Exercise
                    <select
                      value={state.sessionForm.exerciseId}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, exerciseId: event.target.value }))}
                    >
                      {state.exercises.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name} ({prettyExerciseType(exercise.exerciseType)})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Reps
                    <input
                      value={state.sessionForm.setReps}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, setReps: event.target.value }))}
                    />
                  </label>
                  <label>
                    Weight
                    <input
                      value={state.sessionForm.setWeight}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, setWeight: event.target.value }))}
                    />
                  </label>
                  <label>
                    Duration sec
                    <input
                      value={state.sessionForm.setDurationSeconds}
                      onChange={(event) =>
                        state.setSessionForm((prev) => ({ ...prev, setDurationSeconds: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Distance
                    <input
                      value={state.sessionForm.setDistance}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, setDistance: event.target.value }))}
                    />
                  </label>
                  <label>
                    Pace
                    <input
                      value={state.sessionForm.setPace}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, setPace: event.target.value }))}
                    />
                  </label>
                  <label>
                    Intensity / RPE
                    <input
                      value={state.sessionForm.setIntensity}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, setIntensity: event.target.value }))}
                    />
                  </label>
                  <label>
                    Heart Rate
                    <input
                      value={state.sessionForm.setHeartRate}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, setHeartRate: event.target.value }))}
                    />
                  </label>
                  <label>
                    Notes
                    <input
                      value={state.sessionForm.notes}
                      onChange={(event) => state.setSessionForm((prev) => ({ ...prev, notes: event.target.value }))}
                    />
                  </label>
                  <button type="button" className="workout-action" onClick={() => void state.submitSession()}>
                    Save Session
                  </button>
                </div>
              </article>

              <article className="workout-card">
                <h2>Add Exercise</h2>
                <div className="workout-form-grid">
                  <label>
                    Name
                    <input
                      value={state.exerciseForm.name}
                      onChange={(event) => state.setExerciseForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </label>
                  <label>
                    Type
                    <select
                      value={state.exerciseForm.exerciseType}
                      onChange={(event) =>
                        state.setExerciseForm((prev) => ({
                          ...prev,
                          exerciseType: event.target.value as "strength" | "cardio"
                        }))
                      }
                    >
                      <option value="strength">Strength</option>
                      <option value="cardio">Cardio</option>
                    </select>
                  </label>
                  <label>
                    Muscle Group
                    <input
                      value={state.exerciseForm.muscleGroup}
                      onChange={(event) => state.setExerciseForm((prev) => ({ ...prev, muscleGroup: event.target.value }))}
                    />
                  </label>
                  <label>
                    Equipment
                    <input
                      value={state.exerciseForm.equipment}
                      onChange={(event) => state.setExerciseForm((prev) => ({ ...prev, equipment: event.target.value }))}
                    />
                  </label>
                  <button type="button" className="workout-action secondary" onClick={() => void state.submitExercise()}>
                    Create Exercise
                  </button>
                </div>
              </article>
            </section>
          ) : null}

          {activeTab === "templates" ? (
            <section className="workout-stack">
              <article className="workout-card">
                <h2>Create Template</h2>
                <div className="workout-form-grid">
                  <label>
                    Name
                    <input
                      value={state.templateForm.name}
                      onChange={(event) => state.setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </label>
                  <label>
                    Exercise
                    <select
                      value={state.templateForm.exerciseId}
                      onChange={(event) => state.setTemplateForm((prev) => ({ ...prev, exerciseId: event.target.value }))}
                    >
                      {state.exercises.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Target sets
                    <input
                      value={state.templateForm.targetSets}
                      onChange={(event) => state.setTemplateForm((prev) => ({ ...prev, targetSets: event.target.value }))}
                    />
                  </label>
                  <label>
                    Target reps
                    <input
                      value={state.templateForm.targetReps}
                      onChange={(event) => state.setTemplateForm((prev) => ({ ...prev, targetReps: event.target.value }))}
                    />
                  </label>
                  <label>
                    Target weight
                    <input
                      value={state.templateForm.targetWeight}
                      onChange={(event) => state.setTemplateForm((prev) => ({ ...prev, targetWeight: event.target.value }))}
                    />
                  </label>
                  <label>
                    Target duration sec
                    <input
                      value={state.templateForm.targetDurationSeconds}
                      onChange={(event) =>
                        state.setTemplateForm((prev) => ({ ...prev, targetDurationSeconds: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Target distance
                    <input
                      value={state.templateForm.targetDistance}
                      onChange={(event) => state.setTemplateForm((prev) => ({ ...prev, targetDistance: event.target.value }))}
                    />
                  </label>
                  <label>
                    Target pace
                    <input
                      value={state.templateForm.targetPace}
                      onChange={(event) => state.setTemplateForm((prev) => ({ ...prev, targetPace: event.target.value }))}
                    />
                  </label>
                  <label>
                    Target intensity
                    <input
                      value={state.templateForm.targetIntensity}
                      onChange={(event) =>
                        state.setTemplateForm((prev) => ({ ...prev, targetIntensity: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Target heart rate
                    <input
                      value={state.templateForm.targetHeartRate}
                      onChange={(event) =>
                        state.setTemplateForm((prev) => ({ ...prev, targetHeartRate: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Notes
                    <input
                      value={state.templateForm.notes}
                      onChange={(event) => state.setTemplateForm((prev) => ({ ...prev, notes: event.target.value }))}
                    />
                  </label>
                  <button type="button" className="workout-action" onClick={() => void state.submitTemplate()}>
                    Save Template
                  </button>
                </div>
              </article>

              <article className="workout-card">
                <h2>Current Templates</h2>
                <div className="workout-list">
                  {state.templates.map((template) => (
                    <div key={template.id} className="workout-list-item">
                      <div className="workout-list-head">
                        <strong>{template.name}</strong>
                        <span>{template.items.length} items</span>
                      </div>
                      <p>{template.notes || "No notes"}</p>
                      <p>
                        {template.items
                          .map((item) => exercisesById.get(item.exerciseId)?.name ?? item.exerciseId)
                          .slice(0, 3)
                          .join(" - ") || "No exercises"}
                      </p>
                    </div>
                  ))}
                  {state.templates.length === 0 ? <p className="workout-empty">No templates yet.</p> : null}
                </div>
              </article>
            </section>
          ) : null}

          {activeTab === "progress" ? (
            <section className="workout-stack workout-stack-tablet">
              <article className="workout-card">
                <h2>Personal Records</h2>
                <div className="workout-list">
                  {state.prs.map((pr) => (
                    <div key={pr.exerciseId} className="workout-list-item">
                      <div className="workout-list-head">
                        <strong>{pr.exerciseName}</strong>
                        <span>{prettyExerciseType(pr.exerciseType)}</span>
                      </div>
                      <p>
                        Max weight {numberOrDash(pr.strength?.maxWeight)} - Max reps {numberOrDash(pr.strength?.maxReps)} - Max
                        volume {numberOrDash(pr.strength?.maxVolume)}
                      </p>
                      <p>
                        Longest distance {numberOrDash(pr.cardio?.longestDistance)} - Fastest pace{" "}
                        {numberOrDash(pr.cardio?.fastestPace)}
                      </p>
                    </div>
                  ))}
                  {state.prs.length === 0 ? <p className="workout-empty">No PRs yet.</p> : null}
                </div>
              </article>

              <article className="workout-card">
                <h2>Strength Progress</h2>
                <div className="workout-list">
                  {state.strengthProgress.map((point) => (
                    <div key={`${point.workoutDate}-${point.exerciseId}`} className="workout-list-item">
                      <div className="workout-list-head">
                        <strong>{exercisesById.get(point.exerciseId)?.name ?? point.exerciseId}</strong>
                        <span>{point.workoutDate}</span>
                      </div>
                      <p>
                        Weight {point.maxWeight.toFixed(2)} - Reps {point.maxReps.toFixed(2)} - Volume{" "}
                        {point.maxVolume.toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {state.strengthProgress.length === 0 ? <p className="workout-empty">No strength logs yet.</p> : null}
                </div>
              </article>

              <article className="workout-card">
                <h2>Cardio Progress</h2>
                <div className="workout-list">
                  {state.cardioProgress.map((point) => (
                    <div key={`${point.workoutDate}-${point.exerciseId}`} className="workout-list-item">
                      <div className="workout-list-head">
                        <strong>{exercisesById.get(point.exerciseId)?.name ?? point.exerciseId}</strong>
                        <span>{point.workoutDate}</span>
                      </div>
                      <p>
                        Distance {point.totalDistance.toFixed(2)} - Pace {numberOrDash(point.bestPace)} - Avg HR{" "}
                        {numberOrDash(point.avgHeartRate)}
                      </p>
                    </div>
                  ))}
                  {state.cardioProgress.length === 0 ? <p className="workout-empty">No cardio logs yet.</p> : null}
                </div>
              </article>
            </section>
          ) : null}

          {activeTab === "more" ? (
            <section className="workout-stack">
              <div className="workout-pill-row">
                <button
                  type="button"
                  className={`workout-pill ${moreTab === "calendar" ? "active" : ""}`}
                  onClick={() => setMoreTab("calendar")}
                >
                  Calendar
                </button>
                <button
                  type="button"
                  className={`workout-pill ${moreTab === "bodyweight" ? "active" : ""}`}
                  onClick={() => setMoreTab("bodyweight")}
                >
                  Bodyweight
                </button>
              </div>

              {moreTab === "calendar" ? (
                <>
                  <article className="workout-card">
                    <h2>Calendar Month</h2>
                    <label>
                      Month
                      <input type="month" value={state.month} onChange={(event) => state.setMonth(event.target.value)} />
                    </label>
                  </article>

                  <article className="workout-card">
                    <h2>Mark Rest Day</h2>
                    <div className="workout-form-grid">
                      <label>
                        Date
                        <input
                          type="date"
                          value={state.dayStatusForm.date}
                          onChange={(event) => state.setDayStatusForm((prev) => ({ ...prev, date: event.target.value }))}
                        />
                      </label>
                      <label>
                        Rest day
                        <select
                          value={state.dayStatusForm.isRestDay ? "yes" : "no"}
                          onChange={(event) =>
                            state.setDayStatusForm((prev) => ({ ...prev, isRestDay: event.target.value === "yes" }))
                          }
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label>
                        Notes
                        <input
                          value={state.dayStatusForm.notes}
                          onChange={(event) => state.setDayStatusForm((prev) => ({ ...prev, notes: event.target.value }))}
                        />
                      </label>
                      <button type="button" className="workout-action" onClick={() => void state.submitDayStatus()}>
                        Save Day Status
                      </button>
                    </div>
                  </article>

                  <article className="workout-card">
                    <h2>Calendar Snapshot</h2>
                    <div className="workout-list">
                      {state.calendarDays.map((day) => (
                        <div key={day.date} className="workout-list-item">
                          <div className="workout-list-head">
                            <strong>{day.date}</strong>
                            <span>{day.sessionCount} sessions</span>
                          </div>
                          <p>{day.isRestDay ? "Rest day" : "Training day"}</p>
                          <p>{day.notes || "No notes"}</p>
                        </div>
                      ))}
                      {state.calendarDays.length === 0 ? <p className="workout-empty">No calendar entries yet.</p> : null}
                    </div>
                  </article>
                </>
              ) : null}

              {moreTab === "bodyweight" ? (
                <>
                  <article className="workout-card">
                    <h2>Add Bodyweight Entry</h2>
                    <div className="workout-form-grid">
                      <label>
                        Date
                        <input
                          type="date"
                          value={state.bodyweightForm.entryDate}
                          onChange={(event) =>
                            state.setBodyweightForm((prev) => ({ ...prev, entryDate: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Weight
                        <input
                          value={state.bodyweightForm.weight}
                          onChange={(event) => state.setBodyweightForm((prev) => ({ ...prev, weight: event.target.value }))}
                        />
                      </label>
                      <label>
                        Notes
                        <input
                          value={state.bodyweightForm.notes}
                          onChange={(event) => state.setBodyweightForm((prev) => ({ ...prev, notes: event.target.value }))}
                        />
                      </label>
                      <button type="button" className="workout-action" onClick={() => void state.submitBodyweight()}>
                        Save Bodyweight
                      </button>
                    </div>
                  </article>

                  <article className="workout-card">
                    <h2>Bodyweight History</h2>
                    <div className="workout-list">
                      {state.bodyweightEntries.map((entry) => (
                        <div key={entry.id} className="workout-list-item">
                          <div className="workout-list-head">
                            <strong>{entry.entryDate}</strong>
                            <span>{entry.weight.toFixed(2)}</span>
                          </div>
                          <p>{entry.notes || "No notes"}</p>
                        </div>
                      ))}
                      {state.bodyweightEntries.length === 0 ? <p className="workout-empty">No bodyweight entries yet.</p> : null}
                    </div>
                  </article>
                </>
              ) : null}
            </section>
          ) : null}
        </main>

        <nav className="workout-bottom-nav" aria-label="Workout sections">
          {primaryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`workout-bottom-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
