import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { InvestmentForm } from "@/financial-items/components/InvestmentForm";
import type { FinancialItem } from "@/financial-items/types";

export const Route = createFileRoute("/financial-items/investment/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleSubmit = async (data: FinancialItem<"investment">) => {
    await financialItemsCollection.insert(data);
    navigate({ to: "/financial-items/investment" });
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
        <h1 className="text-3xl font-bold text-foreground">Add Investment Portfolio</h1>
        <p className="text-muted-foreground mt-1">Add a new investment portfolio</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Portfolio Details</CardTitle>
        </CardHeader>
        <CardContent>
          <InvestmentForm
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/investment" })}
            submitLabel="Add Investment Portfolio"
          />
        </CardContent>
      </Card>
    </div>
  );
}
