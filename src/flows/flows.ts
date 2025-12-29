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
    paymentType: z.enum(["annuity", "linear"]),
    loanTermMonths: z.number(),
    originalLoanAmount: z.number(),
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

const savingsInterestStrategy = z.object({
  type: z.literal("savingsInterest"),
  config: z.object({
    interestRate: z.number(), // Annual interest rate as decimal (e.g., 0.04 for 4%)
    savingsAccountId: z.string(), // The account to track and pay interest on
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
    savingsInterestStrategy,
  ]),
  modifiers: z.array(z.enum(["inflation_adjusted"])),
});

export type Flow = z.infer<typeof flowSchema>;
