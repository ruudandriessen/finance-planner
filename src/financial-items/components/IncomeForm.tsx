import { useLiveQuery } from "@tanstack/react-db";
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
import { financialItemsCollection } from "@/financial-items/collection";
import {
  isAccountFinancialItem,
  type FinancialItem,
  type FinancialItemFormProps,
} from "@/financial-items/types";
import { useCurrency } from "@/hooks/use-currency";

type IncomeFormData = {
  name: string;
  amount: number;
  targetAccountId: string;
  priorityOrder: number;
  schedule: "monthly" | "annually";
};

export function IncomeForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: FinancialItemFormProps<"income">) {
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);
  const currency = useCurrency();
  const [formData, setFormData] = useState<IncomeFormData>({
    name: initialData?.name ?? "",
    amount: initialData?.data?.amount ?? 0,
    targetAccountId: initialData?.data?.targetAccountId ?? "",
    priorityOrder: initialData?.priorityOrder ?? 1,
    schedule: initialData?.schedule ?? "monthly",
  });

  const handleInputChange = <TKey extends keyof IncomeFormData>(
    field: TKey,
    value: IncomeFormData[TKey],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(formData.amount);
    if (amount <= 0) return;

    const priorityOrder = Number(formData.priorityOrder);

    const financialItem: FinancialItem<"income"> = {
      id: initialData?.id ?? crypto.randomUUID(),
      name: formData.name,
      priorityOrder,
      schedule: formData.schedule,
      start: initialData?.start,
      end: initialData?.end,
      data: {
        type: "income",
        amount,
        targetAccountId: formData.targetAccountId,
      },
    };

    await onSubmit(financialItem);
  };

  const accountItems = financialItems.filter(isAccountFinancialItem);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Income Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g., My Salary"
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label htmlFor="amount">Amount ({currency})</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => handleInputChange("amount", Number(e.target.value))}
          placeholder="Enter monthly amount"
          className="mt-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Amount per {formData.schedule} period</p>
      </div>

      <div>
        <Label htmlFor="targetAccount">Deposit To</Label>
        <Select
          value={formData.targetAccountId}
          onValueChange={(value) => handleInputChange("targetAccountId", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accountItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Select the account where you receive this income
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priorityOrder">Priority Order</Label>
          <Input
            id="priorityOrder"
            type="number"
            min="1"
            value={formData.priorityOrder}
            onChange={(e) => handleInputChange("priorityOrder", Number(e.target.value))}
            className="mt-2"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Lower numbers run first</p>
        </div>

        <div>
          <Label htmlFor="schedule">Schedule</Label>
          <Select
            value={formData.schedule}
            onValueChange={(value) =>
              handleInputChange("schedule", value as "monthly" | "annually")
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
