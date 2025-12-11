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

export const Route = createFileRoute("/assets/$assetId/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	const { assetId } = Route.useParams();
	const navigate = useNavigate();
	const { data: assets } = useLiveQuery(accountsCollection);

	const asset = assets?.find((a) => a.id === assetId);

	const handleSubmit = async (data: AssetFormData) => {
		if (!asset) return;

		const amount = parseFloat(data.amount);
		if (Number.isNaN(amount)) return;

		await accountsCollection.update(asset.id, (oldAsset) => {
			oldAsset.name = data.name;
			oldAsset.amount = amount;
		});
		navigate({ to: "/assets" });
	};

	const handleDelete = async () => {
		if (!asset) return;

		if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
			await accountsCollection.delete(asset.id);
			navigate({ to: "/assets" });
		}
	};

	if (!asset) {
		return (
			<div className="container mx-auto p-6 max-w-2xl">
				<div className="text-center py-12">
					<p className="text-lg text-muted-foreground">Asset not found</p>
					<Button onClick={() => navigate({ to: "/assets" })} className="mt-4">
						Back to Assets
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
					onClick={() => navigate({ to: "/assets" })}
					className="mb-4"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Assets
				</Button>
				<h1 className="text-3xl font-bold text-foreground">Edit Asset</h1>
				<p className="text-muted-foreground mt-1">Update your asset details</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl text-foreground">
						Asset Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					<AssetForm
						initialData={{
							name: asset.name,
							amount: asset.amount.toString(),
						}}
						onSubmit={handleSubmit}
						onCancel={() => navigate({ to: "/assets" })}
						onDelete={handleDelete}
						submitLabel="Update Asset"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
