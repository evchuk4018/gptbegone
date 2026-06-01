import { listWorkLogs } from "../storage/workLogStore.js";
import { createPaycheckCheckRecord } from "../storage/paycheckCheckStore.js";
import type { PaycheckCheckInput, PaycheckCheckResult } from "../types.js";

function resolveStatus(difference: number, tolerance: number): PaycheckCheckResult["status"] {
  if (difference > tolerance) {
    return "possible_missing_pay_or_hours";
  }
  if (difference < -tolerance) {
    return "received_more_than_logged";
  }
  return "looks_ok";
}

export function runPaycheckCheck(input: PaycheckCheckInput): PaycheckCheckResult {
  const logs = listWorkLogs({
    yearLabel: input.yearLabel,
    from: input.startDate,
    to: input.endDate
  }).filter((row) => input.jobId === "all" || row.jobId === input.jobId);

  const expectedGross = logs.reduce((sum, row) => sum + row.grossPay, 0);
  const totalHours = logs.reduce((sum, row) => sum + row.hours, 0);
  const averageRate = totalHours > 0 ? expectedGross / totalHours : 0;
  const difference = expectedGross - input.grossReceived;
  const missingHours = difference > input.tolerance && averageRate > 0 ? difference / averageRate : 0;
  const status = resolveStatus(difference, input.tolerance);

  return createPaycheckCheckRecord({
    yearLabel: input.yearLabel,
    startDate: input.startDate,
    endDate: input.endDate,
    jobId: input.jobId,
    grossReceived: input.grossReceived,
    tolerance: input.tolerance,
    expectedGross,
    difference,
    totalHours,
    averageRate,
    missingHours,
    status
  });
}
