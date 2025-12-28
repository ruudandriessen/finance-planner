import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MortgageDownPaymentForm } from "@/events/components/MortgageDownPaymentForm";
import type { MortgageDownPaymentEvent } from "@/events/schema";
import { plansCollection } from "@/plans/plans";
import { Route as RootRoute } from "@/routes/__root";

export const Route = createFileRoute("/events/mortgage-down-payment/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId } = RootRoute.useSearch();
  const { data: plans = [] } = useLiveQuery(plansCollection);
  const navigate = useNavigate();

  const plan = plans.find((p) => p.id === planId);

  if (!planId || !plan) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No plan selected</p>
          <Button onClick={() => navigate({ to: "/events" })} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: MortgageDownPaymentEvent) => {
    await plansCollection.update(planId, (oldPlan) => {
      oldPlan.events.push(event);
    });
    navigate({ to: "/events" });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/events/add" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event Types
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          Add Mortgage Down Payment
        </h1>
        <p className="text-muted-foreground mt-1">
          Simulate a lump-sum payment to reduce mortgage principal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MortgageDownPaymentForm
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/events" })}
            submitLabel="Add Event"
          />
        </CardContent>
      </Card>
    </div>
  );
}
