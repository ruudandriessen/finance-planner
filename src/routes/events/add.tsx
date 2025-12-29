import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/events/add")({
  component: RouteComponent,
});

const eventTypes = [
  {
    type: "mortgageDownPayment",
    title: "Mortgage Down Payment",
    description: "Make a lump-sum payment to reduce your mortgage principal",
    icon: () => <Home className="h-6 w-6" />,
    url: "/events/mortgage-down-payment/add",
  },
];

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate({ to: "/events" })} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Add Event</h1>
        <p className="text-muted-foreground mt-1">Choose the type of event to add</p>
      </div>

      <div className="grid gap-4">
        {eventTypes.map((eventType) => (
          <Card
            key={eventType.type}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => navigate({ to: eventType.url })}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <eventType.icon />
              </div>
              <div>
                <CardTitle className="text-lg">{eventType.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{eventType.description}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
