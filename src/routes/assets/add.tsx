import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { assetsCollection } from "../../collections/assets";
import { AssetForm, type AssetFormData } from "../../components/AssetForm";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/assets/add")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	const handleSubmit = async (data: AssetFormData) => {
		const amount = parseFloat(data.amount);
		if (Number.isNaN(amount)) return;

		await assetsCollection.insert({
			id: crypto.randomUUID(),
			name: data.name,
			amount,
		});
		navigate({ to: "/assets" });
	};

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
				<h1 className="text-3xl font-bold text-gray-900">Add New Asset</h1>
				<p className="text-gray-600 mt-1">Add a new asset to your portfolio</p>
			</div>

			<Card className="border border-gray-200 rounded-lg shadow-sm">
				<CardHeader className="p-6">
					<CardTitle className="text-xl text-gray-900">Asset Details</CardTitle>
				</CardHeader>
				<CardContent className="p-6 pt-0">
					<AssetForm
						onSubmit={handleSubmit}
						onCancel={() => navigate({ to: "/assets" })}
						submitLabel="Add Asset"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
