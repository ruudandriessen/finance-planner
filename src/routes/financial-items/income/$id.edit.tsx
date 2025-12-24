import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { financialItemsCollection } from "@/collections/financialItems";
import { IncomeForm } from "@/components/financial-items/IncomeForm";
import type { FinancialItem } from "@/components/financial-items/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/financial-items/income/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: items } = useLiveQuery(financialItemsCollection);

  const item = items?.find((i) => i.id === id);

  const handleSubmit = async (data: FinancialItem<"income">) => {
    if (!item) return;

    await financialItemsCollection.update(item.id, () => data);
    navigate({ to: "/financial-items/income" });
  };

  const handleDelete = async () => {
    if (!item) return;

    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      await financialItemsCollection.delete(item.id);
      navigate({ to: "/financial-items/income" });
    }
  };

  if (!item || item.type !== "income") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Income item not found</p>
          <Button
            onClick={() => navigate({ to: "/financial-items/income" })}
            className="mt-4"
          >
            Back to Income
          </Button>
        </div>
      </div>
    );
  }

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
          <CardTitle className="text-xl text-foreground">
            Income Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeForm
            initialData={item as FinancialItem<"income">}
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
