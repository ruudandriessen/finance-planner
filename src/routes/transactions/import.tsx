import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionImportForm } from "@/transactions/components/TransactionImportForm";

export const Route = createFileRoute("/transactions/import")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/transactions" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transactions
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Import Transactions</h1>
        <p className="text-muted-foreground mt-1">Import bank transactions from a CSV file</p>
      </div>

      <TransactionImportForm onComplete={() => navigate({ to: "/transactions" })} />
    </div>
  );
}
