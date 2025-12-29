import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { IncomeForm } from "@/financial-items/components/IncomeForm";
import type { FinancialItem } from "@/financial-items/types";

export const Route = createFileRoute("/financial-items/income/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: items } = useLiveQuery(financialItemsCollection);

  const item = items
    .filter((i): i is FinancialItem<"income"> => i.data.type === "income")
    .find((i) => i.id === id);

  if (!item || item.data.type !== "income") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Income item not found</p>
          <Button onClick={() => navigate({ to: "/financial-items/income" })} className="mt-4">
            Back to Income
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: FinancialItem<"income">) => {
    financialItemsCollection.update(item.id, (oldItem) => {
      oldItem.name = data.name;
      oldItem.priorityOrder = data.priorityOrder;
      oldItem.schedule = data.schedule;
      oldItem.start = data.start;
      oldItem.end = data.end;
      oldItem.data = data.data;
    });
    await navigate({ to: "/financial-items/income" });
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      financialItemsCollection.delete(item.id);
      await navigate({ to: "/financial-items/income" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/financial-items/income" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Income
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit Income</h1>
        <p className="text-muted-foreground mt-1">Update your income details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Income Details</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeForm
            initialData={item}
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/income" })}
            onDelete={handleDelete}
            submitLabel="Update Income"
          />
        </CardContent>
      </Card>
    </div>
  );
}
