import { shouldRunRule } from "./shouldRunRule";
import { StrategyRegistry } from "./strategies";
import type {
  SimulationContext,
  SimulationOptions,
  SimulationResult,
  Transaction,
} from "./types";

export const runSimulation = ({
  monthsToSimulate,
  startDate,
  initialAccounts,
  rules,
}: SimulationOptions): SimulationResult[] => {
  // 1. Initialize State Map (for O(1) lookups)
  // We use a mutable map inside the loop for performance,
  // but we snapshot it for the results.
  const currentBalances: Record<string, number> = {};
  initialAccounts.forEach((acc) => {
    currentBalances[acc.id] = acc.amount;
  });

  // Sort rules once by priority
  const sortedRules = [...rules].sort(
    (a, b) => a.priorityOrder - b.priorityOrder,
  );

  const history: SimulationResult[] = [];
  const currentDate = new Date(startDate);

  // 2. Time Loop
  for (let i = 0; i < monthsToSimulate; i++) {
    const monthlyTransactions: Transaction[] = [];

    // Create Context for this tick
    const context: SimulationContext = {
      date: new Date(currentDate), // Copy date
      balances: currentBalances, // Pass reference to current state
      globals: { inflationRate: 0.03 }, // Hardcoded for now
    };

    // 3. Rule Execution Loop (Waterfall)
    for (const rule of sortedRules) {
      if (!shouldRunRule(rule, currentDate)) {
        continue;
      }

      const strategyFn = StrategyRegistry[rule.strategy.type];

      if (!strategyFn) {
        console.warn(`Unknown strategy: ${rule.strategy.type}`);
        continue;
      }

      // Execute Strategy
      const ruleTxs = strategyFn(rule, context);

      // Apply Transactions to State Immediately (Waterfall effect)
      for (const tx of ruleTxs) {
        // Decrease Source
        const sourceBalance = currentBalances[tx.fromId];
        if (sourceBalance !== undefined) {
          currentBalances[tx.fromId] = sourceBalance - tx.amount;
        } else {
          // Initialize if implied (e.g. Income buckets usually start at 0)
          currentBalances[tx.fromId] = -tx.amount;
        }

        // Increase Target (Asset goes up, or Liability goes down depending on modeling)
        // In this model:
        // Asset (+100) -> Target (+100)
        // Liability (300k) -> Target (-100) means we are reducing debt?
        // standard accounting: Credits/Debits.
        // SIMPLIFIED MODEL: We just ADD to the target bucket.
        // If Target is Liability (300k debt), and we pay 100, we want it to be 299,900.
        // So we must subtract from liability?

        // CORRECTION: To keep it generic, we simply ADD to the target balance.
        // Therefore, Liabilities should likely be stored as NEGATIVE numbers
        // (e.g. -300,000). Moving +100 to it makes it -299,900.
        // Or if stored as positive, the Strategy needs to emit a negative amount?

        // Let's stick to: Assets Positive, Liabilities Negative.
        // Paying off debt = Moving Positive Cash to Negative Liability.
        // -300k + 1k = -299k. Correct.

        const targetBalance = currentBalances[tx.toId];
        if (targetBalance !== undefined) {
          currentBalances[tx.toId] = targetBalance + tx.amount;
        } else {
          currentBalances[tx.toId] = tx.amount;
        }

        monthlyTransactions.push(tx);
      }
    }

    // 4. Record History
    history.push({
      date: new Date(currentDate),
      balances: { ...currentBalances }, // Shallow clone snapshot
      transactions: monthlyTransactions,
    });

    // Advance Time (Simple month increment)
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return history;
};
