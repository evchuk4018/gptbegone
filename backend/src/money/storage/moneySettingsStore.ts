import { db } from "../../db.js";
import type { MoneySettings } from "../types.js";

type MoneySettingsRow = {
  invest_pct: number;
  spend_pct: number;
  cash_pct: number;
  emergency_fund_target: number;
  fi_annual_spending_target: number;
  fi_multiplier: number;
  real_return_rate: number;
  roth_ira_limit: number;
  k401_limit: number;
  roth_ira_split: number;
  k401_split: number;
  taxable_split: number;
  social_security_rate: number;
  medicare_rate: number;
  state_income_tax_rate: number;
  local_income_tax_rate: number;
  starting_bank_balance: number;
  starting_invested_balance: number;
};

function toSettings(row: MoneySettingsRow): MoneySettings {
  return {
    investPct: row.invest_pct,
    spendPct: row.spend_pct,
    cashPct: row.cash_pct,
    emergencyFundTarget: row.emergency_fund_target,
    fiAnnualSpendingTarget: row.fi_annual_spending_target,
    fiMultiplier: row.fi_multiplier,
    realReturnRate: row.real_return_rate,
    rothIraLimit: row.roth_ira_limit,
    k401Limit: row.k401_limit,
    rothIraSplit: row.roth_ira_split,
    k401Split: row.k401_split,
    taxableSplit: row.taxable_split,
    socialSecurityRate: row.social_security_rate,
    medicareRate: row.medicare_rate,
    stateIncomeTaxRate: row.state_income_tax_rate,
    localIncomeTaxRate: row.local_income_tax_rate,
    startingBankBalance: row.starting_bank_balance,
    startingInvestedBalance: row.starting_invested_balance
  };
}

export function getMoneySettings(): MoneySettings {
  const row = db.prepare("SELECT * FROM money_settings WHERE id = 1").get() as MoneySettingsRow;
  return toSettings(row);
}

export function updateMoneySettings(next: Partial<MoneySettings>): MoneySettings {
  const current = getMoneySettings();
  const merged: MoneySettings = {
    investPct: next.investPct ?? current.investPct,
    spendPct: next.spendPct ?? current.spendPct,
    cashPct: next.cashPct ?? current.cashPct,
    emergencyFundTarget: next.emergencyFundTarget ?? current.emergencyFundTarget,
    fiAnnualSpendingTarget: next.fiAnnualSpendingTarget ?? current.fiAnnualSpendingTarget,
    fiMultiplier: next.fiMultiplier ?? current.fiMultiplier,
    realReturnRate: next.realReturnRate ?? current.realReturnRate,
    rothIraLimit: next.rothIraLimit ?? current.rothIraLimit,
    k401Limit: next.k401Limit ?? current.k401Limit,
    rothIraSplit: next.rothIraSplit ?? current.rothIraSplit,
    k401Split: next.k401Split ?? current.k401Split,
    taxableSplit: next.taxableSplit ?? current.taxableSplit,
    socialSecurityRate: next.socialSecurityRate ?? current.socialSecurityRate,
    medicareRate: next.medicareRate ?? current.medicareRate,
    stateIncomeTaxRate: next.stateIncomeTaxRate ?? current.stateIncomeTaxRate,
    localIncomeTaxRate: next.localIncomeTaxRate ?? current.localIncomeTaxRate,
    startingBankBalance: next.startingBankBalance ?? current.startingBankBalance,
    startingInvestedBalance: next.startingInvestedBalance ?? current.startingInvestedBalance
  };

  db.prepare(
    `
    UPDATE money_settings
    SET
      invest_pct = ?,
      spend_pct = ?,
      cash_pct = ?,
      emergency_fund_target = ?,
      fi_annual_spending_target = ?,
      fi_multiplier = ?,
      real_return_rate = ?,
      roth_ira_limit = ?,
      k401_limit = ?,
      roth_ira_split = ?,
      k401_split = ?,
      taxable_split = ?,
      social_security_rate = ?,
      medicare_rate = ?,
      state_income_tax_rate = ?,
      local_income_tax_rate = ?,
      starting_bank_balance = ?,
      starting_invested_balance = ?
    WHERE id = 1
    `
  ).run(
    merged.investPct,
    merged.spendPct,
    merged.cashPct,
    merged.emergencyFundTarget,
    merged.fiAnnualSpendingTarget,
    merged.fiMultiplier,
    merged.realReturnRate,
    merged.rothIraLimit,
    merged.k401Limit,
    merged.rothIraSplit,
    merged.k401Split,
    merged.taxableSplit,
    merged.socialSecurityRate,
    merged.medicareRate,
    merged.stateIncomeTaxRate,
    merged.localIncomeTaxRate,
    merged.startingBankBalance,
    merged.startingInvestedBalance
  );

  return merged;
}
