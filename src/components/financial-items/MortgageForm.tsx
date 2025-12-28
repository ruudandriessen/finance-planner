import { useLiveQuery } from "@tanstack/react-db";
import { useState } from "react";
import { financialItemsCollection } from "@/collections/financialItems";
import {
  calculateAnnuityPayment,
  calculateLinearPrincipal,
} from "@/lib/mortgage-calculations";
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
  interestRate: number;
  loanAmount: number;
  loanTermYears: number;
  paymentType: "annuity" | "linear";
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
    interestRate: initialData?.data?.interestRate ?? 0,
    loanAmount: initialData?.data?.loanAmount ?? 0,
    loanTermYears: initialData?.data?.loanTermYears ?? 30,
    paymentType: initialData?.data?.paymentType ?? "annuity",
    paymentSourceAccountId: initialData?.data?.paymentSourceAccountId ?? "",
    priorityOrder: initialData?.priorityOrder ?? 10,
    schedule: initialData?.schedule ?? "monthly",
  });

  const calculatedPayment = (() => {
    const { loanAmount, interestRate, loanTermYears, paymentType } = formData;
    if (loanAmount <= 0 || loanTermYears <= 0) {
      return 0;
    }
    if (paymentType === "annuity") {
      return calculateAnnuityPayment(loanAmount, interestRate, loanTermYears);
    }
    // For linear, show initial payment (highest payment)
    const principal = calculateLinearPrincipal(loanAmount, loanTermYears);
    const monthlyInterest = (loanAmount * interestRate) / 100 / 12;
    return principal + monthlyInterest;
  })();

  const handleInputChange = (field: keyof MortgageFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { interestRate, loanAmount, loanTermYears, paymentType, priorityOrder } =
      formData;

    if (interestRate < 0 || loanAmount <= 0 || loanTermYears <= 0) {
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
        interestRate,
        loanAmount,
        loanTermYears,
        paymentType,
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
          <Input
            id="loanTermYears"
            type="number"
            step="1"
            min="1"
            max="50"
            value={formData.loanTermYears}
            onChange={(e) => handleInputChange("loanTermYears", e.target.value)}
            placeholder="e.g., 30"
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="paymentType">Payment Type</Label>
          <Select
            value={formData.paymentType}
            onValueChange={(value) =>
              handleInputChange("paymentType", value as "annuity" | "linear")
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="annuity">Annuity (Fixed Payment)</SelectItem>
              <SelectItem value="linear">Linear (Fixed Principal)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md bg-muted p-3">
        <p className="text-sm font-medium">
          {formData.paymentType === "annuity"
            ? "Monthly Payment"
            : "Initial Monthly Payment"}
          :{" "}
          <span className="text-primary">
            $
            {calculatedPayment.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formData.paymentType === "annuity"
            ? "Fixed monthly payment throughout the loan"
            : "Payment decreases as the loan balance decreases"}
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
