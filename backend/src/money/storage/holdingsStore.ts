import { db } from "../../db.js";
import type { AssetType, Holding, HoldingValuation } from "../types.js";
import { createId, nowIso } from "../../utils.js";

type HoldingRow = {
  id: string;
  holding_date: string;
  account_name: string;
  ticker: string;
  display_name: string;
  asset_type: AssetType;
  units: number;
  cost_basis_per_unit: number;
  current_price: number;
  sector: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

function toHolding(row: HoldingRow): Holding {
  return {
    id: row.id,
    holdingDate: row.holding_date,
    accountName: row.account_name,
    ticker: row.ticker,
    displayName: row.display_name,
    assetType: row.asset_type,
    units: row.units,
    costBasisPerUnit: row.cost_basis_per_unit,
    currentPrice: row.current_price,
    sector: row.sector,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toValuation(holding: Holding): HoldingValuation {
  const totalCost = holding.units * holding.costBasisPerUnit;
  const marketValue = holding.units * holding.currentPrice;
  return {
    ...holding,
    totalCost,
    marketValue,
    gainLoss: marketValue - totalCost
  };
}

export function listHoldings(): HoldingValuation[] {
  const rows = db.prepare("SELECT * FROM money_holdings ORDER BY holding_date ASC").all() as HoldingRow[];
  return rows.map(toHolding).map(toValuation);
}

export function createHolding(input: {
  holdingDate: string;
  accountName: string;
  ticker: string;
  displayName: string;
  assetType: AssetType;
  units: number;
  costBasisPerUnit: number;
  currentPrice?: number;
  sector?: string;
  notes?: string;
}): HoldingValuation {
  const id = createId();
  const now = nowIso();
  db.prepare(
    `
    INSERT INTO money_holdings (
      id,
      holding_date,
      account_name,
      ticker,
      display_name,
      asset_type,
      units,
      cost_basis_per_unit,
      current_price,
      sector,
      notes,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    id,
    input.holdingDate,
    input.accountName,
    input.ticker.toUpperCase(),
    input.displayName,
    input.assetType,
    input.units,
    input.costBasisPerUnit,
    input.currentPrice ?? input.costBasisPerUnit,
    input.sector ?? "",
    input.notes ?? "",
    now,
    now
  );

  const row = db.prepare("SELECT * FROM money_holdings WHERE id = ?").get(id) as HoldingRow;
  return toValuation(toHolding(row));
}

export function updateHolding(
  holdingId: string,
  input: Partial<{
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
  }>
): HoldingValuation | null {
  const row = db.prepare("SELECT * FROM money_holdings WHERE id = ?").get(holdingId) as HoldingRow | undefined;
  if (!row) {
    return null;
  }

  const next = {
    holdingDate: input.holdingDate ?? row.holding_date,
    accountName: input.accountName ?? row.account_name,
    ticker: input.ticker?.toUpperCase() ?? row.ticker,
    displayName: input.displayName ?? row.display_name,
    assetType: input.assetType ?? row.asset_type,
    units: input.units ?? row.units,
    costBasisPerUnit: input.costBasisPerUnit ?? row.cost_basis_per_unit,
    currentPrice: input.currentPrice ?? row.current_price,
    sector: input.sector ?? row.sector,
    notes: input.notes ?? row.notes
  };

  db.prepare(
    `
    UPDATE money_holdings
    SET
      holding_date = ?,
      account_name = ?,
      ticker = ?,
      display_name = ?,
      asset_type = ?,
      units = ?,
      cost_basis_per_unit = ?,
      current_price = ?,
      sector = ?,
      notes = ?,
      updated_at = ?
    WHERE id = ?
  `
  ).run(
    next.holdingDate,
    next.accountName,
    next.ticker,
    next.displayName,
    next.assetType,
    next.units,
    next.costBasisPerUnit,
    next.currentPrice,
    next.sector,
    next.notes,
    nowIso(),
    holdingId
  );

  const updated = db.prepare("SELECT * FROM money_holdings WHERE id = ?").get(holdingId) as HoldingRow;
  return toValuation(toHolding(updated));
}

export function deleteHolding(holdingId: string): boolean {
  const res = db.prepare("DELETE FROM money_holdings WHERE id = ?").run(holdingId);
  return res.changes > 0;
}

export function updatePrices(input: { ticker: string; price: number; priceDate: string; notes?: string }): void {
  const normalizedTicker = input.ticker.toUpperCase();
  db.prepare("UPDATE money_holdings SET current_price = ?, updated_at = ? WHERE ticker = ?").run(
    input.price,
    nowIso(),
    normalizedTicker
  );
  db.prepare(
    `
    INSERT INTO money_price_updates (id, ticker, price, price_date, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  ).run(createId(), normalizedTicker, input.price, input.priceDate, input.notes ?? "", nowIso());
}

export function holdingsSummary(): {
  marketValue: number;
  totalCost: number;
  gainLoss: number;
} {
  const row = db
    .prepare(
      `
      SELECT
        COALESCE(SUM(units * current_price), 0) AS market_value,
        COALESCE(SUM(units * cost_basis_per_unit), 0) AS total_cost
      FROM money_holdings
    `
    )
    .get() as { market_value: number; total_cost: number };

  return {
    marketValue: row.market_value,
    totalCost: row.total_cost,
    gainLoss: row.market_value - row.total_cost
  };
}
