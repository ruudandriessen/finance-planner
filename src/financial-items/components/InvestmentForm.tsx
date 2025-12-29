import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  FinancialItem,
  FinancialItemFormProps,
} from "@/financial-items/types";

type InvestmentFormData = {
  name: string;
  initialValue: number;
  yearlyReturnRate: number;
};

export function InvestmentForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: FinancialItemFormProps<"investment">) {
  const [formData, setFormData] = useState<InvestmentFormData>({
    name: initialData?.name ?? "",
    initialValue: initialData?.data?.initialValue ?? 0,
    yearlyReturnRate: initialData?.data?.yearlyReturnRate ?? 7,
  });

  const handleInputChange = (
    field: keyof InvestmentFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { initialValue, yearlyReturnRate } = formData;
    if (initialValue < 0) return;

    const financialItem: FinancialItem<"investment"> = {
      id: initialData?.id ?? crypto.randomUUID(),
      name: formData.name,
      priorityOrder: initialData?.priorityOrder ?? 0,
      schedule: "annually",
      start: initialData?.start,
      end: initialData?.end,
      data: {
        type: "investment",
        initialValue,
        yearlyReturnRate: yearlyReturnRate / 100,
      },
    };

    await onSubmit(financialItem);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Portfolio Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g., Retirement Portfolio"
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label htmlFor="initialValue">Initial Value ($)</Label>
        <Input
          id="initialValue"
          type="number"
          step="0.01"
          min="0"
          value={formData.initialValue}
          onChange={(e) => handleInputChange("initialValue", e.target.value)}
          placeholder="Enter initial value"
          className="mt-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Current value of this investment portfolio
        </p>
      </div>

      <div>
        <Label htmlFor="yearlyReturnRate">Expected Yearly Return (%)</Label>
        <Input
          id="yearlyReturnRate"
          type="number"
          step="0.1"
          value={formData.yearlyReturnRate}
          onChange={(e) =>
            handleInputChange("yearlyReturnRate", e.target.value)
          }
          placeholder="e.g., 7"
          className="mt-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Expected annual percentage return (e.g., 7 for 7%)
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
