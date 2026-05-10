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
  calculateAnnuityPayment,
  calculateLinearPrincipal,
} from "@/financial-items/mortgage/mortgage-calculations";
import type { FinancialItem, FinancialItemFormProps } from "@/financial-items/types";
import { useCurrency, useFormatCurrency } from "@/hooks/use-currency";

type MortgageFormData = {
  name: string;
  interestRateDisplay: number; // Display value (e.g., 4.5 for 4.5%)
  currentBalance: number; // Remaining loan balance
  originalLoanAmount: number; // Total loan at inception
  loanTermYears: number;
  paymentType: "annuity" | "linear";
  paymentSourceAccountId: string;
  priorityOrder: number;
  schedule: "monthly" | "annually";
  mortgageStartDate: string; // ISO date string for input field
  houseValue: string; // String to allow empty input (defaults to originalLoanAmount)
};

export function MortgageForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: FinancialItemFormProps<"mortgage">) {
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);
  const currency = useCurrency();
  const formatCurrency = useFormatCurrency();
  const [formData, setFormData] = useState<MortgageFormData>({
    name: initialData?.name ?? "",
    // Convert stored decimal (0.045) to display value (4.5)
    interestRateDisplay: (initialData?.data?.interestRate ?? 0) * 100,
    currentBalance: initialData?.data?.currentBalance ?? 0,
    originalLoanAmount: initialData?.data?.originalLoanAmount ?? 0,
    loanTermYears: initialData?.data?.loanTermYears ?? 30,
    paymentType: initialData?.data?.paymentType ?? "annuity",
    paymentSourceAccountId: initialData?.data?.paymentSourceAccountId ?? "",
    priorityOrder: initialData?.priorityOrder ?? 10,
    schedule: initialData?.schedule ?? "monthly",
    mortgageStartDate: initialData?.data?.mortgageStartDate
      ? (initialData.data.mortgageStartDate.toISOString().split("T")[0] ?? "")
      : "",
    houseValue: initialData?.data?.houseValue?.toString() ?? "",
  });

  const calculatedPayment = (() => {
    const { originalLoanAmount, interestRateDisplay, loanTermYears, paymentType } = formData;
    if (originalLoanAmount <= 0 || loanTermYears <= 0) {
      return 0;
    }
    // Convert display percentage to decimal for calculations
    const interestRate = interestRateDisplay / 100;
    if (paymentType === "annuity") {
      return calculateAnnuityPayment(originalLoanAmount, interestRate, loanTermYears);
    }
    // For linear, show initial payment (highest payment)
    const principal = calculateLinearPrincipal(originalLoanAmount, loanTermYears);
    const monthlyInterest = (originalLoanAmount * interestRate) / 12;
    return principal + monthlyInterest;
  })();

  const handleInputChange = (field: keyof MortgageFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      interestRateDisplay,
      currentBalance,
      originalLoanAmount,
      loanTermYears,
      paymentType,
      priorityOrder,
    } = formData;

    if (
      interestRateDisplay < 0 ||
      currentBalance <= 0 ||
      originalLoanAmount <= 0 ||
      loanTermYears <= 0
    ) {
      return;
    }

    const financialItem: FinancialItem<"mortgage"> = {
      id: initialData?.id ?? crypto.randomUUID(),
      name: formData.name,
      priorityOrder: Number(priorityOrder),
      schedule: formData.schedule,
      start: initialData?.start,
      end: initialData?.end,
      data: {
        type: "mortgage",
        // Convert display percentage (4.5) to decimal (0.045) for storage
        interestRate: Number(interestRateDisplay) / 100,
        currentBalance: Number(currentBalance),
        originalLoanAmount: Number(originalLoanAmount),
        loanTermYears: Number(loanTermYears),
        paymentType,
        paymentSourceAccountId: formData.paymentSourceAccountId,
        mortgageStartDate: formData.mortgageStartDate
          ? new Date(formData.mortgageStartDate)
          : undefined,
        houseValue: formData.houseValue ? Number(formData.houseValue) : undefined,
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
          <Label htmlFor="originalLoanAmount">Original Loan Amount ({currency})</Label>
          <Input
            id="originalLoanAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.originalLoanAmount}
            onChange={(e) => handleInputChange("originalLoanAmount", e.target.value)}
            placeholder="e.g., 300000"
            className="mt-2"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Total loan amount at inception</p>
        </div>

        <div>
          <Label htmlFor="currentBalance">Current Balance ({currency})</Label>
          <Input
            id="currentBalance"
            type="number"
            step="0.01"
            min="0"
            value={formData.currentBalance}
            onChange={(e) => handleInputChange("currentBalance", e.target.value)}
            placeholder="e.g., 280000"
            className="mt-2"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Remaining loan balance today</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="interestRateDisplay">Annual Interest Rate (%)</Label>
          <Input
            id="interestRateDisplay"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.interestRateDisplay}
            onChange={(e) => handleInputChange("interestRateDisplay", e.target.value)}
            placeholder="e.g., 4.5"
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="mortgageStartDate">Mortgage Start Date</Label>
          <Input
            id="mortgageStartDate"
            type="date"
            value={formData.mortgageStartDate}
            onChange={(e) => handleInputChange("mortgageStartDate", e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            When the mortgage was taken out (optional)
          </p>
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
          {formData.paymentType === "annuity" ? "Monthly Payment" : "Initial Monthly Payment"}:{" "}
          <span className="text-primary">{formatCurrency(calculatedPayment)}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formData.paymentType === "annuity"
            ? "Fixed monthly payment throughout the loan"
            : "Payment decreases as the loan balance decreases"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paymentSourceAccount">Pay From</Label>
          <Select
            value={formData.paymentSourceAccountId}
            onValueChange={(value) => handleInputChange("paymentSourceAccountId", value)}
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
          <p className="text-xs text-muted-foreground mt-1">Account to pay from</p>
        </div>

        <div>
          <Label htmlFor="houseValue">Property Value ({currency})</Label>
          <Input
            id="houseValue"
            type="number"
            step="0.01"
            min="0"
            value={formData.houseValue}
            onChange={(e) => handleInputChange("houseValue", e.target.value)}
            placeholder="e.g., 400000"
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty to use original loan amount
          </p>
        </div>
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
