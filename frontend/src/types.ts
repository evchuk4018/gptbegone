export type ProviderName = "ollama" | "llama-cpp";

export type ChatMode = {
  thinking: boolean;
  flash: boolean;
};

export type ChatSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  provider: ProviderName;
  mode: ChatMode;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type ChatDetail = ChatSummary & {
  messages: ChatMessage[];
};

export type InstalledModel = {
  id: string;
  name: string;
  provider: ProviderName;
  source: "installed" | "downloaded";
};

export type Settings = {
  defaultProvider: ProviderName;
  ollamaBaseUrl: string;
  llamaCppBaseUrl: string;
  llamaModelsDir: string;
};

export type MoneySettings = {
  investPct: number;
  spendPct: number;
  cashPct: number;
  emergencyFundTarget: number;
  fiAnnualSpendingTarget: number;
  fiMultiplier: number;
  realReturnRate: number;
  rothIraLimit: number;
  k401Limit: number;
  rothIraSplit: number;
  k401Split: number;
  taxableSplit: number;
  socialSecurityRate: number;
  medicareRate: number;
  stateIncomeTaxRate: number;
  localIncomeTaxRate: number;
  startingBankBalance: number;
  startingInvestedBalance: number;
};

export type JobProfile = {
  id: string;
  name: string;
  payType: "hourly" | "salary";
  hourlyRate: number;
  annualSalary: number;
  effectiveHourly: number;
  estTaxPct: number;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkLogEntry = {
  id: string;
  workDate: string;
  yearLabel: string;
  jobId: string;
  hours: number;
  rateOverride: number | null;
  effectiveRate: number;
  grossPay: number;
  estTaxPct: number;
  estNetPay: number;
  recSpend: number;
  recInvest: number;
  recCash: number;
  actualSpend: number;
  actualInvestedTransfer: number;
  bankBalance: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type PaycheckCheckResult = {
  id: string;
  yearLabel: string;
  startDate: string;
  endDate: string;
  jobId: string | "all";
  grossReceived: number;
  tolerance: number;
  expectedGross: number;
  difference: number;
  totalHours: number;
  averageRate: number;
  missingHours: number;
  status: "looks_ok" | "possible_missing_pay_or_hours" | "received_more_than_logged";
  createdAt: string;
};

export type BudgetCategoryPlan = {
  id: string;
  month: string;
  categoryName: string;
  plannedAmount: number;
  actualAmountOverride: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetActual = {
  month: string;
  categoryName: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
};

export type RecurringExpense = {
  id: string;
  categoryName: string;
  expenseName: string;
  amount: number;
  startMonth: string;
  endMonth: string | null;
  dayOfMonth: number;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HoldingValuation = {
  id: string;
  holdingDate: string;
  accountName: string;
  ticker: string;
  displayName: string;
  assetType: "stock" | "crypto" | "bond" | "mutual_fund" | "etf" | "cash" | "other";
  units: number;
  costBasisPerUnit: number;
  currentPrice: number;
  sector: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  totalCost: number;
  marketValue: number;
  gainLoss: number;
};

export type AllocationRecommendation = {
  spendAmount: number;
  cashAmount: number;
  investAmount: number;
  remainingDiscretionary: number;
  accounts: {
    rothIra: number;
    k401: number;
    taxable: number;
  };
};

export type MoneyDashboardSnapshot = {
  totalGrossPay: number;
  totalNetPay: number;
  totalRecommendedInvesting: number;
  actualInvestedTransfers: number;
  currentBankBalance: number;
  holdingsMarketValue: number;
  holdingsCost: number;
  holdingsGainLoss: number;
  fiTarget: number;
  fiProgressPct: number;
  estimatedFiAge: number | null;
};

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

export type WorkoutCalendarDay = {
  date: string;
  sessionCount: number;
  isRestDay: boolean;
  notes: string;
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

export type BodyweightEntry = {
  id: string;
  entryDate: string;
  weight: number;
  notes: string;
  createdAt: string;
};
