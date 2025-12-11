import {
	createCollection,
	localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";
import { flowSchema } from "./flows";

const oneTimeEvent = z.object({
	id: z.string(),
	date: z.string(),
	type: z.enum(["transfer", "adjustment"]),
	sourceAccountId: z.string().optional(),
	targetAccountId: z.string().optional(),
	amount: z.number(),
});

export const planSchema = z.object({
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
	events: z.array(oneTimeEvent),
});

export const plansCollection = createCollection(
	localStorageCollectionOptions({
		id: "plans",
		storageKey: "plans",
		getKey: (item) => item.id,
		schema: planSchema,
	}),
);
