import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import z from "zod";

const savingsDataSchema = z.object({
  type: z.literal("savings"),
  initialBalance: z.number(),
  interestRate: z.number().default(0), // Annual interest rate as decimal (e.g., 0.04 for 4%)
});

export type SavingsData = z.infer<typeof savingsDataSchema>;

const checkingDataSchema = z.object({
  type: z.literal("checking"),
  initialBalance: z.number(),
});

export type CheckingData = z.infer<typeof checkingDataSchema>;

const incomeDataSchema = z.object({
  type: z.literal("income"),
  amount: z.number(),
  targetAccountId: z.string(),
});

export type IncomeData = z.infer<typeof incomeDataSchema>;

const mortgageDataSchema = z.object({
  type: z.literal("mortgage"),
  interestRate: z.number(),
  currentBalance: z.number(), // Remaining loan balance
  originalLoanAmount: z.number(), // Total loan at inception
  loanTermYears: z.number(),
  paymentType: z.enum(["annuity", "linear"]),
  paymentSourceAccountId: z.string(),
  mortgageStartDate: z.date().optional(), // When the mortgage was taken out
  houseValue: z.number().optional(), // Property value (defaults to originalLoanAmount)
});

export type MortgageData = z.infer<typeof mortgageDataSchema>;

const expenseDataSchema = z.object({
  type: z.literal("expense"),
  amount: z.number(),
  sourceAccountId: z.string(),
});

export type ExpenseData = z.infer<typeof expenseDataSchema>;

const investmentDataSchema = z.object({
  type: z.literal("investment"),
  initialValue: z.number(),
  yearlyReturnRate: z.number(),
});

export type InvestmentData = z.infer<typeof investmentDataSchema>;

const financialItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  priorityOrder: z.number(),
  schedule: z.enum(["monthly", "annually"]).default("monthly"),
  start: z.date().optional(),
  end: z.date().optional(),
  data: z.discriminatedUnion("type", [
    savingsDataSchema,
    checkingDataSchema,
    incomeDataSchema,
    mortgageDataSchema,
    expenseDataSchema,
    investmentDataSchema,
  ]),
});

// Create collection
export const financialItemsCollection = createCollection(
  localStorageCollectionOptions({
    id: "financialItems",
    storageKey: "financialItems",
    getKey: (item) => item.id,
    schema: financialItemSchema,
  }),
);
