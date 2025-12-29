import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { IncomeForm } from "@/financial-items/components/IncomeForm";
import type { FinancialItem } from "@/financial-items/types";

export const Route = createFileRoute("/financial-items/income/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleSubmit = async (data: FinancialItem<"income">) => {
    await financialItemsCollection.insert(data);
    navigate({ to: "/financial-items/income" });
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
        <h1 className="text-3xl font-bold text-foreground">Add Income</h1>
        <p className="text-muted-foreground mt-1">Add a new income source</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Income Details</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeForm
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/income" })}
            submitLabel="Add Income"
          />
        </CardContent>
      </Card>
    </div>
  );
}
