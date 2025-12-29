import { describe, expect, it } from "vitest";
import type { FinancialItem } from "@/financial-items/types";
import { deriveSavings } from "./deriveSavings";

describe("deriveSavings", () => {
  const createSavingsItem = (
    overrides: Omit<Partial<FinancialItem<"savings">>, "data"> & {
      data?: Partial<Omit<FinancialItem<"savings">["data"], "type">>;
    } = {},
  ): FinancialItem<"savings"> => {
    const { data: dataOverrides = {}, ...rest } = overrides;
    return {
      id: "savings-1",
      name: "Emergency Fund",
      priorityOrder: 1,
      schedule: "monthly",
      data: {
        type: "savings",
        initialBalance: 10000,
        interestRate: 0,
        ...dataOverrides,
      },
      ...rest,
    };
  };

  it("should create an asset account with initial balance", () => {
    const item = createSavingsItem();
    const result = deriveSavings(item);

    expect(result.accounts).toHaveLength(1);
    expect(result.accounts[0]).toEqual({
      id: "savings-1",
      type: "asset",
      amount: 10000,
    });
  });

  it("should not create flows when interest rate is 0", () => {
    const item = createSavingsItem({ data: { interestRate: 0 } });
    const result = deriveSavings(item);

    expect(result.flows).toHaveLength(0);
  });

  it("should create interest income account when interest rate is set", () => {
    const item = createSavingsItem({ data: { interestRate: 0.04 } });
    const result = deriveSavings(item);

    expect(result.accounts).toHaveLength(2);
    expect(result.accounts[1]).toEqual({
      id: "interest-income-savings-1",
      type: "income",
      amount: 0,
    });
  });

  it("should create interest flow with savingsInterest strategy", () => {
    const item = createSavingsItem({ data: { interestRate: 0.04 } });
    const result = deriveSavings(item);

    expect(result.flows).toHaveLength(1);
    const flow = result.flows[0];
    expect(flow).toBeDefined();
    expect(flow?.strategy.type).toBe("savingsInterest");
  });

  it("should configure interest flow correctly", () => {
    const item = createSavingsItem({
      id: "my-savings",
      name: "My Savings",
      priorityOrder: 5,
      data: { interestRate: 0.035 },
    });
    const result = deriveSavings(item);

    const flow = result.flows[0];
    expect(flow).toEqual({
      id: "interest-flow-my-savings",
      name: "My Savings Interest",
      priorityOrder: 1005, // original + 1000
      schedule: "monthly",
      sourceAccountId: "interest-income-my-savings",
      targetAccountId: "my-savings",
      start: undefined,
      end: undefined,
      strategy: {
        type: "savingsInterest",
        config: {
          interestRate: 0.035,
          savingsAccountId: "my-savings",
        },
      },
      modifiers: [],
    });
  });

  it("should include start and end dates in interest flow", () => {
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2025-12-31");
    const item = createSavingsItem({
      start: startDate,
      end: endDate,
      data: { interestRate: 0.04 },
    });
    const result = deriveSavings(item);

    const flow = result.flows[0];
    expect(flow?.start).toEqual(startDate);
    expect(flow?.end).toEqual(endDate);
  });
});
