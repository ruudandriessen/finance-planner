import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { InvestmentForm } from "@/financial-items/components/InvestmentForm";
import type { FinancialItem } from "@/financial-items/types";

export const Route = createFileRoute("/financial-items/investment/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: items } = useLiveQuery(financialItemsCollection);

  const item = items
    ?.filter((i): i is FinancialItem<"investment"> => i.data.type === "investment")
    .find((i) => i.id === id);

  if (!item || item.data.type !== "investment") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Investment portfolio not found</p>
          <Button onClick={() => navigate({ to: "/financial-items/investment" })} className="mt-4">
            Back to Investments
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: FinancialItem<"investment">) => {
    financialItemsCollection.update(item.id, (oldItem) => {
      oldItem.name = data.name;
      oldItem.priorityOrder = data.priorityOrder;
      oldItem.schedule = data.schedule;
      oldItem.start = data.start;
      oldItem.end = data.end;
      oldItem.data = data.data;
    });
    await navigate({ to: "/financial-items/investment" });
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      financialItemsCollection.delete(item.id);
      await navigate({ to: "/financial-items/investment" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/financial-items/investment" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Investments
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit Investment Portfolio</h1>
        <p className="text-muted-foreground mt-1">Update your investment portfolio details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Portfolio Details</CardTitle>
        </CardHeader>
        <CardContent>
          <InvestmentForm
            initialData={item}
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/investment" })}
            onDelete={handleDelete}
            submitLabel="Update Investment Portfolio"
          />
        </CardContent>
      </Card>
    </div>
  );
}
