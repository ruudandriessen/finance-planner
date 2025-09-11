import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import z from "zod";

const salaryIncomeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("salary"),
  period: z.literal('monthly'),
  amount: z.number(),
});

const subsidiesSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("subsidies"),
  amount: z.number(),
});

const incomeSchema = z.discriminatedUnion("type", [
  salaryIncomeSchema,
  subsidiesSchema
]);

export const incomeCollection = createCollection(
  localStorageCollectionOptions({
    id: "income",
    storageKey: "income",
    getKey: (item) => item.id,
    schema: incomeSchema,
  })
)