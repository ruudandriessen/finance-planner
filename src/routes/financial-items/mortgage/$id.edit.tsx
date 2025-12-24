import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { financialItemsCollection } from "@/collections/financialItems";
import { MortgageForm } from "@/components/financial-items/MortgageForm";
import type { FinancialItem } from "@/components/financial-items/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/financial-items/mortgage/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: items } = useLiveQuery(financialItemsCollection);

  const item = items?.find((i) => i.id === id);

  const handleSubmit = async (data: FinancialItem<"mortgage">) => {
    if (!item) return;

    await financialItemsCollection.update(item.id, () => data);
    navigate({ to: "/financial-items/mortgage" });
  };

  const handleDelete = async () => {
    if (!item) return;

    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      await financialItemsCollection.delete(item.id);
      navigate({ to: "/financial-items/mortgage" });
    }
  };

  if (!item || item.type !== "mortgage") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Mortgage item not found
          </p>
          <Button
            onClick={() => navigate({ to: "/financial-items/mortgage" })}
            className="mt-4"
          >
            Back to Mortgages
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
          onClick={() => navigate({ to: "/financial-items/mortgage" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mortgages
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit Mortgage</h1>
        <p className="text-muted-foreground mt-1">
          Update your mortgage details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Mortgage Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MortgageForm
            initialData={item as FinancialItem<"mortgage">}
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/mortgage" })}
            onDelete={handleDelete}
            submitLabel="Update Mortgage"
          />
        </CardContent>
      </Card>
    </div>
  );
}
