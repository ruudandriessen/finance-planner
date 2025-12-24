import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { flowsCollection } from "../../collections/flows";
import { FlowForm } from "../../components/flows/FlowForm";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/flows/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleSubmit = async (data: {
    name: string;
    sourceAccountId: string;
    targetAccountId: string;
    schedule: string;
    priorityOrder: number;
    strategyType: "fixed" | "mortgage";
    amount?: number;
    inflationAdjusted: boolean;
    // Mortgage-specific fields
    liabilityAccountId?: string;
    interestExpenseAccountId?: string;
    assetAccountId?: string;
    totalPaymentAmount?: number;
    baseAnnualRate?: number;
  }) => {
    await flowsCollection.insert({
      id: crypto.randomUUID(),
      name: data.name,
      sourceAccountId: data.sourceAccountId,
      targetAccountId: data.targetAccountId,
      schedule: data.schedule,
      priorityOrder: data.priorityOrder,
      strategy:
        data.strategyType === "fixed"
          ? {
              type: "fixed",
              config: {
                amount: data.amount ?? 0,
              },
            }
          : {
              type: "mortgage",
              config: {
                liabilityAccountId: data.liabilityAccountId ?? "",
                interestExpenseAccountId: data.interestExpenseAccountId ?? "",
                assetAccountId: data.assetAccountId ?? "",
                totalPaymentAmount: data.totalPaymentAmount ?? 0,
                interestCalculation: {
                  type: "FIXED_RATE",
                  baseAnnualRate: data.baseAnnualRate ?? 0,
                },
              },
            },
      modifiers: data.inflationAdjusted ? ["inflation_adjusted"] : [],
    });
    navigate({ to: "/flows" });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/flows" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Flows
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Add New Flow</h1>
        <p className="text-muted-foreground mt-1">
          Create a recurring financial flow between accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Flow Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FlowForm
            mode="add"
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/flows" })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
