import {
  createCollection,
  localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";

// Income data schema
const incomeDataSchema = z.object({
  type: z.literal("income"),
  amount: z.number(),
  sourceAccountId: z.string(),
});

// Mortgage data schema
const mortgageDataSchema = z.object({
  type: z.literal("mortgage"),
  paymentAmount: z.number(),
  interestRate: z.number(),
  loanAmount: z.number(),
  paymentSourceAccountId: z.string(),
});

// Expense data schema
const expenseDataSchema = z.object({
  type: z.literal("expense"),
  amount: z.number(),
  sourceAccountId: z.string(),
});

// Financial item schema
export const financialItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  priorityOrder: z.number(),
  schedule: z.enum(["monthly", "annually"]).default("monthly"),
  start: z.date().optional(),
  end: z.date().optional(),
  data: z.discriminatedUnion("type", [
    incomeDataSchema,
    mortgageDataSchema,
    expenseDataSchema,
  ]),
});

// Create collection (same pattern as accountsCollection)
export const financialItemsCollection = createCollection(
  localStorageCollectionOptions({
    id: "financialItems",
    storageKey: "financialItems",
    getKey: (item) => item.id,
    schema: financialItemSchema,
  }),
);
