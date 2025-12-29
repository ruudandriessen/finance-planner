import { describe, expect, it } from "vitest";
import { StrategyRegistry } from "./strategies";
import type { Flow, SimulationContext } from "./types";

describe("savingsInterestStrategy", () => {
  const createContext = (overrides: Partial<SimulationContext> = {}): SimulationContext => ({
    date: new Date("2024-01-15"),
    balances: {},
    globals: { inflationRate: 0.03 },
    strategyState: {},
    ...overrides,
  });

  const createFlow = (overrides: Partial<Flow> = {}): Flow => ({
    id: "interest-flow-1",
    name: "Savings Interest",
    priorityOrder: 1000,
    schedule: "monthly",
    sourceAccountId: "interest-income",
    targetAccountId: "savings-account",
    strategy: {
      type: "savingsInterest",
      config: {
        interestRate: 0.04,
        savingsAccountId: "savings-account",
      },
    },
    modifiers: [],
    ...overrides,
  });

  // biome-ignore lint/complexity/useLiteralKeys: TS requires bracket notation for index signatures
  const strategy = StrategyRegistry["savingsInterest"];
  if (!strategy) {
    throw new Error("savingsInterest strategy not found in registry");
  }

  it("should track balance each month", () => {
    const ctx = createContext({
      date: new Date("2024-03-15"), // March (not January)
      balances: { "savings-account": 10000 },
    });
    const flow = createFlow();

    strategy(flow, ctx);

    expect(ctx.strategyState["savingsInterest:interest-flow-1:balances"]).toEqual([10000]);
  });

  it("should not pay out in non-January months", () => {
    const ctx = createContext({
      date: new Date("2024-03-15"), // March
      balances: { "savings-account": 10000 },
    });
    const flow = createFlow();

    const transactions = strategy(flow, ctx);

    expect(transactions).toHaveLength(0);
  });

  it("should pay out interest in January based on accumulated history", () => {
    const ctx = createContext({
      date: new Date("2024-01-15"), // January
      balances: { "savings-account": 10000 },
      strategyState: {
        "savingsInterest:interest-flow-1:balances": [
          10000,
          10000,
          10000,
          10000,
          10000,
          10000,
          10000,
          10000,
          10000,
          10000,
          10000, // 11 months of $10,000
        ],
      },
    });
    const flow = createFlow();

    const transactions = strategy(flow, ctx);

    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      fromId: "interest-income",
      toId: "savings-account",
      amount: 400, // $10,000 * 4% = $400
      type: "INTEREST",
    });
  });

  it("should calculate weighted average interest correctly", () => {
    const ctx = createContext({
      date: new Date("2024-01-15"),
      balances: { "savings-account": 20000 },
      strategyState: {
        "savingsInterest:interest-flow-1:balances": [
          5000,
          10000,
          15000,
          20000,
          20000,
          20000,
          20000,
          20000,
          20000,
          20000,
          20000, // Varying balances
        ],
      },
    });
    const flow = createFlow();

    const transactions = strategy(flow, ctx);

    // Average: (5000 + 10000 + 15000 + 20000*8 + 20000) / 12 = 17500
    // Current balance adds another 20000, so: (5000 + 10000 + 15000 + 20000*9) / 12 = 17916.67
    const expectedAvg = (5000 + 10000 + 15000 + 20000 * 9) / 12;
    const expectedInterest = Number((expectedAvg * 0.04).toFixed(2));

    expect(transactions).toHaveLength(1);
    expect(transactions[0]?.amount).toBe(expectedInterest);
  });

  it("should keep only last 12 months of history", () => {
    const ctx = createContext({
      date: new Date("2024-02-15"), // February (not January, so no payout)
      balances: { "savings-account": 15000 },
      strategyState: {
        "savingsInterest:interest-flow-1:balances": [
          1000,
          2000,
          3000,
          4000,
          5000,
          6000,
          7000,
          8000,
          9000,
          10000,
          11000,
          12000, // Already 12 months
        ],
      },
    });
    const flow = createFlow();

    strategy(flow, ctx);

    const history = ctx.strategyState["savingsInterest:interest-flow-1:balances"] as number[];
    expect(history).toHaveLength(12);
    expect(history[0]).toBe(2000); // First entry (1000) was shifted out
    expect(history[11]).toBe(15000); // New entry added
  });

  it("should return no transactions when balance is zero", () => {
    const ctx = createContext({
      date: new Date("2024-01-15"),
      balances: { "savings-account": 0 },
      strategyState: {
        "savingsInterest:interest-flow-1:balances": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    });
    const flow = createFlow();

    const transactions = strategy(flow, ctx);

    expect(transactions).toHaveLength(0);
  });

  it("should handle first January with partial history", () => {
    const ctx = createContext({
      date: new Date("2024-01-15"),
      balances: { "savings-account": 10000 },
      strategyState: {
        "savingsInterest:interest-flow-1:balances": [10000, 10000, 10000], // Only 3 months
      },
    });
    const flow = createFlow();

    const transactions = strategy(flow, ctx);

    // Average of 4 months (3 existing + 1 current): $10,000
    // Interest: $10,000 * 4% = $400
    expect(transactions).toHaveLength(1);
    expect(transactions[0]?.amount).toBe(400);
  });
});
