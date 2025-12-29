import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { plansCollection } from "@/plans/plans";
import { Route as RootRoute } from "@/routes/__root";

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId } = RootRoute.useSearch();
  const { data: plans = [] } = useLiveQuery(plansCollection);
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);
  const navigate = useNavigate();

  const plan = plans.find((p) => p.id === planId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMortgageName = (mortgageId: string) => {
    const mortgage = financialItems.find((item) => item.id === mortgageId);
    return mortgage?.name ?? "Unknown Mortgage";
  };

  if (!planId || !plan) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-muted-foreground text-center">
              <p className="text-lg font-medium mb-2 text-foreground">No plan selected</p>
              <p className="text-sm text-muted-foreground">
                Select a plan to view and manage events
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const events = plan.events;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground">One-off events for plan: {plan.name}</p>
        </div>

        <Button onClick={() => navigate({ to: "/events/add" })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            if (event.type === "mortgageDownPayment") {
              return (
                <Card key={event.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{event.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate({
                          to: "/events/$id/edit",
                          params: { id: event.id },
                        })
                      }
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(event.amount)}</div>
                    <p className="text-sm text-muted-foreground mt-1">Mortgage Down Payment</p>
                    <p className="text-sm text-muted-foreground">
                      {getMortgageName(event.mortgageId)}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-muted-foreground text-center">
              <p className="text-lg font-medium mb-2 text-foreground">No events yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first event to simulate one-off financial scenarios
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
