import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { ExpenseForm } from "@/financial-items/components/ExpenseForm";
import type { FinancialItem } from "@/financial-items/types";

export const Route = createFileRoute("/financial-items/expenses/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: items = [] } = useLiveQuery(financialItemsCollection);

  const item = items
    .filter((i): i is FinancialItem<"expense"> => i.data.type === "expense")
    .find((i) => i.id === id);

  if (!item || item.data.type !== "expense") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Expense item not found</p>
          <Button onClick={() => navigate({ to: "/financial-items/expenses" })} className="mt-4">
            Back to Expenses
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: FinancialItem<"expense">) => {
    await financialItemsCollection.update(item.id, (oldItem) => {
      oldItem.name = data.name;
      oldItem.priorityOrder = data.priorityOrder;
      oldItem.schedule = data.schedule;
      oldItem.start = data.start;
      oldItem.end = data.end;
      oldItem.data = data.data;
    });
    navigate({ to: "/financial-items/expenses" });
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      await financialItemsCollection.delete(item.id);
      navigate({ to: "/financial-items/expenses" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/financial-items/expenses" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Expenses
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit Expense</h1>
        <p className="text-muted-foreground mt-1">Update your expense details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            key={item.id}
            initialData={item}
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/expenses" })}
            onDelete={handleDelete}
            submitLabel="Update Expense"
          />
        </CardContent>
      </Card>
    </div>
  );
}
