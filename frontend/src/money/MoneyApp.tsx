import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMoneyState } from "./useMoneyState";

type MoneyTab = "overview" | "hours" | "budget" | "investments" | "settings";

const tabs: Array<{ id: MoneyTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "hours", label: "Hours & Paycheck" },
  { id: "budget", label: "Budget" },
  { id: "investments", label: "Investments" },
  { id: "settings", label: "Settings" }
];

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

export function MoneyApp() {
  const state = useMoneyState();
  const [activeTab, setActiveTab] = useState<MoneyTab>("overview");

  const fiProgress = useMemo(() => {
    if (!state.dashboard) {
      return 0;
    }
    return Math.max(0, Math.min(100, state.dashboard.fiProgressPct));
  }, [state.dashboard]);

  return (
    <div className="money-shell">
      <header className="money-header">
        <div>
          <p className="money-kicker">Capital Discipline</p>
          <h1>Money Command</h1>
          <p>
            Track work hours, validate paychecks, and route income into spending, emergency cash, and investing.
          </p>
        </div>
        <nav className="money-top-links">
          <Link to="/">Home</Link>
          <Link to="/ai">AI Chat</Link>
        </nav>
      </header>

      <div className="money-tab-row">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`money-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {state.loading ? <div className="money-banner">Loading money module...</div> : null}
      {state.error ? <div className="money-banner error">{state.error}</div> : null}

      {activeTab === "overview" && state.dashboard ? (
        <section className="money-grid">
          <article className="money-card">
            <h2>Income Snapshot</h2>
            <p>Total gross: {fmtCurrency(state.dashboard.totalGrossPay)}</p>
            <p>Total net: {fmtCurrency(state.dashboard.totalNetPay)}</p>
            <p>Recommended investing: {fmtCurrency(state.dashboard.totalRecommendedInvesting)}</p>
            <p>Actual invested transfers: {fmtCurrency(state.dashboard.actualInvestedTransfers)}</p>
          </article>

          <article className="money-card">
            <h2>Liquidity Snapshot</h2>
            <p>Current bank balance: {fmtCurrency(state.dashboard.currentBankBalance)}</p>
            <p>Emergency target: {fmtCurrency(state.settings?.emergencyFundTarget ?? 0)}</p>
            <p>
              Emergency gap: {fmtCurrency(Math.max(0, (state.settings?.emergencyFundTarget ?? 0) - state.dashboard.currentBankBalance))}
            </p>
          </article>

          <article className="money-card">
            <h2>Portfolio Snapshot</h2>
            <p>Market value: {fmtCurrency(state.dashboard.holdingsMarketValue)}</p>
            <p>Cost basis: {fmtCurrency(state.dashboard.holdingsCost)}</p>
            <p>Gain / loss: {fmtCurrency(state.dashboard.holdingsGainLoss)}</p>
          </article>

          <article className="money-card">
            <h2>FI Projection</h2>
            <p>FI target: {fmtCurrency(state.dashboard.fiTarget)}</p>
            <div className="money-progress">
              <div className="money-progress-bar" style={{ width: `${fiProgress}%` }} />
            </div>
            <p>Progress: {fiProgress.toFixed(2)}%</p>
            <p>Estimated FI age: {state.dashboard.estimatedFiAge ?? "Not within model horizon"}</p>
          </article>

          <article className="money-card money-card-wide">
            <h2>Recommendation Preview</h2>
            <div className="money-form-grid">
              <label>
                Net pay
                <input
                  value={state.recommendationForm.netPay}
                  onChange={(event) => state.setRecommendationForm((prev) => ({ ...prev, netPay: event.target.value }))}
                />
              </label>
              <label>
                Bank before paycheck
                <input
                  value={state.recommendationForm.bankBalanceBefore}
                  onChange={(event) => state.setRecommendationForm((prev) => ({ ...prev, bankBalanceBefore: event.target.value }))}
                />
              </label>
              <label>
                Work date
                <input
                  type="date"
                  value={state.recommendationForm.workDate}
                  onChange={(event) => state.setRecommendationForm((prev) => ({ ...prev, workDate: event.target.value }))}
                />
              </label>
              <button type="button" className="money-action" onClick={() => void state.generateRecommendationPreview()}>
                Generate Preview
              </button>
            </div>
            {state.previewRecommendation ? (
              <div className="money-results-grid">
                <p>Spend: {fmtCurrency(state.previewRecommendation.spendAmount)}</p>
                <p>Cash: {fmtCurrency(state.previewRecommendation.cashAmount)}</p>
                <p>Invest: {fmtCurrency(state.previewRecommendation.investAmount)}</p>
                <p>Discretionary: {fmtCurrency(state.previewRecommendation.remainingDiscretionary)}</p>
                <p>Roth IRA: {fmtCurrency(state.previewRecommendation.accounts.rothIra)}</p>
                <p>401(k): {fmtCurrency(state.previewRecommendation.accounts.k401)}</p>
                <p>Taxable: {fmtCurrency(state.previewRecommendation.accounts.taxable)}</p>
              </div>
            ) : null}
          </article>
        </section>
      ) : null}

      {activeTab === "hours" ? (
        <section className="money-grid">
          <article className="money-card money-card-wide">
            <h2>Log Hours + Income</h2>
            <div className="money-form-grid">
              <label>
                Date
                <input
                  type="date"
                  value={state.workLogForm.workDate}
                  onChange={(event) => state.setWorkLogForm((prev) => ({ ...prev, workDate: event.target.value }))}
                />
              </label>
              <label>
                Year label
                <input
                  value={state.workLogForm.yearLabel}
                  onChange={(event) => state.setWorkLogForm((prev) => ({ ...prev, yearLabel: event.target.value }))}
                />
              </label>
              <label>
                Job
                <select
                  value={state.workLogForm.jobId}
                  onChange={(event) => state.setWorkLogForm((prev) => ({ ...prev, jobId: event.target.value }))}
                >
                  {state.jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Hours
                <input
                  value={state.workLogForm.hours}
                  onChange={(event) => state.setWorkLogForm((prev) => ({ ...prev, hours: event.target.value }))}
                />
              </label>
              <label>
                Rate override
                <input
                  value={state.workLogForm.rateOverride}
                  onChange={(event) => state.setWorkLogForm((prev) => ({ ...prev, rateOverride: event.target.value }))}
                />
              </label>
              <label>
                Actual spend
                <input
                  value={state.workLogForm.actualSpend}
                  onChange={(event) => state.setWorkLogForm((prev) => ({ ...prev, actualSpend: event.target.value }))}
                />
              </label>
              <label>
                Actual invested transfer
                <input
                  value={state.workLogForm.actualInvestedTransfer}
                  onChange={(event) => state.setWorkLogForm((prev) => ({ ...prev, actualInvestedTransfer: event.target.value }))}
                />
              </label>
              <label>
                Notes
                <input
                  value={state.workLogForm.notes}
                  onChange={(event) => state.setWorkLogForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </label>
              <button type="button" className="money-action" onClick={() => void state.submitWorkLog()}>
                Add Work Log
              </button>
            </div>
          </article>

          <article className="money-card">
            <h2>Paycheck Checker</h2>
            <div className="money-form-grid compact">
              <label>
                Year label
                <input
                  value={state.paycheckForm.yearLabel}
                  onChange={(event) => state.setPaycheckForm((prev) => ({ ...prev, yearLabel: event.target.value }))}
                />
              </label>
              <label>
                Start
                <input
                  type="date"
                  value={state.paycheckForm.startDate}
                  onChange={(event) => state.setPaycheckForm((prev) => ({ ...prev, startDate: event.target.value }))}
                />
              </label>
              <label>
                End
                <input
                  type="date"
                  value={state.paycheckForm.endDate}
                  onChange={(event) => state.setPaycheckForm((prev) => ({ ...prev, endDate: event.target.value }))}
                />
              </label>
              <label>
                Job filter
                <select
                  value={state.paycheckForm.jobId}
                  onChange={(event) => state.setPaycheckForm((prev) => ({ ...prev, jobId: event.target.value }))}
                >
                  <option value="all">All jobs</option>
                  {state.jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Gross received
                <input
                  value={state.paycheckForm.grossReceived}
                  onChange={(event) => state.setPaycheckForm((prev) => ({ ...prev, grossReceived: event.target.value }))}
                />
              </label>
              <label>
                Tolerance
                <input
                  value={state.paycheckForm.tolerance}
                  onChange={(event) => state.setPaycheckForm((prev) => ({ ...prev, tolerance: event.target.value }))}
                />
              </label>
              <button type="button" className="money-action" onClick={() => void state.submitPaycheckCheck()}>
                Check Paycheck
              </button>
            </div>

            {state.paycheckResult ? (
              <div className="money-results-grid">
                <p>Status: {state.paycheckResult.status}</p>
                <p>Expected gross: {fmtCurrency(state.paycheckResult.expectedGross)}</p>
                <p>Difference: {fmtCurrency(state.paycheckResult.difference)}</p>
                <p>Total hours: {state.paycheckResult.totalHours.toFixed(2)}</p>
                <p>Average rate: {fmtCurrency(state.paycheckResult.averageRate)}</p>
                <p>Missing hours estimate: {state.paycheckResult.missingHours.toFixed(2)}</p>
              </div>
            ) : null}
          </article>

          <article className="money-card money-card-wide">
            <h2>Recent Work Logs</h2>
            <div className="money-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Gross</th>
                    <th>Net</th>
                    <th>Rec Spend</th>
                    <th>Rec Invest</th>
                    <th>Bank</th>
                  </tr>
                </thead>
                <tbody>
                  {state.workLogs.slice(-15).map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.workDate}</td>
                      <td>{entry.hours.toFixed(2)}</td>
                      <td>{fmtCurrency(entry.grossPay)}</td>
                      <td>{fmtCurrency(entry.estNetPay)}</td>
                      <td>{fmtCurrency(entry.recSpend)}</td>
                      <td>{fmtCurrency(entry.recInvest)}</td>
                      <td>{fmtCurrency(entry.bankBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "budget" ? (
        <section className="money-grid">
          <article className="money-card">
            <h2>Month</h2>
            <label>
              Budget month
              <input type="month" value={state.month} onChange={(event) => state.setMonth(event.target.value)} />
            </label>
          </article>

          <article className="money-card">
            <h2>Budget Totals</h2>
            <p>Planned: {fmtCurrency(state.totals.plannedBudget)}</p>
            <p>Actual: {fmtCurrency(state.totals.actualBudget)}</p>
            <p>Variance: {fmtCurrency(state.totals.variance)}</p>
          </article>

          <article className="money-card money-card-wide">
            <h2>Add / Update Category Budget</h2>
            <div className="money-form-grid">
              <label>
                Category
                <input
                  value={state.budgetForm.categoryName}
                  onChange={(event) => state.setBudgetForm((prev) => ({ ...prev, categoryName: event.target.value }))}
                />
              </label>
              <label>
                Planned amount
                <input
                  value={state.budgetForm.plannedAmount}
                  onChange={(event) => state.setBudgetForm((prev) => ({ ...prev, plannedAmount: event.target.value }))}
                />
              </label>
              <label>
                Actual override
                <input
                  value={state.budgetForm.actualAmountOverride}
                  onChange={(event) => state.setBudgetForm((prev) => ({ ...prev, actualAmountOverride: event.target.value }))}
                />
              </label>
              <label>
                Notes
                <input
                  value={state.budgetForm.notes}
                  onChange={(event) => state.setBudgetForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </label>
              <button type="button" className="money-action" onClick={() => void state.submitBudgetCategory()}>
                Save Category Plan
              </button>
            </div>

            <div className="money-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Planned</th>
                    <th>Actual</th>
                    <th>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {state.budgetSummary.map((item) => (
                    <tr key={`${item.month}-${item.categoryName}`}>
                      <td>{item.categoryName}</td>
                      <td>{fmtCurrency(item.plannedAmount)}</td>
                      <td>{fmtCurrency(item.actualAmount)}</td>
                      <td>{fmtCurrency(item.variance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "investments" ? (
        <section className="money-grid">
          <article className="money-card money-card-wide">
            <h2>Add Holding</h2>
            <div className="money-form-grid">
              <label>
                Date
                <input
                  type="date"
                  value={state.holdingForm.holdingDate}
                  onChange={(event) => state.setHoldingForm((prev) => ({ ...prev, holdingDate: event.target.value }))}
                />
              </label>
              <label>
                Account
                <input
                  value={state.holdingForm.accountName}
                  onChange={(event) => state.setHoldingForm((prev) => ({ ...prev, accountName: event.target.value }))}
                />
              </label>
              <label>
                Ticker
                <input
                  value={state.holdingForm.ticker}
                  onChange={(event) => state.setHoldingForm((prev) => ({ ...prev, ticker: event.target.value }))}
                />
              </label>
              <label>
                Name
                <input
                  value={state.holdingForm.displayName}
                  onChange={(event) => state.setHoldingForm((prev) => ({ ...prev, displayName: event.target.value }))}
                />
              </label>
              <label>
                Type
                <select
                  value={state.holdingForm.assetType}
                  onChange={(event) =>
                    state.setHoldingForm((prev) => ({
                      ...prev,
                      assetType: event.target.value as typeof prev.assetType
                    }))
                  }
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Crypto</option>
                  <option value="bond">Bond</option>
                  <option value="mutual_fund">Mutual Fund</option>
                  <option value="etf">ETF</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                Units
                <input
                  value={state.holdingForm.units}
                  onChange={(event) => state.setHoldingForm((prev) => ({ ...prev, units: event.target.value }))}
                />
              </label>
              <label>
                Cost basis / unit
                <input
                  value={state.holdingForm.costBasisPerUnit}
                  onChange={(event) => state.setHoldingForm((prev) => ({ ...prev, costBasisPerUnit: event.target.value }))}
                />
              </label>
              <label>
                Current price
                <input
                  value={state.holdingForm.currentPrice}
                  onChange={(event) => state.setHoldingForm((prev) => ({ ...prev, currentPrice: event.target.value }))}
                />
              </label>
              <label>
                Sector
                <input
                  value={state.holdingForm.sector}
                  onChange={(event) => state.setHoldingForm((prev) => ({ ...prev, sector: event.target.value }))}
                />
              </label>
              <button type="button" className="money-action" onClick={() => void state.submitHolding()}>
                Add Holding
              </button>
            </div>
          </article>

          <article className="money-card">
            <h2>Manual Price Update</h2>
            <div className="money-form-grid compact">
              <label>
                Ticker
                <input
                  value={state.priceUpdateForm.ticker}
                  onChange={(event) => state.setPriceUpdateForm((prev) => ({ ...prev, ticker: event.target.value }))}
                />
              </label>
              <label>
                Price
                <input
                  value={state.priceUpdateForm.price}
                  onChange={(event) => state.setPriceUpdateForm((prev) => ({ ...prev, price: event.target.value }))}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={state.priceUpdateForm.priceDate}
                  onChange={(event) => state.setPriceUpdateForm((prev) => ({ ...prev, priceDate: event.target.value }))}
                />
              </label>
              <button type="button" className="money-action" onClick={() => void state.submitPriceUpdate()}>
                Update Price
              </button>
            </div>
          </article>

          <article className="money-card money-card-wide">
            <h2>Portfolio Holdings</h2>
            <div className="money-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Type</th>
                    <th>Units</th>
                    <th>Cost</th>
                    <th>Value</th>
                    <th>Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {state.holdings.map((holding) => (
                    <tr key={holding.id}>
                      <td>{holding.ticker}</td>
                      <td>{holding.assetType}</td>
                      <td>{holding.units.toFixed(4)}</td>
                      <td>{fmtCurrency(holding.totalCost)}</td>
                      <td>{fmtCurrency(holding.marketValue)}</td>
                      <td>{fmtCurrency(holding.gainLoss)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "settings" && state.settings ? (
        <section className="money-grid">
          <article className="money-card money-card-wide">
            <h2>Allocation Defaults</h2>
            <div className="money-form-grid">
              <label>
                Invest %
                <input
                  value={state.settings.investPct}
                  onChange={(event) => void state.saveMoneySettings({ investPct: Number(event.target.value) })}
                />
              </label>
              <label>
                Spend %
                <input
                  value={state.settings.spendPct}
                  onChange={(event) => void state.saveMoneySettings({ spendPct: Number(event.target.value) })}
                />
              </label>
              <label>
                Cash %
                <input
                  value={state.settings.cashPct}
                  onChange={(event) => void state.saveMoneySettings({ cashPct: Number(event.target.value) })}
                />
              </label>
              <label>
                Emergency fund target
                <input
                  value={state.settings.emergencyFundTarget}
                  onChange={(event) => void state.saveMoneySettings({ emergencyFundTarget: Number(event.target.value) })}
                />
              </label>
              <label>
                FI annual spending target
                <input
                  value={state.settings.fiAnnualSpendingTarget}
                  onChange={(event) => void state.saveMoneySettings({ fiAnnualSpendingTarget: Number(event.target.value) })}
                />
              </label>
              <label>
                FI multiplier
                <input
                  value={state.settings.fiMultiplier}
                  onChange={(event) => void state.saveMoneySettings({ fiMultiplier: Number(event.target.value) })}
                />
              </label>
              <label>
                Real return
                <input
                  value={state.settings.realReturnRate}
                  onChange={(event) => void state.saveMoneySettings({ realReturnRate: Number(event.target.value) })}
                />
              </label>
              <label>
                Roth IRA limit
                <input
                  value={state.settings.rothIraLimit}
                  onChange={(event) => void state.saveMoneySettings({ rothIraLimit: Number(event.target.value) })}
                />
              </label>
              <label>
                401(k) limit
                <input
                  value={state.settings.k401Limit}
                  onChange={(event) => void state.saveMoneySettings({ k401Limit: Number(event.target.value) })}
                />
              </label>
            </div>
            <p className="money-note">Settings save on field change. Phase 1 intentionally excludes alerting and live quote feeds.</p>
          </article>
        </section>
      ) : null}
    </div>
  );
}
