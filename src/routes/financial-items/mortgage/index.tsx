import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit3, Plus } from "lucide-react";
import { financialItemsCollection } from "@/collections/financialItems";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/financial-items/mortgage/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: items } = useLiveQuery(financialItemsCollection);
  const navigate = useNavigate();

  const mortgageItems = items?.filter((item) => item.type === "mortgage") || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mortgages</h1>
          <p className="text-muted-foreground">Manage your mortgage payments</p>
        </div>

        <Button
          onClick={() => navigate({ to: "/financial-items/mortgage/add" })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Mortgage
        </Button>
      </div>

      {mortgageItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mortgageItems.map((item) => {
            const paymentAmount =
              item.data.type === "mortgage" ? item.data.paymentAmount : 0;
            return (
              <Card key={item.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{item.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate({
                        to: "/financial-items/mortgage/$id/edit",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(paymentAmount)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {item.schedule} payment
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-muted-foreground text-center">
              <p className="text-lg font-medium mb-2 text-foreground">
                No mortgages yet
              </p>
              <p className="text-sm text-muted-foreground">
                Add your first mortgage to get started
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
