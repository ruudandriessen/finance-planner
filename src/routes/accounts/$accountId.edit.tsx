import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { accountsCollection } from "../../collections/accounts";
import { AssetForm, type AssetFormData } from "../../components/AssetForm";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/accounts/$accountId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { accountId } = Route.useParams();
  const navigate = useNavigate();
  const { data: assets } = useLiveQuery(accountsCollection);

  const asset = assets?.find((a) => a.id === accountId);

  const handleSubmit = async (data: AssetFormData) => {
    if (!asset) return;

    const amount = parseFloat(data.amount);
    if (Number.isNaN(amount)) return;

    // Liabilities should be stored as negative numbers
    const normalizedAmount =
      data.type === "liability" ? -Math.abs(amount) : amount;

    await accountsCollection.update(asset.id, (oldAsset) => {
      oldAsset.name = data.name;
      oldAsset.amount = normalizedAmount;
      oldAsset.type = data.type;
    });
    navigate({ to: "/accounts" });
  };

  const handleDelete = async () => {
    if (!asset) return;

    if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      await accountsCollection.delete(asset.id);
      navigate({ to: "/accounts" });
    }
  };

  if (!asset) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Account not found</p>
          <Button
            onClick={() => navigate({ to: "/accounts" })}
            className="mt-4"
          >
            Back to Accounts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/accounts" })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Accounts
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit Account</h1>
        <p className="text-muted-foreground mt-1">
          Update your account details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm
            initialData={{
              name: asset.name,
              amount: Math.abs(asset.amount).toString(),
              type: asset.type,
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/accounts" })}
            onDelete={handleDelete}
            submitLabel="Update Account"
          />
        </CardContent>
      </Card>
    </div>
  );
}
