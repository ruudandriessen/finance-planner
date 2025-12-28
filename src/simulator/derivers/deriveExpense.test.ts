import { describe, expect, it } from "vitest";
import type { FinancialItem } from "@/financial-items/types";
import { deriveExpense } from "./deriveExpense";

describe("deriveExpense", () => {
  const createExpenseItem = (
    overrides: Partial<FinancialItem<"expense">> = {},
  ): FinancialItem<"expense"> => ({
    id: "expense-1",
    name: "Monthly Groceries",
    priorityOrder: 10,
    schedule: "monthly",
    data: {
      type: "expense",
      amount: 500,
      sourceAccountId: "checking-account",
    },
    ...overrides,
  });

  it("should create an expense account with id based on item id", () => {
    const item = createExpenseItem();
    const result = deriveExpense(item);

    expect(result.accounts).toHaveLength(1);
    expect(result.accounts[0]).toEqual({
      id: "expense-expense-1",
      type: "expense",
      amount: 0,
    });
  });

  it("should create a flow with fixed strategy", () => {
    const item = createExpenseItem();
    const result = deriveExpense(item);

    expect(result.flows).toHaveLength(1);
    expect(result.flows[0]).toEqual({
      id: "flow-expense-1",
      name: "Monthly Groceries",
      priorityOrder: 10,
      schedule: "monthly",
      sourceAccountId: "checking-account",
      targetAccountId: "expense-expense-1",
      strategy: {
        type: "fixed",
        config: {
          amount: 500,
        },
      },
      start: undefined,
      end: undefined,
      modifiers: [],
    });
  });

  it("should use the correct source account from item data", () => {
    const item = createExpenseItem({
      data: {
        type: "expense",
        amount: 300,
        sourceAccountId: "savings-account",
      },
    });
    const result = deriveExpense(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.sourceAccountId).toBe("savings-account");
  });

  it("should set the correct amount in the flow strategy", () => {
    const item = createExpenseItem({
      data: {
        type: "expense",
        amount: 750,
        sourceAccountId: "checking-account",
      },
    });
    const result = deriveExpense(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.strategy).toEqual({
      type: "fixed",
      config: {
        amount: 750,
      },
    });
  });

  it("should handle annual schedule", () => {
    const item = createExpenseItem({ schedule: "annually" });
    const result = deriveExpense(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.schedule).toBe("annually");
  });

  it("should include start and end dates when provided", () => {
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-12-31");
    const item = createExpenseItem({
      start: startDate,
      end: endDate,
    });
    const result = deriveExpense(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.start).toEqual(startDate);
    expect(flow?.end).toEqual(endDate);
  });

  it("should preserve the priority order from the item", () => {
    const item = createExpenseItem({ priorityOrder: 15 });
    const result = deriveExpense(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.priorityOrder).toBe(15);
  });

  it("should generate unique account and flow ids for different items", () => {
    const item1 = createExpenseItem({ id: "expense-a" });
    const item2 = createExpenseItem({ id: "expense-b" });

    const result1 = deriveExpense(item1);
    const result2 = deriveExpense(item2);

    expect(result1.accounts[0]).toBeDefined();
    expect(result2.accounts[0]).toBeDefined();
    expect(result1.flows[0]).toBeDefined();
    expect(result2.flows[0]).toBeDefined();

    expect(result1.accounts[0]?.id).toBe("expense-expense-a");
    expect(result2.accounts[0]?.id).toBe("expense-expense-b");
    expect(result1.flows[0]?.id).toBe("flow-expense-a");
    expect(result2.flows[0]?.id).toBe("flow-expense-b");
  });
});
