import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { MortgageDownPaymentEvent } from "@/collections/plans";
import { plansCollection } from "@/collections/plans";
import { MortgageDownPaymentForm } from "@/components/events/MortgageDownPaymentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Route as RootRoute } from "@/routes/__root";

export const Route = createFileRoute("/events/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { planId } = RootRoute.useSearch();
  const { data: plans = [] } = useLiveQuery(plansCollection);
  const navigate = useNavigate();

  const plan = plans.find((p) => p.id === planId);
  const event = plan?.events.find((e) => e.id === id);

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

  if (!event) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Event not found</p>
          <Button onClick={() => navigate({ to: "/events" })} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (updatedEvent: MortgageDownPaymentEvent) => {
    await plansCollection.update(planId, (oldPlan) => {
      const index = oldPlan.events.findIndex((e) => e.id === id);
      if (index !== -1) {
        oldPlan.events[index] = updatedEvent;
      }
    });
    navigate({ to: "/events" });
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
      await plansCollection.update(planId, (oldPlan) => {
        oldPlan.events = oldPlan.events.filter((e) => e.id !== id);
      });
      navigate({ to: "/events" });
    }
  };

  if (event.type === "mortgageDownPayment") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/events" })}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Edit Mortgage Down Payment
          </h1>
          <p className="text-muted-foreground mt-1">
            Update your mortgage down payment event
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
              initialData={event}
              onSubmit={handleSubmit}
              onCancel={() => navigate({ to: "/events" })}
              onDelete={handleDelete}
              submitLabel="Update Event"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Unknown event type</p>
        <Button onClick={() => navigate({ to: "/events" })} className="mt-4">
          Back to Events
        </Button>
      </div>
    </div>
  );
}
