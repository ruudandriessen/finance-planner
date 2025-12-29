import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { formatCurrency } from "@/lib/formatters";

export const Route = createFileRoute("/financial-items/expenses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: items = [] } = useLiveQuery(financialItemsCollection);
  const navigate = useNavigate();

  const expenseItems = items.filter((item) => item.data.type === "expense");

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Manage your recurring expenses</p>
        </div>

        <Button onClick={() => navigate({ to: "/financial-items/expenses/add" })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {expenseItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {expenseItems.map((item) => {
            const amount = item.data.type === "expense" ? item.data.amount : 0;
            return (
              <Card key={item.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{item.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate({
                        to: "/financial-items/expenses/$id/edit",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">{item.schedule}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-muted-foreground text-center">
              <p className="text-lg font-medium mb-2 text-foreground">No expenses yet</p>
              <p className="text-sm text-muted-foreground">Add your first expense to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
