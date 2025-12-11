import {
	createCollection,
	localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";

const assetsSchema = z.object({
	id: z.string(),
	name: z.string(),
	amount: z.number(),
});

export const assetsCollection = createCollection(
	localStorageCollectionOptions({
		id: "assets",
		storageKey: "assets",
		getKey: (item) => item.id,
		schema: assetsSchema,
	}),
);
