import { describe, expect, it } from "vitest";
import { deriveMortgage } from "./MortgageTemplate";
import type { FinancialItem } from "./types";

describe("deriveMortgage", () => {
  const createMortgageItem = (
    overrides: Partial<FinancialItem<"mortgage">> = {},
  ): FinancialItem<"mortgage"> => ({
    id: "mortgage-1",
    name: "Home Mortgage",
    priorityOrder: 10,
    schedule: "monthly",
    data: {
      type: "mortgage",
      interestRate: 0.05, // 5% as decimal
      loanAmount: 300000,
      loanTermYears: 30,
      paymentType: "annuity",
      paymentSourceAccountId: "checking-account",
    },
    ...overrides,
  });

  it("should create three accounts: liability, expense, and asset", () => {
    const item = createMortgageItem();
    const result = deriveMortgage(item);

    expect(result.accounts).toHaveLength(3);

    const liabilityAccount = result.accounts.find(
      (a) => a.type === "liability",
    );
    const expenseAccount = result.accounts.find((a) => a.type === "expense");
    const assetAccount = result.accounts.find((a) => a.type === "asset");

    expect(liabilityAccount).toBeDefined();
    expect(expenseAccount).toBeDefined();
    expect(assetAccount).toBeDefined();
  });

  it("should create account ids based on item id", () => {
    const item = createMortgageItem();
    const result = deriveMortgage(item);

    expect(result.accounts[0]).toBeDefined();
    expect(result.accounts[1]).toBeDefined();
    expect(result.accounts[2]).toBeDefined();

    expect(result.accounts[0]?.id).toBe("liability-mortgage-1");
    expect(result.accounts[1]?.id).toBe("expense-mortgage-1");
    expect(result.accounts[2]?.id).toBe("asset-mortgage-1");
  });

  it("should set liability amount as negative of loan amount", () => {
    const item = createMortgageItem({
      data: {
        type: "mortgage",
        interestRate: 0.05,
        loanAmount: 250000,
        loanTermYears: 30,
        paymentType: "annuity",
        paymentSourceAccountId: "checking-account",
      },
    });
    const result = deriveMortgage(item);

    const liabilityAccount = result.accounts.find(
      (a) => a.type === "liability",
    );
    expect(liabilityAccount?.amount).toBe(-250000);
  });

  it("should handle negative loan amount input by making it negative", () => {
    const item = createMortgageItem({
      data: {
        type: "mortgage",
        interestRate: 0.05,
        loanAmount: -200000,
        loanTermYears: 30,
        paymentType: "annuity",
        paymentSourceAccountId: "checking-account",
      },
    });
    const result = deriveMortgage(item);

    const liabilityAccount = result.accounts.find(
      (a) => a.type === "liability",
    );
    expect(liabilityAccount?.amount).toBe(-200000);
  });

  it("should set expense account amount to 0", () => {
    const item = createMortgageItem();
    const result = deriveMortgage(item);

    const expenseAccount = result.accounts.find((a) => a.type === "expense");
    expect(expenseAccount?.amount).toBe(0);
  });

  it("should set asset account amount to loan amount", () => {
    const item = createMortgageItem({
      data: {
        type: "mortgage",
        interestRate: 0.05,
        loanAmount: 400000,
        loanTermYears: 30,
        paymentType: "annuity",
        paymentSourceAccountId: "checking-account",
      },
    });
    const result = deriveMortgage(item);

    const assetAccount = result.accounts.find((a) => a.type === "asset");
    expect(assetAccount?.amount).toBe(400000);
  });

  it("should create one flow with mortgage strategy", () => {
    const item = createMortgageItem();
    const result = deriveMortgage(item);
    const flow = result.flows[0];

    expect(result.flows).toHaveLength(1);
    expect(flow).toBeDefined();
    expect(flow?.strategy.type).toBe("mortgage");
  });

  it("should set flow source to payment source account", () => {
    const item = createMortgageItem({
      data: {
        type: "mortgage",
        interestRate: 0.05,
        loanAmount: 300000,
        loanTermYears: 30,
        paymentType: "annuity",
        paymentSourceAccountId: "savings-account",
      },
    });
    const result = deriveMortgage(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.sourceAccountId).toBe("savings-account");
  });

  it("should set flow target to liability account", () => {
    const item = createMortgageItem();
    const result = deriveMortgage(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.targetAccountId).toBe("liability-mortgage-1");
  });

  it("should configure mortgage strategy correctly", () => {
    const item = createMortgageItem({
      data: {
        type: "mortgage",
        interestRate: 0.045, // 4.5% as decimal
        loanAmount: 350000,
        loanTermYears: 30,
        paymentType: "annuity",
        paymentSourceAccountId: "checking-account",
      },
    });
    const result = deriveMortgage(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.strategy).toEqual({
      type: "mortgage",
      config: {
        liabilityAccountId: "liability-mortgage-1",
        interestExpenseAccountId: "expense-mortgage-1",
        assetAccountId: "asset-mortgage-1",
        paymentType: "annuity",
        loanTermMonths: 360,
        originalLoanAmount: 350000,
        interestCalculation: {
          type: "FIXED_RATE",
          baseAnnualRate: 0.045,
        },
      },
    });
  });

  it("should preserve item name in the flow", () => {
    const item = createMortgageItem({ name: "Investment Property Mortgage" });
    const result = deriveMortgage(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.name).toBe("Investment Property Mortgage");
  });

  it("should preserve priority order in the flow", () => {
    const item = createMortgageItem({ priorityOrder: 20 });
    const result = deriveMortgage(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.priorityOrder).toBe(20);
  });

  it("should preserve schedule in the flow", () => {
    const item = createMortgageItem({ schedule: "annually" });
    const result = deriveMortgage(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.schedule).toBe("annually");
  });

  it("should include start and end dates in the flow", () => {
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2054-01-01");
    const item = createMortgageItem({
      start: startDate,
      end: endDate,
    });
    const result = deriveMortgage(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.start).toEqual(startDate);
    expect(flow?.end).toEqual(endDate);
  });

  it("should set modifiers to empty array", () => {
    const item = createMortgageItem();
    const result = deriveMortgage(item);
    const flow = result.flows[0];

    expect(flow).toBeDefined();
    expect(flow?.modifiers).toEqual([]);
  });

  it("should generate unique ids for different mortgage items", () => {
    const item1 = createMortgageItem({ id: "mortgage-a" });
    const item2 = createMortgageItem({ id: "mortgage-b" });

    const result1 = deriveMortgage(item1);
    const result2 = deriveMortgage(item2);

    expect(result1.accounts[0]).toBeDefined();
    expect(result2.accounts[0]).toBeDefined();
    expect(result1.flows[0]).toBeDefined();
    expect(result2.flows[0]).toBeDefined();

    expect(result1.accounts[0]?.id).toBe("liability-mortgage-a");
    expect(result2.accounts[0]?.id).toBe("liability-mortgage-b");
    expect(result1.flows[0]?.id).toBe("flow-mortgage-a");
    expect(result2.flows[0]?.id).toBe("flow-mortgage-b");
  });
});
