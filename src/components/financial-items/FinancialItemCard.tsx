import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateInitialMortgagePayment } from "@/financial-items/mortgage/mortgage-calculations";
import type { FinancialItemBase } from "@/financial-items/types";
import { useFormatCurrency } from "@/hooks/use-currency";

interface FinancialItemCardProps {
  item: FinancialItemBase;
  onEdit: () => void;
}

function getItemDisplayInfo(
  item: FinancialItemBase,
  formatCurrency: (amount: number) => string,
): {
  displayValue: string;
  subtitle: string;
} {
  switch (item.data.type) {
    case "savings":
      return {
        displayValue: formatCurrency(item.data.initialBalance),
        subtitle: "Savings Account",
      };
    case "checking":
      return {
        displayValue: formatCurrency(item.data.initialBalance),
        subtitle: "Checking Account",
      };
    case "income":
      return {
        displayValue: formatCurrency(item.data.amount),
        subtitle: `${item.schedule} income`,
      };
    case "expense":
      return {
        displayValue: formatCurrency(item.data.amount),
        subtitle: `${item.schedule} expense`,
      };
    case "mortgage": {
      const payment = calculateInitialMortgagePayment(
        item.data.originalLoanAmount,
        item.data.interestRate,
        item.data.loanTermYears,
        item.data.paymentType,
      );
      return {
        displayValue: formatCurrency(payment),
        subtitle: `${item.data.paymentType} • ${item.data.loanTermYears}yr @ ${(item.data.interestRate * 100).toFixed(1)}%`,
      };
    }
    case "investment":
      return {
        displayValue: formatCurrency(item.data.initialValue),
        subtitle: `${(item.data.yearlyReturnRate * 100).toFixed(1)}% yearly return`,
      };
  }
}

export function FinancialItemCard({ item, onEdit }: FinancialItemCardProps) {
  const formatCurrency = useFormatCurrency();
  const { displayValue, subtitle } = getItemDisplayInfo(item, formatCurrency);

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20 hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{item.name}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
