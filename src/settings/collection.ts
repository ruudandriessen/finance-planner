import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import z from "zod";

export const currencies = ["EUR", "USD", "GBP", "JPY", "CHF", "CAD", "AUD"] as const;
export type Currency = (typeof currencies)[number];

const userSettingsSchema = z.object({
  id: z.literal("user-settings"),
  currency: z.enum(currencies).default("EUR"),
});

export const userSettingsCollection = createCollection(
  localStorageCollectionOptions({
    id: "userSettings",
    storageKey: "userSettings",
    getKey: (item) => item.id,
    schema: userSettingsSchema,
  }),
);
