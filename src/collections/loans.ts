import {
	createCollection,
	localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";

const mortgageSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.literal("mortgage"),
	principal: z.number(),
	interestRate: z.number(), // annual percentage
	termYears: z.number(),
	monthlyPayment: z.number(),
	remainingBalance: z.number(),
});

const personalLoanSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.literal("personal"),
	principal: z.number(),
	interestRate: z.number(), // annual percentage
	termYears: z.number(),
	monthlyPayment: z.number(),
	remainingBalance: z.number(),
});

const creditCardSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.literal("credit_card"),
	balance: z.number(),
	interestRate: z.number(), // annual percentage
	minimumPayment: z.number(),
});

const loansSchema = z.discriminatedUnion("type", [
	mortgageSchema,
	personalLoanSchema,
	creditCardSchema,
]);

export const loansCollection = createCollection(
	localStorageCollectionOptions({
		id: "loans",
		storageKey: "loans",
		getKey: (item) => item.id,
		schema: loansSchema,
	}),
);
