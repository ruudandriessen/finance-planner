import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { FinancialItem, FinancialItemFormProps } from "./types";

type SavingsFormData = {
  name: string;
  initialBalance: number;
};

export function SavingsForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: FinancialItemFormProps<"savings">) {
  const [formData, setFormData] = useState<SavingsFormData>({
    name: initialData?.name ?? "",
    initialBalance: initialData?.data?.initialBalance ?? 0,
  });

  const handleInputChange = (field: keyof SavingsFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { initialBalance } = formData;
    if (initialBalance < 0) return;

    const financialItem: FinancialItem<"savings"> = {
      id: initialData?.id ?? crypto.randomUUID(),
      name: formData.name,
      priorityOrder: initialData?.priorityOrder ?? 0,
      schedule: "monthly",
      start: initialData?.start,
      end: initialData?.end,
      data: {
        type: "savings",
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
          Current balance in this savings account
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            className="flex-1"
          >
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
