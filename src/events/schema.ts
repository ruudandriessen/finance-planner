import z from "zod";

const mortgageDownPaymentEvent = z.object({
  id: z.string(),
  type: z.literal("mortgageDownPayment"),
  name: z.string(),
  date: z.string(),
  mortgageId: z.string(),
  sourceAccountId: z.string(),
  amount: z.number(),
});

export const eventsSchema = z.discriminatedUnion("type", [
  mortgageDownPaymentEvent,
]);

export type PlanEvent = z.infer<typeof eventsSchema>;
export type MortgageDownPaymentEvent = z.infer<typeof mortgageDownPaymentEvent>;
