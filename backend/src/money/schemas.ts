import { z } from "zod";

export const moneySettingsSchema = z.object({
  investPct: z.number().min(0),
  spendPct: z.number().min(0),
  cashPct: z.number().min(0),
  emergencyFundTarget: z.number().min(0),
  fiAnnualSpendingTarget: z.number().min(0),
  fiMultiplier: z.number().min(1),
  realReturnRate: z.number().min(0),
  rothIraLimit: z.number().min(0),
  k401Limit: z.number().min(0),
  rothIraSplit: z.number().min(0),
  k401Split: z.number().min(0),
  taxableSplit: z.number().min(0),
  socialSecurityRate: z.number().min(0),
  medicareRate: z.number().min(0),
  stateIncomeTaxRate: z.number().min(0),
  localIncomeTaxRate: z.number().min(0),
  startingBankBalance: z.number(),
  startingInvestedBalance: z.number()
});

export const updateMoneySettingsSchema = moneySettingsSchema.partial();

export const payTypeSchema = z.enum(["hourly", "salary"]);

export const createJobSchema = z.object({
  name: z.string().min(1),
  payType: payTypeSchema,
  hourlyRate: z.number().min(0),
  annualSalary: z.number().min(0),
  estTaxPct: z.number().min(0),
  notes: z.string().optional(),
  active: z.boolean().optional()
});

export const updateJobSchema = createJobSchema.partial();

export const createWorkLogSchema = z.object({
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  yearLabel: z.string().min(1),
  jobId: z.string().min(1),
  hours: z.number().min(0),
  rateOverride: z.number().min(0).nullable().optional(),
  actualSpend: z.number().min(0).optional(),
  actualInvestedTransfer: z.number().min(0).optional(),
  notes: z.string().optional(),
  spendAmountOverride: z.number().min(0).optional(),
  cashAmountOverride: z.number().min(0).optional(),
  investAmountOverride: z.number().min(0).optional()
});

export const updateWorkLogSchema = createWorkLogSchema.partial();

export const paycheckCheckSchema = z.object({
  yearLabel: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jobId: z.union([z.literal("all"), z.string().min(1)]),
  grossReceived: z.number(),
  tolerance: z.number().min(0)
});

export const upsertBudgetCategoriesSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  categories: z
    .array(
      z.object({
        categoryName: z.string().min(1),
        plannedAmount: z.number(),
        actualAmountOverride: z.number().nullable().optional(),
        notes: z.string().optional()
      })
    )
    .min(1)
});

export const recurringExpenseSchema = z.object({
  categoryName: z.string().min(1),
  expenseName: z.string().min(1),
  amount: z.number(),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/),
  endMonth: z.string().regex(/^\d{4}-\d{2}$/).nullable().optional(),
  dayOfMonth: z.number().int().min(1).max(31),
  notes: z.string().optional(),
  active: z.boolean().optional()
});

export const assetTypeSchema = z.enum(["stock", "crypto", "bond", "mutual_fund", "etf", "cash", "other"]);

export const createHoldingSchema = z.object({
  holdingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accountName: z.string().min(1),
  ticker: z.string().min(1),
  displayName: z.string().min(1),
  assetType: assetTypeSchema,
  units: z.number().min(0),
  costBasisPerUnit: z.number().min(0),
  currentPrice: z.number().min(0).optional(),
  sector: z.string().optional(),
  notes: z.string().optional()
});

export const updateHoldingSchema = createHoldingSchema.partial();

export const updatePriceSchema = z.object({
  ticker: z.string().min(1),
  price: z.number().min(0),
  priceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional()
});

export const createContributionSchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accountType: z.enum(["roth_ira", "k401", "taxable", "cash"]),
  contribution: z.number(),
  employerMatch: z.number().optional(),
  withdrawal: z.number().optional(),
  taxYear: z.number().int().min(2000),
  notes: z.string().optional()
});

export const recommendationPreviewSchema = z.object({
  netPay: z.number().min(0),
  bankBalanceBefore: z.number(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  spendAmountOverride: z.number().min(0).optional(),
  cashAmountOverride: z.number().min(0).optional(),
  investAmountOverride: z.number().min(0).optional()
});
