import { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkoutState } from "./useWorkoutState";

type WorkoutTab = "overview" | "log" | "templates" | "calendar" | "progress" | "bodyweight";

const tabs: Array<{ id: WorkoutTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "log", label: "Log Workout" },
  { id: "templates", label: "Templates / Routines" },
  { id: "calendar", label: "Calendar + Rest Days" },
  { id: "progress", label: "Progress + PRs" },
  { id: "bodyweight", label: "Bodyweight" }
];

function numberOrDash(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : value.toFixed(2);
}

export function WorkoutApp() {
  const state = useWorkoutState();
  const [activeTab, setActiveTab] = useState<WorkoutTab>("overview");

  return (
    <div className="workout-shell">
      <header className="workout-header">
        <div>
          <p className="workout-kicker">Training Ledger</p>
          <h1>Workout Tracking</h1>
          <p>Log sessions, monitor strength and cardio progress, mark rest days, and track bodyweight trends.</p>
        </div>
        <nav className="workout-top-links">
          <Link to="/">Home</Link>
          <Link to="/ai">AI Chat</Link>
          <Link to="/money">Money</Link>
        </nav>
      </header>

      <div className="workout-tab-row">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`workout-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {state.loading ? <div className="workout-banner">Loading workout module...</div> : null}
      {state.error ? <div className="workout-banner error">{state.error}</div> : null}

      {activeTab === "overview" ? (
        <section className="workout-grid">
          <article className="workout-card">
            <h2>Session Summary</h2>
            <p>Total sessions: {state.overview.totalSessions}</p>
            <p>Rest days this month: {state.overview.restDays}</p>
            <p>Templates: {state.templates.length}</p>
          </article>
          <article className="workout-card">
            <h2>Bodyweight Snapshot</h2>
            <p>Latest weight: {state.overview.latestWeight ?? "No entry"}</p>
            <p>Delta vs prior: {numberOrDash(state.overview.weightDelta)}</p>
            <p>Entries: {state.bodyweightEntries.length}</p>
          </article>
          <article className="workout-card workout-card-wide">
            <h2>Recent Sessions</h2>
            <div className="workout-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Items</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {state.sessions.slice(0, 12).map((session) => (
                    <tr key={session.id}>
                      <td>{session.workoutDate}</td>
                      <td>{session.title}</td>
                      <td>{session.items.length}</td>
                      <td>{session.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "log" ? (
        <section className="workout-grid">
          <article className="workout-card workout-card-wide">
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
                      {exercise.name} ({exercise.exerciseType})
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
                  onChange={(event) => state.setSessionForm((prev) => ({ ...prev, setDurationSeconds: event.target.value }))}
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
            <div className="workout-form-grid compact">
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
              <button type="button" className="workout-action" onClick={() => void state.submitExercise()}>
                Create Exercise
              </button>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "templates" ? (
        <section className="workout-grid">
          <article className="workout-card workout-card-wide">
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
                  onChange={(event) => state.setTemplateForm((prev) => ({ ...prev, targetIntensity: event.target.value }))}
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

          <article className="workout-card workout-card-wide">
            <h2>Current Templates</h2>
            <div className="workout-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Items</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {state.templates.map((template) => (
                    <tr key={template.id}>
                      <td>{template.name}</td>
                      <td>{template.items.length}</td>
                      <td>{template.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "calendar" ? (
        <section className="workout-grid">
          <article className="workout-card">
            <h2>Month</h2>
            <label>
              Calendar month
              <input type="month" value={state.month} onChange={(event) => state.setMonth(event.target.value)} />
            </label>
          </article>
          <article className="workout-card">
            <h2>Mark Rest Day</h2>
            <div className="workout-form-grid compact">
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
                  onChange={(event) => state.setDayStatusForm((prev) => ({ ...prev, isRestDay: event.target.value === "yes" }))}
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
          <article className="workout-card workout-card-wide">
            <h2>Calendar Snapshot</h2>
            <div className="workout-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sessions</th>
                    <th>Rest Day</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {state.calendarDays.map((day) => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.sessionCount}</td>
                      <td>{day.isRestDay ? "Yes" : "No"}</td>
                      <td>{day.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "progress" ? (
        <section className="workout-grid">
          <article className="workout-card workout-card-wide">
            <h2>Strength Progress</h2>
            <div className="workout-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Exercise</th>
                    <th>Max Weight</th>
                    <th>Max Reps</th>
                    <th>Max Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {state.strengthProgress.map((point) => (
                    <tr key={`${point.workoutDate}-${point.exerciseId}`}>
                      <td>{point.workoutDate}</td>
                      <td>{state.exercises.find((exercise) => exercise.id === point.exerciseId)?.name ?? point.exerciseId}</td>
                      <td>{point.maxWeight.toFixed(2)}</td>
                      <td>{point.maxReps.toFixed(2)}</td>
                      <td>{point.maxVolume.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="workout-card workout-card-wide">
            <h2>Cardio Progress</h2>
            <div className="workout-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Exercise</th>
                    <th>Total Distance</th>
                    <th>Best Pace</th>
                    <th>Avg Heart Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {state.cardioProgress.map((point) => (
                    <tr key={`${point.workoutDate}-${point.exerciseId}`}>
                      <td>{point.workoutDate}</td>
                      <td>{state.exercises.find((exercise) => exercise.id === point.exerciseId)?.name ?? point.exerciseId}</td>
                      <td>{point.totalDistance.toFixed(2)}</td>
                      <td>{numberOrDash(point.bestPace)}</td>
                      <td>{numberOrDash(point.avgHeartRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="workout-card workout-card-wide">
            <h2>Personal Records</h2>
            <div className="workout-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Type</th>
                    <th>Max Weight</th>
                    <th>Max Reps</th>
                    <th>Max Volume</th>
                    <th>Longest Distance</th>
                    <th>Fastest Pace</th>
                  </tr>
                </thead>
                <tbody>
                  {state.prs.map((pr) => (
                    <tr key={pr.exerciseId}>
                      <td>{pr.exerciseName}</td>
                      <td>{pr.exerciseType}</td>
                      <td>{numberOrDash(pr.strength?.maxWeight)}</td>
                      <td>{numberOrDash(pr.strength?.maxReps)}</td>
                      <td>{numberOrDash(pr.strength?.maxVolume)}</td>
                      <td>{numberOrDash(pr.cardio?.longestDistance)}</td>
                      <td>{numberOrDash(pr.cardio?.fastestPace)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "bodyweight" ? (
        <section className="workout-grid">
          <article className="workout-card">
            <h2>Add Bodyweight Entry</h2>
            <div className="workout-form-grid compact">
              <label>
                Date
                <input
                  type="date"
                  value={state.bodyweightForm.entryDate}
                  onChange={(event) => state.setBodyweightForm((prev) => ({ ...prev, entryDate: event.target.value }))}
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
          <article className="workout-card workout-card-wide">
            <h2>Bodyweight History</h2>
            <div className="workout-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {state.bodyweightEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.entryDate}</td>
                      <td>{entry.weight.toFixed(2)}</td>
                      <td>{entry.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}
