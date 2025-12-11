import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { incomeCollection } from "../../collections/income";
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
	const { data: income } = useLiveQuery(incomeCollection);

	const incomeItem = income?.find((i) => i.id === incomeId);

	const handleSubmit = async (data: {
		name: string;
		amount: string;
		targetAssetId?: string;
		period?: "monthly";
	}) => {
		if (!incomeItem) return;

		await incomeCollection.update(incomeItem.id, (oldIncome) => {
			oldIncome.name = data.name;
			oldIncome.amount = parseFloat(data.amount);
			if (data.targetAssetId) {
				oldIncome.targetAssetId = data.targetAssetId;
			}
			if (data.period) {
				oldIncome.period = data.period;
			}
		});
		navigate({ to: "/income" });
	};

	const handleDelete = async () => {
		if (!incomeItem) return;

		if (confirm(`Are you sure you want to delete "${incomeItem.name}"?`)) {
			await incomeCollection.delete(incomeItem.id);
			navigate({ to: "/income" });
		}
	};

	if (!incomeItem) {
		return (
			<div className="container mx-auto p-6 max-w-2xl">
				<div className="text-center py-12">
					<p className="text-lg text-gray-600">Income source not found</p>
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
				<h1 className="text-3xl font-bold text-gray-900">Edit Income</h1>
				<p className="text-gray-600 mt-1">Update your income source details</p>
			</div>

			<Card className="border border-gray-200 rounded-lg shadow-sm">
				<CardHeader className="p-6">
					<CardTitle className="text-xl text-gray-900">
						Income Details
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6 pt-0">
					<IncomeForm
						mode="edit"
						initialData={{
							name: incomeItem.name,
							amount: incomeItem.amount.toString(),
							targetAssetId: incomeItem.targetAssetId,
							period: incomeItem.period,
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
