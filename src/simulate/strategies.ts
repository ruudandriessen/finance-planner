import type { Rule, SimulationContext, Transaction } from "./types";

// Define the signature for any strategy function
export type StrategyFn = (rule: Rule, ctx: SimulationContext) => Transaction[];

/**
 * STRATEGY 1: FIXED_TRANSFER
 * Simple movement of a set amount from A to B.
 */
const fixedTransferStrategy: StrategyFn = (rule, ctx) => {
	if (rule.strategy.type !== "fixed") return [];
	const { config } = rule.strategy;
	const amount = config.amount;

	// Validation
	if (!amount || amount <= 0) return [];

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
 */
const dynamicMortgageStrategy: StrategyFn = (rule, ctx) => {
	if (rule.strategy.type !== "mortgage") return [];
	const { config } = rule.strategy;

	// 1. Get the current Loan Balance
	// We expect Liabilities to be stored as NEGATIVE numbers (e.g., -200,000)
	const currentLiabilityBalance = ctx.balances[config.liabilityAccountId] || 0;

	// If the loan is already positive or zero, it's paid off. Stop paying.
	if (currentLiabilityBalance >= 0) {
		return [];
	}

	// 2. Calculate Interest
	// We need the absolute value of the debt to calculate interest cost
	const principalRemaining = Math.abs(currentLiabilityBalance);

	// Convert percentage to decimal if needed (e.g., 4.15 -> 0.0415)
	const annualRateInput = config.interestCalculation.baseAnnualRate || 5; // Default 5%
	const annualRate = annualRateInput > 1 ? annualRateInput / 100 : annualRateInput;
	const monthlyRate = annualRate / 12;

	let interestPayment = principalRemaining * monthlyRate;

	// 3. Determine Splits
	const totalPayment = config.totalPaymentAmount;

	// Logic: You pay the interest first. The rest goes to principal.
	let principalPayment = totalPayment - interestPayment;

	// Edge Case: The final payment (Don't overpay the loan)
	// If remaining debt is $500, and principal payment is calculated at $1000,
	// we cap the principal payment at $500.
	if (principalPayment > principalRemaining) {
		principalPayment = principalRemaining;

		// Optional: Adjust total payment down if we are just clearing the crumbs
		// or assume the user keeps the change.
		// Here we strictly pay off exactly what is needed.
	}

	// Edge Case: Negative Amortization (Interest > Payment)
	// If your payment is $1000 but interest is $1500, your debt grows.
	if (principalPayment < 0) {
		// In this simple model, we will just apply the full payment to interest,
		// and the remainder increases the liability (technically).
		// Let's simplify:
		// 1. Pay max interest possible with the cash available.
		// 2. Add unpaid interest to principal? (Complex)
		// For this MVP, let's just log a warning and clamp.
		console.warn(
			`[${rule.name}] ⚠️  NEGATIVE AMORTIZATION!\n` +
			`  Mortgage Balance: $${principalRemaining.toLocaleString()}\n` +
			`  Monthly Interest: $${interestPayment.toFixed(2)}\n` +
			`  Your Payment: $${totalPayment.toFixed(2)}\n` +
			`  Shortfall: $${(interestPayment - totalPayment).toFixed(2)}\n` +
			`  → Your payment is too low! Increase it to at least $${Math.ceil(interestPayment + 100)}/month`
		);
		interestPayment = totalPayment;
		principalPayment = 0;
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
 * STRATEGY REGISTRY
 * Maps the string keys from your DB/JSON to the actual functions.
 */
export const StrategyRegistry: Record<string, StrategyFn> = {
	fixed: fixedTransferStrategy,
	mortgage: dynamicMortgageStrategy,
};
