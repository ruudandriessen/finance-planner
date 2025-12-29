import type z from "zod";
import type { PlanEvent } from "@/events/schema";
import type { FinancialItemBase } from "@/financial-items/types";
import type { flowSchema } from "@/flows/flows";

export type Flow = z.infer<typeof flowSchema>;

export interface SimulationOptions {
  financialItems: FinancialItemBase[];
  monthsToSimulate: number;
  startDate: Date;
  events?: PlanEvent[];
}

export interface SimulationContext {
  date: Date;
  // Fast lookup for current state: { "acc_checking": 5000, "acc_mortgage": -200000 }
  balances: Record<string, number>;
  // Global world parameters
  globals: {
    inflationRate: number;
  };
  // Persistent state for strategies that need to track data across months
  // Key format: "strategyType:flowId:key" -> value
  strategyState: Record<string, unknown>;
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
  balances: Record<string, number>;
  transactions: Transaction[];
}
