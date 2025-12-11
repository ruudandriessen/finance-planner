import {
	createCollection,
	localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";

export const accountSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum(["asset", "liability", "income", "expense"]),
	amount: z.number(),
});

export const accountsCollection = createCollection(
	localStorageCollectionOptions({
		id: "accounts",
		storageKey: "accounts",
		getKey: (item) => item.id,
		schema: accountSchema,
	}),
);
