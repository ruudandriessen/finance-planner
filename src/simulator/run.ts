import type { PlanEvent } from "@/events/schema";
import { deriveAccountsAndFlows } from "./derivers/derive-accounts-flows";
import { shouldRunRule } from "./shouldRunRule";
import { StrategyRegistry } from "./strategies";
import type {
  SimulationContext,
  SimulationOptions,
  SimulationResult,
  Transaction,
} from "./types";

/**
 * Checks if an event should be applied in the current month.
 * Events are applied if their date falls within the current simulation month.
 */
function shouldApplyEvent(event: PlanEvent, currentDate: Date): boolean {
  const eventDate = new Date(event.date);
  return (
    eventDate.getFullYear() === currentDate.getFullYear() &&
    eventDate.getMonth() === currentDate.getMonth()
  );
}

/**
 * Applies a transaction to the current balances (mutates in place).
 */
function applyTransaction(
  currentBalances: Record<string, number>,
  tx: Transaction,
): void {
  // Decrease Source
  const sourceBalance = currentBalances[tx.fromId];
  if (sourceBalance !== undefined) {
    currentBalances[tx.fromId] = sourceBalance - tx.amount;
  } else {
    currentBalances[tx.fromId] = -tx.amount;
  }

  // Increase Target
  const targetBalance = currentBalances[tx.toId];
  if (targetBalance !== undefined) {
    currentBalances[tx.toId] = targetBalance + tx.amount;
  } else {
    currentBalances[tx.toId] = tx.amount;
  }
}

/**
 * Processes plan events for the current month and returns transactions.
 */
function processEvents(
  events: PlanEvent[],
  currentDate: Date,
  currentBalances: Record<string, number>,
): Transaction[] {
  const eventsToApply = events.filter((event) =>
    shouldApplyEvent(event, currentDate),
  );
  const transactionsToApply = eventsToApply
    .filter((event) => event.type === "mortgageDownPayment")
    .map((event) => {
      const liabilityAccountId = `liability-${event.mortgageId}`;
      const tx: Transaction = {
        fromId: event.sourceAccountId,
        toId: liabilityAccountId,
        amount: event.amount,
        date: new Date(currentDate),
        description: `Down payment: ${event.name}`,
        type: "TRANSFER",
      };
      return tx;
    });

  transactionsToApply.forEach((tx) => {
    applyTransaction(currentBalances, tx);
  });

  return transactionsToApply;
}

export const runSimulation = ({
  monthsToSimulate,
  startDate,
  financialItems,
  events = [],
}: SimulationOptions): SimulationResult[] => {
  const { flows, accounts: initialAccounts } =
    deriveAccountsAndFlows(financialItems);

  if (initialAccounts.length === 0 || flows.length === 0) {
    return [];
  }

  // 1. Initialize State Map (for O(1) lookups)
  // We use a mutable map inside the loop for performance,
  // but we snapshot it for the results.
  const currentBalances: Record<string, number> = {};
  initialAccounts.forEach((acc) => {
    currentBalances[acc.id] = acc.amount;
  });

  // Sort rules once by priority
  const sortedRules = [...flows].sort(
    (a, b) => a.priorityOrder - b.priorityOrder,
  );

  const history: SimulationResult[] = [];
  const currentDate = new Date(startDate);

  // Persistent state for strategies that need to track data across months
  const strategyState: Record<string, unknown> = {};

  // 2. Time Loop
  for (let i = 0; i < monthsToSimulate; i++) {
    const monthlyTransactions: Transaction[] = [];

    // Create Context for this tick
    const context: SimulationContext = {
      date: new Date(currentDate), // Copy date
      balances: currentBalances, // Pass reference to current state
      globals: { inflationRate: 0.03 }, // Hardcoded for now
      strategyState, // Persistent state across months
    };

    // 3. Process one-time events first (before regular rules)
    const eventTransactions = processEvents(
      events,
      currentDate,
      currentBalances,
    );
    monthlyTransactions.push(...eventTransactions);

    // 4. Rule Execution Loop (Waterfall)
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
        applyTransaction(currentBalances, tx);
        monthlyTransactions.push(tx);
      }
    }

    // 5. Record History
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
