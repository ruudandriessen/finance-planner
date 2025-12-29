import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { useFormatCurrency } from "@/hooks/use-currency";

export const Route = createFileRoute("/financial-items/investment/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: items = [] } = useLiveQuery(financialItemsCollection);
  const navigate = useNavigate();
  const formatCurrency = useFormatCurrency();

  const investmentItems = items.filter((item) => item.data.type === "investment");

  const formatPercent = (rate: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(rate);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investment Portfolios</h1>
          <p className="text-muted-foreground">Manage your investment portfolios</p>
        </div>

        <Button onClick={() => navigate({ to: "/financial-items/investment/add" })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Investment Portfolio
        </Button>
      </div>

      {investmentItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {investmentItems.map((item) => {
            const value = item.data.type === "investment" ? item.data.initialValue : 0;
            const rate = item.data.type === "investment" ? item.data.yearlyReturnRate : 0;
            return (
              <Card key={item.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{item.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate({
                        to: "/financial-items/investment/$id/edit",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(value)}</div>
                  <p className="text-sm text-muted-foreground mt-1">Initial Value</p>
                  <div className="text-lg font-medium mt-2 text-green-600 dark:text-green-400">
                    {formatPercent(rate)} yearly
                  </div>
                  <p className="text-sm text-muted-foreground">Expected Return</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-muted-foreground text-center">
              <p className="text-lg font-medium mb-2 text-foreground">
                No investment portfolios yet
              </p>
              <p className="text-sm text-muted-foreground">
                Add your first investment portfolio to get started
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
