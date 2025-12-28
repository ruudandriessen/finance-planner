import { describe, expect, it } from "vitest";
import { deriveIncome } from "./IncomeTemplate";
import type { FinancialItem } from "./types";

describe("deriveIncome", () => {
  const createIncomeItem = (
    overrides: Partial<FinancialItem<"income">> = {},
  ): FinancialItem<"income"> => ({
    id: "income-1",
    name: "Monthly Salary",
    priorityOrder: 1,
    schedule: "monthly",
    data: {
      type: "income",
      amount: 5000,
      targetAccountId: "checking-account",
    },
    ...overrides,
  });

  it("should create an income account with id based on item id", () => {
    const item = createIncomeItem();
    const result = deriveIncome(item);

    expect(result.accounts).toHaveLength(1);
    expect(result.accounts[0]).toEqual({
      id: "income-income-1",
      type: "income",
      amount: 0,
    });
  });

  it("should create a flow with fixed strategy", () => {
    const item = createIncomeItem();
    const result = deriveIncome(item);

    expect(result.flows).toHaveLength(1);
    expect(result.flows[0]).toEqual({
      id: "flow-income-1",
      name: "Monthly Salary",
      priorityOrder: 1,
      schedule: "monthly",
      sourceAccountId: "income-income-1",
      targetAccountId: "checking-account",
      strategy: {
        type: "fixed",
        config: {
          amount: 5000,
        },
      },
      start: undefined,
      end: undefined,
      modifiers: [],
    });
  });

  it("should use the correct target account from item data", () => {
    const item = createIncomeItem({
      data: {
        type: "income",
        amount: 3000,
        targetAccountId: "savings-account",
      },
    });
    const result = deriveIncome(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.targetAccountId).toBe("savings-account");
  });

  it("should set the correct amount in the flow strategy", () => {
    const item = createIncomeItem({
      data: {
        type: "income",
        amount: 7500,
        targetAccountId: "checking-account",
      },
    });
    const result = deriveIncome(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.strategy).toEqual({
      type: "fixed",
      config: {
        amount: 7500,
      },
    });
  });

  it("should handle annual schedule", () => {
    const item = createIncomeItem({ schedule: "annually" });
    const result = deriveIncome(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.schedule).toBe("annually");
  });

  it("should include start and end dates when provided", () => {
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-12-31");
    const item = createIncomeItem({
      start: startDate,
      end: endDate,
    });
    const result = deriveIncome(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.start).toEqual(startDate);
    expect(flow?.end).toEqual(endDate);
  });

  it("should preserve the priority order from the item", () => {
    const item = createIncomeItem({ priorityOrder: 5 });
    const result = deriveIncome(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.priorityOrder).toBe(5);
  });

  it("should generate unique account and flow ids for different items", () => {
    const item1 = createIncomeItem({ id: "income-a" });
    const item2 = createIncomeItem({ id: "income-b" });

    const result1 = deriveIncome(item1);
    const result2 = deriveIncome(item2);

    expect(result1.accounts[0]).toBeDefined();
    expect(result2.accounts[0]).toBeDefined();
    expect(result1.flows[0]).toBeDefined();
    expect(result2.flows[0]).toBeDefined();

    expect(result1.accounts[0]?.id).toBe("income-income-a");
    expect(result2.accounts[0]?.id).toBe("income-income-b");
    expect(result1.flows[0]?.id).toBe("flow-income-a");
    expect(result2.flows[0]?.id).toBe("flow-income-b");
  });
});
