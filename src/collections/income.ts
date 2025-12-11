import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import z from "zod";

const incomeSchema = z.object({
  id: z.string(),
  name: z.string(),
  period: z.literal('monthly'),
  amount: z.number(),
  targetAssetId: z.string(),
});


export const incomeCollection = createCollection(
  localStorageCollectionOptions({
    id: "income",
    storageKey: "income",
    getKey: (item) => item.id,
    schema: incomeSchema,
  })
)