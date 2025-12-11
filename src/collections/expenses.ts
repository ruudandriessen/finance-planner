import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import z from "zod";

const expensesSchema = z.object({
  id: z.string(),
  name: z.string(),
  period: z.literal('monthly'),
  amount: z.number(),
  sourceAssetId: z.string(),
});


export const expenseCollection = createCollection(
  localStorageCollectionOptions({
    id: "expenses",
    storageKey: "expenses",
    getKey: (item) => item.id,
    schema: expensesSchema,
  })
)