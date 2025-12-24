import type z from "zod";
import type { accountSchema } from "@/collections/accounts";
import type { flowSchema } from "@/collections/flows";

// Type for derived accounts (omits name field)
export type DerivedAccount = Omit<z.infer<typeof accountSchema>, "name">;
export type Flow = z.infer<typeof flowSchema>;

// Financial item data types
export type IncomeData = {
  type: "income";
  amount: number;
  sourceAccountId: string;
};

export type MortgageData = {
  type: "mortgage";
  paymentAmount: number;
  interestRate: number;
  loanAmount: number;
  paymentSourceAccountId: string;
};

// Union type for all financial item data
export type FinancialItemData = IncomeData | MortgageData;

// Type map: maps type literal to its data type
type FinancialItemDataMap = {
  income: IncomeData;
  mortgage: MortgageData;
};

// Helper type to extract data type from type literal
type DataTypeForType<T extends keyof FinancialItemDataMap> =
  FinancialItemDataMap[T];

// Base financial item type
// Can accept either a type literal ('income' | 'mortgage') or the full data type
export type FinancialItem<
  T extends keyof FinancialItemDataMap | FinancialItemData = FinancialItemData,
> = T extends keyof FinancialItemDataMap
  ? {
      id: string;
      name: string;
      type: T;
      priorityOrder: number;
      schedule: "monthly" | "annually";
      start?: Date;
      end?: Date;
      data: DataTypeForType<T>;
    }
  : T extends FinancialItemData
    ? {
        id: string;
        name: string;
        type: T["type"];
        priorityOrder: number;
        schedule: "monthly" | "annually";
        start?: Date;
        end?: Date;
        data: T;
      }
    : never;

// Template interface
export interface FinancialItemTemplate<T extends FinancialItemData> {
  id: string;
  name: string;
  description: string;
  icon: string;
  derive: (item: FinancialItem<T>) => {
    accounts: DerivedAccount[];
    flows: Flow[];
  };
}

// Form props
// T can be either a type literal ('income' | 'mortgage') or the full data type
export interface FinancialItemFormProps<
  T extends keyof FinancialItemDataMap | FinancialItemData,
> {
  initialData?: Partial<FinancialItem<T>>;
  onSubmit: (data: FinancialItem<T>) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>;
  submitLabel?: string;
}
