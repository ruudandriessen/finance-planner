import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { CheckingForm } from "@/financial-items/components/CheckingForm";
import type { FinancialItem } from "@/financial-items/types";

export const Route = createFileRoute("/financial-items/checking/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: items } = useLiveQuery(financialItemsCollection);

  const item = items
    .filter((i): i is FinancialItem<"checking"> => i.data.type === "checking")
    .find((i) => i.id === id);

  if (!item || item.data.type !== "checking") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Checking account not found</p>
          <Button onClick={() => navigate({ to: "/financial-items/checking" })} className="mt-4">
            Back to Checking
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: FinancialItem<"checking">) => {
    await financialItemsCollection.update(item.id, (oldItem) => {
      oldItem.name = data.name;
      oldItem.priorityOrder = data.priorityOrder;
      oldItem.schedule = data.schedule;
      oldItem.start = data.start;
      oldItem.end = data.end;
      oldItem.data = data.data;
    });
    navigate({ to: "/financial-items/checking" });
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      await financialItemsCollection.delete(item.id);
      navigate({ to: "/financial-items/checking" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/financial-items/checking" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checking
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit Checking Account</h1>
        <p className="text-muted-foreground mt-1">Update your checking account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckingForm
            initialData={item}
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/checking" })}
            onDelete={handleDelete}
            submitLabel="Update Checking Account"
          />
        </CardContent>
      </Card>
    </div>
  );
}
