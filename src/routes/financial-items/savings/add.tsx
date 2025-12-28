import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { financialItemsCollection } from "@/collections/financialItems";
import { SavingsForm } from "@/components/financial-items/SavingsForm";
import type { FinancialItem } from "@/components/financial-items/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/financial-items/savings/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleSubmit = async (data: FinancialItem<"savings">) => {
    await financialItemsCollection.insert(data);
    navigate({ to: "/financial-items/savings" });
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
          Add Savings Account
        </h1>
        <p className="text-muted-foreground mt-1">Add a new savings account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsForm
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/savings" })}
            submitLabel="Add Savings Account"
          />
        </CardContent>
      </Card>
    </div>
  );
}
