import {
  calculateAnnuityPayment,
  calculateLinearPrincipal,
} from "@/lib/mortgage-calculations";
import type { Rule, SimulationContext, Transaction } from "./types";

// Define the signature for any strategy function
type StrategyFn = (rule: Rule, ctx: SimulationContext) => Transaction[];

/**
 * STRATEGY 1: FIXED_TRANSFER
 * Simple movement of a set amount from A to B.
 */
const fixedTransferStrategy: StrategyFn = (rule, ctx) => {
  if (rule.strategy.type !== "fixed") return [];
  const { config } = rule.strategy;
  const amount = config.amount;

  if (amount <= 0) {
    console.warn(`[${rule.name}] ⚠️ BELOW ZERO AMOUNT TRANSFER`);
    return [];
  }

  return [
    {
      fromId: rule.sourceAccountId,
      toId: rule.targetAccountId,
      amount: amount,
      date: ctx.date,
      description: `Fixed Transfer: ${rule.name || rule.id}`,
      type: "TRANSFER",
    },
  ];
};

/**
 * STRATEGY 2: DYNAMIC_MORTGAGE
 * Calculates interest based on current debt balance,
 * splits payment into Interest (Expense) and Principal (Liability Reduction).
 * Supports two payment types:
 * - Annuity: Fixed monthly payment (calculated from loan amount, rate, term)
 * - Linear: Fixed principal payment + decreasing interest
 */
const dynamicMortgageStrategy: StrategyFn = (rule, ctx) => {
  if (rule.strategy.type !== "mortgage") return [];
  const { config } = rule.strategy;

  // 1. Get the current Loan Balance
  // We expect Liabilities to be stored as NEGATIVE numbers (e.g., -200,000)
  const currentLiabilityBalance = ctx.balances[config.liabilityAccountId] ?? 0;

  // If the loan is already positive or zero, it's paid off. Stop paying.
  if (currentLiabilityBalance >= 0) {
    return [];
  }

  // 2. Calculate Interest
  // We need the absolute value of the debt to calculate interest cost
  const principalRemaining = Math.abs(currentLiabilityBalance);

  // Convert percentage to decimal if needed (e.g., 4.15 -> 0.0415)
  const annualRateInput = config.interestCalculation.baseAnnualRate ?? 5; // Default 5%
  const annualRate =
    annualRateInput > 1 ? annualRateInput / 100 : annualRateInput;
  const monthlyRate = annualRate / 12;

  const interestPayment = principalRemaining * monthlyRate;

  // 3. Calculate payment based on payment type
  let totalPayment: number;
  let principalPayment: number;

  if (config.paymentType === "linear") {
    // Linear: Fixed principal payment each month
    principalPayment = calculateLinearPrincipal(
      config.originalLoanAmount,
      config.loanTermMonths / 12,
    );
    // Cap principal payment to remaining debt
    if (principalPayment > principalRemaining) {
      principalPayment = principalRemaining;
    }
    totalPayment = principalPayment + interestPayment;
  } else {
    // Annuity: Fixed total payment
    totalPayment = calculateAnnuityPayment(
      config.originalLoanAmount,
      config.interestCalculation.baseAnnualRate,
      config.loanTermMonths / 12,
    );
    principalPayment = totalPayment - interestPayment;

    // Edge Case: The final payment (Don't overpay the loan)
    if (principalPayment > principalRemaining) {
      principalPayment = principalRemaining;
    }

    // Edge Case: Negative Amortization (Interest > Payment)
    if (principalPayment < 0) {
      console.warn(
        `[${rule.name}] ⚠️  NEGATIVE AMORTIZATION!\n` +
          `  Mortgage Balance: $${principalRemaining.toLocaleString()}\n` +
          `  Monthly Interest: $${interestPayment.toFixed(2)}\n` +
          `  Your Payment: $${totalPayment.toFixed(2)}\n` +
          `  Shortfall: $${(interestPayment - totalPayment).toFixed(2)}\n` +
          `  → Your payment is too low!`,
      );
      principalPayment = 0;
    }
  }

  const transactions: Transaction[] = [];

  // Transaction A: The Interest (Money burns; goes to Expense)
  if (interestPayment > 0) {
    transactions.push({
      fromId: rule.sourceAccountId,
      toId: config.interestExpenseAccountId,
      amount: Number(interestPayment.toFixed(2)),
      date: ctx.date,
      description: `Mortgage Interest (${rule.name})`,
      type: "INTEREST",
    });
  }

  // Transaction B: The Principal (Money reduces debt; goes to Liability)
  if (principalPayment > 0) {
    transactions.push({
      fromId: rule.sourceAccountId,
      toId: config.liabilityAccountId,
      amount: Number(principalPayment.toFixed(2)),
      date: ctx.date,
      description: `Mortgage Principal (${rule.name})`,
      type: "TRANSFER",
    });
  }

  return transactions;
};

/**
 * STRATEGY 3: COMPOUND_INTEREST
 * Applies a % growth rate to the current balance of the target account.
 * Used for: Savings Interest, Stock Market Growth, Dividend Reinvestment.
 */
const compoundInterestStrategy: StrategyFn = (rule, ctx) => {
  if (rule.strategy.type !== "compound") return [];
  const { config } = rule.strategy;

  // 1. Get the current balance of the Asset (e.g., Stock Portfolio)
  // Logic: We define the "Target" as the account growing.
  const currentBalance = ctx.balances[rule.targetAccountId] || 0;

  // No money, no interest.
  if (currentBalance <= 0) return [];

  // 2. Determine Rate
  const annualRate = config.growthRate; // e.g., 0.08 for 8%

  // 3. Calculate Gain
  const gainAmount = currentBalance * annualRate;

  // Round to 2 decimals
  const safeAmount = Number(gainAmount.toFixed(2));

  if (safeAmount <= 0) return [];

  return [
    {
      fromId: rule.sourceAccountId, // The "Market" or "Bank" income node
      toId: rule.targetAccountId, // The Asset
      amount: safeAmount,
      date: ctx.date,
      description: `Growth (${(annualRate * 100).toFixed(1)}%): ${rule.name}`,
      type: "INTEREST", // or 'APPRECIATION'
    },
  ];
};

// Add to Registry
// StrategyRegistry['COMPOUND_INTEREST'] = compoundInterestStrategy;

/**
 * STRATEGY REGISTRY
 * Maps the string keys from your DB/JSON to the actual functions.
 */
export const StrategyRegistry: Record<string, StrategyFn> = {
  fixed: fixedTransferStrategy,
  mortgage: dynamicMortgageStrategy,
  compound: compoundInterestStrategy,
};
