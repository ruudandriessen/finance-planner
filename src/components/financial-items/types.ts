import type z from "zod";
import type {
  CheckingData,
  ExpenseData,
  IncomeData,
  MortgageData,
  SavingsData,
} from "@/collections/financialItems";
import type { flowSchema } from "@/collections/flows";

// Type for derived accounts
export type DerivedAccount = {
  id: string;
  type: "asset" | "liability" | "income" | "expense";
  amount: number;
};

export type Flow = z.infer<typeof flowSchema>;

// Union type for all financial item data
export type FinancialItemData =
  | SavingsData
  | CheckingData
  | IncomeData
  | MortgageData
  | ExpenseData;

// Type map: maps type literal to its data type
type FinancialItemDataMap = {
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

// Form props
export interface FinancialItemFormProps<T extends keyof FinancialItemDataMap> {
  initialData?: Partial<FinancialItem<T>>;
  onSubmit: (data: FinancialItem<T>) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>;
  submitLabel?: string;
}
