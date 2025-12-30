import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import z from "zod";

const transactionSchema = z.object({
  id: z.string(),
  iban: z.string(),
  date: z.coerce.date(),
  amount: z.number(),
  currency: z.string().default("EUR"),
  balanceAfter: z.number().optional(),
  counterpartyIban: z.string().optional(),
  counterpartyName: z.string().optional(),
  description: z.string(),
  transactionCode: z.string().optional(),
  importedAt: z.coerce.date(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const transactionsCollection = createCollection(
  localStorageCollectionOptions({
    id: "transactions",
    storageKey: "transactions",
    getKey: (item) => item.id,
    schema: transactionSchema,
  }),
);
