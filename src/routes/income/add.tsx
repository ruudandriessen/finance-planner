import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { flowsCollection } from "../../collections/flows";
import { IncomeForm } from "../../components/income/IncomeForm";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/income/add")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	const handleSubmit = async (data: {
		name: string;
		amount: string;
		targetAssetId?: string;
		sourceAssetId?: string;
		amountType?: "fixed" | "percentage" | "remainder";
		schedule?: string;
	}) => {
		if (data.targetAssetId == null || data.sourceAssetId == null) {
			return;
		}

		await flowsCollection.insert({
			id: crypto.randomUUID(),
			amount: parseFloat(data.amount),
			name: data.name,
			sourceAccountId: data.sourceAssetId,
			targetAccountId: data.targetAssetId,
			amountType: data.amountType || "fixed",
			schedule: data.schedule || "monthly",
			conditions: {
				stopIfTargetBalance: 0,
			},
		});
		navigate({ to: "/income" });
	};

	return (
		<div className="container mx-auto p-6 max-w-2xl">
			<div className="mb-6">
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/income" })}
					className="mb-4"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Income
				</Button>
				<h1 className="text-3xl font-bold text-foreground">Add New Income</h1>
				<p className="text-muted-foreground mt-1">
					Add a new income source to your financial plan
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl text-foreground">
						Income Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					<IncomeForm
						mode="add"
						onSubmit={handleSubmit}
						onCancel={() => navigate({ to: "/income" })}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
