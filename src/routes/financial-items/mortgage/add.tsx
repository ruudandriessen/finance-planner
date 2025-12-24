import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { financialItemsCollection } from "@/collections/financialItems";
import { MortgageForm } from "@/components/financial-items/MortgageForm";
import type { FinancialItem } from "@/components/financial-items/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/financial-items/mortgage/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleSubmit = async (data: FinancialItem<"mortgage">) => {
    await financialItemsCollection.insert(data);
    navigate({ to: "/financial-items/mortgage" });
  };

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
        <h1 className="text-3xl font-bold text-foreground">Add Mortgage</h1>
        <p className="text-muted-foreground mt-1">Add a new mortgage payment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Mortgage Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MortgageForm
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/mortgage" })}
            submitLabel="Add Mortgage"
          />
        </CardContent>
      </Card>
    </div>
  );
}
