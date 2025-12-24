import type z from "zod";
import type { accountSchema } from "@/collections/accounts";
import type { flowSchema } from "@/collections/flows";

export type Rule = z.infer<typeof flowSchema>;

export interface SimulationOptions {
  monthsToSimulate: number;
  startDate: Date;
  initialAccounts: z.infer<typeof accountSchema>[];
  rules: Rule[];
}

export interface SimulationContext {
  date: Date;
  // Fast lookup for current state: { "acc_checking": 5000, "acc_mortgage": -200000 }
  balances: Record<string, number>;
  // Global world parameters
  globals: {
    inflationRate: number;
    interestRateVector?: number; // Futureproofing
  };
}

export interface Transaction {
  fromId: string;
  toId: string;
  amount: number; // Always positive
  date: Date;
  description: string;
  type?: "TRANSFER" | "INTEREST" | "FEE"; // Optional tagging
}

export interface SimulationResult {
  date: Date;
  // A snapshot of all account balances at the end of this month
  balances: Record<string, number>;
  // The specific transactions that occurred this month
  transactions: Transaction[];
}
