import {
  createCollection,
  localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";

// Savings account data schema
const savingsDataSchema = z.object({
  type: z.literal("savings"),
  initialBalance: z.number(),
});

// Checking account data schema
const checkingDataSchema = z.object({
  type: z.literal("checking"),
  initialBalance: z.number(),
});

// Income data schema
const incomeDataSchema = z.object({
  type: z.literal("income"),
  amount: z.number(),
  targetAccountId: z.string(),
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
    savingsDataSchema,
    checkingDataSchema,
    incomeDataSchema,
    mortgageDataSchema,
    expenseDataSchema,
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
