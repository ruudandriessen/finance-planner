import type z from "zod";
import type { flowSchema } from "@/collections/flows";

// Type for derived accounts
export type DerivedAccount = {
  id: string;
  type: "asset" | "liability" | "income" | "expense";
  amount: number;
};

export type Flow = z.infer<typeof flowSchema>;

// Financial item data types
export type SavingsData = {
  type: "savings";
  initialBalance: number;
};

export type CheckingData = {
  type: "checking";
  initialBalance: number;
};

export type IncomeData = {
  type: "income";
  amount: number;
  targetAccountId: string;
};

export type MortgageData = {
  type: "mortgage";
  paymentAmount: number;
  interestRate: number;
  loanAmount: number;
  paymentSourceAccountId: string;
};

export type ExpenseData = {
  type: "expense";
  amount: number;
  sourceAccountId: string;
};

// Union type for all financial item data
export type FinancialItemData =
  | SavingsData
  | CheckingData
  | IncomeData
  | MortgageData
  | ExpenseData;

// Type map: maps type literal to its data type
export type FinancialItemDataMap = {
  savings: SavingsData;
  checking: CheckingData;
  income: IncomeData;
  mortgage: MortgageData;
  expense: ExpenseData;
};

// Helper type to extract data type from type literal
type DataTypeForType<T extends keyof FinancialItemDataMap> =
  FinancialItemDataMap[T];

// Base financial item structure (matches schema shape)
export type FinancialItemBase = {
  id: string;
  name: string;
  priorityOrder: number;
  schedule: "monthly" | "annually";
  start?: Date;
  end?: Date;
  data: FinancialItemData;
};

// Narrowed financial item type for specific data types
export type FinancialItem<T extends keyof FinancialItemDataMap> = {
  id: string;
  name: string;
  priorityOrder: number;
  schedule: "monthly" | "annually";
  start?: Date;
  end?: Date;
  data: DataTypeForType<T>;
};

// Result type for derive functions
export type DeriveResult = {
  accounts: DerivedAccount[];
  flows: Flow[];
};

// Derive function type for a specific data type
export type DeriveFn<T extends keyof FinancialItemDataMap> = (
  item: FinancialItem<T>,
) => DeriveResult;

// Registry type for derive functions
export type DeriveRegistry = {
  [K in keyof FinancialItemDataMap]: DeriveFn<K>;
};

// Template interface
export interface FinancialItemTemplate<T extends keyof FinancialItemDataMap> {
  id: string;
  name: string;
  description: string;
  icon: string;
  derive: (item: FinancialItem<T>) => DeriveResult;
}

// Form props
export interface FinancialItemFormProps<T extends keyof FinancialItemDataMap> {
  initialData?: Partial<FinancialItem<T>>;
  onSubmit: (data: FinancialItem<T>) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>;
  submitLabel?: string;
}
