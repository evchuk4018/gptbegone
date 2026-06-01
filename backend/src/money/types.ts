export type PayType = "hourly" | "salary";

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
  payType: PayType;
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

export type PaycheckCheckInput = {
  yearLabel: string;
  startDate: string;
  endDate: string;
  jobId: string | "all";
  grossReceived: number;
  tolerance: number;
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

export type BudgetActual = {
  month: string;
  categoryName: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
};

export type AssetType = "stock" | "crypto" | "bond" | "mutual_fund" | "etf" | "cash" | "other";

export type Holding = {
  id: string;
  holdingDate: string;
  accountName: string;
  ticker: string;
  displayName: string;
  assetType: AssetType;
  units: number;
  costBasisPerUnit: number;
  currentPrice: number;
  sector: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type HoldingValuation = Holding & {
  totalCost: number;
  marketValue: number;
  gainLoss: number;
};

export type ContributionAccountType = "roth_ira" | "k401" | "taxable" | "cash";

export type ContributionEntry = {
  id: string;
  entryDate: string;
  accountType: ContributionAccountType;
  contribution: number;
  employerMatch: number;
  withdrawal: number;
  netContribution: number;
  taxYear: number;
  notes: string;
  createdAt: string;
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
