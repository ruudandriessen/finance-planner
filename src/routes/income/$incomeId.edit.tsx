import { useLiveQuery } from "@tanstack/react-db";
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

export const Route = createFileRoute("/income/$incomeId/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	const { incomeId } = Route.useParams();
	const navigate = useNavigate();
	const { data: flows } = useLiveQuery(flowsCollection);

	const flow = flows?.find((f) => f.id === incomeId);

	const handleSubmit = async (data: {
		name: string;
		amount: string;
		targetAssetId?: string;
		sourceAssetId?: string;
		amountType?: "fixed" | "percentage" | "remainder";
		schedule?: string;
	}) => {
		if (!flow) return;
		if (!data.targetAssetId || !data.sourceAssetId) return;

		await flowsCollection.update(flow.id, (oldFlow) => {
			oldFlow.name = data.name;
			oldFlow.amount = parseFloat(data.amount);
			oldFlow.targetAccountId = data.targetAssetId!;
			oldFlow.sourceAccountId = data.sourceAssetId!;
			oldFlow.amountType = data.amountType || "fixed";
			oldFlow.schedule = data.schedule || "monthly";
		});
		navigate({ to: "/income" });
	};

	const handleDelete = async () => {
		if (!flow) return;

		if (confirm(`Are you sure you want to delete "${flow.name}"?`)) {
			await flowsCollection.delete(flow.id);
			navigate({ to: "/income" });
		}
	};

	if (!flow) {
		return (
			<div className="container mx-auto p-6 max-w-2xl">
				<div className="text-center py-12">
					<p className="text-lg text-muted-foreground">
						Income source not found
					</p>
					<Button onClick={() => navigate({ to: "/income" })} className="mt-4">
						Back to Income
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
					onClick={() => navigate({ to: "/income" })}
					className="mb-4"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Income
				</Button>
				<h1 className="text-3xl font-bold text-foreground">Edit Income</h1>
				<p className="text-muted-foreground mt-1">
					Update your income source details
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
						mode="edit"
						initialData={{
							name: flow.name,
							amount: flow.amount.toString(),
							targetAssetId: flow.targetAccountId,
							sourceAssetId: flow.sourceAccountId,
							amountType: flow.amountType,
							schedule: flow.schedule,
						}}
						onSubmit={handleSubmit}
						onCancel={() => navigate({ to: "/income" })}
						onDelete={handleDelete}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
