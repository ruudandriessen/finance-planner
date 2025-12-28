import z from "zod";

const fixedStrategy = z.object({
  type: z.literal("fixed"),
  config: z.object({
    amount: z.number(),
  }),
});

const morgageStrategy = z.object({
  type: z.literal("mortgage"),
  config: z.object({
    liabilityAccountId: z.string(),
    interestExpenseAccountId: z.string(),
    assetAccountId: z.string(),
    totalPaymentAmount: z.number(),
    interestCalculation: z.object({
      type: z.literal("FIXED_RATE"),
      baseAnnualRate: z.number(),
    }),
  }),
});

const compoundInterestStrategy = z.object({
  type: z.literal("compound"),
  config: z.object({
    growthRate: z.number(),
  }),
});

export const flowSchema = z.object({
  id: z.string(),
  name: z.string(),

  // Execution Priority
  // Lower numbers run first (Income -> Transfers -> Bills -> Savings)
  priorityOrder: z.number(),
  schedule: z.enum(["monthly", "annually"]).default("monthly"),

  // Flow direction
  sourceAccountId: z.string(),
  targetAccountId: z.string(),

  start: z.date().optional(),
  end: z.date().optional(),

  strategy: z.discriminatedUnion("type", [
    fixedStrategy,
    morgageStrategy,
    compoundInterestStrategy,
  ]),
  modifiers: z.array(z.enum(["inflation_adjusted"])),
});
