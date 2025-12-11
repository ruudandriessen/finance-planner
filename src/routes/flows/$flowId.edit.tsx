import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { flowsCollection } from "../../collections/flows";
import { FlowForm } from "../../components/flows/FlowForm";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/flows/$flowId/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	const { flowId } = Route.useParams();
	const navigate = useNavigate();
	const { data: flows } = useLiveQuery(flowsCollection);

	const flow = flows?.find((f) => f.id === flowId);

	const handleSubmit = async (data: {
		name: string;
		sourceAccountId: string;
		targetAccountId: string;
		schedule: string;
		priorityOrder: number;
		strategyType: "fixed" | "mortgage";
		amount?: number;
		inflationAdjusted: boolean;
		// Mortgage-specific fields
		liabilityAccountId?: string;
		interestExpenseAccountId?: string;
		assetAccountId?: string;
		totalPaymentAmount?: number;
		baseAnnualRate?: number;
	}) => {
		if (!flow) return;

		await flowsCollection.update(flow.id, (oldFlow) => {
			oldFlow.name = data.name;
			oldFlow.targetAccountId = data.targetAccountId;
			oldFlow.sourceAccountId = data.sourceAccountId;
			oldFlow.schedule = data.schedule;
			oldFlow.priorityOrder = data.priorityOrder;
			oldFlow.strategy =
				data.strategyType === "fixed"
					? {
							type: "fixed",
							config: {
								amount: data.amount ?? 0,
							},
						}
					: {
							type: "mortgage",
							config: {
								liabilityAccountId: data.liabilityAccountId ?? "",
								interestExpenseAccountId: data.interestExpenseAccountId ?? "",
								assetAccountId: data.assetAccountId ?? "",
								totalPaymentAmount: data.totalPaymentAmount ?? 0,
								interestCalculation: {
									type: "FIXED_RATE",
									baseAnnualRate: data.baseAnnualRate ?? 0,
								},
							},
						};
			oldFlow.modifiers = data.inflationAdjusted ? ["inflation_adjusted"] : [];
		});
		navigate({ to: "/flows" });
	};

	const handleDelete = async () => {
		if (!flow) return;

		if (confirm(`Are you sure you want to delete "${flow.name}"?`)) {
			await flowsCollection.delete(flow.id);
			navigate({ to: "/flows" });
		}
	};

	if (!flow) {
		return (
			<div className="container mx-auto p-6 max-w-2xl">
				<div className="text-center py-12">
					<p className="text-lg text-muted-foreground">Flow not found</p>
					<Button onClick={() => navigate({ to: "/flows" })} className="mt-4">
						Back to Flows
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
					onClick={() => navigate({ to: "/flows" })}
					className="mb-4"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Flows
				</Button>
				<h1 className="text-3xl font-bold text-foreground">Edit Flow</h1>
				<p className="text-muted-foreground mt-1">Update flow details</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl text-foreground">
						Flow Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					<FlowForm
						mode="edit"
						initialData={{
							name: flow.name,
							sourceAccountId: flow.sourceAccountId,
							targetAccountId: flow.targetAccountId,
							schedule: flow.schedule,
							priorityOrder: flow.priorityOrder,
							strategyType: flow.strategy.type,
							amount:
								flow.strategy.type === "fixed"
									? flow.strategy.config.amount
									: undefined,
							inflationAdjusted: flow.modifiers.includes("inflation_adjusted"),
							// Mortgage fields
							liabilityAccountId:
								flow.strategy.type === "mortgage"
									? flow.strategy.config.liabilityAccountId
									: undefined,
							interestExpenseAccountId:
								flow.strategy.type === "mortgage"
									? flow.strategy.config.interestExpenseAccountId
									: undefined,
							assetAccountId:
								flow.strategy.type === "mortgage"
									? flow.strategy.config.assetAccountId
									: undefined,
							totalPaymentAmount:
								flow.strategy.type === "mortgage"
									? flow.strategy.config.totalPaymentAmount
									: undefined,
							baseAnnualRate:
								flow.strategy.type === "mortgage"
									? flow.strategy.config.interestCalculation.baseAnnualRate
									: undefined,
						}}
						onSubmit={handleSubmit}
						onCancel={() => navigate({ to: "/flows" })}
						onDelete={handleDelete}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
