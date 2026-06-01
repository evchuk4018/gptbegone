import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { appDataDir, defaultModelsDir } from "./utils.js";

const dbPath = path.join(appDataDir, "app.db");

if (!fs.existsSync(appDataDir)) {
  fs.mkdirSync(appDataDir, { recursive: true });
}
if (!fs.existsSync(defaultModelsDir)) {
  fs.mkdirSync(defaultModelsDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('ollama', 'llama-cpp')),
  thinking INTEGER NOT NULL DEFAULT 1,
  flash INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  default_provider TEXT NOT NULL CHECK (default_provider IN ('ollama', 'llama-cpp')),
  ollama_base_url TEXT NOT NULL,
  llama_cpp_base_url TEXT NOT NULL,
  llama_models_dir TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS money_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  invest_pct REAL NOT NULL,
  spend_pct REAL NOT NULL,
  cash_pct REAL NOT NULL,
  emergency_fund_target REAL NOT NULL,
  fi_annual_spending_target REAL NOT NULL,
  fi_multiplier REAL NOT NULL,
  real_return_rate REAL NOT NULL,
  roth_ira_limit REAL NOT NULL,
  k401_limit REAL NOT NULL,
  roth_ira_split REAL NOT NULL,
  k401_split REAL NOT NULL,
  taxable_split REAL NOT NULL,
  social_security_rate REAL NOT NULL,
  medicare_rate REAL NOT NULL,
  state_income_tax_rate REAL NOT NULL,
  local_income_tax_rate REAL NOT NULL,
  starting_bank_balance REAL NOT NULL,
  starting_invested_balance REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS money_jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  pay_type TEXT NOT NULL CHECK (pay_type IN ('hourly', 'salary')),
  hourly_rate REAL NOT NULL,
  annual_salary REAL NOT NULL,
  est_tax_pct REAL NOT NULL,
  notes TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS money_work_logs (
  id TEXT PRIMARY KEY,
  work_date TEXT NOT NULL,
  year_label TEXT NOT NULL,
  job_id TEXT NOT NULL,
  hours REAL NOT NULL,
  rate_override REAL,
  effective_rate REAL NOT NULL,
  gross_pay REAL NOT NULL,
  est_tax_pct REAL NOT NULL,
  est_net_pay REAL NOT NULL,
  rec_spend REAL NOT NULL,
  rec_invest REAL NOT NULL,
  rec_cash REAL NOT NULL,
  actual_spend REAL NOT NULL,
  actual_invested_transfer REAL NOT NULL,
  bank_balance REAL NOT NULL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES money_jobs(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS money_paycheck_checks (
  id TEXT PRIMARY KEY,
  year_label TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  job_id TEXT,
  gross_received REAL NOT NULL,
  tolerance REAL NOT NULL,
  expected_gross REAL NOT NULL,
  difference REAL NOT NULL,
  total_hours REAL NOT NULL,
  average_rate REAL NOT NULL,
  missing_hours REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS money_budget_categories (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  category_name TEXT NOT NULL,
  planned_amount REAL NOT NULL,
  actual_amount_override REAL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(month, category_name)
);

CREATE TABLE IF NOT EXISTS money_recurring_expenses (
  id TEXT PRIMARY KEY,
  category_name TEXT NOT NULL,
  expense_name TEXT NOT NULL,
  amount REAL NOT NULL,
  start_month TEXT NOT NULL,
  end_month TEXT,
  day_of_month INTEGER NOT NULL,
  notes TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS money_holdings (
  id TEXT PRIMARY KEY,
  holding_date TEXT NOT NULL,
  account_name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  display_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'bond', 'mutual_fund', 'etf', 'cash', 'other')),
  units REAL NOT NULL,
  cost_basis_per_unit REAL NOT NULL,
  current_price REAL NOT NULL,
  sector TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS money_contributions (
  id TEXT PRIMARY KEY,
  entry_date TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('roth_ira', 'k401', 'taxable', 'cash')),
  contribution REAL NOT NULL,
  employer_match REAL NOT NULL,
  withdrawal REAL NOT NULL,
  tax_year INTEGER NOT NULL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS money_price_updates (
  id TEXT PRIMARY KEY,
  ticker TEXT NOT NULL,
  price REAL NOT NULL,
  price_date TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('strength', 'cardio')),
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_template_items (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps REAL,
  target_weight REAL,
  target_duration_seconds REAL,
  target_distance REAL,
  target_pace REAL,
  target_intensity REAL,
  target_heart_rate REAL,
  notes TEXT NOT NULL,
  FOREIGN KEY(template_id) REFERENCES workout_templates(id) ON DELETE CASCADE,
  FOREIGN KEY(exercise_id) REFERENCES workout_exercises(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  workout_date TEXT NOT NULL,
  title TEXT NOT NULL,
  template_id TEXT,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(template_id) REFERENCES workout_templates(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS workout_session_items (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  notes TEXT NOT NULL,
  FOREIGN KEY(session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY(exercise_id) REFERENCES workout_exercises(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS workout_session_sets (
  id TEXT PRIMARY KEY,
  session_item_id TEXT NOT NULL,
  set_index INTEGER NOT NULL,
  reps REAL,
  weight REAL,
  duration_seconds REAL,
  distance REAL,
  pace REAL,
  intensity REAL,
  heart_rate REAL,
  notes TEXT NOT NULL,
  FOREIGN KEY(session_item_id) REFERENCES workout_session_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workout_day_status (
  status_date TEXT PRIMARY KEY,
  is_rest_day INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_bodyweight_entries (
  id TEXT PRIMARY KEY,
  entry_date TEXT NOT NULL,
  weight REAL NOT NULL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`);

db.exec(`
INSERT INTO settings (id, default_provider, ollama_base_url, llama_cpp_base_url, llama_models_dir)
SELECT 1, 'ollama', 'http://127.0.0.1:11434', 'http://127.0.0.1:8080', '${defaultModelsDir.replace(/\\/g, "/")}'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);

INSERT INTO money_settings (
  id,
  invest_pct,
  spend_pct,
  cash_pct,
  emergency_fund_target,
  fi_annual_spending_target,
  fi_multiplier,
  real_return_rate,
  roth_ira_limit,
  k401_limit,
  roth_ira_split,
  k401_split,
  taxable_split,
  social_security_rate,
  medicare_rate,
  state_income_tax_rate,
  local_income_tax_rate,
  starting_bank_balance,
  starting_invested_balance
)
SELECT
  1,
  0.5,
  0.35,
  0.15,
  5000,
  35000,
  25,
  0.05,
  7500,
  24500,
  0.2,
  0.3,
  0.5,
  0.062,
  0.0145,
  0.0307,
  0.01,
  10000,
  0
WHERE NOT EXISTS (SELECT 1 FROM money_settings WHERE id = 1);
`);

const now = new Date().toISOString();
db.prepare(
  `
  INSERT OR IGNORE INTO money_jobs (
    id,
    name,
    pay_type,
    hourly_rate,
    annual_salary,
    est_tax_pct,
    notes,
    active,
    created_at,
    updated_at
  ) VALUES
    ('job-summer', 'Summer job', 'hourly', 15, 0, 0.1179, '40-50 hr/week summer', 1, ?, ?),
    ('job-school', 'School-year job', 'hourly', 15, 0, 0.1179, '10+ hr/week during school', 1, ?, ?),
    ('job-internship', 'Internship/co-op', 'hourly', 22, 0, 0.1179, 'Conservative placeholder', 1, ?, ?),
    ('job-engineering', 'Future engineering job', 'salary', 0, 75000, 0.1179, 'Approx. $75k/year equivalent', 1, ?, ?)
`
).run(now, now, now, now, now, now, now, now);

db.prepare(
  `
  INSERT OR IGNORE INTO workout_exercises (
    id,
    name,
    exercise_type,
    muscle_group,
    equipment,
    is_custom,
    active,
    created_at,
    updated_at
  ) VALUES
    ('ex-back-squat', 'Back Squat', 'strength', 'legs', 'barbell', 0, 1, ?, ?),
    ('ex-bench-press', 'Bench Press', 'strength', 'chest', 'barbell', 0, 1, ?, ?),
    ('ex-deadlift', 'Deadlift', 'strength', 'posterior_chain', 'barbell', 0, 1, ?, ?),
    ('ex-overhead-press', 'Overhead Press', 'strength', 'shoulders', 'barbell', 0, 1, ?, ?),
    ('ex-pull-up', 'Pull-Up', 'strength', 'back', 'bodyweight', 0, 1, ?, ?),
    ('ex-barbell-row', 'Barbell Row', 'strength', 'back', 'barbell', 0, 1, ?, ?),
    ('ex-running', 'Running', 'cardio', 'cardio', 'none', 0, 1, ?, ?),
    ('ex-cycling', 'Cycling', 'cardio', 'cardio', 'bike', 0, 1, ?, ?),
    ('ex-rowing', 'Rowing', 'cardio', 'cardio', 'rower', 0, 1, ?, ?),
    ('ex-jump-rope', 'Jump Rope', 'cardio', 'cardio', 'rope', 0, 1, ?, ?)
`
).run(now, now, now, now, now, now, now, now, now, now, now, now, now, now, now, now, now, now, now, now);

export { db };

export function resetForTests(): void {
  db.exec("DELETE FROM workout_bodyweight_entries;");
  db.exec("DELETE FROM workout_day_status;");
  db.exec("DELETE FROM workout_session_sets;");
  db.exec("DELETE FROM workout_session_items;");
  db.exec("DELETE FROM workout_sessions;");
  db.exec("DELETE FROM workout_template_items;");
  db.exec("DELETE FROM workout_templates;");
  db.exec("DELETE FROM workout_exercises WHERE is_custom = 1;");
  db.exec("DELETE FROM money_price_updates;");
  db.exec("DELETE FROM money_contributions;");
  db.exec("DELETE FROM money_holdings;");
  db.exec("DELETE FROM money_recurring_expenses;");
  db.exec("DELETE FROM money_budget_categories;");
  db.exec("DELETE FROM money_paycheck_checks;");
  db.exec("DELETE FROM money_work_logs;");
  db.exec("DELETE FROM money_jobs;");
  db.exec("DELETE FROM messages;");
  db.exec("DELETE FROM chats;");

  db.prepare(
    `
    UPDATE money_settings
    SET
      invest_pct = 0.5,
      spend_pct = 0.35,
      cash_pct = 0.15,
      emergency_fund_target = 5000,
      fi_annual_spending_target = 35000,
      fi_multiplier = 25,
      real_return_rate = 0.05,
      roth_ira_limit = 7500,
      k401_limit = 24500,
      roth_ira_split = 0.2,
      k401_split = 0.3,
      taxable_split = 0.5,
      social_security_rate = 0.062,
      medicare_rate = 0.0145,
      state_income_tax_rate = 0.0307,
      local_income_tax_rate = 0.01,
      starting_bank_balance = 10000,
      starting_invested_balance = 0
    WHERE id = 1
  `
  ).run();

  const now = new Date().toISOString();
  db.prepare(
    `
    INSERT OR IGNORE INTO money_jobs (
      id,
      name,
      pay_type,
      hourly_rate,
      annual_salary,
      est_tax_pct,
      notes,
      active,
      created_at,
      updated_at
    ) VALUES
      ('job-summer', 'Summer job', 'hourly', 15, 0, 0.1179, '40-50 hr/week summer', 1, ?, ?),
      ('job-school', 'School-year job', 'hourly', 15, 0, 0.1179, '10+ hr/week during school', 1, ?, ?),
      ('job-internship', 'Internship/co-op', 'hourly', 22, 0, 0.1179, 'Conservative placeholder', 1, ?, ?),
      ('job-engineering', 'Future engineering job', 'salary', 0, 75000, 0.1179, 'Approx. $75k/year equivalent', 1, ?, ?)
  `
  ).run(now, now, now, now, now, now, now, now);
}
