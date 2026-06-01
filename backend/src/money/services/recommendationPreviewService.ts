import { getContributionTotalsByTaxYear } from "../storage/contributionStore.js";
import { getMoneySettings } from "../storage/moneySettingsStore.js";
import { buildAllocationRecommendation } from "./recommendationService.js";

export function previewRecommendation(input: {
  netPay: number;
  bankBalanceBefore: number;
  workDate: string;
  spendAmountOverride?: number;
  cashAmountOverride?: number;
  investAmountOverride?: number;
}) {
  const settings = getMoneySettings();
  const taxYear = Number(input.workDate.slice(0, 4));
  const totals = getContributionTotalsByTaxYear(taxYear);

  return buildAllocationRecommendation({
    netPay: input.netPay,
    bankBalanceBefore: input.bankBalanceBefore,
    settings,
    contributionTotalsForYear: {
      rothIra: totals.roth_ira,
      k401: totals.k401,
      taxable: totals.taxable
    },
    spendAmountOverride: input.spendAmountOverride,
    cashAmountOverride: input.cashAmountOverride,
    investAmountOverride: input.investAmountOverride
  });
}
