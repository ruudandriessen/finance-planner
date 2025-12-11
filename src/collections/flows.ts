import {
	createCollection,
	localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";

const fixedStrategy = z.object({
	type: z.literal("fixed"),
	config: z.object({
		amount: z.number(),
		// insufficientFundsBehavior: z.enum(["strict", "partial"]),
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

export const flowSchema = z.object({
	id: z.string(),
	name: z.string(),

	// Execution Priority
	// Lower numbers run first (Income -> Transfers -> Bills -> Savings)
	priorityOrder: z.number(),
	schedule: z.string(),

	// Flow direction
	sourceAccountId: z.string(),
	targetAccountId: z.string(),

	strategy: z.discriminatedUnion("type", [fixedStrategy, morgageStrategy]),
	modifiers: z.array(z.enum(["inflation_adjusted"])),
});

export const flowsCollection = createCollection(
	localStorageCollectionOptions({
		id: "flows",
		storageKey: "flows",
		getKey: (item) => item.id,
		schema: flowSchema,
	}),
);
