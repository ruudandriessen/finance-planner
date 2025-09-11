import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import z from "zod";

const houseAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("house"),
  amount: z.number(),
});

const stockAssetsSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("stocks"),
  amount: z.number(),
  expectedReturn: z.number(),
});

const assetsSchema = z.discriminatedUnion("type", [
  houseAssetSchema,
  stockAssetsSchema
]);

export const assetsCollection = createCollection(
  localStorageCollectionOptions({
    id: "assets",
    storageKey: "assets",
    getKey: (item) => item.id,
    schema: assetsSchema,
  })
)