import { describe, expect, it } from "vitest";
import { buildAllocationRecommendation } from "../src/money/services/recommendationService.js";

describe("buildAllocationRecommendation", () => {
  const settings = {
    investPct: 0.5,
    spendPct: 0.35,
    cashPct: 0.15,
    emergencyFundTarget: 5000,
    fiAnnualSpendingTarget: 35000,
    fiMultiplier: 25,
    realReturnRate: 0.05,
    rothIraLimit: 7500,
    k401Limit: 24500,
    rothIraSplit: 0.2,
    k401Split: 0.3,
    taxableSplit: 0.5,
    socialSecurityRate: 0.062,
    medicareRate: 0.0145,
    stateIncomeTaxRate: 0.0307,
    localIncomeTaxRate: 0.01,
    startingBankBalance: 10000,
    startingInvestedBalance: 0
  };

  it("allocates across spend, cash, and invest buckets", () => {
    const rec = buildAllocationRecommendation({
      netPay: 1000,
      bankBalanceBefore: 5000,
      settings,
      contributionTotalsForYear: {
        rothIra: 0,
        k401: 0,
        taxable: 0
      }
    });

    expect(rec.spendAmount).toBe(350);
    expect(rec.cashAmount).toBeGreaterThanOrEqual(150);
    expect(rec.investAmount).toBeGreaterThan(0);
    expect(rec.accounts.rothIra + rec.accounts.k401 + rec.accounts.taxable).toBeCloseTo(rec.investAmount, 6);
  });

  it("respects annual tax-advantaged limits", () => {
    const rec = buildAllocationRecommendation({
      netPay: 2000,
      bankBalanceBefore: 5000,
      settings,
      contributionTotalsForYear: {
        rothIra: 7500,
        k401: 24500,
        taxable: 0
      }
    });

    expect(rec.accounts.rothIra).toBe(0);
    expect(rec.accounts.k401).toBe(0);
    expect(rec.accounts.taxable).toBeCloseTo(rec.investAmount, 6);
  });
});
