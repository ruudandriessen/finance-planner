import { describe, expect, it } from "vitest";
import type { FinancialItemBase } from "@/financial-items/types";
import { getFinancialItemSimulationPreview } from "./simulation-preview";

const simulationResults = [
  {
    date: new Date("2026-01-01"),
    balances: {
      savings: 1000,
      investment: 5000,
    },
    transactions: [],
  },
  {
    date: new Date("2026-02-01"),
    balances: {
      savings: 1100,
      investment: 5200,
    },
    transactions: [],
  },
];

function createItem(type: FinancialItemBase["data"]["type"], id = type): FinancialItemBase {
  const base = {
    id,
    name: id,
    priorityOrder: 1,
    schedule: "monthly" as const,
  };

  switch (type) {
    case "savings":
      return { ...base, data: { type, initialBalance: 1000, interestRate: 0 } };
    case "checking":
      return { ...base, data: { type, initialBalance: 1000 } };
    case "investment":
      return { ...base, data: { type, initialValue: 5000, yearlyReturnRate: 0.07 } };
    case "income":
      return { ...base, data: { type, amount: 1000, targetAccountId: "savings" } };
    case "expense":
      return { ...base, data: { type, amount: 100, sourceAccountId: "savings" } };
    case "mortgage":
      return {
        ...base,
        data: {
          type,
          currentBalance: 250000,
          originalLoanAmount: 300000,
          interestRate: 0.04,
          loanTermYears: 30,
          paymentType: "annuity",
          paymentSourceAccountId: "savings",
        },
      };
  }
}

describe("getFinancialItemSimulationPreview", () => {
  it("returns balance preview data for savings items", () => {
    const preview = getFinancialItemSimulationPreview(createItem("savings"), simulationResults);

    expect(preview).toEqual({
      kind: "balance",
      projectedValue: 1100,
      series: [
        { date: new Date("2026-01-01"), value: 1000 },
        { date: new Date("2026-02-01"), value: 1100 },
      ],
    });
  });

  it("returns balance preview data for investment items", () => {
    const preview = getFinancialItemSimulationPreview(createItem("investment"), simulationResults);

    expect(preview?.projectedValue).toBe(5200);
  });

  it("does not return previews for flow-only or mortgage items yet", () => {
    expect(getFinancialItemSimulationPreview(createItem("income"), simulationResults)).toBeNull();
    expect(getFinancialItemSimulationPreview(createItem("expense"), simulationResults)).toBeNull();
    expect(getFinancialItemSimulationPreview(createItem("mortgage"), simulationResults)).toBeNull();
  });

  it("returns null when there are no simulation results", () => {
    expect(getFinancialItemSimulationPreview(createItem("savings"), [])).toBeNull();
  });
});
