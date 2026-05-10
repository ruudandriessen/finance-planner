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
import type { MortgageDownPaymentEvent } from "@/events/schema";
import { financialItemsCollection } from "@/financial-items/collection";
import { useCurrency } from "@/hooks/use-currency";

type MortgageDownPaymentFormProps = {
  initialData?: MortgageDownPaymentEvent;
  onSubmit: (event: MortgageDownPaymentEvent) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
};

type FormData = {
  name: string;
  date: string;
  mortgageId: string;
  sourceAccountId: string;
  amount: number;
};

export function MortgageDownPaymentForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: MortgageDownPaymentFormProps) {
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);
  const currency = useCurrency();
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name ?? "",
    date: initialData?.date ?? "",
    mortgageId: initialData?.mortgageId ?? "",
    sourceAccountId: initialData?.sourceAccountId ?? "",
    amount: initialData?.amount ?? 0,
  });

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.date ||
      !formData.mortgageId ||
      !formData.sourceAccountId ||
      formData.amount <= 0
    ) {
      return;
    }

    const event: MortgageDownPaymentEvent = {
      id: initialData?.id ?? crypto.randomUUID(),
      type: "mortgageDownPayment",
      name: formData.name,
      date: formData.date,
      mortgageId: formData.mortgageId,
      sourceAccountId: formData.sourceAccountId,
      amount: formData.amount,
    };

    await onSubmit(event);
  };

  const mortgageItems = financialItems.filter((item) => item.data.type === "mortgage");

  const accountItems = financialItems.filter(
    (item) => item.data.type === "savings" || item.data.type === "checking",
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g., Year-end bonus payment"
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label htmlFor="date">Payment Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange("date", e.target.value)}
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label htmlFor="mortgage">Mortgage</Label>
        <Select
          value={formData.mortgageId}
          onValueChange={(value) => handleInputChange("mortgageId", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select mortgage" />
          </SelectTrigger>
          <SelectContent>
            {mortgageItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          The mortgage to apply the down payment to
        </p>
      </div>

      <div>
        <Label htmlFor="sourceAccount">Pay From</Label>
        <Select
          value={formData.sourceAccountId}
          onValueChange={(value) => handleInputChange("sourceAccountId", value)}
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
          The account to pay from (e.g., Savings)
        </p>
      </div>

      <div>
        <Label htmlFor="amount">Amount ({currency})</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value) || 0)}
          placeholder="e.g., 10000"
          className="mt-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          The lump-sum amount to pay toward the mortgage principal
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
