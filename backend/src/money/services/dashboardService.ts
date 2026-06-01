import { getMoneySettings } from "../storage/moneySettingsStore.js";
import { holdingsSummary } from "../storage/holdingsStore.js";
import { summarizeWorkLogs } from "../storage/workLogStore.js";
import type { MoneyDashboardSnapshot } from "../types.js";

function estimateFiAge(settings: ReturnType<typeof getMoneySettings>, currentPortfolio: number): number | null {
  const fiTarget = settings.fiAnnualSpendingTarget * settings.fiMultiplier;
  const annualContribution = 40000;
  let age = 18;
  let portfolio = currentPortfolio;

  for (let i = 0; i < 60; i += 1) {
    const contribution = age < 23 ? 3000 : annualContribution;
    portfolio += contribution + portfolio * settings.realReturnRate;
    if (portfolio >= fiTarget) {
      return age;
    }
    age += 1;
  }
  return null;
}

export function getMoneyDashboardSnapshot(): MoneyDashboardSnapshot {
  const settings = getMoneySettings();
  const work = summarizeWorkLogs();
  const holdings = holdingsSummary();

  const fiTarget = settings.fiAnnualSpendingTarget * settings.fiMultiplier;
  const fiProgressPct = fiTarget > 0 ? (holdings.marketValue / fiTarget) * 100 : 0;

  return {
    totalGrossPay: work.totalGrossPay,
    totalNetPay: work.totalNetPay,
    totalRecommendedInvesting: work.totalRecommendedInvesting,
    actualInvestedTransfers: work.actualInvestedTransfers,
    currentBankBalance: work.latestBankBalance,
    holdingsMarketValue: holdings.marketValue,
    holdingsCost: holdings.totalCost,
    holdingsGainLoss: holdings.gainLoss,
    fiTarget,
    fiProgressPct,
    estimatedFiAge: estimateFiAge(settings, Math.max(holdings.marketValue, settings.startingInvestedBalance))
  };
}
