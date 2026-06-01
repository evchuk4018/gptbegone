import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { resetForTests } from "../src/db.js";

describe("money API", () => {
  const app = createApp();

  beforeEach(() => {
    resetForTests();
  });

  it("creates work logs and runs paycheck check", async () => {
    const jobsRes = await request(app).get("/api/money/jobs").expect(200);
    const jobId = jobsRes.body[0].id as string;

    await request(app)
      .post("/api/money/work-logs")
      .send({
        workDate: "2026-06-01",
        yearLabel: "Year 1 Jobs",
        jobId,
        hours: 8,
        actualSpend: 50,
        actualInvestedTransfer: 100
      })
      .expect(201);

    const checkRes = await request(app)
      .post("/api/money/paycheck-check")
      .send({
        yearLabel: "Year 1 Jobs",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        jobId: "all",
        grossReceived: 120,
        tolerance: 1
      })
      .expect(201);

    expect(checkRes.body.expectedGross).toBeGreaterThan(0);
    expect(checkRes.body.totalHours).toBe(8);
  });

  it("supports budget planning and summary", async () => {
    await request(app)
      .put("/api/money/budget/categories")
      .send({
        month: "2026-06",
        categories: [
          { categoryName: "Housing", plannedAmount: 1000 },
          { categoryName: "Food", plannedAmount: 400, actualAmountOverride: 350 }
        ]
      })
      .expect(200);

    await request(app)
      .post("/api/money/budget/recurring")
      .send({
        categoryName: "Housing",
        expenseName: "Rent",
        amount: 950,
        startMonth: "2026-01",
        dayOfMonth: 1
      })
      .expect(201);

    const summary = await request(app).get("/api/money/budget/summary?month=2026-06").expect(200);
    expect(summary.body).toHaveLength(2);
    const housing = summary.body.find((item: { categoryName: string }) => item.categoryName === "Housing");
    expect(housing.actualAmount).toBe(950);
  });

  it("tracks holdings and dashboard", async () => {
    await request(app)
      .post("/api/money/holdings")
      .send({
        holdingDate: "2026-06-01",
        accountName: "Brokerage",
        ticker: "VTI",
        displayName: "Vanguard Total Stock Market",
        assetType: "etf",
        units: 10,
        costBasisPerUnit: 200,
        currentPrice: 220,
        sector: "Broad Market"
      })
      .expect(201);

    const holdings = await request(app).get("/api/money/holdings").expect(200);
    expect(holdings.body[0].gainLoss).toBe(200);

    const dashboard = await request(app).get("/api/money/dashboard").expect(200);
    expect(dashboard.body.holdingsMarketValue).toBe(2200);
    expect(dashboard.body.fiTarget).toBe(875000);
  });
});
