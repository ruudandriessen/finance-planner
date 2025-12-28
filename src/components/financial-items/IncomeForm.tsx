import { useLiveQuery } from "@tanstack/react-db";
import { useState } from "react";
import { accountsCollection } from "@/collections/accounts";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { FinancialItem, FinancialItemFormProps } from "./types";

type IncomeFormData = {
  name: string;
  amount: string;
  sourceAccountId: string;
  priorityOrder: string;
  schedule: "monthly" | "annually";
};

export function IncomeForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: FinancialItemFormProps<"income">) {
  const { data: accounts } = useLiveQuery(accountsCollection);
  const [formData, setFormData] = useState<IncomeFormData>({
    name: initialData?.name || "",
    amount:
      initialData?.data && initialData.data.type === "income"
        ? initialData.data.amount.toString()
        : "",
    sourceAccountId:
      initialData?.data && initialData.data.type === "income"
        ? initialData.data.sourceAccountId
        : "",
    priorityOrder: initialData?.priorityOrder?.toString() || "1",
    schedule: initialData?.schedule || "monthly",
  });

  const handleInputChange = (field: keyof IncomeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (Number.isNaN(amount) || amount <= 0) return;

    const priorityOrder = parseInt(formData.priorityOrder, 10) ?? 1;

    const financialItem: FinancialItem<"income"> = {
      id: initialData?.id || crypto.randomUUID(),
      name: formData.name,
      priorityOrder,
      schedule: formData.schedule,
      start: initialData?.start,
      end: initialData?.end,
      data: {
        type: "income",
        amount,
        sourceAccountId: formData.sourceAccountId,
      },
    };

    await onSubmit(financialItem);
  };

  // Filter to only asset accounts (user's accounts like checking, savings)
  const userAccounts = accounts?.filter((acc) => acc.type === "asset") || [];

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
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => handleInputChange("amount", e.target.value)}
          placeholder="Enter monthly amount"
          className="mt-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Amount per {formData.schedule} period
        </p>
      </div>

      <div>
        <Label htmlFor="sourceAccount">Payment Source</Label>
        <Select
          value={formData.sourceAccountId}
          onValueChange={(value) => handleInputChange("sourceAccountId", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {userAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
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
            onChange={(e) => handleInputChange("priorityOrder", e.target.value)}
            className="mt-2"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Lower numbers run first
          </p>
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
