import type { AllocationRecommendation, MoneySettings } from "../types.js";

function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

function normalizeSplits(settings: MoneySettings): { roth: number; k401: number; taxable: number } {
  const sum = settings.rothIraSplit + settings.k401Split + settings.taxableSplit;
  if (sum <= 0) {
    return { roth: 0, k401: 0, taxable: 1 };
  }
  return {
    roth: settings.rothIraSplit / sum,
    k401: settings.k401Split / sum,
    taxable: settings.taxableSplit / sum
  };
}

export function buildAllocationRecommendation(input: {
  netPay: number;
  bankBalanceBefore: number;
  settings: MoneySettings;
  contributionTotalsForYear: {
    rothIra: number;
    k401: number;
    taxable: number;
  };
  spendAmountOverride?: number;
  cashAmountOverride?: number;
  investAmountOverride?: number;
}): AllocationRecommendation {
  const netPay = clampNonNegative(input.netPay);
  const settings = input.settings;

  const spendCap = clampNonNegative(netPay * settings.spendPct);
  const spendAmount = clampNonNegative(input.spendAmountOverride ?? spendCap);
  let remainingAfterSpend = clampNonNegative(netPay - spendAmount);

  const emergencyNeed = clampNonNegative(settings.emergencyFundTarget - input.bankBalanceBefore);
  const defaultCash = Math.max(netPay * settings.cashPct, Math.min(emergencyNeed, remainingAfterSpend));
  const cashAmount = clampNonNegative(Math.min(remainingAfterSpend, input.cashAmountOverride ?? defaultCash));
  remainingAfterSpend = clampNonNegative(remainingAfterSpend - cashAmount);

  const defaultInvest = clampNonNegative(Math.min(remainingAfterSpend, netPay * settings.investPct));
  const investAmount = clampNonNegative(Math.min(remainingAfterSpend, input.investAmountOverride ?? defaultInvest));
  const remainingDiscretionary = clampNonNegative(remainingAfterSpend - investAmount);

  const normalizedSplits = normalizeSplits(settings);
  let rothTarget = investAmount * normalizedSplits.roth;
  let k401Target = investAmount * normalizedSplits.k401;
  let taxableTarget = investAmount * normalizedSplits.taxable;

  const rothRemainingLimit = clampNonNegative(settings.rothIraLimit - input.contributionTotalsForYear.rothIra);
  const k401RemainingLimit = clampNonNegative(settings.k401Limit - input.contributionTotalsForYear.k401);

  const rothActual = Math.min(rothTarget, rothRemainingLimit);
  rothTarget = rothActual;

  const k401Actual = Math.min(k401Target, k401RemainingLimit);
  k401Target = k401Actual;

  taxableTarget += investAmount - (rothTarget + k401Target + taxableTarget);

  return {
    spendAmount,
    cashAmount,
    investAmount,
    remainingDiscretionary,
    accounts: {
      rothIra: rothTarget,
      k401: k401Target,
      taxable: taxableTarget
    }
  };
}
