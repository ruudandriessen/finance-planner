import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import z from "zod";
import { eventsSchema } from "@/events/schema";
import { flowSchema } from "../flows/flows";

const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  globalParams: z
    .object({
      inflationRate: z.number(),
    })
    .partial(),
  overrides: z.array(
    z.object({
      ruleId: z.string(),
      patch: flowSchema.partial(),
    }),
  ),
  events: z.array(eventsSchema),
});

export const plansCollection = createCollection(
  localStorageCollectionOptions({
    id: "plans",
    storageKey: "plans",
    getKey: (item) => item.id,
    schema: planSchema,
  }),
);
