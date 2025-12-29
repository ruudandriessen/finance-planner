import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { CheckingForm } from "@/financial-items/components/CheckingForm";
import type { FinancialItem } from "@/financial-items/types";

export const Route = createFileRoute("/financial-items/checking/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleSubmit = async (data: FinancialItem<"checking">) => {
    financialItemsCollection.insert(data);
    await navigate({ to: "/financial-items/checking" });
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
        <h1 className="text-3xl font-bold text-foreground">Add Checking Account</h1>
        <p className="text-muted-foreground mt-1">Add a new checking account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckingForm
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/financial-items/checking" })}
            submitLabel="Add Checking Account"
          />
        </CardContent>
      </Card>
    </div>
  );
}
