import { Edit3 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateInitialMortgagePayment } from "@/financial-items/mortgage/mortgage-calculations";
import type { FinancialItemSimulationPreview } from "@/financial-items/simulation-preview";
import type { FinancialItemBase } from "@/financial-items/types";
import { useFormatCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

interface FinancialItemCardProps {
  item: FinancialItemBase;
  onEdit: () => void;
  simulationPreview?: FinancialItemSimulationPreview | null;
}

function formatSignedCurrency(amount: number, formatCurrency: (amount: number) => string) {
  if (amount > 0) {
    return `+${formatCurrency(amount)}`;
  }

  return formatCurrency(amount);
}

function getItemDisplayInfo(
  item: FinancialItemBase,
  formatCurrency: (amount: number) => string,
): {
  displayLabel: string;
  displayValue: string;
  subtitle: string;
} {
  switch (item.data.type) {
    case "savings":
      return {
        displayLabel: "Current balance",
        displayValue: formatCurrency(item.data.initialBalance),
        subtitle: "Savings account",
      };
    case "checking":
      return {
        displayLabel: "Current balance",
        displayValue: formatCurrency(item.data.initialBalance),
        subtitle: "Checking account",
      };
    case "income":
      return {
        displayLabel: "Amount",
        displayValue: formatCurrency(item.data.amount),
        subtitle: `${item.schedule} income`,
      };
    case "expense":
      return {
        displayLabel: "Amount",
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
        displayLabel: "Estimated payment",
        displayValue: formatCurrency(payment),
        subtitle: `${item.data.paymentType} • ${item.data.loanTermYears}yr @ ${(item.data.interestRate * 100).toFixed(1)}%`,
      };
    }
    case "investment":
      return {
        displayLabel: "Current value",
        displayValue: formatCurrency(item.data.initialValue),
        subtitle: `${(item.data.yearlyReturnRate * 100).toFixed(1)}% yearly return`,
      };
  }
}

function getProjectionLabel(preview: FinancialItemSimulationPreview) {
  if (preview.series.length === 1) {
    return "In 1 month";
  }

  return `In ${preview.series.length} months`;
}

function getProjectionDelta(preview: FinancialItemSimulationPreview) {
  const startingValue = preview.series[0]?.value ?? preview.projectedValue;
  return preview.projectedValue - startingValue;
}

function getPreviewChartDomain(preview: FinancialItemSimulationPreview): [number, number] {
  const values = preview.series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const fallbackPadding = Math.max(Math.abs(max) * 0.02, 1);
  const padding = range > 0 ? range * 0.2 : fallbackPadding;

  return [min - padding, max + padding];
}

export function FinancialItemCard({ item, onEdit, simulationPreview }: FinancialItemCardProps) {
  const formatCurrency = useFormatCurrency();
  const { displayLabel, displayValue, subtitle } = getItemDisplayInfo(item, formatCurrency);
  const projectionDelta = simulationPreview ? getProjectionDelta(simulationPreview) : 0;
  const chartDomain = simulationPreview ? getPreviewChartDomain(simulationPreview) : undefined;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20 hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{item.name}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{displayLabel}</p>
            <div className="mt-0.5 text-xl font-semibold leading-tight">{displayValue}</div>
          </div>
          {simulationPreview ? (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">
                {getProjectionLabel(simulationPreview)}
              </p>
              <div className="mt-0.5 text-lg font-semibold leading-tight">
                {formatCurrency(simulationPreview.projectedValue)}
              </div>
              <div
                className={cn(
                  "text-xs",
                  projectionDelta > 0 && "text-green-600 dark:text-green-400",
                  projectionDelta < 0 && "text-red-600 dark:text-red-400",
                  projectionDelta === 0 && "text-muted-foreground",
                )}
              >
                {formatSignedCurrency(projectionDelta, formatCurrency)}
              </div>
            </div>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {simulationPreview ? (
          <div className="pt-1">
            <div className="h-14 w-full" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={simulationPreview.series}
                  margin={{ top: 4, right: 0, bottom: 4, left: 0 }}
                >
                  <YAxis hide domain={chartDomain} />
                  <Line
                    type="basis"
                    dataKey="value"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
