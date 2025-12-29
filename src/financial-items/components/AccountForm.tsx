import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FinancialItemBase } from "@/financial-items/types";

type AccountType = "savings" | "checking";

type AccountFormData = {
  name: string;
  accountType: AccountType;
  initialBalance: number;
  interestRate: number;
};

interface AccountFormProps {
  initialData?: FinancialItemBase;
  onSubmit: (data: FinancialItemBase) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>;
  submitLabel?: string;
}

export function AccountForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: AccountFormProps) {
  const initialType =
    initialData?.data?.type === "checking" ? "checking" : "savings";
  const initialBalance =
    initialData?.data?.type === "savings" ||
    initialData?.data?.type === "checking"
      ? initialData.data.initialBalance
      : 0;
  const initialInterestRate =
    initialData?.data?.type === "savings"
      ? (initialData.data.interestRate ?? 0) * 100
      : 0;

  const [formData, setFormData] = useState<AccountFormData>({
    name: initialData?.name ?? "",
    accountType: initialType,
    initialBalance,
    interestRate: initialInterestRate,
  });

  const handleInputChange = (
    field: keyof AccountFormData,
    value: string | AccountType
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { initialBalance, accountType, interestRate } = formData;
    if (initialBalance < 0) return;
    if (interestRate < 0) return;

    const financialItem: FinancialItemBase = {
      id: initialData?.id ?? crypto.randomUUID(),
      name: formData.name,
      priorityOrder: initialData?.priorityOrder ?? 0,
      schedule: "monthly",
      start: initialData?.start,
      end: initialData?.end,
      data:
        accountType === "savings"
          ? {
              type: "savings",
              initialBalance,
              interestRate: interestRate / 100,
            }
          : {
              type: "checking",
              initialBalance,
            },
    };

    await onSubmit(financialItem);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g., Emergency Fund"
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label htmlFor="accountType">Account Type</Label>
        <Select
          value={formData.accountType}
          onValueChange={(value: AccountType) =>
            handleInputChange("accountType", value)
          }
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="savings">Savings Account</SelectItem>
            <SelectItem value="checking">Checking Account</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {formData.accountType === "savings"
            ? "A savings account for building your emergency fund or other goals"
            : "A checking account for daily transactions"}
        </p>
      </div>

      <div>
        <Label htmlFor="initialBalance">Initial Balance ($)</Label>
        <Input
          id="initialBalance"
          type="number"
          step="0.01"
          min="0"
          value={formData.initialBalance}
          onChange={(e) => handleInputChange("initialBalance", e.target.value)}
          placeholder="Enter initial balance"
          className="mt-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Current balance in this account
        </p>
      </div>

      <div>
        <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
        <Input
          id="interestRate"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.interestRate}
          onChange={(e) => handleInputChange("interestRate", e.target.value)}
          placeholder="e.g., 4.5"
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Interest is paid out annually in January based on weighted average balance
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        {onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete} className="flex-1">
            Delete
          </Button>
        )}
        <Button type="submit" className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
