import {
  createCollection,
  localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";
import { flowSchema } from "./flows";

const mortgageDownPaymentEvent = z.object({
  id: z.string(),
  type: z.literal("mortgageDownPayment"),
  name: z.string(),
  date: z.string(),
  mortgageId: z.string(),
  sourceAccountId: z.string(),
  amount: z.number(),
});

const planEventSchema = z.discriminatedUnion("type", [
  mortgageDownPaymentEvent,
]);

export type PlanEvent = z.infer<typeof planEventSchema>;
export type MortgageDownPaymentEvent = z.infer<typeof mortgageDownPaymentEvent>;

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
  events: z.array(planEventSchema),
});

export const plansCollection = createCollection(
  localStorageCollectionOptions({
    id: "plans",
    storageKey: "plans",
    getKey: (item) => item.id,
    schema: planSchema,
  }),
);
