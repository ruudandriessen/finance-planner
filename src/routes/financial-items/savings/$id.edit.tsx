import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { financialItemsCollection } from "@/collections/financialItems";
import { SavingsForm } from "@/components/financial-items/SavingsForm";
import type { FinancialItem } from "@/components/financial-items/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/financial-items/savings/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: items } = useLiveQuery(financialItemsCollection);

  const item = items
    ?.filter((i): i is FinancialItem<"savings"> => i.data.type === "savings")
    .find((i) => i.id === id);

  if (!item || item.data.type !== "savings") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Savings account not found
          </p>
          <Button
            onClick={() => navigate({ to: "/financial-items/savings" })}
            className="mt-4"
          >
            Back to Savings
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: FinancialItem<"savings">) => {
    await financialItemsCollection.update(item.id, (oldItem) => {
      oldItem.name = data.name;
      oldItem.priorityOrder = data.priorityOrder;
      oldItem.schedule = data.schedule;
      oldItem.start = data.start;
      oldItem.end = data.end;
      oldItem.data = data.data;
    });
    navigate({ to: "/financial-items/savings" });
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      await financialItemsCollection.delete(item.id);
      navigate({ to: "/financial-items/savings" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/financial-items/savings" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Savings
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          Edit Savings Account
        </h1>
        <p className="text-muted-foreground mt-1">
          Update your savings account details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsForm
            initialData={item}
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/savings" })}
            onDelete={handleDelete}
            submitLabel="Update Savings Account"
          />
        </CardContent>
      </Card>
    </div>
  );
}
