import { useLiveQuery } from "@tanstack/react-db";
import { useState } from "react";
import { financialItemsCollection } from "@/collections/financialItems";
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

type MortgageFormData = {
  name: string;
  paymentAmount: number;
  interestRate: number;
  loanAmount: number;
  paymentSourceAccountId: string;
  priorityOrder: number;
  schedule: "monthly" | "annually";
};

export function MortgageForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: FinancialItemFormProps<"mortgage">) {
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);
  const [formData, setFormData] = useState<MortgageFormData>({
    name: initialData?.name ?? "",
    paymentAmount: initialData?.data?.paymentAmount ?? 0,
    interestRate: initialData?.data?.interestRate ?? 0,
    loanAmount: initialData?.data?.loanAmount ?? 0,
    paymentSourceAccountId: initialData?.data?.paymentSourceAccountId ?? "",
    priorityOrder: initialData?.priorityOrder ?? 10,
    schedule: initialData?.schedule ?? "monthly",
  });

  const handleInputChange = (field: keyof MortgageFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { paymentAmount, interestRate, loanAmount, priorityOrder } = formData;

    if (paymentAmount <= 0 || interestRate < 0 || loanAmount <= 0) {
      return;
    }

    const financialItem: FinancialItem<"mortgage"> = {
      id: initialData?.id ?? crypto.randomUUID(),
      name: formData.name,
      priorityOrder,
      schedule: formData.schedule,
      start: initialData?.start,
      end: initialData?.end,
      data: {
        type: "mortgage",
        paymentAmount,
        interestRate,
        loanAmount,
        paymentSourceAccountId: formData.paymentSourceAccountId,
      },
    };

    await onSubmit(financialItem);
  };

  // Filter to savings and checking accounts only
  const accountItems = financialItems.filter(
    (item) => item.data.type === "savings" || item.data.type === "checking",
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Mortgage Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g., My Mortgage"
          className="mt-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="loanAmount">Initial Loan Amount ($)</Label>
          <Input
            id="loanAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.loanAmount}
            onChange={(e) => handleInputChange("loanAmount", e.target.value)}
            placeholder="e.g., 300000"
            className="mt-2"
            required
          />
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
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="paymentAmount">Monthly Payment ($)</Label>
        <Input
          id="paymentAmount"
          type="number"
          step="0.01"
          min="0"
          value={formData.paymentAmount}
          onChange={(e) => handleInputChange("paymentAmount", e.target.value)}
          placeholder="e.g., 2000"
          className="mt-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Total monthly payment amount
        </p>
      </div>

      <div>
        <Label htmlFor="paymentSourceAccount">Pay From</Label>
        <Select
          value={formData.paymentSourceAccountId}
          onValueChange={(value) =>
            handleInputChange("paymentSourceAccountId", value)
          }
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
          Select the account you'll pay from (e.g., Checking Account)
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
