import {
	createCollection,
	localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";

export const flowSchema = z.object({
	id: z.string(),
	name: z.string(),

	// Execution Priority
	// Lower numbers run first (Income -> Transfers -> Bills -> Savings)
	priorityOrder: z.number(),

	// Flow direction
	sourceAccountId: z.string(),
	targetAccountId: z.string(),

	// Maps to a code class: FixedStrategy, MortgageStrategy, WaterfallStrategy
	strategyType: z.enum(["fixed"]),
	strategyConfig: z.object({
		amount: z.number(),
		// insufficientFundsBehavior: z.enum(["strict", "partial"]),
	}),

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
